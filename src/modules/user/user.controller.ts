import { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { userRepository } from './user.repository';

export const listUserChats = async (
  req: Request<{ userId: string }>,
  res: Response,
): Promise<void> => {
  const { userId } = req.params;

  if (!(await userRepository.exists(userId))) {
    throw new AppError(404, 'User not found');
  }

  const chats = await userRepository.findChats(userId);

  res.json({
    chats: chats.map((chat) => ({
      chatId: chat.id,
      type: chat.type,
      name: chat.name,
      memberIds: chat.members.map((m) => m.userId),
      createdAt: chat.createdAt,
    })),
  });
};