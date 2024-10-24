import Notification from "../models/notification.model.mjs";

// Create a new notification
export const createNotification = async (req, res) => {
  const { userId, type, message } = req.body;

  try {
    const notification = new Notification({ userId, type, message });
    await notification.save();

    // Emit the notification to the specific user using Socket.IO
    req.io.to(userId).emit("newNotification", notification);

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error creating notification", error });
  }
};

// Get all notifications for a specific user
export const getUserNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({ userId });

    // Optionally, emit an event to the user's room indicating notifications have been fetched
    req.io.to(userId).emit("notificationsFetched", notifications);

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Emit the updated notification to the user
    req.io.to(notification.userId.toString()).emit("notificationRead", notification);

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error marking notification as read", error });
  }
};

// Mark all notifications as read for a specific user
export const markAllNotificationAsRead = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    // Emit an event to notify the user that all notifications are marked as read
    req.io.to(userId).emit("allNotificationsRead");

    res.status(200).json({ message: "All notifications marked as read", result });
  } catch (error) {
    res.status(500).json({ message: "Error marking all notifications as read", error });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Emit an event to notify the user about the deletion
    req.io.to(notification.userId.toString()).emit("notificationDeleted", notification._id);

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification", error });
  }
};
