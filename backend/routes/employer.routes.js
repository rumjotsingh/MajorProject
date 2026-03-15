import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("employer"));

router.get("/dashboard", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Employer dashboard - Ready for credential verification",
  });
});

export default router;
