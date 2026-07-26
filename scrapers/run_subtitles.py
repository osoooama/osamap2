import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / 'src'))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent / '.env')
from sites.subtitles import crawl_subtitles
crawl_subtitles()
print('\n=== Subtitles Done ===')
input('Press Enter to close...')
