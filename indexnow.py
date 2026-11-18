"""Signale les pages nouvelles ou modifiees de mystrow.fr via IndexNow
(Bing, Yandex, Seznam, Naver... se partagent l'info ; Google n'y participe pas).

A lancer APRES le git push :
    python indexnow.py                  # pages touchees par le dernier commit
    python indexnow.py --since 394ad4d  # pages touchees depuis ce commit
    python indexnow.py --all            # tout le sitemap (premiere fois)
    python indexnow.py /en/aide /shop   # URLs precises
Options : --dry-run (n'envoie rien), --no-wait (n'attend pas le deploiement).

Seules les URLs presentes dans sitemap.xml sont soumises (pas de 404, compte...).
Le site met quelques minutes a se mettre a jour apres un push : le script attend
que la version en ligne d'une page modifiee corresponde au fichier local.
"""
import argparse
import json
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

HOST = "mystrow.fr"
BASE = f"https://{HOST}"
KEY = "586853d8c556c434b93086bcaa6afe37"
KEY_LOCATION = f"{BASE}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
ROOT = Path(__file__).resolve().parent
UA = "MyStrow-IndexNow/1.0"


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True,
                          text=True, encoding="utf-8", check=True).stdout


def sitemap_locs(xml):
    return set(re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml))


def file_to_url(path):
    """'en/aide.html' -> https://mystrow.fr/en/aide ; 'en/index.html' -> .../en/"""
    if not path.endswith(".html"):
        return None
    p = path[:-5]
    if p == "index":
        p = ""
    elif p.endswith("/index"):
        p = p[:-5]
    return f"{BASE}/{p}"


def changed_files(since):
    out = git("diff", "--name-only", "--diff-filter=AMR", f"{since}..HEAD")
    return [l.strip() for l in out.splitlines() if l.strip()]


def fetch(url):
    sep = "&" if "?" in url else "?"
    req = urllib.request.Request(f"{url}{sep}nocache={int(time.time())}",
                                 headers={"User-Agent": UA, "Cache-Control": "no-cache"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.status, r.read()


def norm(b):
    return b.replace(b"\r\n", b"\n").strip()


def wait_deployed(files, timeout=900):
    """Attend que le serveur serve la version locale d'un fichier modifie."""
    probe = next((f for f in files if (ROOT / f).is_file()
                  and (f.endswith(".html") or f.endswith(".xml") or f == f"{KEY}.txt")), None)
    if not probe:
        return True
    local = norm((ROOT / probe).read_bytes())
    url = f"{BASE}/{probe}"  # le .html est servi tel quel (ou redirige en 301, suivi)
    print(f"Attente du deploiement ({probe})...", end="", flush=True)
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            _, body = fetch(url)
            if norm(body) == local:
                print(" en ligne.")
                return True
        except urllib.error.URLError:
            pass
        print(".", end="", flush=True)
        time.sleep(20)
    print(" delai depasse.")
    return False


def submit(urls):
    payload = {"host": HOST, "key": KEY, "keyLocation": KEY_LOCATION,
               "urlList": sorted(urls)}
    req = urllib.request.Request(ENDPOINT, data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json; charset=utf-8",
                                          "User-Agent": UA}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode(errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="replace")


MESSAGES = {
    200: "OK, URLs recues.",
    202: "OK, URLs recues (cle en cours de verification).",
    400: "Requete invalide.",
    403: "Cle refusee : le fichier de cle n'est pas (encore) en ligne ?",
    422: "URLs refusees (hors du domaine ou cle incoherente).",
    429: "Trop de requetes, reessayer plus tard.",
}


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("urls", nargs="*", help="URLs ou chemins (/en/aide)")
    ap.add_argument("--since", default="HEAD~1", help="commit de depart (defaut HEAD~1)")
    ap.add_argument("--all", action="store_true", help="tout le sitemap")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-wait", action="store_true")
    a = ap.parse_args()

    locs = sitemap_locs((ROOT / "sitemap.xml").read_text(encoding="utf-8"))
    files = []

    if a.all:
        urls = set(locs)
        files = [f"{KEY}.txt"]
    elif a.urls:
        urls = {u if u.startswith("http") else BASE + "/" + u.lstrip("/") for u in a.urls}
        unknown = urls - locs
        if unknown:
            print("Hors sitemap (envoyees quand meme) :", *sorted(unknown), sep="\n  ")
    else:
        files = changed_files(a.since)
        urls = {file_to_url(f) for f in files} & locs
        if "sitemap.xml" in files:  # pages ajoutees au sitemap
            try:
                old = git("show", f"{a.since}:sitemap.xml")
            except subprocess.CalledProcessError:
                old = ""
            urls |= locs - sitemap_locs(old)

    if not urls:
        print("Aucune URL du sitemap a signaler.")
        return 0

    print(f"{len(urls)} URL(s) :")
    for u in sorted(urls):
        print("  " + u)
    if a.dry_run:
        print("(dry-run : rien envoye)")
        return 0

    if not a.no_wait and files and not wait_deployed(files):
        print("Le site ne semble pas a jour : relancer plus tard ou avec --no-wait.")
        return 1

    status, body = submit(urls)
    print(f"IndexNow : HTTP {status} - {MESSAGES.get(status, body[:300])}")
    return 0 if status in (200, 202) else 1


if __name__ == "__main__":
    sys.exit(main())
