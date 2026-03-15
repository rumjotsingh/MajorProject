import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import * as adminController from "../controllers/admin.controller.js";

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize("admin"));

// ==============================================================================
// DASHBOARD
// ==============================================================================
router.get("/dashboard", adminController.getDashboardStats);

// ==============================================================================
// INSTITUTES
// ==============================================================================
router.post("/institutes", adminController.createInstitute);
router.get("/institutes", adminController.getAllInstitutes);
router.get("/institutes/pending", adminController.getPendingInstitutes);
router.get("/institutes/:instituteId", adminController.getInstituteById);
router.put("/institutes/:instituteId", adminController.updateInstitute);
router.put(
  "/institutes/:instituteId/approve",
  adminController.approveInstitute,
);
router.put("/institutes/:instituteId/reject", adminController.rejectInstitute);
router.patch(
  "/institutes/:instituteId/suspend",
  adminController.suspendInstitute,
);
router.patch(
  "/institutes/:instituteId/deactivate",
  adminController.deactivateInstitute,
);
router.patch(
  "/institutes/:instituteId/block-login",
  adminController.blockInstituteLogin,
);
router.get(
  "/institutes/:instituteId/credentials",
  adminController.getInstituteCredentials,
);
router.delete("/institutes/:instituteId", adminController.deleteInstitute);

// ==============================================================================
// LEARNERS
// ==============================================================================
router.get("/learners", adminController.getAllLearners);
router.get("/learners/:id", adminController.getLearnerById);
router.patch("/learners/:id/suspend", adminController.suspendLearner);
router.patch("/learners/:id/unsuspend", adminController.unsuspendLearner);
router.get("/learners/:id/credentials", adminController.getLearnerCredentials);
router.delete("/learners/:id", adminController.deleteLearner);

// ==============================================================================
// EMPLOYERS
// ==============================================================================
router.get("/employers", adminController.getAllEmployers);
router.get("/employers/:id", adminController.getEmployerById);
router.get("/employers/:id/activity", adminController.getEmployerActivity);
router.get("/employers/:id/verifications", adminController.getEmployerVerifications);
router.put("/employers/:id/approve", adminController.approveEmployer);
router.patch("/employers/:id/suspend", adminController.suspendEmployer);
router.patch("/employers/:id/unsuspend", adminController.unsuspendEmployer);
router.delete("/employers/:id", adminController.deleteEmployer);

// ==============================================================================
// USERS
// ==============================================================================
router.get("/users", adminController.getAllUsers);
router.put("/users/:userId/deactivate", adminController.deactivateUser);

// ==============================================================================
// CREDENTIALS
// ==============================================================================
router.get("/credentials", adminController.getAllCredentials);
router.patch(
  "/credentials/:credentialId/verify",
  adminController.verifyGlobalCredential,
);
router.patch(
  "/credentials/:credentialId/reject",
  adminController.rejectGlobalCredential,
);

// ==============================================================================
// PATHWAYS
// ==============================================================================
router.get("/pathways", adminController.getAllPathways);
router.post("/pathways", adminController.createPathway);
router.put("/pathways/:id", adminController.updatePathway);
router.patch("/pathways/:id/toggle", adminController.togglePathwayStatus);
router.delete("/pathways/:id", adminController.deletePathway);

export default router;
