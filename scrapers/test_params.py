import pymongo
# Print all params that contain ssl or tls
import inspect
sig = inspect.signature(pymongo.MongoClient.__init__)
ssl_params = [k for k in sig.parameters.keys() if 'ssl' in k.lower() or 'tls' in k.lower()]
print(f'SSL/TLS params: {ssl_params}')
