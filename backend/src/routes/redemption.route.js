import express from 'express'
import { createProgram, createTransaction, getProgram, getPrograms, getTransaction, getTransactions, updateProgram } from '../controllers/redemption.controller.js';
import { authenticateBarangay, requireRoles } from '../middlewares/authMiddleware.js';

const router = express.Router()

router.post("/programs", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK"]), createProgram)
router.get("/programs", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK"]), getPrograms)
router.get("/programs/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK"]), getProgram)
router.post("/transactions", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK"]), createTransaction)
router.get("/transactions", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK"]), getTransactions)
router.patch("/programs/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK"]), updateProgram)
router.get("/transactions/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK"]), getTransaction)

export default router;