SITES = [
    {'name': 'streamex.sh', 'url': 'https://streamex.sh', 'category': 'foreign'},
    {'name': 'hd1.brstej.com', 'url': 'https://hd1.brstej.com', 'category': 'arabic'},
    {'name': 'animeslayer.to', 'url': 'https://animeslayer.to', 'category': 'anime'},
    {'name': 'faselhd.club', 'url': 'https://faselhd.club', 'category': 'arabic'},
    {'name': 'ar.qissat.tv', 'url': 'https://ar.qissat.tv', 'category': 'turkish'},
    {'name': 'hdfilmcehennemi.sh', 'url': 'https://hdfilmcehennemi.sh', 'category': 'turkish'},
    {'name': 'dizipal104.vip', 'url': 'https://dizipal104.vip', 'category': 'turkish'},
    {'name': '123moviesfree.net', 'url': 'https://ww8.123moviesfree.net', 'category': 'foreign'},
]


def get_all_sites():
    return SITES


SOURCES = {'foreign': [], 'arabic': [], 'turkish': [], 'anime': [], 'animation': []}
for s in SITES:
    cat = s['category']
    if cat not in SOURCES:
        SOURCES[cat] = []
    SOURCES[cat].append(s)
