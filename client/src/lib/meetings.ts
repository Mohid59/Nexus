import { api } from './api';
import { UserRole } from '../types';

export type MeetingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface MeetingParty {
  id: string;
  name: string;
  avatarUrl: string;
  role: UserRole;
  email?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  organizer: MeetingParty;
  attendee: MeetingParty;
  start: string;
  end: string;
  status: MeetingStatus;
  roomId: string;
}

export interface CreateMeetingPayload {
  attendee: string;
  title: string;
  description?: string;
  start: string;
  end: string;
}

export async function listMeetings(params?: { scope?: string; status?: string }): Promise<Meeting[]> {
  const { data } = await api.get('/meetings', { params });
  return data.data as Meeting[];
}

export async function createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
  const { data } = await api.post('/meetings', payload);
  return data.meeting as Meeting;
}

export async function acceptMeeting(id: string): Promise<Meeting> {
  const { data } = await api.patch(`/meetings/${id}/accept`);
  return data.meeting as Meeting;
}

export async function rejectMeeting(id: string): Promise<Meeting> {
  const { data } = await api.patch(`/meetings/${id}/reject`);
  return data.meeting as Meeting;
}

export async function cancelMeeting(id: string): Promise<Meeting> {
  const { data } = await api.patch(`/meetings/${id}/cancel`);
  return data.meeting as Meeting;
}
