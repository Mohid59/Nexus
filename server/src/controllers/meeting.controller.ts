import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { Meeting, IMeeting } from '../models/Meeting';
import { User } from '../models/User';
import { CreateMeetingInput, ListMeetingsQuery } from '../validators/meeting.schema';

const POPULATE = 'name avatarUrl role email';
const populateParties = [
  { path: 'organizer', select: POPULATE },
  { path: 'attendee', select: POPULATE },
];

/** True if an *accepted* meeting overlaps [start, end) for either participant. */
async function hasConflict(userIds: string[], start: Date, end: Date, excludeId?: string): Promise<boolean> {
  const query: Record<string, unknown> = {
    status: 'accepted',
    start: { $lt: end },
    end: { $gt: start },
    $or: [{ organizer: { $in: userIds } }, { attendee: { $in: userIds } }],
  };
  if (excludeId) query._id = { $ne: excludeId };
  return Boolean(await Meeting.exists(query));
}

async function loadParticipantMeeting(id: string, userId: string): Promise<IMeeting> {
  const meeting = await Meeting.findById(id);
  if (!meeting) throw new AppError(404, 'Meeting not found');
  if (meeting.organizer.toString() !== userId && meeting.attendee.toString() !== userId) {
    throw new AppError(403, 'You are not a participant of this meeting');
  }
  return meeting;
}

export const createMeeting = asyncHandler(async (req, res) => {
  const { attendee, title, description, start, end } = req.body as CreateMeetingInput;
  const organizer = req.user!.id;

  if (attendee === organizer) throw new AppError(400, 'You cannot schedule a meeting with yourself');
  const other = await User.findById(attendee);
  if (!other) throw new AppError(404, 'Attendee not found');

  if (await hasConflict([organizer, attendee], start, end)) {
    throw new AppError(409, 'That time slot conflicts with an existing meeting for one of the participants');
  }

  const meeting = await Meeting.create({
    title,
    description,
    organizer,
    attendee,
    start,
    end,
    status: 'pending',
    roomId: crypto.randomUUID(),
  });
  await meeting.populate(populateParties);
  res.status(201).json({ meeting: meeting.toJSON() });
});

export const listMeetings = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { status, scope } = req.query as unknown as ListMeetingsQuery;

  const filter: Record<string, unknown> = { $or: [{ organizer: userId }, { attendee: userId }] };
  if (status) filter.status = status;
  if (scope === 'upcoming') filter.end = { $gte: new Date() };
  else if (scope === 'past') filter.end = { $lt: new Date() };

  const meetings = await Meeting.find(filter).sort({ start: 1 }).populate(populateParties);
  res.json({ data: meetings.map((m) => m.toJSON()) });
});

export const acceptMeeting = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const meeting = await loadParticipantMeeting(req.params.id as string, userId);

  if (meeting.attendee.toString() !== userId) throw new AppError(403, 'Only the invitee can accept this meeting');
  if (meeting.status !== 'pending') throw new AppError(409, `Meeting is already ${meeting.status}`);

  if (await hasConflict([meeting.organizer.toString(), meeting.attendee.toString()], meeting.start, meeting.end, meeting.id)) {
    throw new AppError(409, 'Accepting this meeting would conflict with another accepted meeting');
  }

  meeting.status = 'accepted';
  await meeting.save();
  await meeting.populate(populateParties);
  res.json({ meeting: meeting.toJSON() });
});

export const rejectMeeting = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const meeting = await loadParticipantMeeting(req.params.id as string, userId);

  if (meeting.attendee.toString() !== userId) throw new AppError(403, 'Only the invitee can reject this meeting');
  if (meeting.status !== 'pending') throw new AppError(409, `Meeting is already ${meeting.status}`);

  meeting.status = 'rejected';
  await meeting.save();
  await meeting.populate(populateParties);
  res.json({ meeting: meeting.toJSON() });
});

export const cancelMeeting = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const meeting = await loadParticipantMeeting(req.params.id as string, userId);

  if (meeting.status === 'cancelled' || meeting.status === 'rejected') {
    throw new AppError(409, `Meeting is already ${meeting.status}`);
  }

  meeting.status = 'cancelled';
  await meeting.save();
  await meeting.populate(populateParties);
  res.json({ meeting: meeting.toJSON() });
});
