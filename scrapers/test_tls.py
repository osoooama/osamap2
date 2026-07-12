import ssl, socket, certifi

host = "ac-u9kliur-shard-00-00.xiju5ao.mongodb.net"
port = 27017

print(f"Python OpenSSL: {ssl.OPENSSL_VERSION}")
print(f"TLS versions supported: {ssl._DEFAULT_CIPHERS[:100] if hasattr(ssl, '_DEFAULT_CIPHERS') else 'N/A'}")

# Try TLS 1.2 socket
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ctx.minimum_version = ssl.TLSVersion.TLSv1_2
ctx.load_verify_locations(certifi.where())

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(20)
try:
    print(f"Connecting to {host}:{port}...")
    sock.connect((host, port))
    print("TCP connected!")
    ssock = ctx.wrap_socket(sock, server_hostname=host)
    print(f"TLS established! Version: {ssock.version()}")
    ssock.close()
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
finally:
    sock.close()
