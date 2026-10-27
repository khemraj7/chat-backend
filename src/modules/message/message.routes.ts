import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { deleteMessage, editMessage, listMessages, markMessageRead, sendMessage, updateLastSeen } from './message.controller';
import {
  chatIdParam,
  deleteMessageBody,
  editMessageBody,
  lastSeenBody,
  listMessagesQuery,
  markReadBody,
  messageParams,
  sendMessageBody,
} from './message.schema';

const router = Router();

router.post(
  '/:chatId/message/send',
  validate({ params: chatIdParam, body: sendMessageBody }),
  sendMessage,
);

router.get(
  '/:chatId/messages',
  validate({ params: chatIdParam, query: listMessagesQuery }),
  listMessages,
);

router.post(
  '/:chatId/message/:messageId/read',
  validate({ params: messageParams, body: markReadBody }),
  markMessageRead,
);

router.post(
  '/:chatId/lastseen',
  validate({ params: chatIdParam, body: lastSeenBody }),
  updateLastSeen,
);

router.patch(
  '/:chatId/message/:messageId',
  validate({ params: messageParams, body: editMessageBody }),
  editMessage,
);

router.delete(
  '/:chatId/message/:messageId',
  validate({ params: messageParams, body: deleteMessageBody }),
  deleteMessage,
);

export default router;