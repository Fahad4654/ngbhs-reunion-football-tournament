import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for duplicate phone numbers...');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      phone: true,
      email: true
    }
  });

  const phoneMap = new Map();
  const duplicates = [];

  for (const user of users) {
    if (user.phone) {
      if (phoneMap.has(user.phone)) {
        duplicates.push({
          phone: user.phone,
          original: phoneMap.get(user.phone),
          duplicate: user.email
        });
      } else {
        phoneMap.set(user.phone, user.email);
      }
    }
  }

  if (duplicates.length > 0) {
    console.log('Found duplicate phone numbers:');
    console.table(duplicates);
    
    console.log('Nullifying duplicate phone numbers to allow schema update...');
    for (const dup of duplicates) {
      await prisma.user.updateMany({
        where: { phone: dup.phone },
        data: { phone: null }
      });
      console.log(`Nullified phone ${dup.phone}`);
    }
  } else {
    console.log('No duplicate phone numbers found.');
  }

  // Also nullify empty strings as they violate unique constraint in Postgres if multiple
  console.log('Nullifying empty phone strings...');
  const emptyPhones = await prisma.user.updateMany({
    where: { phone: '' },
    data: { phone: null }
  });
  console.log(`Nullified ${emptyPhones.count} empty phone strings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
