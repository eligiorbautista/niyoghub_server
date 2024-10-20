import express from "express";
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationAsRead,
} from "../controllers/notifications.controllers.mjs";

const router = express.Router();

// Create a new notification
router.post("/create", createNotification);

// Get all notifications for a specific user
router.get("/:userId", getUserNotifications);

// Mark a notification as read
router.patch("/:id", markNotificationAsRead);

// Mark all notifications as read for a specific user
router.patch("/markAllAsRead/:userId", markAllNotificationAsRead);

// Delete a notification (this is the missing route)
router.delete("/:id", deleteNotification);

export default router;
