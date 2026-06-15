import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { sendMessageSchema, userIdParam } from '../validators/message.schema';
import { listConversations, getThread, sendMessage } from '../controllers/message.controller';

const router = Router();

router.use(requireAuth);

router.get('/conversations', listConversations);
router.post('/', validate({ body: sendMessageSchema }), sendMessage);
router.get('/:id', validate({ params: userIdParam }), getThread);

export default router;
