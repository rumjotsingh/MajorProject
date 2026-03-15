import express from "express";
import {
  authenticate,
  authorize,
  requireApproval,
} from "../middleware/auth.middleware.js";
import * as instituteController from "../controllers/institute.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("institute"));
router.use(requireApproval);

// Dashboard
router.get("/dashboard", instituteController.getDashboard);

// Pathway Management
router.get("/pathways", instituteController.getPathways);
router.post("/pathways", instituteController.createPathway);
router.patch("/pathways/:pathwayId", instituteController.updatePathway);
router.delete("/pathways/:pathwayId", instituteController.deletePathway);

// Credential Management
router.get("/credentials", instituteController.getIssuedCredentials);
router.get("/credentials/pending", instituteController.getPendingCredentials);
router.get("/credentials/stats", instituteController.getCredentialStats);
router.get("/learners", instituteController.getInstituteLearners);
router.patch(
  "/credentials/:credentialId/verify",
  instituteController.verifyCredential,
);
router.patch(
  "/credentials/:credentialId/reject",
  instituteController.rejectCredential,
);

export default router;
