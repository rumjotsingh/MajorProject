import express from "express";
import * as learnerController from "../controllers/learner.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  updateProfileValidation,
  uploadCredentialValidation,
  enrollPathwayValidation,
  joinInstituteValidation,
  unenrollPathwayValidation,
  paginationValidation,
  objectIdValidation,
  claimCredentialsValidation,
} from "../middleware/learner.validation.js";

const router = express.Router();

// Apply authentication and authorization to all routes
router.use(authenticate);
router.use(authorize("learner"));

// ============ PROFILE ROUTES ============
router.get("/profile", learnerController.getProfile);
router.put(
  "/profile",
  updateProfileValidation,
  learnerController.updateProfile,
);
router.get("/dashboard", learnerController.getDashboard);

// ============ INSTITUTIONS ROUTE ============
router.get("/institutions", learnerController.getInstitutions);
router.get("/institutions/search", learnerController.searchInstitutions);
router.post(
  "/join-institute",
  joinInstituteValidation,
  learnerController.joinInstitute,
);
router.post(
  "/institutions/create-from-external",
  learnerController.createInstitutionFromExternal,
);
router.post(
  "/institutions/create-manually",
  learnerController.createInstitutionManually,
);

// ============ PATHWAY ROUTES ============
router.get("/pathways", learnerController.getAllPathways);
router.get(
  "/pathways/:id",
  objectIdValidation,
  learnerController.getPathwayDetails,
);
router.post(
  "/enroll-pathway",
  enrollPathwayValidation,
  learnerController.enrollPathway,
);
router.get("/enrollments", learnerController.getMyEnrollments);
router.get("/my-pathway", learnerController.getMyPathway);
router.delete(
  "/enrollments/:pathwayId",
  unenrollPathwayValidation,
  (req, res, next) => {
    req.body.pathwayId = req.params.pathwayId;
    next();
  },
  learnerController.unenrollPathway,
);
router.delete("/unenroll-pathway", learnerController.unenrollPathway);

// ============ CREDENTIAL ROUTES ============
router.post(
  "/upload-credential",
  uploadCredentialValidation,
  learnerController.uploadCredential,
);

router.get(
  "/credentials",
  paginationValidation,
  learnerController.getCredentials,
);

router.get(
  "/credentials/:id",
  objectIdValidation,
  learnerController.getCredentialById,
);
router.delete(
  "/credentials/:id",
  objectIdValidation,
  learnerController.deleteCredential,
);
router.post(
  "/claim-credentials",
  claimCredentialsValidation,
  learnerController.claimCredentials,
);

export default router;
