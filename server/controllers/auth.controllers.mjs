import User from "../models/user.model.mjs";
import Notification from "../models/notification.model.mjs";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateToken.mjs";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import crypto from "crypto";
import { sendResetEmail, sendOTPEmail } from "../utils/email.mjs";
import generateResetToken from "../utils/generateResetToken.mjs";
import { createNotification } from "./notifications.controllers.mjs";

dotenv.config();

// GOOGLE OAUTH STRATEGY
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id: googleId, emails, displayName: fullName, photos } = profile;
        const email = emails[0].value;
        const profilePicture = photos[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          // REGISTER USER (Google Account)
          user = await User.create({
            fullName,
            email,
            profilePicture,
            accountType: "google",
            googleId,
          });

          // Create a registration notification
          await createNotification(
            {
              body: {
                userId: user._id,
                message:
                  "You have successfully registered with your google account.",
                type: "Registration",
                read: false,
              },
            },
            {
              status: () => ({ json: () => {} }),
            }
          );
        }

        const userObject = user.toObject();
        delete userObject.password;
        delete userObject.passwordResetOtp;
        delete userObject.passwordResetOtpExpiresAt;
        delete userObject.passwordChangedAt;
        delete userObject.resetPasswordToken;
        delete userObject.resetPasswordExpiresAt;
        delete userObject.twoFactorOtp;
        delete userObject.twoFactorOtpExpiresAt;
        delete userObject.createdAt;
        delete userObject.updatedAt;
        delete userObject.__v;

        done(null, userObject);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.passwordResetOtp;
    delete userObject.passwordResetOtpExpiresAt;
    delete userObject.passwordChangedAt;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpiresAt;
    delete userObject.twoFactorOtp;
    delete userObject.twoFactorOtpExpiresAt;
    delete userObject.createdAt;
    delete userObject.updatedAt;
    delete userObject.__v;
    done(null, userObject);
  } catch (error) {
    done(error, null);
  }
});

