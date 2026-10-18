import os
import json
import webbrowser
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 4040

# scripts 폴더 절대경로
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
# 루트 폴더 (scripts의 상위 디렉토리)
PROJECT_ROOT = os.path.dirname(SCRIPTS_DIR)

# 루트 아래 config/rates.json 지정
CONFIG_DIR = os.path.join(PROJECT_ROOT, "config")
CONFIG_PATH = os.path.join(CONFIG_DIR, "rates.json")

class RateAdminHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/rates":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                self.wfile.write(f.read().encode("utf-8"))
        else:
            # admin.html 및 정적 자원 서빙
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/save":
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8"))
                with open(CONFIG_PATH, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode("utf-8"))

def open_browser():
    webbrowser.open_new(f"http://localhost:{PORT}/admin.html")

if __name__ == "__main__":
    threading.Timer(0.8, open_browser).start()
    print("==================================================")
    print(f" Rates Admin Server running: http://localhost:{PORT}/admin.html")
    print(f" Config file: {CONFIG_PATH}")
    print(" 종료하려면 터미널에서 Ctrl + C 를 누르세요.")
    print("==================================================")
    
    server = HTTPServer(("localhost", PORT), RateAdminHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n서버가 안전하게 종료되었습니다.")