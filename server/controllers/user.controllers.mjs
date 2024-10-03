import User from "../models/user.model.mjs";
import Notification from "../models/notification.model.mjs";
import bcrypt from "bcryptjs";

// FETCH USER PROFILE (only for users with role "user")
export const getUserProfile = async (req, res) => {
  try {
    // ensure that the user's role is not admin
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Access denied. Users only." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// UPDATE USER PROFILE (only for users with role "user")
export const updateUserProfile = async (req, res) => {
  try {
    // ensure that the user's role is not admin
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Access denied. Users only." });
    }

    const {
      fullName,
      email,
      address,
      language,
      profilePicture,
      isTwoFactorEnabled,
    } = req.body;

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update user profile fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.address = address || user.address;
    user.language = language || user.language;
    user.profilePicture = profilePicture || user.profilePicture;
    user.isTwoFactorEnabled =
      isTwoFactorEnabled !== undefined
        ? isTwoFactorEnabled
        : user.isTwoFactorEnabled;

    await user.save();

    // Create a notification for profile update
    await Notification.create({
      userId: req.user.id,
      type: "user_activity",
      message: "Your profile has been updated successfully.",
    });

    return res
      .status(200)
      .json({ message: "User profile updated successfully.", user });
  } catch (error) {
    console.error("Error updating user profile:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// CHANGE USER PASSWORD (only for users with role "user")
export const changeUserPassword = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Access denied. Users only." });
    }

    const { currentPassword, newPassword, confirmCurrentPassword } = req.body;

    if (currentPassword !== confirmCurrentPassword) {
      return res
        .status(400)
        .json({ message: "Current password and confirmation do not match." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // create a notification for password change
    await Notification.create({
      userId: req.user.id,
      type: "security",
      message: "Your password has been changed successfully.",
    });

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing user password:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
