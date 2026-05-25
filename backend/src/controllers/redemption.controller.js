import { prisma } from "../config/db.js";

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
    const {
      programId,
      items,
      collectorName,
      beneficiaryName,
      educationalLevel,
    } = req.body ?? {};

    if (!programId || !items || !collectorName || !beneficiaryName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const materials = await Promise.all(
      items.map((i) =>
        prisma.programMaterial.findUnique({
          where: { id: i.programMaterialId },
          select: {
            pointValue: true,
            cashValue: true,
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

    const transaction = await prisma.redemptionTransaction.create({
      data: {
        programId,
        collectorName,
        beneficiaryName,
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

export {
  createProgram,
  getPrograms,
  getProgram,
  createTransaction,
  getTransactions,
  updateProgram,
  getTransaction,
};
