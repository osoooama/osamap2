import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / 'src'))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent / '.env')
from sites.iptv import crawl_iptv
crawl_iptv()
print('\n=== IPTV Done ===')
input('Press Enter to close...')
