import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    // password is optional (prevent conflicts with google auth)
    password: {
      type: String,
      minlength: 6, // required for local users
      required: function () {
        return this.accountType === "local"; // required only for 'local' account types
      },
    },

    city: {
      type: String,
    },

    language: {
      type: String,
      default: "english",
      enum: ["english", "filipino"],
    },

    profilePicture: {
      type: String,
      default: "",
    },

    accountType: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },

    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // OTP FOR 2FA AUTH
    twoFactorOtp: {
      type: String,
      default: null,
    },

    twoFactorOtpExpiresAt: {
      type: Date,
      default: null,
    },

    // OTP FOR PASSWORD RESET
    passwordResetOtp: {
      type: String,
      default: null,
    },

    passwordResetOtpExpiresAt: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
