import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import timezones from "../utils/timezones.js";
const adminSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "editor", "provider"],
      required: true,
    },
    password: {
      type: String,
    },
    title: {
      type: String,
    },
    pronouns: {
      type: String,
      enum: ["Mr.", "Mrs.", "Ms.", "Miss.", "Sr.", "Jr.", "Dr.", "Prof."],
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    phoneNumber: {
      country: String,
      number: String,
    },
    avatarName: {
      type: String, //
    },
    avatar: {
      type: String, //
    },
    coverImage: {
      type: String,
    },
    coverImageName: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    notifyOn: {
      type: String,
      enum: ["all", "note", "message", "none"],
      default: "all",
    },
    preferredNotesNotificationSound: {
      type: String,
      default: "/Default.mp3",
    },
    preferredMessagesNotificationSound: {
      type: String,
      default: "/Default.mp3",
    },
    emailNotify: {
      type: Boolean,
      default: false,
    },
    emailNotifyDelay: {
      type: String,
      enum: ["Immediately", "15m", "1h"],
      default: "1h",
    },
    theme: {
      mode: {
        type: String,
        default: "light",
        enum: ["light", "dark", "system"],
      },
      name: {
        type: String,
        default: "Default",
      },
    },
    language: {
      type: String,
      default: "en",
      enum: ["en", "de", "es", "esLatam", "fr", "it", "pt"],
    },
    timezone: {
      type: String,
      enum: ["system", ...timezones],
      default: "system",
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
adminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Admin = mongoose.model("Admin", adminSchema);
