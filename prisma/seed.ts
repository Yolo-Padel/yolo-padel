import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@yolopadel.com',
      username: 'admin',
      password: '$2a$12$BdMP2qir947/i1M3sx/wHOmg.DYtFtZhJXD3E5DvfZokrhoAy/UOa', // In production, use proper password hashing
      role: 'ADMIN',
      isEmailVerified: true,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      username: 'janesmith',
      password: '$2a$12$XRb.4anJ7quwe4VLR6uNbO4ICi6onmbfBiAtl.Y86Gmi/Dvz0.NDW',
      role: 'MEMBER',
      isEmailVerified: false,
    },
  })

  // Create profiles for users
  await prisma.profile.create({
    data: {
      userId: user1.id,
      firstName: 'Admin',
      lastName: 'YoloPadel',
      bio: 'System administrator for Yolo Padel platform',
      preferences: {
        notifications: true,
        theme: 'dark',
        language: 'id',
      },
    },
  })

  await prisma.profile.create({
    data: {
      userId: user2.id,
      firstName: 'Jane',
      lastName: 'Smith',
      bio: 'Professional padel player and member',
      preferences: {
        notifications: false,
        theme: 'light',
        language: 'en',
      },
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`Created ${await prisma.user.count()} users`)
  console.log(`Created ${await prisma.profile.count()} profiles`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
