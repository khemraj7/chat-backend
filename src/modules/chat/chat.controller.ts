import { Request, Response } from 'express';
import { CreateChatBody, CreateGroupBody, MemberChangeBody } from './chat.schema';
import { chatService } from './chat.service';

export const createChat = async (req: Request, res: Response): Promise<void> => {
  const { userAId, userBId } = req.body as CreateChatBody;
  const result = await chatService.createOrGetDirect(userAId, userBId);
  res.status(result.created ? 201 : 200).json({ chatId: result.chatId });
};

export const createGroup = async (req: Request, res: Response): Promise<void> => {
  const { creatorId, name, memberIds } = req.body as CreateGroupBody;
  const chatId = await chatService.createGroup(creatorId, name, memberIds);
  res.status(201).json({ chatId });
};

export const addMember = async (
  req: Request<{ chatId: string }>,
  res: Response,
): Promise<void> => {
  const { requesterId, userId } = req.body as MemberChangeBody;
  const memberIds = await chatService.addMember(req.params.chatId, requesterId, userId);
  res.json({ chatId: req.params.chatId, memberIds });
};

export const removeMember = async (
  req: Request<{ chatId: string }>,
  res: Response,
): Promise<void> => {
  const { requesterId, userId } = req.body as MemberChangeBody;
  const memberIds = await chatService.removeMember(req.params.chatId, requesterId, userId);
  res.json({ chatId: req.params.chatId, memberIds });
};