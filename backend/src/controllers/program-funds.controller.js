import { prisma } from "../config/db.js";

const addExpense = async (req, res) => {
  try {
    const { role, barangayId, id } = req.user;
    const { programId, amount, description, name } = req.body ?? {};

    if (!programId || !amount || !description || !name) {
      return res.status(404).json({ error: "Required fields are missing" });
    }

    const user = await prisma.user.findUnique({
      where: { id, barangayId },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    await prisma.programExpense.create({
      data: {
        userId: id,
        programId,
        barangayId,
        name,
        amount,
        description,
        performedBy: `${user.firstName} ${user.lastName}`,
        performedByRole: role,
      },
    });

    return res.status(201).json({ message: "Expense successfully added" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const expenses = await prisma.programExpense.findMany({
      where: { barangayId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        program: {
          select: {
            name: true,
          },
        },
        name: true,
        amount: true,
        description: true,
        performedBy: true,
        performedByRole: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Fetching expeses successful", expenses });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getProgramFundSummary = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const totalExpenses = await prisma.programExpense.aggregate({
      where: { barangayId },
      _sum: { amount: true },
    });

    const sales = await prisma.junkshopSaleItem.findMany({
      where: {
        junkshopSale: {
          junkshop: {
            barangayId,
          },
        },
      },
      select: {
        cost: true,
        quantity: true,
      },
    });

    const totalIncome = sales.reduce((total, current) => {
      return total + current.cost * current.quantity;
    }, 0);

    const program = await prisma.program.findMany({
      where: { barangayId },
      select: {
        id: true,
        name: true,
        allotedBudget: true,
        expenses: {
          select: {
            amount: true,
          },
        },
      },
    });

    const programBreakdown = program.map((p) => {
      const totalSpent = p.expenses.reduce((total, current) => {
        return total + current.amount;
      }, 0);

      return {
        id: p.id,
        name: p.name,
        allotedBudget: p.allotedBudget,
        totalSpent,
        remaining: p.allotedBudget - totalSpent,
      };
    });

    return res.status(200).json({
      message: "Fetch program fund summary success",
      totalExpenses: totalExpenses._sum.amount ?? 0,
      totalIncome,
      programBreakdown,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getTransactionLogs = async (req, res) => {
  try {
    const { barangayId } = req.user;

    const expenses = await prisma.programExpense.findMany({
      where: { barangayId },
      select: {
        id: true,
        name: true,
        description: true,
        program: {
          select: {
            name: true,
          },
        },
        amount: true,
        performedBy: true,
        performedByRole: true,
        createdAt: true,
      },
    });

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
            name: true,
          },
        },
        saleItems: {
          select: {
            quantity: true,
            cost: true,
          },
        },
        performedBy: true,
        performedByRole: true,
        createdAt: true,
      },
    });

    const transactions = [
      ...expenses.map((e) => ({ ...e, type: "expense" })),
      ...sales.map((s) => {
        const { saleItems, ...rest } = s;
        return {
          ...rest,
          type: "income",
          name: "Junkshop Sale",
          totalAmount: s.saleItems.reduce((total, current) => {
            return total + current.cost * current.quantity;
          }, 0),
        };
      }),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res
      .status(200)
      .json({ message: "Fetch transaction logs successful", transactions });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { addExpense, getExpenses, getProgramFundSummary, getTransactionLogs };
