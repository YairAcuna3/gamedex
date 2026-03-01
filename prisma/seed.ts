import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Crear premios con sus scopes definidos
  const awards = [
    { code: "GOLD", name: "Oro", scope: "MONTHLY" },
    { code: "SILVER", name: "Plata", scope: "MONTHLY" },
    { code: "BRONZE", name: "Bronce", scope: "MONTHLY" },
    { code: "GOTY", name: "Game Of The Year", scope: "YEARLY" },
  ];

  for (const award of awards) {
    await prisma.award.upsert({
      where: { code: award.code as any },
      update: { scope: award.scope as any },
      create: award as any,
    });
  }

  console.log("✅ Premios creados exitosamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
