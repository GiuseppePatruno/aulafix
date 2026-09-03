import express from "express";
import {
  createReport,
  deleteReport,
  getReportById,
  getReports,
  getStats,
  updateReport,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getReports);
router.get("/stats", getStats);
router.get("/:id", getReportById);
router.post("/", createReport);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport);

export default router;
