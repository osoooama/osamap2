# Try connecting WITHOUT SSL/TLS
from dotenv import load_dotenv
from pathlib import Path
import os
load_dotenv(Path('.env').resolve())

# Direct connection without SSL
uri = "mongodb://osamakreshan49_db_user:Osama995AA@ac-u9kliur-shard-00-00.xiju5ao.mongodb.net:27017/?authSource=admin&directConnection=true&ssl=false"
print(f"Trying without SSL...")

import pymongo
try:
    client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=10000)
    info = client.server_info()
    print(f"Connected! {info.get('version')}")
except Exception as e:
    print(f"No-SSL error: {type(e).__name__}: {str(e)[:200]}")
finally:
    try: client.close()
    except: pass

# Try with SSL but using Python's default context
uri2 = "mongodb+srv://osamakreshan49_db_user:Osama995AA@cluster0.xiju5ao.mongodb.net/?retryWrites=true&w=majority"
print(f"\nTrying with default SSL context...")
try:
    client2 = pymongo.MongoClient(uri2, serverSelectionTimeoutMS=15000)
    info2 = client2.server_info()
    print(f"Connected! {info2.get('version')}")
except Exception as e:
    print(f"SSL error: {type(e).__name__}: {str(e)[:200]}")
finally:
    try: client2.close()
    except: pass
