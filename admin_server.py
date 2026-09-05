import os
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 4040
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config", "rates.json")

class RateAdminHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/rates":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                self.wfile.write(f.read().encode("utf-8"))
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/save":
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode("utf-8"))
                # 포맷팅 유지하며 파일에 저장
                with open(CONFIG_PATH, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "rates.json 저장 완료"}).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "error": str(e)}).encode("utf-8"))

if __name__ == "__main__":
    print(f"Rates Admin Server running: http://localhost:{PORT}/admin.html")
    server = HTTPServer(("localhost", PORT), RateAdminHandler)
    server.serve_forever()