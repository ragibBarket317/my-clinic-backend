import cookieParser from "cookie-parser";
import cors from "cors";
import { EventEmitter } from "events";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createSuperAdmin } from "./utils/createAdmin.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.SOCKET_FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Enables compatibility with polling
});
// Socket.IO setup
const userSocketMap = {};
const whoSlectedWhom = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};
export const getWhoSlectedWhom = (who) => {
  return whoSlectedWhom[who];
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId != "undefined") userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("whoSelectedWhom", (selectedId) => {
    whoSlectedWhom[userId] = selectedId;
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected");

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
EventEmitter.defaultMaxListeners = 15;

// superadmin create script
createSuperAdmin();

// routes import
import adminRouter from "./routes/admin.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import documentRouter from "./routes/document.routes.js";
import inviteAdmin from "./routes/invitedAdmin.routes.js";
import messageRouter from "./routes/message.routes.js";
import notesRouter from "./routes/note.routes.js";
import notificationsRouter from "./routes/notification.routes.js";
import overviewRouter from "./routes/overview.routes.js";
import patientRouter from "./routes/patient.routes.js";
import settingRouter from "./routes/setting.routes.js";
import { errorHandler } from "./utils/errorHandler.js";

// routes declaration
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/invite", inviteAdmin);
app.use("/api/v1/patient", patientRouter);
app.use("/api/v1/notes", notesRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/overview", overviewRouter);
app.use("/api/v1/apts", appointmentRouter);
app.use("/api/v1/documents", documentRouter);
app.use("/api/v1/setting", settingRouter);

app.use(errorHandler);

// Listen to the server on a port
server.listen(process.env.PORT || 8000, () => {
  console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
});

export { app, io };
