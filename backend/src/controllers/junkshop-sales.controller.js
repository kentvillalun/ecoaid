import { prisma } from "../config/db.js";
import { convertToKg } from "../utils/covertToKg.js";

const recordSale = async (req, res) => {
  try {
    const { junkshopId, items } = req.body ?? {};
    const { id, barangayId, role } = req.user;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    const current = await prisma.junkshopPriceItem.findMany({
      where: {
        junkshopId,
        materialId: { in: items.map((item) => item.materialId) },
      },
      select: {
        materialId: true,
        price: true,
        unit: true,
      },
    });

    const missingItems = items.filter((item) => {
      return !current.some((c) => c.materialId === item.materialId);
    });

    if (missingItems.length > 0) {
      return res.status(400).json({
        error: "Items are missing",
        missingMaterials: missingItems.map(
          (item) => `This material with this ${item.materialId} does not exist`,
        ),
      });
    }

    const saleItems = items.map((item) => {
      const matchedPrice = current.find(
        (c) => c.materialId === item.materialId,
      );

      return {
        materialId: item.materialId,
        quantity: item.quantity,
        cost: matchedPrice.price,
        unit: matchedPrice.unit,
      };
    });

    const stockSummary = await prisma.stockTransactionLog.groupBy({
      where: {
        barangayId,
        materialId: { in: items.map((item) => item.materialId) },
      },
      by: ["materialId", "transactionType"],
      _sum: { quantity: true },
    });

    const insufficientItems = saleItems.filter((item) => {
      const inQty =
        stockSummary.find(
          (s) => s.materialId === item.materialId && s.transactionType === "IN",
        )?._sum?.quantity ?? 0;
      const outQty =
        stockSummary.find(
          (s) => s.materialId === item.materialId && s.transactionType === "OUT",
        )?._sum?.quantity ?? 0;
      const currentBalance = inQty - outQty;

      return convertToKg(item.quantity, item.unit) > currentBalance;
    });

    if (insufficientItems.length > 0) {
      return res.status(400).json({
        error: "Current balance is not enough for deduction",
        insufficientMaterials: insufficientItems.map((item) => item.materialId),
      });
    }

    await prisma.$transaction(async (tx) => {
      const sale = await tx.junkshopSale.create({
        data: {
          junkshopId,
          userId: id,
          performedBy: `${user.firstName} ${user.lastName}`,
          performedByRole: role,
          saleItems: {
            createMany: {
              data: saleItems.map((item) => ({
                materialId: item.materialId,
                quantity: item.quantity,
                cost: item.cost,
                unit: item.unit,
              })),
            },
          },
        },
      });

      const transactionLog = await tx.stockTransactionLog.createMany({
        data: items.map((item) => ({
          barangayId,
          junkshopSalesId: sale.id,
          performedBy: `${user.firstName} ${user.lastName}`,
          source: "JUNKSHOP_SALES",
          transactionType: "OUT",
          materialId: item.materialId,
          quantity: convertToKg(item.quantity, item.unit),
          unit: item.unit === "PIECE" ? "PIECE" : "KG",
        })),
      });
    });

    return res.status(200).json({ message: "Sale created successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getJunkshopSales = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const sales = await prisma.junkshopSale.findMany({
      where: {
        junkshop: {
          barangayId,
        },
      },
      select: {
        id: true,
        junkshop: {
          select: {
            id: true,
            name: true,
          },
        },
        performedBy: true,
        performedByRole: true,
        createdAt: true,
        saleItems: {
          select: {
            id: true,
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

    const enrichedSales = sales.map((sale) => {
      const totalAmount = sale.saleItems.reduce((accumulator, currentItem) => {
        return accumulator + currentItem.cost * currentItem.quantity;
      }, 0);

      return { ...sale, totalAmount };
    });

    return res
      .status(200)
      .json({ message: "Fetching sale history successful", enrichedSales });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getJunkshopWithPrices = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const junkshops = await prisma.junkshop.findMany({
      where: {
        barangayId,
      },
      select: {
        id: true,
        name: true,
        isAvailable: true,
        priceItems: {
          select: {
            material: {
              select: {
                id: true,
                name: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            price: true,
            unit: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json({ message: "Fetching junkshop with prices success", junkshops });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const addJunkshop = async (req, res) => {
  try {
    const { barangayId } = req.user;
    const { name, description, location, priceItems } = req.body ?? {};

    await prisma.junkshop.create({
      data: {
        barangayId,
        name,
        description,
        location,
        priceItems: {
          createMany: {
            data: priceItems.map((item) => ({
              materialId: item.materialId,
              price: item.price,
              unit: item.unit,
            })),
          },
        },
      },
    });

    return res
      .status(201)
      .json({ message: "Successfully created a junkshop record" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getJunkshopDetails = async (req, res) => {
  try {
    const { junkshopId } = req.params;
    const { barangayId } = req.user;

    const junkshop = await prisma.junkshop.findUnique({
      where: { id: junkshopId, barangayId },
      select: {
        name: true,
        description: true,
        location: true,
        isAvailable: true,
        createdAt: true,
        priceItems: {
          select: {
            id: true,
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
            price: true,
          },
        },
      },
    });

    if (!junkshop) {
      return res.status(404).json({ error: "Junkshop do not exist" });
    }

    return res
      .status(200)
      .json({ message: "Fetching junkshop details successful", junkshop });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getJunkshops = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const junkshops = await prisma.junkshop.findMany({
      where: { barangayId },
      select: {
        id: true,
        name: true,
        location: true,
        isAvailable: true,
      },
    });

    return res.status(200).json({ message: "Fetching junkshops successful", junkshops });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  recordSale,
  getJunkshopSales,
  getJunkshopWithPrices,
  addJunkshop,
  getJunkshopDetails,
  getJunkshops
};
