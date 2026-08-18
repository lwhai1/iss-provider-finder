import http.server
import socketserver
import os
import webbrowser

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    pass

os.chdir(os.path.dirname(os.path.abspath(__file__)))

print(f"🚀 特需儿童/DAHS-ISS Provider 智能筛选工具启动中...")
print(f"🌐 请在浏览器中打开: http://localhost:{PORT}")

try:
    webbrowser.open(f"http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n服务已停止。")
