import express, { Request, Response, NextFunction, Router } from "express";
import * as authController from "../controllers/authController";
import * as userController from "../controllers/userController";
import petsRouter from "./petRoutes";

const router: Router = express.Router({ mergeParams: true });

/**
 * @route POST /user/234fad4/pets
 * @route GET /user/234fad4/pets
 */
router.use("/:userId/pets", petsRouter);

/**
 * Sign in using @phoneNumber and @code
 * @route POST user/login
 */
router.post("/login", authController.login);

/**
 * Verify sms @code that was sent to @phoneNumber
 * @route POST user/verify
 */
router.post("/verify", authController.userVerify);

/**
 * Sign up by @phoneNumber @role and @name
 * @route POST user/signup
 */
router.post("/signup", authController.signUp);

/**
 * Protected routs.
 */
/* router.use(authController.protect); */

/**
 * Get info about current logged in user.
 * @route GET user/me
 */
router.get("/me", userController.getMe, userController.getUser);

/**
 * Update info about current logged in user.
 * @route PATCH user/updateMe
 */
router.patch("/updateMe", userController.updateMe);

/**
 * Disactivate profile of current logged in user.
 * @route DELETE user/deleteMe
 */
router.delete("/deleteMe", userController.deleteMe);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route("/:id").get(userController.getUser);
/* .patch(userController.updateUser)
  .delete(userController.deleteUser); */

export default router;
