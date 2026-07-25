import express from 'express'
import { authenticateBarangay, requireRoles } from '../middlewares/authMiddleware.js'
import { addExpense, getExpenses, getProgramFundSummary } from '../controllers/program-funds.controller'

const router = express.Router()

router.post("/expenses", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), addExpense)
router.get('/expenses', authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), getExpenses)
router.get('/summary', authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), getProgramFundSummary)

export default router