import express from 'express'
import { createProgram, createTransaction, getBeneficiaries, getProgram, getPrograms, getTransaction, getTransactions, searchBeneficiary, updateProgram } from '../controllers/redemption.controller.js';
import { authenticateBarangay, requireRoles } from '../middlewares/authMiddleware.js';

const router = express.Router()

router.post("/programs", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK"]), createProgram)
router.get("/programs", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), getPrograms)
router.get("/programs/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK"]), getProgram)
router.post("/transactions", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK"]), createTransaction)
router.get("/transactions", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK"]), getTransactions)
router.patch("/programs/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK"]), updateProgram)
router.get("/transactions/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK"]), getTransaction)
router.get("/beneficiaries", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), getBeneficiaries)
router.get("/beneficiaries/search", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), searchBeneficiary)

export default router;