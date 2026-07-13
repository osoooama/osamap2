SITES = [
    {'name': 'streamex.sh', 'url': 'https://streamex.sh', 'category': 'foreign'},
    {'name': 'cinemana.cc', 'url': 'https://cinemana.cc', 'category': 'arabic'},
    {'name': 'hd1.brstej.com', 'url': 'https://hd1.brstej.com', 'category': 'arabic'},
    {'name': 'mycima.video', 'url': 'https://mycima.video', 'category': 'arabic'},
    {'name': 'eegebest.com', 'url': 'https://eegebest.com', 'category': 'arabic'},
    {'name': 'fajer.show', 'url': 'https://fajer.show', 'category': 'arabic'},
    {'name': '3iskk.xyz', 'url': 'https://3iskk.xyz', 'category': 'arabic'},
    {'name': '7obtv.co', 'url': 'https://7obtv.co', 'category': 'arabic'},
    {'name': 'dizipal2085.com', 'url': 'https://dizipal2085.com', 'category': 'turkish'},
]


def get_all_sites():
    return SITES


SOURCES = {'foreign': [], 'arabic': [], 'turkish': [], 'anime': []}
for s in SITES:
    cat = s['category']
    if cat not in SOURCES:
        SOURCES[cat] = []
    SOURCES[cat].append(s)
