#!/usr/bin/env python3
"""
LuxeCraft Studio - Local Development Server
Zero-dependency static server using Python 3 built-in http.server.
"""
import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]} -> {args[1]}\n")

def run():
    global PORT
    for attempt in range(10):
        try:
            # Bind to 0.0.0.0 so it responds to localhost, 127.0.0.1, and local IP
            with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
                print("=" * 60)
                print(f"✨ LuxeCraft Studio E-Commerce Store is LIVE!")
                print(f"👉 Access URL: http://localhost:{PORT}")
                print(f"👉 Alternative: http://127.0.0.1:{PORT}")
                print(f"📁 Serving Directory: {DIRECTORY}")
                print("=" * 60)
                sys.stdout.flush()
                httpd.serve_forever()
                break
        except OSError as err:
            print(f"Port {PORT} in use ({err}), trying {PORT + 1}...")
            PORT += 1

if __name__ == "__main__":
    try:
        run()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user.")
        sys.exit(0)
