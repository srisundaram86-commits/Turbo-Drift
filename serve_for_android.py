import os
import sys
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler

def get_lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Connecting to a public IP doesn't actually send packets,
        # but queries the system routing table for the outbound interface
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

class CustomHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Disable caching during development so changes appear immediately
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        # Allow cross-origin if needed
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run(port=8000):
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    lan_ip = get_lan_ip()

    print("=" * 68)
    print("      TURBO OVERDRIVE 2.5D - ANDROID INSTANT WIRELESS SERVER")
    print("=" * 68)
    print()
    print(f"  [+] Your Computer's Wi-Fi IP Address: {lan_ip}")
    print()
    print("  HOW TO PLAY ON YOUR ANDROID PHONE:")
    print("  ----------------------------------------------------------------")
    print("  1. Make sure your Android phone is connected to the same Wi-Fi.")
    print("  2. Open Google Chrome (or any browser) on your phone.")
    print(f"  3. In the address bar, type:")
    print()
    print(f"         http://{lan_ip}:{port}")
    print()
    print("  4. Once loaded, tap the three dots (⋮) in Chrome, then tap:")
    print("         'Install app' or 'Add to Home screen'")
    print()
    print("  The game will install with a native app icon and run in 100%")
    print("  full-screen offline mode with zero address bar distractions!")
    print("  ----------------------------------------------------------------")
    print(f"  Serving files on port {port}... (Press Ctrl+C to stop)")
    print()

    server_address = ('0.0.0.0', port)
    try:
        httpd = HTTPServer(server_address, CustomHandler)
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)
    except OSError as e:
        if port == 8000:
            print(f"Port 8000 busy, trying 8080...")
            run(8080)
        else:
            raise e

if __name__ == '__main__':
    run()

