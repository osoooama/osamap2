from dotenv import load_dotenv
from pathlib import Path
import os, ssl
load_dotenv(Path('.env').resolve())

uri = ("mongodb://osamakreshan49_db_user:Osama995AA@"
       "ac-u9kliur-shard-00-00.xiju5ao.mongodb.net:27017,"
       "ac-u9kliur-shard-00-01.xiju5ao.mongodb.net:27017,"
       "ac-u9kliur-shard-00-02.xiju5ao.mongodb.net:27017/"
       "?ssl=true&authSource=admin&retryWrites=true&w=majority"
       "&replicaSet=atlas-11ftih-shard-0")
print(f'Connecting directly...')

import pymongo
tls_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
tls_ctx.minimum_version = ssl.TLSVersion.TLSv1_2
tls_ctx.check_hostname = False
tls_ctx.verify_mode = ssl.CERT_NONE

client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=15000, ssl=True, tlsContext=tls_ctx)
try:
    info = client.server_info()
    print(f'Connected! Version: {info.get("version")}')
    db = client['OSAMAP2_DB']
    collections = db.list_collection_names()
    print(f'Collections: {collections}')
except Exception as e:
    print(f'Error: {type(e).__name__}: {str(e)[:200]}')
finally:
    client.close()
