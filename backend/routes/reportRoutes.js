import express from "express";
import {
  createReport,
  deleteReport,
  getReports,
  updateReport,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getReports);
router.post("/", createReport);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport);

export default router;
