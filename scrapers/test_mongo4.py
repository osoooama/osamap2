from dotenv import load_dotenv
from pathlib import Path
import os, ssl, certifi
load_dotenv(Path('.env').resolve())

# Use SRV with certifi CA bundle
uri = "mongodb+srv://osamakreshan49_db_user:Osama995AA@cluster0.xiju5ao.mongodb.net/?retryWrites=true&w=majority"
print(f'Using certifi CA: {certifi.where()}')

import pymongo
client = pymongo.MongoClient(
    uri,
    serverSelectionTimeoutMS=20000,
    tlsCAFile=certifi.where(),
    tlsAllowInvalidCertificates=False
)
try:
    info = client.server_info()
    print(f'Connected! Server: {info.get("version", "unknown")}')
    dbs = client.list_database_names()
    print(f'Databases: {dbs}')
except Exception as e:
    print(f'Error 1: {e}')
    client.close()
    
    # Try with direct connect (single node, no replica set discovery)
    print('\nTrying directConnect=True...')
    client2 = pymongo.MongoClient(
        uri,
        serverSelectionTimeoutMS=20000,
        tlsCAFile=certifi.where(),
        directConnection=True
    )
    try:
        info2 = client2.server_info()
        print(f'Connected! Server: {info2.get("version", "unknown")}')
    except Exception as e2:
        print(f'Error 2: {e2}')
