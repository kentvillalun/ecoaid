import { prisma } from "../config/db.js";
import { convertToKg } from "../utils/covertToKg.js";
import { getResidentProgramBalance } from "../utils/residentPoints.js";

// every material in a request has to belong to the requesting barangay,
// otherwise a program could be built from another barangay's materials
const materialsBelongToBarangay = async (materialIds, barangayId) => {
  const uniqueIds = [...new Set(materialIds)];

  const count = await prisma.material.count({
    where: { id: { in: uniqueIds }, barangayId },
  });

  return count === uniqueIds.length;
};

const createProgram = async (req, res) => {
  try {
    const {
      name,
      allotedBudget,
      programMaterial,
      description,
      isCashMode,
      announce,
    } = req.body ?? {};

    const { barangayId, id: userId, role } = req.user;

    if (!name || !allotedBudget || !programMaterial || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!Array.isArray(programMaterial) || programMaterial.length === 0) {
      return res
        .status(400)
        .json({ error: "A program needs at least one material" });
    }

    const ownsMaterials = await materialsBelongToBarangay(
      programMaterial.map((pm) => pm.materialId),
      barangayId,
    );

    if (!ownsMaterials) {
      return res.status(404).json({ error: "Material not found" });
    }

    // only roles allowed to post announcements manually may auto-announce;
    // TREASURER can create programs but announcing is silently skipped
    const shouldAnnounce =
      announce === true && ["CAPTAIN", "SECRETARY", "SK"].includes(role);

    let announcementData = null;

    if (shouldAnnounce) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          lastName: true,
        },
      });

      const materials = await prisma.material.findMany({
        where: {
          barangayId,
          id: { in: programMaterial.map((pm) => pm.materialId) },
        },
        select: {
          id: true,
          name: true,
          defaultUnit: true,
        },
      });

      const materialLines = programMaterial
        .map((pm) => {
          const material = materials.find((m) => m.id === pm.materialId);
          if (!material) return null;

          const unit = material.defaultUnit.toLowerCase();
          return isCashMode
            ? `• ${material.name} - ₱${pm.cashValue}/${unit}`
            : `• ${material.name} - ${pm.pointValue} pts/${unit}`;
        })
        .filter(Boolean);

      announcementData = {
        barangayId,
        userId,
        title: `${name}`,
        content: `${description}\n\nAccepted materials:\n${materialLines.join("\n")}`,
        category: "EVENT",
        performedBy: `${user.firstName} ${user.lastName}`,
        performedByRole: role,
      };
    }

    const record = await prisma.$transaction(async (tx) => {
      const program = await tx.program.create({
        data: {
          barangayId,
          name,
          allotedBudget,
          description,
          isCashMode,
          programMaterial: {
            createMany: {
              data: programMaterial,
            },
          },
        },
      });

      if (announcementData) {
        await tx.announcement.create({ data: announcementData });
      }

      return program;
    });

    return res
      .status(201)
      .json({ message: "Program created", record, announced: shouldAnnounce });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getPrograms = async (req, res) => {
  try {
    const barangayId = req.user.barangayId;

    const programs = await prisma.program.findMany({
      where: { barangayId },
      include: {
        programMaterial: {
          include: {
            material: {
              select: {
                defaultUnit: true,
                name: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res
      .status(200)
      .json({ message: "Fetching requests successful", programs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const barangayId = req.user.barangayId;

    const program = await prisma.program.findUnique({
      where: { id, barangayId },
      include: {
        programMaterial: {
          include: {
            material: {
              select: {
                name: true,
                defaultUnit: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        redemptionTransaction: {
          include: {
            redemptionTransactionItem: {
              include: {
                programMaterial: {
                  select: {
                    material: {
                      select: {
                        name: true,
                        defaultUnit: true,
                        category: {
                          select: {
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!program) {
      return res.status(404).json({ error: "Program does not exist" });
    }

    return res.status(200).json({
      message: "Fetching successful",
      program,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, allotedBudget, description, maxPoints, isActive, materials, isCashMode } =
      req.body ?? {};
    const { barangayId } = req.user;

    const program = await prisma.program.findUnique({
      where: { id, barangayId },
      select: {
        isCashMode: true,
        _count: { select: { redemptionTransaction: true } },
      },
    });

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (allotedBudget !== undefined) data.allotedBudget = allotedBudget;
    if (description !== undefined) data.description = description;
    if (maxPoints !== undefined) data.maxPoints = maxPoints;
    if (isActive !== undefined) data.isActive = isActive;

    // existing transactions store their values as points or as pesos, so the
    // mode can only change while the program has no transactions
    const isModeChanging =
      typeof isCashMode === "boolean" && isCashMode !== program.isCashMode;

    if (isModeChanging) {
      if (program._count.redemptionTransaction > 0) {
        return res.status(400).json({
          error: "Cannot change the redemption mode: the program already has transactions",
        });
      }

      // the old values are for the other mode, so new ones are required
      if (!materials) {
        return res.status(400).json({
          error: "Material values are required when changing the redemption mode",
        });
      }

      data.isCashMode = isCashMode;
    }

    const effectiveIsCashMode = isModeChanging ? isCashMode : program.isCashMode;

    const operations = [
      prisma.program.update({
        where: { id, barangayId },
        data,
      }),
    ];

    if (materials) {
      if (!Array.isArray(materials) || materials.length === 0) {
        return res
          .status(400)
          .json({ error: "A program needs at least one material" });
      }

  
      const values = materials.map((m) => parseFloat(m.pointValue ?? m.cashValue));
      if (values.some((v) => !Number.isFinite(v))) {
        return res.status(400).json({ error: "Invalid material value" });
      }

      const ownsMaterials = await materialsBelongToBarangay(
        materials.map((m) => m.materialId),
        barangayId,
      );

      if (!ownsMaterials) {
        return res.status(404).json({ error: "Material not found" });
      }

      
      const removed = await prisma.programMaterial.findMany({
        where: {
          programId: id,
          materialId: { notIn: materials.map((m) => m.materialId) },
        },
        select: {
          id: true,
          material: { select: { name: true } },
          _count: { select: { redemptionTransactionItem: true } },
        },
      });

      const inUse = removed.filter((r) => r._count.redemptionTransactionItem > 0);
      if (inUse.length > 0) {
        return res.status(400).json({
          error: `Cannot remove ${inUse
            .map((r) => r.material.name)
            .join(", ")}: already used in transactions`,
        });
      }

      const valueField = effectiveIsCashMode ? "cashValue" : "pointValue";
      const otherField = effectiveIsCashMode ? "pointValue" : "cashValue";

      operations.push(
        prisma.programMaterial.deleteMany({
          where: { id: { in: removed.map((r) => r.id) } },
        }),
        ...materials.map(({ materialId }, index) =>
          prisma.programMaterial.upsert({
            where: {
              programId_materialId: {
                programId: id,
                materialId,
              },
            },
            update: { [valueField]: values[index], [otherField]: null },
            create: { programId: id, materialId, [valueField]: values[index] },
          }),
        ),
      );
    }

    // all-or-nothing: a failed removal can't leave the program half-updated
    await prisma.$transaction(operations);

    return res.status(200).json({ message: "Update successful" });
  } catch (error) {
    // anything reaching here is unexpected, so it is a server error
    return res.status(500).json({ error: error.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { programId, items, residentId } = req.body ?? {};

    const { barangayId, id } = req.user;

    if (!programId || !items || !residentId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const program = await prisma.program.findUnique({
      where: { id: programId, barangayId },
      select: { isActive: true, isCashMode: true },
    });

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    if (!program.isActive) {
      return res.status(400).json({ error: "Program is inactive" });
    }

    const collector = await prisma.user.findUnique({
      where: { barangayId, id },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    const resident = await prisma.user.findUnique({
      where: { barangayId, id: residentId, role: "RESIDENT" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
    }

    const materials = await Promise.all(
      items.map((i) =>
        prisma.programMaterial.findUnique({
          where: {
            id: i.programMaterialId,
            programId,
            program: {
              barangayId,
            },
          },
          select: {
            pointValue: true,
            cashValue: true,
            materialId: true,
            material: {
              select: {
                defaultUnit: true,
              },
            },
          },
        }),
      ),
    );

    if (materials.some((m) => m === null)) {
      return res.status(404).json({ error: "Program material not found" });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const transaction = await tx.redemptionTransaction.create({
        data: {
          programId,
          residentId: resident.id,
          collectorName: `${collector.firstName} ${collector.lastName}`,
          residentName: `${resident.firstName} ${resident.lastName}`,
          redemptionTransactionItem: {
            createMany: {
              data: items.map((item, index) => ({
                programMaterialId: item.programMaterialId,
                amount: item.amount,
                currentValue: program.isCashMode
                  ? materials[index].cashValue
                  : materials[index].pointValue,
              })),
            },
          },
        },
      });

      // taking part in a redemption counts as being active, just like a
      // completed pickup or intake, so the resident can see programs and points
      await tx.user.update({
        where: { id: resident.id },
        data: { isVerified: true },
      });

      await tx.stockTransactionLog.createMany({
        data: items.map((item, index) => ({
          barangayId,
          userId: resident.id,
          redemptionTransactionId: transaction.id,
          source: "REDEMPTION",
          transactionType: "IN",
          materialId: materials[index].materialId,
          unit:
            materials[index].material.defaultUnit === "PIECE" ? "PIECE" : "KG",
          quantity: convertToKg(
            item.amount,
            materials[index].material.defaultUnit,
          ),
        })),
      });

      return transaction;
    });

    return res.status(201).json({
      message: "Transaction Created",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const barangayId = req.user.barangayId;

    const transactions = await prisma.redemptionTransaction.findMany({
      where: {
        program: {
          barangayId,
        },
      },
      include: {
        program: true,
        redemptionTransactionItem: {
          include: {
            programMaterial: {
              select: {
                material: {
                  select: {
                    name: true,
                    defaultUnit: true,
                    category: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      message: "Fetching trasactions successful",
      transactions,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getTransaction = async (req, res) => {
  try {
    const barangayId = req.user.barangayId;
    const { id } = req.params;

    const transaction = await prisma.redemptionTransaction.findUnique({
      where: {
        id,
        program: {
          barangayId,
        },
      },
      include: {
        program: true,
        redemptionTransactionItem: {
          include: {
            programMaterial: {
              select: {
                pointValue: true,
                cashValue: true,
                material: {
                  select: {
                    name: true,
                    defaultUnit: true,
                    category: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res
      .status(200)
      .json({ message: "Fetch transaciton successful", transaction });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const searchResident = async (req, res) => {
  try {
    const { barangayId } = req.user;
    const { name, programId } = req.query;

    if (!programId) {
      return res.status(400).json({ error: "Program is required" });
    }

    // "juan dela" should match first name "Juan" + last name "Dela Cruz",
    // so every typed word must match either the first or the last name
    const words = (name ?? "").trim().split(/\s+/).filter(Boolean);

    const residents = await prisma.user.findMany({
      where: {
        barangayId,
        role: "RESIDENT",
        AND: words.map((word) => ({
          OR: [
            { firstName: { contains: word, mode: "insensitive" } },
            { lastName: { contains: word, mode: "insensitive" } },
          ],
        })),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      take: 10,
    });

    // points shown here are scoped to the selected program
    const residentsWithPoints = await Promise.all(
      residents.map(async (resident) => ({
        id: resident.id,
        name: `${resident.firstName} ${resident.lastName}`,
        points: await getResidentProgramBalance(resident.id, programId),
      })),
    );

    return res.status(200).json({
      message: "Searching residents successful",
      residents: residentsWithPoints,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getResidentPrograms = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const barangay = await prisma.barangay.findUnique({
      where: { id: barangayId },
      select: {
        hasRedemptionManagement: true,
      },
    });

    if (!barangay?.hasRedemptionManagement) {
      return res.status(200).json({
        message: "Redemption management is disabled",
        enabled: false,
        programs: [],
      });
    }

    const programs = await prisma.program.findMany({
      where: { barangayId, isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        isCashMode: true,
        createdAt: true,
        programMaterial: {
          select: {
            id: true,
            pointValue: true,
            cashValue: true,
            material: {
              select: {
                name: true,
                defaultUnit: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        rewardItems: {
          where: { quantity: { gt: 0 } },
          select: {
            id: true,
            name: true,
            category: true,
            pointCost: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Fetching programs successful",
      enabled: true,
      programs,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  createProgram,
  getResidentPrograms,
  getPrograms,
  getProgram,
  createTransaction,
  getTransactions,
  updateProgram,
  getTransaction,
  searchResident,
};
