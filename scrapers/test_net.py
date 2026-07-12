# Try using urllib.request to test HTTPS connectivity to MongoDB Atlas API
import urllib.request, json

# Test if we can reach the Atlas API
try:
    req = urllib.request.Request("https://cloud.mongodb.com/api/atlas/v1.0/groups/6a4fbc5e95755f1f415665e4/clusters/Cluster0")
    resp = urllib.request.urlopen(req, timeout=10)
    print(f"Atlas API reachable: {resp.status}")
except Exception as e:
    print(f"Atlas API error: {e}")

# Test direct socket connection with timeout monitoring
import socket, time

host = "ac-u9kliur-shard-00-00.xiju5ao.mongodb.net"
port = 27017

print(f"\nResolving {host}...")
try:
    addrs = socket.getaddrinfo(host, port)
    for addr in addrs:
        print(f"  {addr[4][0]}:{addr[4][1]} (family={addr[0]}, type={addr[1]})")
except Exception as e:
    print(f"DNS error: {e}")

print(f"\nTesting connection timing to {host}:{port}...")
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(5)
try:
    t0 = time.time()
    sock.connect((host, port))
    t1 = time.time()
    print(f"TCP connected in {(t1-t0)*1000:.0f}ms")
    
    # Wait briefly and see if server sends anything
    sock.settimeout(2)
    try:
        data = sock.recv(1024)
        print(f"Server sent {len(data)} bytes immediately")
    except socket.timeout:
        print("Server sent nothing (expected)")
    
    sock.close()
except Exception as e:
    print(f"TCP error: {e}")
