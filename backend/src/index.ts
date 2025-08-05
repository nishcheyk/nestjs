import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import routes from './app/routes';
import { errorHandlerMiddleware } from './app/common/middleware/error-handler.middleware';
import { rateLimiterMiddleware } from './app/common/middleware/rate-limiter.middleware';
import { Config } from './app/common/helper/config.helper';
import http from "http";
import { Server } from "socket.io";
import swaggerDocument from './swagger.json';

async function bootstrap() {
  await mongoose.connect(Config.mongoUri);
  console.log('Connected to MongoDB');

  const app = express();

  // Create HTTP server explicitly for Socket.IO to attach
  const server = http.createServer(app);

  // Initialize Socket.IO attached to HTTP server
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",   // your React app default Vite port
        "http://localhost:5174",  // backend or any other allowed origin
        // add more origins if needed
      ],
      methods: ["GET", "POST"]
    }
  });
  

  // Middleware setup
  app.use(cors({  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
  ], credentials: true }));
  app.use(express.json());


  // API routes
  app.use('/api', routes);

  // Swagger documentation route
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Error handling middleware (after all routes)
  app.use(errorHandlerMiddleware);

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('chatMessage', (msg) => {
      console.log('Received chat message:', msg);
      // Broadcast to all clients including sender
      io.emit('chatMessage', msg);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Start server with HTTP server, NOT app.listen
  server.listen(Config.port, () => {
    console.log(`Server running at http://localhost:${Config.port}`);
    console.log(`Swagger docs available at http://localhost:${Config.port}/api-docs`);
  });
}

bootstrap().catch(err => {
  console.error('Failed to bootstrap app:', err);
  process.exit(1);
});
