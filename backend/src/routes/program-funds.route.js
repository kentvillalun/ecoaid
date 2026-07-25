import express from 'express'
import { authenticateBarangay, requireRoles } from '../middlewares/authMiddleware.js'
import { addExpense, getExpenses, getProgramFundSummary, getTransactionLogs } from '../controllers/program-funds.controller.js'

const router = express.Router()

router.post("/expenses", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), addExpense)
router.get('/expenses', authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), getExpenses)
router.get('/summary', authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), getProgramFundSummary)
router.get('/transactions', authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "TREASURER", "SK"]), getTransactionLogs)

export default router