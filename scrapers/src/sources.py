SITES = [
    {'name': 'streamex.sh', 'url': 'https://streamex.sh', 'category': 'foreign'},
    {'name': 'hd1.brstej.com', 'url': 'https://hd1.brstej.com', 'category': 'arabic'},
    {'name': 'animeslayer.to', 'url': 'https://animeslayer.to', 'category': 'anime'},
    {'name': 'faselhd.club', 'url': 'https://faselhd.club', 'category': 'arabic'},
    {'name': 'ar.qissat.tv', 'url': 'https://ar.qissat.tv', 'category': 'turkish'},
    {'name': 'hdfilmcehennemi.sh', 'url': 'https://hdfilmcehennemi.sh', 'category': 'turkish'},
    {'name': 'dizipal104.vip', 'url': 'https://dizipal104.vip', 'category': 'turkish'},
    {'name': '123moviesfree.net', 'url': 'https://ww8.123moviesfree.net', 'category': 'foreign'},
    {'name': 'eegebest.com', 'url': 'https://eegebest.com', 'category': 'arabic'},
    {'name': 'fajer.show', 'url': 'https://fajer.show', 'category': 'arabic'},
    {'name': '3iskk.xyz', 'url': 'https://3iskk.xyz', 'category': 'arabic'},
    {'name': '7obtv.co', 'url': 'https://7obtv.co', 'category': 'arabic'},
    {'name': 'cinemana.cc', 'url': 'https://cinemana.cc', 'category': 'arabic'},
]


def get_all_sites():
    return SITES


SOURCES = {'foreign': [], 'arabic': [], 'turkish': [], 'anime': [], 'animation': []}
for s in SITES:
    cat = s['category']
    if cat not in SOURCES:
        SOURCES[cat] = []
    SOURCES[cat].append(s)
