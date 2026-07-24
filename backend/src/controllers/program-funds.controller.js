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
                        name: true
                    }
                },
                name: true,
                amount: true,
                description: true,
                performedBy: true,
                performedByRole: true
            }
        })

        return res.status(200).json({ message: "Fetching expeses successful", expenses })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getProgramFundSummary = async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export { addExpense, getExpenses }
