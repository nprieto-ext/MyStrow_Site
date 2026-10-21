// Connexion « Continuer avec Google / Apple » — partagé par compte.html et
// connexion-app.html (relais de l'appli PC et de la tablette).
//
// Les fournisseurs ne sont PAS activés dans Firebase Auth : on récupère un
// jeton d'identité Google/Apple, la Cloud Function `oauth_login` retrouve le
// compte MyStrow existant (lien mémorisé ou même e-mail) et renvoie un custom
// token, échangé ici contre une session Firebase normale. Pas de compte ⇒
// erreur NO_ACCOUNT, jamais de création.
//
// Identifiant vide ⇒ bouton masqué : la page reste utilisable tant que la
// console Google / Apple n'est pas configurée.
(function () {
  const GOOGLE_CLIENT_ID = '880317301045-c690hvk9sn76gg5830mk4jrgounh9fr0.apps.googleusercontent.com';
  const APPLE_SERVICES_ID = 'com.happlysas.mystrow.web';

  const FB_API_KEY = 'AIzaSyAQjGJXGCSWzOE-wvKXh6sbZy6JDhL8tqA';
  const OAUTH_URL  = 'https://us-central1-mystrow-907be.cloudfunctions.net/oauth_login';

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error('SCRIPT_LOAD'));
      document.head.appendChild(s);
    });
  }

  let _gisReady = null;
  function gis() {
    if (!_gisReady) _gisReady = loadScript('https://accounts.google.com/gsi/client');
    return _gisReady;
  }

  let _appleReady = null;
  function appleJs() {
    if (!_appleReady) {
      _appleReady = loadScript(
        'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/fr_FR/appleid.auth.js'
      ).then(() => {
        AppleID.auth.init({
          clientId: APPLE_SERVICES_ID,
          scope: 'email',
          // Doit figurer TEL QUEL dans les « Return URLs » du Services ID.
          redirectURI: location.origin + location.pathname,
          usePopup: true,
        });
      });
    }
    return _appleReady;
  }

  // Le bouton Google ne peut pas être déclenché par programme (GIS n'expose
  // le jeton d'identité que via son propre bouton) : on le dessine dans `el`.
  // Un seul callback actif : le dernier bouton rendu l'emporte.
  async function renderGoogle(el, onToken, opts) {
    if (!GOOGLE_CLIENT_ID || !el) return false;
    await gis();
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (r) => onToken(r.credential),
      ux_mode: 'popup',
      auto_select: false,
    });
    google.accounts.id.renderButton(el, Object.assign({
      theme: 'filled_black', size: 'large', shape: 'pill',
      text: 'continue_with', locale: 'fr', width: el.clientWidth || 320,
    }, opts || {}));
    return true;
  }

  async function appleToken() {
    await appleJs();
    try {
      const r = await AppleID.auth.signIn();
      return r.authorization.id_token;
    } catch (e) {
      // Fenêtre fermée par l'utilisateur : pas une erreur à afficher.
      if (e && e.error === 'popup_closed_by_user') throw new Error('CANCELLED');
      throw new Error('APPLE_' + ((e && e.error) || 'ERROR'));
    }
  }

  async function callOAuth(body, bearer) {
    const headers = { 'Content-Type': 'application/json' };
    if (bearer) headers['Authorization'] = 'Bearer ' + bearer;
    let res;
    try {
      res = await fetch(OAUTH_URL, { method: 'POST', headers, body: JSON.stringify(body) });
    } catch (e) {
      throw new Error('NETWORK');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      const err = new Error(data.code || ('HTTP_' + res.status));
      err.email = data.email || '';
      throw err;
    }
    return data;
  }

  // → {idToken, refreshToken, localId, expiresIn, email}
  async function login(provider, idToken) {
    const d = await callOAuth({ provider, id_token: idToken, action: 'login' });
    const res = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=' + FB_API_KEY,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: d.custom_token, returnSecureToken: true }) }
    );
    const s = await res.json();
    if (!res.ok) throw new Error((s.error && s.error.message) || 'SIGNIN');
    // signInWithCustomToken ne renvoie ni l'uid ni l'e-mail : l'uid est dans
    // le jeton (claim user_id), l'e-mail vient de oauth_login.
    const claims = JSON.parse(atob(s.idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return { idToken: s.idToken, refreshToken: s.refreshToken,
             localId: claims.user_id, expiresIn: s.expiresIn, email: d.email };
  }

  function link(provider, idToken, firebaseIdToken) {
    return callOAuth({ provider, id_token: idToken, action: 'link' }, firebaseIdToken);
  }

  function unlink(provider, firebaseIdToken) {
    return callOAuth({ provider, action: 'unlink' }, firebaseIdToken);
  }

  // App tablette : dépose la session dans la boîte aux lettres que l'app
  // relève avec le même `state` (voir _oauth_handoff côté Cloud Function).
  function handoff(state, refreshToken, email) {
    return callOAuth({ action: 'handoff_put', state, refresh_token: refreshToken, email: email || '' });
  }

  // Messages communs (le cas NO_ACCOUNT est rédigé par chaque page).
  function errorText(code) {
    switch (code) {
      case 'NETWORK':        return 'Serveur injoignable — vérifiez votre connexion internet.';
      case 'INVALID_TOKEN':  return 'La connexion n\'a pas pu être vérifiée. Réessayez.';
      case 'USER_DISABLED':  return 'Ce compte a été désactivé. Contactez le support.';
      case 'ALREADY_LINKED': return 'Ce compte est déjà lié à un autre compte MyStrow.';
      case 'UNAUTHORIZED':   return 'Session expirée : reconnectez-vous.';
      case 'SCRIPT_LOAD':    return 'Impossible de charger le module de connexion (bloqueur de publicités ?).';
      default:               return 'Connexion impossible (' + (code || 'erreur inconnue') + ').';
    }
  }

  window.msOAuth = {
    hasGoogle: !!GOOGLE_CLIENT_ID,
    hasApple:  !!APPLE_SERVICES_ID,
    renderGoogle, appleToken, login, link, unlink, handoff, errorText,
  };
})();