// CHECK IF ADMIN IS ALREADY REGISTERED
export const checkIfUsersExist = async (req, res) => {
  try {
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      return res.status(200).json({ message: "No admin registered yet." });
    } else {
      return res.status(200).json({ message: "Admin is already registered." });
    }
  } catch (error) {
    console.log(`Error in checkIfUsersExist controller: ${error.message}`);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// LOGIN USER (LOCAL ACCOUNT)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    if (user.accountType !== "local") {
      return res
        .status(400)
        .json({ error: "Please use Google login for this account." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    if (user.isTwoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorOtp = otp;
      user.twoFactorOtpExpiresAt = Date.now() + 5 * 60 * 1000;
      await user.save();

      await sendOTPEmail(user.email, otp);
      return res.status(200).json({ message: "OTP sent to your email." });
    }

    const token = generateTokenAndSetCookie(user._id, res);

    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.passwordResetOtp;
    delete userObject.passwordResetOtpExpiresAt;
    delete userObject.passwordChangedAt;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpiresAt;
    delete userObject.twoFactorOtp;
    delete userObject.twoFactorOtpExpiresAt;
    delete userObject.createdAt;
    delete userObject.updatedAt;
    delete userObject.__v;

    return res.status(200).json({
      token: res.token,
      user: userObject,
    });
  } catch (error) {
    console.log(`Error in login controller: ${error.message}`);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      user.twoFactorOtp !== otp ||
      user.twoFactorOtpExpiresAt < Date.now()
    ) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    user.twoFactorOtp = undefined;
    user.twoFactorOtpExpiresAt = undefined;
    await user.save();

    const token = generateTokenAndSetCookie(user._id, res);

    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.passwordResetOtp;
    delete userObject.passwordResetOtpExpiresAt;
    delete userObject.passwordChangedAt;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpiresAt;
    delete userObject.twoFactorOtp;
    delete userObject.twoFactorOtpExpiresAt;
    delete userObject.createdAt;
    delete userObject.updatedAt;
    delete userObject.__v;

    return res.status(200).json({
      token: res.token, // return token in the response
      user: userObject,
    });
  } catch (error) {
    console.log(`Error in verifyOTP controller: ${error.message}`);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// LOGOUT USER
export const logout = (req, res) => {
  try {
    res.token = "";
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.log(`Error in logout controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};

// REGISTER USER (LOCAL ACCOUNT)
export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      city,
      language = "english",
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match." });
    }

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // set default profile picture (UI Avatars)
    const profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fullName
    )}&background=random&bold=true`;

    const hashedPassword = await bcrypt.hash(password, 10);

    // check total number of users
    const userCount = await User.countDocuments();

    const role = userCount === 0 ? "admin" : "user"; // first registration for admin

    // create new user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      city,
      language,
      profilePicture,
      accountType: "local",
      role, // set the role based on user count
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res); // sets jwt and cookie (logs in automatically)

      // Create a registration notification
      await createNotification(
        {
          body: {
            userId: newUser._id,
            message: "You have successfully registered.",
            type: "Registration",
            read: false,
          },
        },
        {
          status: () => ({ json: () => {} }),
        }
      );

      const userObject = newUser.toObject();
      delete userObject.password;
      delete userObject.passwordResetOtp;
      delete userObject.passwordResetOtpExpiresAt;
      delete userObject.passwordChangedAt;
      delete userObject.resetPasswordToken;
      delete userObject.resetPasswordExpiresAt;
      delete userObject.twoFactorOtp;
      delete userObject.twoFactorOtpExpiresAt;
      delete userObject.createdAt;
      delete userObject.updatedAt;
      delete userObject.__v;

      return res.status(201).json({
        token: res.token, // return token in the response
        user: userObject,
      });
    } else {
      return res.status(400).json({ error: "Invalid user data." });
    }
  } catch (error) {
    console.log(`Error in register controller: ${error.message}`);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// GOOLE LOGIN
export const googleLogin = (req, res, next) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
};

// GOOGLE OAUTH CALLBACK
export const googleCallback = async (req, res) => {
  passport.authenticate("google", async (err, user) => {
    if (err) {
      console.log(`Error in googleCallback controller: ${err.message}`);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (!user) {
      return res.status(401).json({ error: "Authentication failed." });
    }

    // check if 2FA is enabled
    if (user.isTwoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // generate a 6-digit OTP
      user.twoFactorOtp = otp; // store OTP temporarily
      user.twoFactorOtpExpiresAt = Date.now() + 5 * 60 * 1000; // set expiration time (5 minutes)

      await user.save();
      await sendOTPEmail(user.email, otp);

      return res.status(200).json({ message: "OTP sent to your email." });
    }

    generateTokenAndSetCookie(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  })(req, res);
};

// REQUEST PASSWORD RESET
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // check for existing user
    const user = await User.findOne({ email });

    // Create a registration notification
    await createNotification(
      {
        body: {
          userId: newUser._id,
          message: "A password reset request has been made.",
          type: "Password Reset Request",
          read: false,
        },
      },
      {
        status: () => ({ json: () => {} }),
      }
    );

    if (!user) {
      return res.status(200).json({
        message: "If the email is registered, a reset link will be sent.",
      });
    }

    // only local accounts can reset passwords
    if (user.accountType !== "local") {
      return res.status(400).json({
        error: "Password reset is only for local accounts.",
      });
    }

    // generate reset token
    const resetToken = generateResetToken();
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // set token and expiration (5 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = Date.now() + 5 * 60 * 1000;

    await user.save();

    // send reset email
    // Update the password reset URL
    const resetURL = `https://niyoghub-password-reset.vercel.app/change-password?token=${resetToken}`;

    // const mobileResetURL = `niyoghub://ChangePassword/${resetToken}`;

    await sendResetEmail(user.email, resetURL);

    return res.status(200).json({
      message: "If the email is registered, a reset link will be sent.",
    });
  } catch (error) {
    console.log(`Error in requestPasswordReset: ${error.message}`);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: "Passwords don't match." });
    }

    // hash token to check
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // find user by token and check expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update password and clear token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    generateTokenAndSetCookie(user._id, res);

    // Create a successful password reset notification
    await Notification.create({
      userId: user._id,
      type: "Password Reset",
      message: "Your password has been reset successfully.",
    });

    // Create a registration notification
    await createNotification(
      {
        body: {
          userId: newUser._id,
          message: "Your password has been reset successfully.",
          type: "Password Reset",
          read: false,
        },
      },
      {
        status: () => ({ json: () => {} }),
      }
    );

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.log(`Error in resetPassword: ${error.message}`);
    return res.status(500).json({ error: "Internal server error." });
  }
};
