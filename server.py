#!/usr/bin/env python3
"""
Simple HTTP Server for Quiz Website
Serves the quiz website locally for testing
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

class QuizHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def start_server(port=8000):
    """Start the HTTP server"""
    # Change to the directory containing the quiz files
    os.chdir(Path(__file__).parent)
    
    with socketserver.TCPServer(("", port), QuizHTTPRequestHandler) as httpd:
        print(f"Quiz server running at http://localhost:{port}")
        print("Press Ctrl+C to stop the server")
        
        # Try to open the browser automatically
        try:
            webbrowser.open(f'http://localhost:{port}')
        except:
            print(f"Please open http://localhost:{port} in your browser")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    start_server()
