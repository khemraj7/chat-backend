import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { addMember, createChat, createGroup, removeMember } from './chat.controller';
import { createChatBody, createGroupBody, groupIdParam, memberChangeBody } from './chat.schema';

const router = Router();

router.post('/create', validate({ body: createChatBody }), createChat);

router.post('/group/create', validate({ body: createGroupBody }), createGroup);

router.post(
  '/:chatId/members/add',
  validate({ params: groupIdParam, body: memberChangeBody }),
  addMember,
);

router.post(
  '/:chatId/members/remove',
  validate({ params: groupIdParam, body: memberChangeBody }),
  removeMember,
);

export default router;