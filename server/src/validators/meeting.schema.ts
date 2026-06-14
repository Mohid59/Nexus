import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createMeetingSchema = z
  .object({
    attendee: objectId,
    title: z.string().min(2).max(140),
    description: z.string().max(2000).optional(),
    start: z.coerce.date(),
    end: z.coerce.date(),
  })
  .refine((d) => d.end.getTime() > d.start.getTime(), {
    message: 'End time must be after start time',
    path: ['end'],
  });

export const listMeetingsQuery = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'cancelled']).optional(),
  scope: z.enum(['upcoming', 'past', 'all']).default('all'),
});

export const meetingIdParam = z.object({ id: objectId });

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type ListMeetingsQuery = z.infer<typeof listMeetingsQuery>;
