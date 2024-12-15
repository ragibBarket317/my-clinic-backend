import { Admin } from "../models/admin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// change notification settings
export const changeNotificationSettings = asyncHandler(async (req, res) => {
  const { delay, emailNotify, notifyOn, notificationSound, messageSound } =
    req.body;

  const adminId = req.admin._id;
  let admin = await Admin.findByIdAndUpdate(
    adminId,
    {
      emailNotifyDelay: delay,
      preferredMessagesNotificationSound: messageSound,
      preferredNotesNotificationSound: notificationSound,
      notifyOn,
      emailNotifyDelay: delay,
      emailNotify,
    },
    {
      new: true,
    }
  );
  res.json(new ApiResponse(200, admin, "Setting updated"));
});

// change theme setting
export const changeThemeSettings = asyncHandler(async (req, res) => {
  const { mode, name } = req.body;

  const adminId = req.admin._id;
  let admin = await Admin.findByIdAndUpdate(
    adminId,
    {
      theme: {
        name,
        mode,
      },
    },
    {
      new: true,
    }
  );
  res.json(new ApiResponse(200, admin, "Theme Settings Updated"));
});

// change language setting
export const changeTimeLangSettings = asyncHandler(async (req, res) => {
  const { timezone, language } = req.body;

  const adminId = req.admin._id;
  let admin = await Admin.findByIdAndUpdate(
    adminId,
    {
      timezone,
      language,
    },
    {
      new: true,
    }
  );
  res.json(new ApiResponse(200, admin, "Settings Updated"));
});
