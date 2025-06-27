import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const admin = await prisma.admin.upsert({
      where: { username: "SW-admin" },
      update: {},
      create: {
        username: "SW-admin",
        password: "Xk9#mP2$qR8@",
      },
    });

    console.log("Admin user created successfully:");
    console.log("Username:", admin.username);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
