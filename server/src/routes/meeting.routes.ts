import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { createMeetingSchema, listMeetingsQuery, meetingIdParam } from '../validators/meeting.schema';
import {
  createMeeting,
  listMeetings,
  acceptMeeting,
  rejectMeeting,
  cancelMeeting,
} from '../controllers/meeting.controller';

const router = Router();

router.use(requireAuth);

router.get('/', validate({ query: listMeetingsQuery }), listMeetings);
router.post('/', validate({ body: createMeetingSchema }), createMeeting);
router.patch('/:id/accept', validate({ params: meetingIdParam }), acceptMeeting);
router.patch('/:id/reject', validate({ params: meetingIdParam }), rejectMeeting);
router.patch('/:id/cancel', validate({ params: meetingIdParam }), cancelMeeting);

export default router;
