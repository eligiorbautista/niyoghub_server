import Notification from "../models/notification.model.mjs";

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { userId, message, type, read } = req.body;

    // Create a new notification document
    const notification = await Notification.create({
      userId,
      message,
      type,
      read,
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error(`Error in createNotification controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get all notifications for a specific user
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all notifications for the given userId
    const notifications = await Notification.find({ userId });

    res.status(200).json(notifications);
  } catch (error) {
    console.error(`Error in getUserNotifications controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update the notification by its ID, marking it as read
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true } // Return the updated document
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error(
      `Error in markNotificationAsRead controller: ${error.message}`
    );
    res.status(500).json({ error: "Internal server error." });
  }
};

export const markAllNotificationAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    // Update all notifications for the given userId to set "read" to true
    await Notification.updateMany({ userId, read: false }, { read: true });

    res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error(`Error in markAllAsRead route: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Delete a notification (New function)
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the notification by its ID
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }

    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error(`Error in deleteNotification controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};
