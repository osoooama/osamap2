from dotenv import load_dotenv
from pathlib import Path
import os
load_dotenv(Path('.env').resolve())
uri = os.getenv('MONGODB_URI')
print(f'URI: {uri[:40]}...')

import pymongo
# Try with TLS options
client = pymongo.MongoClient(
    uri,
    serverSelectionTimeoutMS=15000,
    tls=True,
    tlsAllowInvalidCertificates=True
)
try:
    info = client.server_info()
    v = info.get('version', 'unknown')
    print(f'Connected! Server: {v}')
    # List databases
    dbs = client.list_database_names()
    print(f'Databases: {dbs}')
except Exception as e:
    print(f'Error: {e}')
