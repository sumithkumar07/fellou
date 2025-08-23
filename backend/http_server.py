#!/usr/bin/env python3
"""
Ultra-simple HTTP server for testing
"""
import json
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
from datetime import datetime

class SimpleHTTPHandler(http.server.BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/health':
            response = {
                "status": "healthy",
                "version": "1.0.0",
                "timestamp": datetime.now().isoformat()
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(404)
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                request_data = json.loads(post_data.decode())
                message = request_data.get('message', '')
                
                # Simple YouTube detection
                if 'open youtube' in message.lower():
                    response = {
                        "response": "✅ **Youtube is opening in your browser!**\n\n🌐 **URL:** https://www.youtube.com\n🚀 **Action:** Navigating your browser now\n⚡ **Status:** Opening in real browser\n\n💡 **Your browser should be navigating to the website now!**",
                        "session_id": "test-session",
                        "timestamp": datetime.now().isoformat(),
                        "website_opened": True,
                        "website_name": "youtube", 
                        "website_url": "https://www.youtube.com"
                    }
                else:
                    response = {
                        "response": f"I received: {message}",
                        "session_id": "test-session",
                        "timestamp": datetime.now().isoformat()
                    }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_error(500, f"Error: {str(e)}")
        else:
            self.send_error(404)

if __name__ == "__main__":
    PORT = 8001
    Handler = SimpleHTTPHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Server running on port {PORT}")
        httpd.serve_forever()