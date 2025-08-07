// Norsk geografi og kategori-data for filtrering

export const norskeFylker = [
  'Alle fylker',
  'Agder',
  'Innlandet', 
  'Møre og Romsdal',
  'Nordland',
  'Oslo',
  'Rogaland',
  'Troms og Finnmark',
  'Trøndelag',
  'Vestfold og Telemark',
  'Vestland',
  'Viken'
]

export const storeByer = [
  'Alle byer',
  'Oslo',
  'Bergen',
  'Stavanger',
  'Trondheim',
  'Fredrikstad',
  'Drammen',
  'Sandnes',
  'Kristiansand',
  'Tromsø',
  'Sarpsborg',
  'Skien',
  'Ålesund',
  'Sandefjord',
  'Haugesund',
  'Tønsberg',
  'Moss',
  'Bodø',
  'Arendal',
  'Hamar',
  'Ytrebygda',
  'Larvik',
  'Halden',
  'Lillehammer',
  'Mo i Rana',
  'Molde',
  'Horten',
  'Gjøvik',
  'Harstad',
  'Askøy',
  'Jessheim',
  'Elverum'
]

// Bil-spesifikke filtre
export const bilMerker = [
  'Alle merker',
  'Audi',
  'BMW', 
  'Citroën',
  'Fiat',
  'Ford',
  'Honda',
  'Hyundai',
  'Kia',
  'Mazda',
  'Mercedes-Benz',
  'Mitsubishi',
  'Nissan',
  'Opel',
  'Peugeot',
  'Renault',
  'Skoda',
  'Subaru',
  'Suzuki',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo'
]

export const drivstoffTyper = [
  'Alle',
  'Bensin',
  'Diesel', 
  'Hybrid',
  'Elektrisk',
  'Plugin-hybrid',
  'Hydrogen'
]

export const girkasseTyper = [
  'Alle',
  'Manuell',
  'Automat',
  'Halvautomatisk'
]

export const prisRangerBil = [
  'Alle priser',
  'Under 50k',
  '50k - 100k',
  '100k - 200k', 
  '200k - 400k',
  '400k - 600k',
  '600k - 1M',
  'Over 1M'
]

export const bilAlder = [
  'Alle årganger',
  '2024',
  '2023-2024',
  '2020-2024',
  '2015-2024',
  '2010-2024',
  '2005-2024',
  'Eldre enn 2005'
]

export const kilometerStand = [
  'Alle',
  'Under 10k',
  '10k - 50k',
  '50k - 100k',
  '100k - 150k',
  '150k - 200k',
  '200k - 300k',
  'Over 300k'
]

// Eiendom-spesifikke filtre
export const boligTyper = [
  'Alle typer',
  'Leilighet',
  'Enebolig',
  'Rekkehus',
  'Tomannsbolig',
  'Leiligheter',
  'Hytte/Fritidsbolig',
  'Tomt',
  'Gård',
  'Næringsbygg',
  'Annet'
]

export const prisRangerEiendom = [
  'Alle priser',
  'Under 1M',
  '1M - 2M',
  '2M - 3M',
  '3M - 5M',
  '5M - 8M',
  '8M - 12M',
  'Over 12M'
]

export const antallRom = [
  'Alle',
  '1 rom',
  '2 rom', 
  '3 rom',
  '4 rom',
  '5 rom',
  '6+ rom'
]

export const arealer = [
  'Alle størrelser',
  'Under 50 kvm',
  '50-75 kvm',
  '75-100 kvm',
  '100-150 kvm',
  '150-200 kvm',
  'Over 200 kvm'
]

export const tomtestorrelser = [
  'Alle tomtestørrelser',
  'Under 500 kvm',
  '500-1000 kvm',
  '1000-2000 kvm',
  '2000-5000 kvm',
  'Over 5000 kvm'
]

export const byggeAr = [
  'Alle byggeår',
  '2020-2024',
  '2010-2019',
  '2000-2009',
  '1990-1999',
  '1980-1989',
  '1970-1979',
  'Eldre enn 1970'
]

