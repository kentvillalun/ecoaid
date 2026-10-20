import express from 'express'
import { createProgram, createTransaction, getProgram, getPrograms, getResidentPrograms, getTransaction, getTransactions, searchResident, updateProgram } from '../controllers/redemption.controller.js';
import { authenticateBarangay, authenticateResident, requireRoles } from '../middlewares/authMiddleware.js';

const router = express.Router()

router.post("/programs", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), createProgram)
router.get("/programs", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), getPrograms)
router.get("/programs/residents", authenticateResident, getResidentPrograms)
router.get("/programs/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), getProgram)
router.post("/transactions", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), createTransaction)
router.get("/transactions", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), getTransactions)
router.patch("/programs/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), updateProgram)
router.get("/transactions/:id", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), getTransaction)
router.get("/residents/search", authenticateBarangay, requireRoles(["CAPTAIN", "SECRETARY", "SK", "TREASURER"]), searchResident)

export default router;