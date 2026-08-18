import http.server
import socketserver
import os

PORT = 8000

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == "__main__":
    web_dir = os.path.dirname(__file__)
    if web_dir:
        os.chdir(web_dir)
        
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"服务已启动: http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务已停止")