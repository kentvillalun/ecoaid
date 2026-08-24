import { prisma } from "../config/db.js";

export const getMrfInventoryReport = async (barangayId, startDate, endDate) => {
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1);
  const materials = await prisma.stockTransactionLog.findMany({
    where: {
      barangayId,
      createdAt: {
        gte: new Date(startDate),
        lt: end,
      },
    },
    select: {
      createdAt: true,
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
      transactionType: true,
      quantity: true,
      unit: true,
    },
  });

  const enrichedMaterials = materials.reduce((acc, transaction) => {
    const date = transaction.createdAt.toISOString().slice(0, 10);

    const key = `${transaction.material.name}_${date}`;

    if (!acc[key]) {
      acc[key] = {
        date,
        material: transaction.material.name,
        category: transaction.material.category.name,
        quantityIn: 0,
        quantityOut: 0,
        net: 0,
      };
    }

    if (transaction.transactionType === "IN") {
      acc[key].quantityIn += transaction.quantity;
      acc[key].net += transaction.quantity;
    } else {
      acc[key].quantityOut += transaction.quantity;
      acc[key].net -= transaction.quantity;
    }

    return acc;
  }, {});

  const results = Object.values(enrichedMaterials);

  return { results };
};

export const getCollectionIntakeReports = async (
  barangayId,
  startDate,
  endDate,
) => {
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1);

  const requests = await prisma.pickupRequests.findMany({
    where: {
      barangayId,
      collectedAt: {
        gte: new Date(startDate),
        lt: end,
      },
      status: "COLLECTED",
    },
    select: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      collectedAt: true,
      collectionItems: {
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
          actualUnit: true,
          actualValue: true,
        },
      },
    },
  });

  const manualIntakes = await prisma.manualIntakeTransaction.findMany({
    where: {
      barangayId,
      createdAt: {
        gte: new Date(startDate),
        lt: end,
      },
    },
    select: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      householdName: true,
      createdAt: true,
      manualIntakeItems: {
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
          unit: true,
          quantity: true,
        },
      },
    },
  });

  const mappedRequests = requests.map((r) => {
    return {
      residentName: `${r.user.firstName} ${r.user.lastName}`,
      date: r.collectedAt,
      channel: "App Request",
      materials: r.collectionItems.map((item) => ({
        name: item.material.name,
        category: item.material.category.name,
        unit: item.actualUnit,
        quantity: item.actualValue,
      })),
    };
  });

  const mappedManualIntakes = manualIntakes.map((intake) => {
    return {
      residentName: intake.user
        ? `${intake.user.firstName} ${intake.user.lastName}`
        : intake.householdName,
      date: intake.createdAt,
      channel: "Manual Intake",
      materials: intake.manualIntakeItems.map((item) => ({
        name: item.material.name,
        category: item.material.category.name,
        unit: item.unit,
        quantity: item.quantity,
      })),
    };
  });

  const mergedRecords = [...mappedRequests, ...mappedManualIntakes];

  return { mergedRecords };
};

export const getRedemptionReports = async (
  barangayId,
  startDate,
  endDate,
  programId,
) => {
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1);

  const transactions = await prisma.redemptionTransaction.findMany({
    where: {
      program: {
        barangayId,
      },
      createdAt: {
        gte: new Date(startDate),
        lt: end,
      },
      ...(programId && { programId }),
    },
    select: {
      beneficiaryName: true,
      createdAt: true,
      // joined per-row (not filtered to a single program) so a report spanning
      // multiple programs can label/format each row by its own program's mode
      program: {
        select: {
          isCashMode: true,
        },
      },
      redemptionTransactionItem: {
        select: {
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
          amount: true,
          currentValue: true,
        },
      },
      educationalLevel: true,
    },
  });

  const rewardReleases = await prisma.rewardRelease.findMany({
    where: {
      barangayId,
      createdAt: {
        gte: new Date(startDate),
        lt: end,
      },
      ...(programId && { programId }),
    },
    select: {
      beneficiaryName: true,
      createdAt: true,
      quantity: true,
      rewardItem: {
        select: {
          name: true,
          category: true,
          pointCost: true,
        },
      },
    },
  });

  const merged = transactions.map((t) => {
    const matchedRelease = rewardReleases.filter(
      (r) => r.beneficiaryName === t.beneficiaryName,
    );

    const pointsEarned = t.redemptionTransactionItem.reduce((acc, item) => {
      return acc + item.amount * item.currentValue;
    }, 0);
    return {
      beneficiaryName: t.beneficiaryName,
      dateSubmitted: t.createdAt,
      isCashMode: t.program.isCashMode,
      educationalLevel: t.educationalLevel,
      materialsCollected: t.redemptionTransactionItem.map((item) => ({
        name: item.programMaterial.material.name,
        category: item.programMaterial.material.category.name,
        unit: item.programMaterial.material.defaultUnit,
        amount: item.amount,
        currentValue: item.currentValue,
      })),
      pointsEarned,
      rewardReceived: matchedRelease.map((r) => ({
        name: r.rewardItem.name,
        category: r.rewardItem.category,
        quantity: r.quantity,
        date: r.createdAt
      })),
      pointsSpent: matchedRelease.reduce((total, row) => {
        return total + row.quantity * row.rewardItem.pointCost;
      }, 0),
    };
  });

  return { merged };
};

export const getProgramFundsReport = async (barangayId, startDate, endDate) => {
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1);

  const sales = await prisma.junkshopSale.findMany({
    where: {
      junkshop: {
        barangayId,
      },
      createdAt: {
        gte: new Date(startDate),
        lt: end,
      },
    },
    select: {
      junkshop: {
        select: {
          name: true,
        },
      },
      createdAt: true,
      performedBy: true,
      performedByRole: true,
      saleItems: {
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
          quantity: true,
          cost: true,
          unit: true,
        },
      },
    },
  });

  const expenses = await prisma.programExpense.findMany({
    where: {
      barangayId,
      createdAt: {
        gte: new Date(startDate),
        lt: end,
      },
    },
    select: {
      name: true,
      amount: true,
      description: true,
      performedBy: true,
      performedByRole: true,
      createdAt: true,
      program: {
        select: {
          name: true,
        },
      },
    },
  });

  const mappedSales = sales.map((sale) => {
    return {
      type: "income",
      name: sale.junkshop.name,
      description: `Sold to: ${sale.junkshop.name}`,
      program: "—",
      amount: sale.saleItems.reduce((total, item) => {
        return total + item.cost * item.quantity;
      }, 0),
      materials: sale.saleItems.map((item) => ({
        name: item.material.name,
        category: item.material.category.name,
        unit: item.unit,
        quantity: item.quantity,
        cost: item.cost,
      })),
      performedBy: sale.performedBy,
      performedByRole: sale.performedByRole,
      date: sale.createdAt,
    };
  });

  const mappedExpenses = expenses.map((e) => {
    return {
      type: "expense",
      name: e.name,
      description: e.description,
      program: e.program.name,
      amount: e.amount,
      materials: [],
      performedBy: e.performedBy,
      performedByRole: e.performedByRole,
      date: e.createdAt,
    };
  });

  const mergedRows = [...mappedSales, ...mappedExpenses];

  const totalIncome = sales.reduce((total, sale) => {
    const saleTotal = sale.saleItems.reduce((subtotal, item) => {
      return subtotal + item.quantity * item.cost;
    }, 0);
    return total + saleTotal;
  }, 0);

  const totalExpense = expenses.reduce((total, current) => {
    return total + current.amount;
  }, 0);

  const net = totalIncome - totalExpense;

  return { mergedRows, totalIncome, totalExpense, net };
};
