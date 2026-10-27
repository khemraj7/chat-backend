import express from 'express';
import { errorHandler } from './middlewares/error.middleware';
import chatRoutes from './modules/chat/chat.routes';
import userRoutes from './modules/user/user.routes';
import messageRoutes from './modules/message/message.routes';

export const app = express();

app.use(express.json());

app.use('/chat', chatRoutes);
app.use('/chat', messageRoutes);
app.use('/user', userRoutes);

app.use(errorHandler);