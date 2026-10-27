import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware';
import { listUserChats } from './user.controller';

const router = Router();

const userIdParam = z.object({ userId: z.string().uuid() });

router.get('/:userId/chats', validate({ params: userIdParam }), listUserChats);

export default router;