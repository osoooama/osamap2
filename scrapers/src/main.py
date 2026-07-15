from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent.joinpath('.env'))

from run_all import run
from notifier import send_telegram_alert


def main():
    total = run()

    send_telegram_alert(
        f'Scraping Complete - {total} streams',
        'all',
        'N/A',
        'https://github.com/osoooama/osamap2/actions',
    )


if __name__ == '__main__':
    main()
