import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../src/generated/prisma/index.js";

// To seed, just run this command after migrate reset
// node prisma/seed.js

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const DEV_BARANGAY = {
  name: "Beddeng Laud",
  municipality: "Vigan City",
  province: "Ilocos Sur",
  zipCode: "2700",
  logoUrl: null,
  adminPhoneNumber: "09990000001",
  adminPassword: "barangay123",
  adminFirstName: "Beddeng",
  adminLastName: "Laud Admin",
  sitios: ["Sitio 1", "Sitio 2", "Sitio 3"],
  adminUsername: "barangayadmin",
  contactNumber: "09177744669",
};

const DEV_STAFF = [
  {
    phoneNumber: "09990000002",
    firstName: "Secretary",
    lastName: "Dev",
    role: Role.SECRETARY,
    username: "secretarydev",
  },
  {
    phoneNumber: "09990000003",
    firstName: "Treasurer",
    lastName: "Dev",
    role: Role.TREASURER,
    username: "treasurerdev",
  },
  {
    phoneNumber: "09990000004",
    firstName: "SK",
    lastName: "Dev",
    role: Role.SK,
    username: "skdev",
  },
  {
    phoneNumber: "09990000005",
    firstName: "Collector",
    lastName: "Dev",
    role: Role.COLLECTOR,
    username: "collectordev",
  },
];

const DEV_CATEGORIES = ["Metals", "Papers", "Plastics", "Glass"];

async function main() {
  const passwordHash = await bcrypt.hash(DEV_BARANGAY.adminPassword, 10);

  const barangay = await prisma.barangay.upsert({
    where: {
      zipCode: DEV_BARANGAY.zipCode,
    },
    update: {
      name: DEV_BARANGAY.name,
      municipality: DEV_BARANGAY.municipality,
      province: DEV_BARANGAY.province,
      isRegistered: true,
      contactNumber: DEV_BARANGAY.contactNumber,
    },
    create: {
      name: DEV_BARANGAY.name,
      municipality: DEV_BARANGAY.municipality,
      province: DEV_BARANGAY.province,
      zipCode: DEV_BARANGAY.zipCode,
      isRegistered: true,
      contactNumber: DEV_BARANGAY.contactNumber,
    },
  });

  for (const sitioName of DEV_BARANGAY.sitios) {
    await prisma.sitio.upsert({
      where: {
        barangayId_name: {
          barangayId: barangay.id,
          name: sitioName,
        },
      },
      update: {},
      create: {
        name: sitioName,
        barangayId: barangay.id,
      },
    });
  }

  for (const staff of DEV_STAFF) {
    await prisma.user.upsert({
      where: { phoneNumber: staff.phoneNumber },
      update: {
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
        passwordHash,
        barangayId: barangay.id,
        address: `Barangay Hall, ${DEV_BARANGAY.name}, ${DEV_BARANGAY.municipality}`,
        isActive: true,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        username: staff.username,
      },
      create: {
        phoneNumber: staff.phoneNumber,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
        passwordHash,
        barangayId: barangay.id,
        address: `Barangay Hall, ${DEV_BARANGAY.name}, ${DEV_BARANGAY.municipality}`,
        isActive: true,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        username: staff.username,
      },
    });
  }

  console.log(
    "Seeded staff accounts:",
    DEV_STAFF.map((s) => `${s.username} (${s.role})`),
  );

  await prisma.user.upsert({
    where: {
      phoneNumber: DEV_BARANGAY.adminPhoneNumber,
    },
    update: {
      firstName: DEV_BARANGAY.adminFirstName,
      lastName: DEV_BARANGAY.adminLastName,
      role: Role.CAPTAIN,
      passwordHash,
      barangayId: barangay.id,
      address: `Barangay Hall, ${DEV_BARANGAY.name}, ${DEV_BARANGAY.municipality}`,
      isActive: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      username: DEV_BARANGAY.adminUsername,
    },
    create: {
      phoneNumber: DEV_BARANGAY.adminPhoneNumber,
      firstName: DEV_BARANGAY.adminFirstName,
      lastName: DEV_BARANGAY.adminLastName,
      role: Role.CAPTAIN,
      passwordHash,
      barangayId: barangay.id,
      address: `Barangay Hall, ${DEV_BARANGAY.name}, ${DEV_BARANGAY.municipality}`,
      isActive: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      username: DEV_BARANGAY.adminUsername,
    },
  });

  console.log("Seeded development barangay account:", {
    barangay: DEV_BARANGAY.name,
    municipality: DEV_BARANGAY.municipality,
    adminPhoneNumber: DEV_BARANGAY.adminPhoneNumber,
    sitios: DEV_BARANGAY.sitios,
  });

  for (const categoryName of DEV_CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
      },
    });
  }

  const categories = await prisma.category.findMany();

  const metals = categories.find((c) => c.name === "Metals");
  const papers = categories.find((c) => c.name === "Papers");
  const plastics = categories.find((c) => c.name === "Plastics");
  const glass = categories.find((c) => c.name === "Glass");

  const DEV_METALS = [
    { name: "Aluminum Cans", defaultUnit: "KG" },
    { name: "Tin Cans", defaultUnit: "PIECE" },
    { name: "Steel Scraps", defaultUnit: "KG" },
    { name: "Iron Scraps", defaultUnit: "KG" },
  ];
  const DEV_PAPERS = [
    { name: "Newspaper", defaultUnit: "KG" },
    { name: "Cardboard", defaultUnit: "KG" },
  ];
  const DEV_PLASTICS = [
    { name: "Plastic Bottles (PET)", defaultUnit: "PIECE" },
    { name: "Plastic Bags", defaultUnit: "KG" },
    { name: "Hard Plastics", defaultUnit: "KG" },
  ];
  const DEV_GLASS = [
    { name: "Alak Bottles", defaultUnit: "PIECE" },
    { name: "Beer Bottles", defaultUnit: "PIECE" },
  ];

  for (const { name, defaultUnit } of DEV_METALS) {
    await prisma.material.upsert({
      where: {
        name_barangayId: {
          name,
          barangayId: barangay.id,
        },
      },
      update: {
        categoryId: metals.id,
        defaultUnit,
      },
      create: {
        name,
        barangayId: barangay.id,
        categoryId: metals.id,
        defaultUnit,
      },
    });
  }

  for (const { name, defaultUnit } of DEV_PAPERS) {
    await prisma.material.upsert({
      where: {
        name_barangayId: {
          name,
          barangayId: barangay.id,
        },
      },
      update: {
        categoryId: papers.id,
        defaultUnit,
      },
      create: {
        name,
        barangayId: barangay.id,
        categoryId: papers.id,
        defaultUnit,
      },
    });
  }

  for (const { name, defaultUnit } of DEV_PLASTICS) {
    await prisma.material.upsert({
      where: {
        name_barangayId: {
          name,
          barangayId: barangay.id,
        },
      },
      update: {
        categoryId: plastics.id,
        defaultUnit,
      },
      create: {
        name,
        barangayId: barangay.id,
        categoryId: plastics.id,
        defaultUnit,
      },
    });
  }

  for (const { name, defaultUnit } of DEV_GLASS) {
    await prisma.material.upsert({
      where: {
        name_barangayId: {
          name,
          barangayId: barangay.id,
        },
      },
      update: {
        categoryId: glass.id,
        defaultUnit,
      },
      create: {
        name,
        barangayId: barangay.id,
        categoryId: glass.id,
        defaultUnit,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
