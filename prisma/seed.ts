import { PrismaClient, MatchStatus, Role } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clean up
  await prisma.match.deleteMany()
  await prisma.batch.deleteMany()
  await prisma.news.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@ngbhs.com',
        firebaseId: 'admin_dummy_id',
        name: 'Super Admin',
        role: Role.ADMIN,
      },
      {
        email: 'coadmin@ngbhs.com',
        firebaseId: 'coadmin_dummy_id',
        name: 'Tournament Manager',
        role: Role.CO_ADMIN,
      },
      {
        email: 'user@ngbhs.com',
        firebaseId: 'user_dummy_id',
        name: 'General User',
        role: Role.USER,
      },
    ],
  })

  // Create Batches
  const batches = [
    { name: 'Batch 2005', slug: 'batch-2005', year: 2005 },
    { name: 'Batch 2008', slug: 'batch-2008', year: 2008 },
    { name: 'Batch 2010', slug: 'batch-2010', year: 2010 },
    { name: 'Batch 2012', slug: 'batch-2012', year: 2012 },
    { name: 'Batch 2015', slug: 'batch-2015', year: 2015 },
    { name: 'Batch 2018', slug: 'batch-2018', year: 2018 },
  ]

  const createdBatches = await Promise.all(
    batches.map(batch => prisma.batch.create({ data: batch }))
  )

  // Create Matches
  await prisma.match.create({
    data: {
      date: new Date(),
      status: MatchStatus.LIVE,
      homeTeamId: createdBatches[2].id, // 2010
      awayTeamId: createdBatches[3].id, // 2012
      homeScore: 2,
      awayScore: 1,
      isFeatured: true,
      venue: 'Main Stadium'
    }
  })

  await prisma.match.create({
    data: {
      date: new Date(),
      status: MatchStatus.SCHEDULED,
      homeTeamId: createdBatches[0].id, // 2005
      awayTeamId: createdBatches[1].id, // 2008
      venue: 'Pitch B'
    }
  })

  // Create News
  await prisma.news.create({
    data: {
      title: 'Tournament Kickoff Success!',
      slug: 'tournament-kickoff-success',
      content: 'The NGBHS Reunion Football Tournament started with a bang...',
      excerpt: 'The lights, the crowd, and the reunion spirit were at an all-time high...',
      isExclusive: true
    }
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
