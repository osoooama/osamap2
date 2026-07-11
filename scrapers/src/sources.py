FOREIGN_SITES = [
    {'name': 'cineby.cc', 'url': 'https://cineby.cc', 'category': 'foreign'},
    {'name': 'hydrahd.com', 'url': 'https://hydrahd.com', 'category': 'foreign'},
    {'name': 'flickystream.com', 'url': 'https://flickystream.com', 'category': 'foreign'},
    {'name': 'watchug.com', 'url': 'https://watchug.com', 'category': 'foreign'},
    {'name': 'novastream.to', 'url': 'https://novastream.to', 'category': 'foreign'},
]

ARABIC_SITES = [
    {'name': 'akwam.cc', 'url': 'https://akwam.cc', 'category': 'arabic'},
    {'name': 'faselplus.cc', 'url': 'https://faselplus.cc', 'category': 'arabic'},
    {'name': 'mycima.tube', 'url': 'https://mycima.tube', 'category': 'arabic'},
    {'name': '3iskk.xyz', 'url': 'https://3iskk.xyz', 'category': 'arabic'},
]

TURKISH_SITES = [
    {'name': 'kayifamily.com', 'url': 'https://kayifamily.com', 'category': 'turkish'},
    {'name': 'dizipal.com', 'url': 'https://dizipal.com', 'category': 'turkish'},
    {'name': 'fullhdfilmizle.com', 'url': 'https://fullhdfilmizle.com', 'category': 'turkish'},
]

ANIME_SITES = [
    {'name': 'hianime.to', 'url': 'https://hianime.to', 'category': 'anime'},
    {'name': 'animekaizoku.com', 'url': 'https://animekaizoku.com', 'category': 'anime'},
    {'name': 'shahiid-anime.net', 'url': 'https://shahiid-anime.net', 'category': 'anime'},
]


def get_all_sites():
    return FOREIGN_SITES + ARABIC_SITES + TURKISH_SITES + ANIME_SITES


sources = {
    'foreign': FOREIGN_SITES,
    'arabic': ARABIC_SITES,
    'turkish': TURKISH_SITES,
    'anime': ANIME_SITES,
}

SOURCES = sources
