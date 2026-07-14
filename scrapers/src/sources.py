SITES = [
    {'name': 'streamex.sh', 'url': 'https://streamex.sh', 'category': 'foreign'},
    {'name': 'hd1.brstej.com', 'url': 'https://hd1.brstej.com', 'category': 'arabic'},
    {'name': 'animeslayer.to', 'url': 'https://animeslayer.to', 'category': 'anime'},
]


def get_all_sites():
    return SITES


SOURCES = {'foreign': [], 'arabic': [], 'turkish': [], 'anime': []}
for s in SITES:
    cat = s['category']
    if cat not in SOURCES:
        SOURCES[cat] = []
    SOURCES[cat].append(s)
