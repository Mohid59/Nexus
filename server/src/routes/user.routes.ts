import { Router } from 'express';
import { getMe, updateMe, getUserById } from '../controllers/user.controller';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, idParamSchema } from '../validators/user.schema';

const router = Router();

router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, validate({ body: updateProfileSchema }), updateMe);
router.get('/:id', requireAuth, validate({ params: idParamSchema }), getUserById);

export default router;
