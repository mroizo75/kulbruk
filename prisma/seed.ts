import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  {
    name: 'Biler',
    slug: 'biler',
    description: 'Nye og brukte biler, motorsykler og andre kjøretøy',
    icon: 'Car',
    sortOrder: 1,
  },
  {
    name: 'Møbler',
    slug: 'mobler',
    description: 'Nye og brukte møbler for hjemmet og kontoret',
    icon: 'Home',
    sortOrder: 2,
  },
  {
    name: 'Elektronikk',
    slug: 'elektronikk', 
    description: 'Datamaskiner, telefoner, TV og annen elektronikk',
    icon: 'Laptop',
    sortOrder: 3,
  },
  {
    name: 'Eiendom',
    slug: 'eiendom',
    description: 'Leiligheter, hus og andre eiendommer til salgs eller leie',
    icon: 'Building',
    sortOrder: 4,
  },
  {
    name: 'Jobb',
    slug: 'jobb',
    description: 'Stillingsannonser og jobbannonser',
    icon: 'Briefcase',
    sortOrder: 5,
  },
  {
    name: 'Klær og mote',
    slug: 'klaer-og-mote',
    description: 'Klær, sko og moteartikler for dame, herre og barn',
    icon: 'Shirt',
    sortOrder: 6,
  },
  {
    name: 'Sport og fritid',
    slug: 'sport-og-fritid',
    description: 'Sportsutstyr, treningsapparater og fritidsartikler',
    icon: 'Dumbbell',
    sortOrder: 7,
  },
  {
    name: 'Hage og utendørs',
    slug: 'hage-og-utendors',
    description: 'Hageutstyr, utendørsmøbler og verktøy',
    icon: 'TreePine',
    sortOrder: 8,
  },
  {
    name: 'Hobby og musikk',
    slug: 'hobby-og-musikk',
    description: 'Musikkinstrumenter, bøker, spill og hobbyartikler',
    icon: 'Music',
    sortOrder: 9,
  },
  {
    name: 'Barn og baby',
    slug: 'barn-og-baby',
    description: 'Barnevogner, leker, klær og alt for barn',
    icon: 'Baby',
    sortOrder: 10,
  },
  {
    name: 'Kjæledyr',
    slug: 'kjaledyr',
    description: 'Dyr til salgs, utstyr og tilbehør til kjæledyr',
    icon: 'Heart',
    sortOrder: 11,
  },
  {
    name: 'Diverse',
    slug: 'diverse',
    description: 'Alt annet som ikke passer i andre kategorier',
    icon: 'Package',
    sortOrder: 12,
  }
]

async function main() {
  console.log('🌱 Starter seeding av kategorier...')

  // Slett eksisterende kategorier (kun for development)
  await prisma.category.deleteMany()

  // Opprett nye kategorier
  for (const category of categories) {
    const created = await prisma.category.create({
      data: category,
    })
    console.log(`✅ Opprettet kategori: ${created.name}`)
  }

  console.log('🎉 Seeding fullført!')
}

main()
  .catch((e) => {
    console.error('❌ Feil under seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })