import User from "../models/user.model.mjs";
import Notification from "../models/notification.model.mjs";
import bcrypt from "bcryptjs";

// FETCH USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    // if (req.user.role !== "user" || req.user.role !== "admin") {
    //   return res
    //     .status(403)
    //     .json({ message: "Access denied. Users & Admin only." });
    // }

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

// UPDATE USER PROFILE
export const updateUserProfile = async (req, res) => {
  try {
    const {
      fullName,
      email,
      address,
      language,
      profilePicture,
      isTwoFactorEnabled,
      notifications, // Add notifications to the request body
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

    // Update notification preferences if provided
    if (notifications) {
      user.notifications.announcements =
        notifications.announcements !== undefined
          ? notifications.announcements
          : user.notifications.announcements;
      user.notifications.events =
        notifications.events !== undefined
          ? notifications.events
          : user.notifications.events;
      user.notifications.newsAndPrograms =
        notifications.newsAndPrograms !== undefined
          ? notifications.newsAndPrograms
          : user.notifications.newsAndPrograms;
      user.notifications.chatMessages =
        notifications.chatMessages !== undefined
          ? notifications.chatMessages
          : user.notifications.chatMessages;
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "User profile updated successfully.", user });
  } catch (error) {
    console.error("Error updating user profile:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// CHANGE USER PASSWORD
export const changeUserPassword = async (req, res) => {
  try {
    // if (req.user.role !== "user" || req.user.role !== "admin") {
    //   return res
    //     .status(403)
    //     .json({ message: "Access denied. Users & Admin only." });
    // }

    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        message: "New password and confirm new password do not match.",
      });
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
