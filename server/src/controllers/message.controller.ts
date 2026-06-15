import type { Server } from 'socket.io';
import { Types } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { Message, IMessage } from '../models/Message';
import { User } from '../models/User';

/** List the current user's conversations: one entry per other party with last message + unread count. */
export const listConversations = asyncHandler(async (req, res) => {
  const uid = req.user!.id;
  const msgs = await Message.find({ $or: [{ sender: uid }, { receiver: uid }] }).sort({ createdAt: -1 });

  const grouped = new Map<string, { last: IMessage; unread: number }>();
  for (const m of msgs) {
    const other = m.sender.toString() === uid ? m.receiver.toString() : m.sender.toString();
    if (!grouped.has(other)) grouped.set(other, { last: m, unread: 0 });
    if (m.receiver.toString() === uid && !m.read) grouped.get(other)!.unread += 1;
  }

  const others = [...grouped.keys()];
  const users = await User.find({ _id: { $in: others } }).select('name avatarUrl role isOnline');
  const byId = new Map(users.map((u) => [u.id as string, u]));

  const conversations = [...grouped.entries()]
    .map(([id, v]) => {
      const u = byId.get(id);
      return u ? { user: u.toJSON(), lastMessage: v.last.toJSON(), unread: v.unread } : null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  res.json({ data: conversations });
});

/** Thread of messages between the current user and :id (ascending), marking received ones read. */
export const getThread = asyncHandler(async (req, res) => {
  const uid = req.user!.id;
  const other = req.params.id;

  const msgs = await Message.find({
    $or: [
      { sender: uid, receiver: other },
      { sender: other, receiver: uid },
    ],
  }).sort({ createdAt: 1 });

  await Message.updateMany({ sender: other, receiver: uid, read: false }, { read: true });

  res.json({ data: msgs.map((m) => m.toJSON()) });
});

/** Send a message to another user. Emits `message:new` to the recipient's personal room. */
export const sendMessage = asyncHandler(async (req, res) => {
  const uid = req.user!.id;
  const { to, content } = req.body as { to: string; content: string };

  if (to === uid) throw new AppError(400, 'You cannot message yourself');
  const recipient = await User.findById(to);
  if (!recipient) throw new AppError(404, 'Recipient not found');

  const msg = await Message.create({
    sender: new Types.ObjectId(uid),
    receiver: new Types.ObjectId(to),
    content,
  });

  const io = req.app.get('io') as Server | undefined;
  io?.to(to).emit('message:new', msg.toJSON());

  res.status(201).json({ message: msg.toJSON() });
});
