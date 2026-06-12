"""Tiny static server that disables caching, so edits always show up.
Run:  python serve.py
"""
import http.server
import socketserver
import os

PORT = 5182
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    print(f"Serving with no-cache on http://localhost:{PORT}")
    httpd.serve_forever()
