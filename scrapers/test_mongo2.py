from dotenv import load_dotenv
from pathlib import Path
import os, ssl
load_dotenv(Path('.env').resolve())
uri = os.getenv('MONGODB_URI')
print(f'URI: {uri[:40]}...')
print(f'Python SSL: {ssl.OPENSSL_VERSION}')

import pymongo
# Try with explicit TLS options + different approach
client = pymongo.MongoClient(
    uri,
    serverSelectionTimeoutMS=15000,
    tls=True,
    tlsAllowInvalidCertificates=True,
    tlsAllowInvalidHostnames=True,
)
try:
    info = client.server_info()
    v = info.get('version', 'unknown')
    print(f'Connected! Server: {v}')
    dbs = client.list_database_names()
    print(f'Databases: {dbs}')
except Exception as e:
    print(f'Error type: {type(e).__name__}')
    print(f'Error: {e}')
