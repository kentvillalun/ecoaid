import { prisma } from "../config/db.js";

const filterReports = async (req, res) => {
  try {
    const { barangayId } = req.user;
    const { startDate, endDate, type, programId } = req.query;

    if (!startDate || !endDate || !type) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    if (
      ![
        "mrf-inventory",
        "collection-intake",
        "redemption",
        "program-funds",
      ].includes(type)
    ) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    switch (type) {
      case "mrf-inventory": {
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

        return res.status(200).json({
          message: "Fetch MRF Inventory reports successful",
          results,
        });
      }

      case "collection-intake": {
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

        return res.status(200).json({
          message: "Fetch collection records successful",
          mergedRecords,
        });
      }
      case "redemption": {
        const where = {
          program: {
            barangayId
          },
          createdAt: {
            gte: new Date(startDate),
            lt: end,
          },
        };

        if (programId) {
          where.programId = programId;
        }

        const transactions = await prisma.redemptionTransaction.findMany({
          where,
          select: {
            beneficiaryName: true,
            createdAt: true,
            redemptionTransactionItem: {
              select: {
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
          const matchedRelease = rewardReleases.find(
            (r) => r.beneficiaryName === t.beneficiaryName,
          );

          const pointsEarned = t.redemptionTransactionItem.reduce(
            (acc, item) => {
              return acc + item.amount * item.currentValue;
            },
            0,
          );
          return {
            beneficiaryName: t.beneficiaryName,
            dateSubmitted: t.createdAt,
            dateReleased: matchedRelease ? matchedRelease.createdAt : null,
            educationalLevel: t.educationalLevel,
            materialsCollected: t.redemptionTransactionItem.map((item) => ({
              name: item.programMaterial.material.name,
              category: item.programMaterial.material.category.name,
              amount: item.amount,
              currentValue: item.currentValue,
            })),
            pointsEarned,
            rewardReceived: matchedRelease
              ? {
                  name: matchedRelease.rewardItem.name,
                  category: matchedRelease.rewardItem.category,
                  quantity: matchedRelease.quantity,
                }
              : null,
            pointsSpent: matchedRelease
              ? matchedRelease.quantity * matchedRelease.rewardItem.pointCost
              : 0,
          };
        });

        return res.status(200).json({
          message: "Fetch beneficiary redemption records successful",
          merged,
        });
      }
      case "program-funds": {

        const sales = await prisma.junkshopSale.findMany({
          where: {
            junkshop: {
              barangayId,
            },
            createdAt: {
              gte: new Date(startDate),
              lt: end,
            }
          },
          select: {
            junkshop: {
              select: {
                name: true,
              }
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
                        name: true
                      }
                    }
                  }
                }, 
                quantity: true,
                cost: true,
                unit: true
              }
            }
          }
        })

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
                name: true
              }
            }
          }
        })

        const mappedSales = sales.map((sale) => {
          return {
            type: "income",
            name: sale.junkshop.name,
            description: `Sold to: ${sale.junkshop.name}`,
            program: "—",
            amount: sale.saleItems.reduce((total, item) => {
              return total + (item.cost * item.quantity)
            }, 0),
            materials: sale.saleItems.map((item) => ({
              name: item.material.name,
              category: item.material.category.name,
              unit: item.unit,
              quantity: item.quantity,
              cost: item.cost
            })),
            performedBy: sale.performedBy,
            performedByRole: sale.performedByRole,
            date: sale.createdAt,
          }
        })

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
            date: e.createdAt
          }
        })

        const mergedRows = [...mappedSales, ...mappedExpenses]

        const totalIncome = sales.reduce((total, sale) => {
          const saleTotal = sale.saleItems.reduce((subtotal, item) => {
            return subtotal + (item.quantity * item.cost)
          }, 0)
          return total + saleTotal
        }, 0)

        const totalExpense = expenses.reduce((total, current) => {
          return total + (current.amount)
        }, 0)

        const net = totalIncome - totalExpense

        return res.status(200).json({ message: "Fetch program funds record successful", mergedRows, totalIncome, totalExpense, net})
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { filterReports };
