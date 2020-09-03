import express, { Router } from "express";
import * as petController from "../controllers/petController";
import * as authController from "../controllers/authController";

const router: Router = express.Router();

router.use(authController.protect);

/**
 * @Route api/v1/pets
 */
router
  .route("/")
  .get(petController.getAllPets)
  .post(
    petController.uploadPetPhoto,
    petController.setUsersPetsId,
    petController.createPet
  );

/**
 * @Route api/v1/pets
 */
router
  .route("/:id")
  .get(petController.getPet)
  .patch(petController.updatePet)
  .delete(petController.deletePet);

export default router;
