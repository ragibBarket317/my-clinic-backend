import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getNotificationsForAdmin = asyncHandler(async (req, res) => {
  // Extract admin ID from request
  const adminId = req.admin._id;

  // Find notifications for the admin
  const notifications = await Notification.find({ adminId }).sort({
    createdAt: -1,
  }); // Sort by creation date, descending

  // Calculate the number of unread notifications
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  res.status(200).json(
    new ApiResponse(200, {
      success: true,
      notifications,
      unreadCount,
    })
  );
});

// calculate unread count of notifications
const getNotificationsUnreadCount = asyncHandler(async (req, res) => {
  // Extract admin ID from request
  const adminId = req.admin._id;

  // Find notifications for the admin
  const notifications = await Notification.find({ adminId });

  // Calculate the number of unread notifications
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  res.status(200).json(
    new ApiResponse(200, {
      success: true,
      unreadCount,
    })
  );
});

const markOneNotificationAsRead = asyncHandler(async (req, res) => {
  // Extract notification ID from request
  const notificationId = req.params.id;

  // Update all notifications for the admin to mark them as read
  await Notification.findByIdAndUpdate(notificationId, { read: true });

  res.status(200).json(
    new ApiResponse(200, {
      success: true,
      message: "Notification marked as read",
    })
  );
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  // Extract admin ID from request
  const adminId = req.admin._id;

  // Update all notifications for the admin to mark them as read
  await Notification.updateMany({ adminId }, { read: true });

  res.status(200).json(
    new ApiResponse(200, {
      success: true,
      message: "All notifications marked as read",
    })
  );
});

export {
  getNotificationsForAdmin,
  markOneNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationsUnreadCount,
};
