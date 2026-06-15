"""Local dev server for Aquatic Pools.

- Serves the static site with caching disabled (so edits always show up).
- Adds a POST /api/generate-pool endpoint that powers the AI Backyard
  Visualizer: it reads GEMINI_API_KEY from .env (the key stays server-side
  and is never shipped to the browser) and proxies the uploaded photo to
  Google's Gemini 3 Pro Image model, returning the generated pool render.

Run:  python serve.py
"""
import http.server
import socketserver
import os
import json
import urllib.request
import urllib.error

PORT = int(os.environ.get("PORT", 5182))  # hosts like Render inject $PORT
ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

MODEL = "gemini-3-pro-image"  # Nano Banana Pro — high-fidelity image editing
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent" % MODEL

PROMPT = (
    "Transform this real backyard photo into a photorealistic, high-end custom swimming pool design. "
    "Add a modern resort-style pool that fits the existing yard's shape, scale, and camera perspective, "
    "with tasteful stone or tile water features, a raised spa with a spillover, clean travertine decking, "
    "subtle landscape lighting, desert-appropriate landscaping, and a lounge area. "
    "Keep the existing house, walls, fences, and structures intact and realistic. "
    "Natural daylight, luxury Arizona backyard, magazine-quality render. Output only the edited image."
)


def load_env():
    env = {}
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


# Local dev reads .env; hosted (Render etc.) reads the real environment variable.
GEMINI_KEY = load_env().get("GEMINI_API_KEY", "") or os.environ.get("GEMINI_API_KEY", "")


def split_data_url(s, default_mime):
    """Return (base64_data, mime) from a data: URL or a bare base64 string."""
    if not s:
        return "", default_mime
    if s.startswith("data:") and "," in s:
        header = s[:s.index(",")]
        mime = header[5:header.index(";")] if ";" in header else default_mime
        return s.split(",", 1)[1], mime
    return s, default_mime


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _json(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path.split("?")[0] != "/api/generate-pool":
            self._json(404, {"error": "Not found"})
            return
        if not GEMINI_KEY:
            self._json(500, {"error": "GEMINI_API_KEY is missing from .env"})
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            b64, mime = split_data_url(data.get("image", ""), data.get("mime", "image/jpeg"))
            ref64, ref_mime = split_data_url(data.get("reference", ""), data.get("refMime", "image/jpeg"))
            if not b64:
                self._json(400, {"error": "No image provided"})
                return
        except Exception as e:  # noqa
            self._json(400, {"error": "Bad request: %s" % e})
            return

        parts = [
            {"text": PROMPT},
            {"inline_data": {"mime_type": mime, "data": b64}},
        ]
        if ref64:
            parts.append({"text": (
                "The second image is a design/style reference the client likes. Match its overall "
                "vibe, materials, finishes, water features, and color palette where it fits the yard."
            )})
            parts.append({"inline_data": {"mime_type": ref_mime, "data": ref64}})

        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
        }
        req = urllib.request.Request(
            GEMINI_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                result = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "ignore")
            print("[Gemini HTTPError %s] %s" % (e.code, detail[:800]))
            self._json(502, {"error": "Gemini API error (%s)" % e.code, "detail": detail[:600]})
            return
        except Exception as e:  # noqa
            print("[Gemini request failed] %s" % e)
            self._json(502, {"error": "Gemini request failed: %s" % e})
            return

        out_img, out_mime = None, "image/png"
        for cand in result.get("candidates", []):
            for part in cand.get("content", {}).get("parts", []):
                inline = part.get("inlineData") or part.get("inline_data")
                if inline and inline.get("data"):
                    out_img = inline["data"]
                    out_mime = inline.get("mimeType") or inline.get("mime_type") or "image/png"
                    break
            if out_img:
                break
        if not out_img:
            print("[Gemini] no image in response: %s" % json.dumps(result)[:800])
            self._json(502, {"error": "No image returned by Gemini", "detail": json.dumps(result)[:400]})
            return
        self._json(200, {"image": "data:%s;base64,%s" % (out_mime, out_img)})


class ThreadingServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


with ThreadingServer(("", PORT), Handler) as httpd:
    state = "ON (gemini-3-pro-image)" if GEMINI_KEY else "OFF (no key in .env)"
    print("Serving no-cache on http://localhost:%d  |  AI Visualizer: %s" % (PORT, state))
    httpd.serve_forever()
