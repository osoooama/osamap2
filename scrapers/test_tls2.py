import socket, certifi, ssl

host = "ac-u9kliur-shard-00-00.xiju5ao.mongodb.net"
port = 27017

for ver_name, ver in [("TLSv1_1", ssl.TLSVersion.TLSv1_1),
                       ("TLSv1_2", ssl.TLSVersion.TLSv1_2),
                       ("TLSv1_3", ssl.TLSVersion.TLSv1_3)]:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(10)
    try:
        sock.connect((host, port))
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        ctx.minimum_version = ver
        ctx.maximum_version = ver
        ctx.load_verify_locations(certifi.where())
        ssock = ctx.wrap_socket(sock, server_hostname=host)
        print(f"{ver_name}: OK - {ssock.version()}")
        ssock.close()
    except Exception as e:
        print(f"{ver_name}: FAIL - {type(e).__name__}: {str(e)[:80]}")
    finally:
        sock.close()
