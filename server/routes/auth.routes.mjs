import express from "express";

import {
  login,
  logout,
  register,
  googleLogin,
  googleCallback,
  checkIfUsersExist,
  requestPasswordReset,
  resetPassword,
  verifyOTP,
} from "../controllers/auth.controllers.mjs";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

// PASSWORD RESET ROUTES
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

// VERIFY OTP AUTH ROUTE (2FA)
router.post("/verify-otp", verifyOTP);

// CHECK IF ADMIN IS ALREADY REGISTERED ROUTE
router.get("/check-users", checkIfUsersExist);

// GOOGLE AUTH ROUTES
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

export default router;
