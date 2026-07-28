import { prisma } from "../config/db.js";
import { convertToKg } from "../utils/covertToKg.js";

const createProgram = async (req, res) => {
  try {
    const { name, allotedBudget, programMaterial, description, isCashMode } =
      req.body ?? {};

    const barangayId = req.user.barangayId;

    if (!name || !allotedBudget || !programMaterial || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const record = await prisma.program.create({
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

    return res.status(201).json({ message: "Program created", record });
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
    const { name, allotedBudget, description, maxPoints, isActive, materials } =
      req.body ?? {};

    const data = {};
    if (name !== undefined) data.name = name;
    if (allotedBudget !== undefined) data.allotedBudget = allotedBudget;
    if (description !== undefined) data.description = description;
    if (maxPoints !== undefined) data.maxPoints = maxPoints;
    if (isActive !== undefined) data.isActive = isActive;

    await prisma.program.update({
      where: { id },
      data,
    });

    if (materials) {
      await Promise.all(
        materials.map(({ materialId, pointValue }) =>
          prisma.programMaterial.upsert({
            where: {
              programId_materialId: {
                programId: id,
                materialId,
              },
            },
            update: {
              pointValue: parseFloat(pointValue),
            },
            create: {
              programId: id,
              materialId,
              pointValue: parseFloat(pointValue),
            },
          }),
        ),
      );
    }

    return res.status(200).json({ message: "Update successful" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { programId, items, beneficiaryId, beneficiaryName, educationalLevel } =
      req.body ?? {};

    const { barangayId, id } = req.user;

    if (!programId || !items) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await prisma.user.findUnique({
      where: { barangayId, id },
      select: {
        firstName: true,
        lastName: true,
      }
    })

    const materials = await Promise.all(
      items.map((i) =>
        prisma.programMaterial.findUnique({
          where: { id: i.programMaterialId },
          select: {
            pointValue: true,
            cashValue: true,
            materialId: true,
            material: {
              select: {
                defaultUnit: true,
              },
            },
            program: {
              select: {
                isCashMode: true,
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
      let beneficiarySnapshot = null;
      let resolvedBeneficiaryId = beneficiaryId ?? null;

      if (beneficiaryId) {
        const beneficiary = await tx.beneficiary.findUnique({
          where: { barangayId, id: beneficiaryId },
          select: {
            id: true,
            name: true,
            points: true,
          },
        });

        if (!beneficiary) {
          throw new Error("Beneficiary not found")
        }

        beneficiarySnapshot = beneficiary.name;
      }

      if (!beneficiaryId && beneficiaryName) {
        const newBeneficiary = await tx.beneficiary.create({
          data: { name: beneficiaryName, barangayId, points: 0 },
        });
        resolvedBeneficiaryId = newBeneficiary.id;
        beneficiarySnapshot = beneficiaryName;
      }

      const transaction = await tx.redemptionTransaction.create({
        data: {
          programId,
          beneficiaryId: resolvedBeneficiaryId,
          collectorName: `${user.firstName} ${user.lastName}`,
          beneficiaryName: beneficiarySnapshot,
          educationalLevel,
          redemptionTransactionItem: {
            createMany: {
              data: items.map((item, index) => ({
                programMaterialId: item.programMaterialId,
                amount: item.amount,
                currentValue: materials[index].program.isCashMode
                  ? materials[index].cashValue
                  : materials[index].pointValue,
              })),
            },
          },
        },
      });

      const isCashMode = materials[0]?.program?.isCashMode;
      const totalPoints = items.reduce((total, item, index) => {
        return total + materials[index].pointValue * item.amount;
      }, 0);

      if (resolvedBeneficiaryId && !isCashMode) {
        await tx.beneficiary.update({
          where: {
            id: resolvedBeneficiaryId,
          },
          data: {
            points: {
              increment: totalPoints,
            },
          },
        });
      }

      const transactionLog = await tx.stockTransactionLog.createMany({
        data: items.map((item, index) => ({
          barangayId,
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

      return transaction
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

const getBeneficiaries = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const beneficiaries = await prisma.beneficiary.findMany({
      where: { barangayId },
      select: {
        id: true,
        name: true,
        points: true,
        createdAt: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Fetch beneficiaries successful", beneficiaries });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const searchBeneficiary = async (req, res) => {
  try {
    const { barangayId } = req.user;
    const { name } = req.query;

    const beneficiaries = await prisma.beneficiary.findMany({
      where: {
        barangayId,
        name: { contains: name, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        points: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Searching beneficiaries successful", beneficiaries });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  createProgram,
  getPrograms,
  getProgram,
  createTransaction,
  getTransactions,
  updateProgram,
  getTransaction,
  getBeneficiaries,
  searchBeneficiary,
};
