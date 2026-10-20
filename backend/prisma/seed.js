import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../src/generated/prisma/index.js";
import {
  CORE_MATERIALS,
  createCoreMaterials,
  ensureCoreCategories,
} from "../src/utils/coreMaterials.js";

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

async function seedSampleResident() {
  // Look up by zip code — IDs change after every migrate reset
  const barangay = await prisma.barangay.findUniqueOrThrow({
    where: { zipCode: DEV_BARANGAY.zipCode },
  });

  const DEV_SAMPLE_RESIDENT = {
    username: "testResident",
    phoneNumber: "09265065614",
    passwordHash: "Resident@123",
    role: Role.RESIDENT,
    barangayId: barangay.id,
    firstName: "Test",
    lastName: "Resident",
  };

  const passwordHash = await bcrypt.hash(DEV_SAMPLE_RESIDENT.passwordHash, 10);

  await prisma.user.upsert({
    where: {
      username: DEV_SAMPLE_RESIDENT.username,
    },
    update: {
      username: DEV_SAMPLE_RESIDENT.username,
      phoneNumber: DEV_SAMPLE_RESIDENT.phoneNumber,
      passwordHash,
      role: DEV_SAMPLE_RESIDENT.role,
      barangayId: DEV_SAMPLE_RESIDENT.barangayId,
      firstName: DEV_SAMPLE_RESIDENT.firstName,
      lastName: DEV_SAMPLE_RESIDENT.lastName,
    },
    create: {
      username: DEV_SAMPLE_RESIDENT.username,
      phoneNumber: DEV_SAMPLE_RESIDENT.phoneNumber,
      passwordHash,
      role: DEV_SAMPLE_RESIDENT.role,
      barangayId: DEV_SAMPLE_RESIDENT.barangayId,
      firstName: DEV_SAMPLE_RESIDENT.firstName,
      lastName: DEV_SAMPLE_RESIDENT.lastName,
    },
  });
}

async function seedSuperAdmin() {
  const DEV_SUPER_ADMIN = {
    username: "superadmin",
    phoneNumber: "09943304495",
    passwordHash: "SuperAdmin@123",
    role: Role.SUPER_ADMIN,
    barangayId: null,
    isActive: true,
    firstName: "Kent",
    lastName: "Villalun",
  };

  const passwordHash = await bcrypt.hash(DEV_SUPER_ADMIN.passwordHash, 10);

  await prisma.user.upsert({
    where: {
      username: DEV_SUPER_ADMIN.username,
    },
    update: {
      username: DEV_SUPER_ADMIN.username,
      phoneNumber: DEV_SUPER_ADMIN.phoneNumber,
      passwordHash,
      role: DEV_SUPER_ADMIN.role,
      barangayId: DEV_SUPER_ADMIN.barangayId,
      isActive: DEV_SUPER_ADMIN.isActive,
      firstName: DEV_SUPER_ADMIN.firstName,
      lastName: DEV_SUPER_ADMIN.lastName,
    },
    create: {
      username: DEV_SUPER_ADMIN.username,
      phoneNumber: DEV_SUPER_ADMIN.phoneNumber,
      passwordHash,
      role: DEV_SUPER_ADMIN.role,
      barangayId: DEV_SUPER_ADMIN.barangayId,
      isActive: DEV_SUPER_ADMIN.isActive,
      firstName: DEV_SUPER_ADMIN.firstName,
      lastName: DEV_SUPER_ADMIN.lastName,
    },
  });

  console.log("Seeded Super Admin account", {
    username: DEV_SUPER_ADMIN.username,
    phoneNumber: DEV_SUPER_ADMIN.phoneNumber,
    role: DEV_SUPER_ADMIN.role,
    barangayId: DEV_SUPER_ADMIN.barangayId,
    firstName: DEV_SUPER_ADMIN.firstName,
    lastName: DEV_SUPER_ADMIN.lastName,
  });
}

async function seedBarangayTestingAccounts() {
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

  return barangay;
}

// Core categories + materials every barangay needs.
// New barangays get these automatically on registration; this backfills any existing ones.
async function seedCoreMaterials() {
  await ensureCoreCategories(prisma);
  console.log("Seeded categories:", Object.keys(CORE_MATERIALS));

  const barangays = await prisma.barangay.findMany({ select: { id: true, name: true } });
  for (const barangay of barangays) {
    await createCoreMaterials(prisma, barangay.id);
    console.log(`Seeded core materials for ${barangay.name}`);
  }
}

async function main() {
  // await seedSuperAdmin();
  // await seedCoreMaterials();
  await seedSampleResident();
  // console.log("Seeded sample resident: testResident");

  // Dev/training data — not needed for pilot testing
  // await seedBarangayTestingAccounts();
  await seedCoreMaterials();
  // await seedSampleResident();
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
