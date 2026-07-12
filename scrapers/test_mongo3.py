from dotenv import load_dotenv
from pathlib import Path
import os, ssl
load_dotenv(Path('.env').resolve())

# Try direct connection instead of SRV
uri = "mongodb://osamakreshan49_db_user:Osama995AA@ac-u9kliur-shard-00-00.xiju5ao.mongodb.net:27017,ac-u9kliur-shard-00-01.xiju5ao.mongodb.net:27017,ac-u9kliur-shard-00-02.xiju5ao.mongodb.net:27017/?replicaSet=atlas-11ftih-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&tlsAllowInvalidCertificates=true"
print(f'Connecting directly...')

import pymongo
client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=15000)
try:
    info = client.server_info()
    v = info.get('version', 'unknown')
    print(f'Connected! Server: {v}')
    dbs = client.list_database_names()
    print(f'Databases: {dbs}')
    client.close()
except Exception as e:
    print(f'Error: {e}')
    # Try with SRV again but with different options
    print('\nTrying SRV with TLS options...')
    uri2 = "mongodb+srv://osamakreshan49_db_user:Osama995AA@cluster0.xiju5ao.mongodb.net/?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true&tlsAllowInvalidHostnames=true"
    client2 = pymongo.MongoClient(uri2, serverSelectionTimeoutMS=15000)
    try:
        info2 = client2.server_info()
        print(f'Connected via SRV! Server: {info2.get("version", "unknown")}')
    except Exception as e2:
        print(f'SRV Error: {e2}')
