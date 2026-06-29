import { prisma } from "../config/db.js";
import { convertToKg } from "../utils/covertToKg.js";

const recordSale = async (req, res) => {
  try {
    const { junkshopId, items } = req.body ?? {};
    const { id, barangayId } = req.user;

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

    await prisma.$transaction(async (tx) => {
      const sale = await tx.junkshopSale.create({
        data: {
          junkshopId,
          userId: id,
          performedBy: `${user.firstName} ${user.lastName}`,
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
