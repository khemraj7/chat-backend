import { Request, Response } from 'express';
import {
  DeleteMessageBody,
  EditMessageBody,
  LastSeenBody,
  listMessagesQuery,
  MarkReadBody,
  SendMessageBody,
} from './message.schema';
import { messageService } from './message.service';

export const sendMessage = async (
  req: Request<{ chatId: string }>,
  res: Response,
): Promise<void> => {
  const { senderId, text } = req.body as SendMessageBody;
  const message = await messageService.send(req.params.chatId, senderId, text);
  res.status(201).json({ message });
};

export const listMessages = async (
  req: Request<{ chatId: string }>,
  res: Response,
): Promise<void> => {
  const { limit } = listMessagesQuery.parse(req.query);
  const messages = await messageService.list(req.params.chatId, limit);
  res.json({ messages });
};

export const markMessageRead = async (
  req: Request<{ chatId: string; messageId: string }>,
  res: Response,
): Promise<void> => {
  const { userId } = req.body as MarkReadBody;
  const { chatId, messageId } = req.params;
  const message = await messageService.markRead(chatId, messageId, userId);
  res.json({ message });
};

export const updateLastSeen = async (
  req: Request<{ chatId: string }>,
  res: Response,
): Promise<void> => {
  const { userId, messageId } = req.body as LastSeenBody;
  const lastSeen = await messageService.updateLastSeen(req.params.chatId, userId, messageId);
  res.json({ lastSeen });
};

export const editMessage = async (
  req: Request<{ chatId: string; messageId: string }>,
  res: Response,
): Promise<void> => {
  const { userId, text } = req.body as EditMessageBody;
  const { chatId, messageId } = req.params;
  const message = await messageService.edit(chatId, messageId, userId, text);
  res.json({ message });
};

export const deleteMessage = async (
  req: Request<{ chatId: string; messageId: string }>,
  res: Response,
): Promise<void> => {
  const { userId } = req.body as DeleteMessageBody;
  const { chatId, messageId } = req.params;
  const message = await messageService.remove(chatId, messageId, userId);
  res.json({ message });
};