import User from "../models/user.model.mjs";
import Notification from "../models/notification.model.mjs";
import bcrypt from "bcryptjs";

// FETCH ADMIN PROFILE (only for admins with role "admin")
export const getAdminProfile = async (req, res) => {
  try {
    // ensure that the user's role is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    return res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin profile:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// UPDATE ADMIN PROFILE (only for admins with role "admin")
export const updateAdminProfile = async (req, res) => {
  try {
    // ensure that the user's role is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const {
      fullName,
      email,
      address,
      language,
      profilePicture,
      isTwoFactorEnabled,
    } = req.body;

    const admin = await User.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // Update admin profile fields
    admin.fullName = fullName || admin.fullName;
    admin.email = email || admin.email;
    admin.address = address || admin.address;
    admin.language = language || admin.language;
    admin.profilePicture = profilePicture || admin.profilePicture;
    admin.isTwoFactorEnabled =
      isTwoFactorEnabled !== undefined
        ? isTwoFactorEnabled
        : admin.isTwoFactorEnabled;

    await admin.save();

    // Create a notification for profile update
    await Notification.create({
      userId: req.user.id,
      type: "admin_activity",
      message: "Your admin profile has been updated successfully.",
    });

    return res
      .status(200)
      .json({ message: "Admin profile updated successfully.", admin });
  } catch (error) {
    console.error("Error updating admin profile:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// CHANGE ADMIN PASSWORD (only for admins with role "admin")
export const changeAdminPassword = async (req, res) => {
  try {
    // ensure that the user's role is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { currentPassword, newPassword, confirmCurrentPassword } = req.body;

    if (currentPassword !== confirmCurrentPassword) {
      return res
        .status(400)
        .json({ message: "Current password and confirmation do not match." });
    }

    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    // Create a notification for password change
    await Notification.create({
      userId: req.user.id,
      type: "security",
      message: "Your admin password has been changed successfully.",
    });

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing admin password:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// FETCH ALL USERS (excluding admin)
export const getUsers = async (req, res) => {
  try {
    // ensure that the user's role is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // fetch all users (admin excluded)
    const users = await User.find({ role: { $ne: "admin" } }).select(
      "-password"
    );

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// FETCH USER BY ID
export const getUserById = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// UPDATE A USER PROFILE (Admin updating another user's profile, no notifications needed)
export const updateUserProfile = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { id } = req.params;
    const { fullName, email, address, newPassword } = req.body;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.address = address || user.address;

    // If newPassword is provided, update the user's password
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
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
