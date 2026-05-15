import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export const initializeSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Clients can join a room based on the project ID to receive specific updates
    socket.on("join_project", (projectId: string) => {
      socket.join(projectId);
      console.log(`[Socket] Client ${socket.id} joined project ${projectId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    console.warn("[Socket] Socket.io is not initialized yet");
  }
  return io;
};

export const emitAnalysisUpdate = (projectId: string, data: any) => {
  if (io) {
    io.to(projectId).emit("analysis_updated", data);
  }
};
