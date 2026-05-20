export type MockArtwork = {
  title: string
  meta: string
  src: string
  col: string
  row: string
}

export type MockArtist = {
  name: string
  specialty: string
  galleries: number
  artworks: number
  src: string
}

export const MOCK_ARTWORKS: MockArtwork[] = [
  { title: 'Espiral #3',    meta: 'Escultura · Mariana López',  src: '/images/mock/artworks/artwork-01.jpg', col: '1/6',   row: '1/9'  },
  { title: 'Bruma I',       meta: 'Fotografía · Alicia M.',     src: '/images/mock/artworks/artwork-02.jpg', col: '6/9',   row: '1/5'  },
  { title: 'Agua & Luz',    meta: 'Instalación · Pere Costa',   src: '/images/mock/artworks/artwork-03.jpg', col: '9/13',  row: '1/7'  },
  { title: 'Raíz doble',    meta: 'Pintura · Iria Vidal',       src: '/images/mock/artworks/artwork-04.jpg', col: '6/10',  row: '5/9'  },
  { title: 'Vacío útil',    meta: 'Fotografía · Kai L.',        src: '/images/mock/artworks/artwork-05.jpg', col: '10/13', row: '7/9'  },
  { title: 'Textura #7',    meta: 'Escultura · Marta G.',       src: '/images/mock/artworks/artwork-06.jpg', col: '1/5',   row: '9/15' },
  { title: 'Luz baja',      meta: 'Fotografía · Kai L.',        src: '/images/mock/artworks/artwork-07.jpg', col: '5/9',   row: '9/13' },
  { title: 'Forma libre',   meta: 'Pintura · Noa B.',           src: '/images/mock/artworks/artwork-08.jpg', col: '9/13',  row: '9/15' },
  { title: 'Noche urbana',  meta: 'Pintura · Carlos P.',        src: '/images/mock/artworks/artwork-09.jpg', col: '5/9',   row: '13/16'},
  { title: 'Silencio',      meta: 'Instalación',                src: '/images/mock/artworks/artwork-10.jpg', col: '1/5',   row: '15/17'},
  { title: 'Fragmentos',    meta: 'Pintura · Noa B.',           src: '/images/mock/artworks/artwork-12.jpg', col: '9/13',  row: '15/17'},
]

export const MOCK_ARTISTS: MockArtist[] = [
  { name: 'Mariana López', specialty: 'Escultura · Madrid',      galleries: 3, artworks: 24, src: '/images/mock/artists/artist-01.jpg' },
  { name: 'Pere Costa',    specialty: 'Instalación · Barcelona', galleries: 2, artworks: 18, src: '/images/mock/artists/artist-02.jpg' },
  { name: 'Iria Vidal',    specialty: 'Pintura · Vigo',          galleries: 1, artworks: 12, src: '/images/mock/artists/artist-03.jpg' },
  { name: 'Kai Lindström', specialty: 'Fotografía · Helsinki',   galleries: 2, artworks: 31, src: '/images/mock/artists/artist-04.jpg' },
]