// Torget-spesifikke filtre
export const torgetKategorier = [
  'Alle kategorier',
  'Elektronikk',
  'Møbler',
  'Klær og mote',
  'Sport og fritid',
  'Hobby og musikk',
  'Barn og baby',
  'Hage og utendørs',
  'Kjæledyr',
  'Bøker og medier',
  'Kunst og samling',
  'Mat og drikke',
  'Helse og skjønnhet',
  'Verktøy',
  'Diverse'
]

export const prisRangerTorget = [
  'Alle priser',
  'Under 100kr',
  '100-500kr',
  '500-1000kr',
  '1000-5000kr',
  '5000-10000kr',
  'Over 10000kr'
]

export const tilstand = [
  'Alle tilstander',
  'Ny/ubrukt',
  'Som ny',
  'Lite brukt',
  'Godt brukt',
  'Slitt'
]

// Sorteringsalternativer
export const sorteringsAlternativer = {
  bil: [
    { value: 'nyeste', label: 'Nyeste først' },
    { value: 'pris-lav', label: 'Lavest pris først' },
    { value: 'pris-hoy', label: 'Høyest pris først' },
    { value: 'km-lav', label: 'Lavest km først' },
    { value: 'ar-ny', label: 'Nyeste årsmodell' },
    { value: 'mest-sett', label: 'Mest sette' }
  ],
  eiendom: [
    { value: 'nyeste', label: 'Nyeste først' },
    { value: 'pris-lav', label: 'Lavest pris først' },
    { value: 'pris-hoy', label: 'Høyest pris først' },
    { value: 'areal-stort', label: 'Størst areal først' },
    { value: 'rom-mange', label: 'Flest rom først' },
    { value: 'mest-sett', label: 'Mest sette' }
  ],
  torget: [
    { value: 'nyeste', label: 'Nyeste først' },
    { value: 'pris-lav', label: 'Lavest pris først' },
    { value: 'pris-hoy', label: 'Høyest pris først' },
    { value: 'relevans', label: 'Mest relevante' },
    { value: 'mest-sett', label: 'Mest sette' },
    { value: 'alfabetisk', label: 'A-Å' }
  ]
}

// Søkeforslag basert på kategori
export const sokeForslag = {
  bil: [
    'BMW X5',
    'Tesla Model 3',
    'Audi A4',
    'VW Golf',
    'Toyota Prius',
    'Mercedes C-klasse',
    'Volvo XC90',
    'Ford Focus'
  ],
  eiendom: [
    '3-roms leilighet Oslo',
    'Enebolig Bærum',
    'Hytte Lillehammer',
    'Leilighet sentrum',
    'Rekkehus barnefamilier',
    'Tomt sjønær'
  ],
  torget: [
    'iPhone 14',
    'MacBook Pro',
    'Gaming-PC',
    'Sofa IKEA',
    'Barnevogn',
    'Sykkel dame',
    'Vinterdekk',
    'PlayStation 5'
  ]
}

// Hurtigfiltre (ofte brukte kombinasjoner)
export const hurtigfiltre = {
  bil: [
    { navn: 'Elbiler under 400k', filter: { drivstoff: 'Elektrisk', maksPris: 400000 } },
    { navn: 'Familie-SUV', filter: { type: 'SUV', minAr: 2018 } },
    { navn: 'Økonomiske bensinbiler', filter: { drivstoff: 'Bensin', maksPris: 200000 } },
    { navn: 'Lav kilometerstand', filter: { maksKm: 50000 } }
  ],
  eiendom: [
    { navn: 'Førstegangsktjøper', filter: { maksPris: 3000000, minRom: 2 } },
    { navn: 'Barnefamilie', filter: { minRom: 4, type: 'Enebolig' } },
    { navn: 'Sentrale leiligheter', filter: { type: 'Leilighet', omrade: 'Oslo' } },
    { navn: 'Hytter', filter: { type: 'Hytte/Fritidsbolig' } }
  ],
  torget: [
    { navn: 'Mobiltelefoner', filter: { kategori: 'Elektronikk', subkategori: 'Mobil' } },
    { navn: 'Barneklær', filter: { kategori: 'Barn og baby', subkategori: 'Klær' } },
    { navn: 'Gaming', filter: { kategori: 'Elektronikk', subkategori: 'Gaming' } },
    { navn: 'Vintage møbler', filter: { kategori: 'Møbler', alder: 'Vintage' } }
  ]
}
