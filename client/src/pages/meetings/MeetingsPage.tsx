import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { CalendarPlus, Check, X, Video, CalendarDays, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import { api, apiErrorMessage } from '../../lib/api';
import {
  Meeting,
  MeetingStatus,
  listMeetings,
  createMeeting,
  acceptMeeting,
  rejectMeeting,
  cancelMeeting,
} from '../../lib/meetings';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { 'en-US': enUS } });

const STATUS_BG: Record<MeetingStatus, string> = {
  pending: '#C2683A',
  accepted: '#0F766E',
  rejected: '#8C887A',
  cancelled: '#B4AFA1',
};

const STATUS_BADGE: Record<MeetingStatus, BadgeVariant> = {
  pending: 'accent',
  accepted: 'secondary',
  rejected: 'gray',
  cancelled: 'gray',
};

interface Counterpart {
  id: string;
  name: string;
  avatarUrl: string;
}

interface CalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: MeetingStatus;
  meeting: Meeting;
}

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState<Date>(new Date());

  const [counterparts, setCounterparts] = useState<Counterpart[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formAttendee, setFormAttendee] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');

  const load = useCallback(async () => {
    try {
      setMeetings(await listMeetings());
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not load meetings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    const role = user.role === 'entrepreneur' ? 'investors' : 'entrepreneurs';
    api
      .get(`/${role}`, { params: { limit: 100 } })
      .then(({ data }) => setCounterparts(data.data as Counterpart[]))
      .catch(() => undefined);
  }, [user]);

  const events: CalEvent[] = useMemo(
    () =>
      meetings
        .filter((m) => m.status !== 'rejected' && m.status !== 'cancelled')
        .map((m) => ({
          id: m.id,
          title: m.title,
          start: new Date(m.start),
          end: new Date(m.end),
          status: m.status,
          meeting: m,
        })),
    [meetings]
  );

  const upcoming = useMemo(
    () =>
      [...meetings]
        .filter((m) => new Date(m.end) >= new Date() && m.status !== 'cancelled' && m.status !== 'rejected')
        .sort((a, b) => +new Date(a.start) - +new Date(b.start)),
    [meetings]
  );

  const otherParty = (m: Meeting) => (m.organizer.id === user?.id ? m.attendee : m.organizer);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAttendee || !formTitle || !formStart || !formEnd) return;
    if (new Date(formEnd) <= new Date(formStart)) {
      toast.error('End time must be after start time');
      return;
    }
    setSubmitting(true);
    try {
      await createMeeting({
        attendee: formAttendee,
        title: formTitle,
        start: new Date(formStart).toISOString(),
        end: new Date(formEnd).toISOString(),
      });
      toast.success('Meeting request sent');
      setModalOpen(false);
      setFormAttendee('');
      setFormTitle('');
      setFormStart('');
      setFormEnd('');
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not schedule meeting'));
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (fn: (id: string) => Promise<Meeting>, id: string, ok: string) => {
    try {
      await fn(id);
      toast.success(ok);
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Action failed'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Meetings</h1>
          <p className="mt-1 text-muted">Schedule and manage calls with your connections.</p>
        </div>
        <Button leftIcon={<CalendarPlus size={18} />} onClick={() => setModalOpen(true)}>
          Schedule meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
            {loading ? (
              <Skeleton className="h-[600px] w-full" />
            ) : (
              <Calendar
                localizer={localizer}
                events={events}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                startAccessor="start"
                endAccessor="end"
                popup
                style={{ height: 600 }}
                eventPropGetter={(event: CalEvent) => ({
                  style: { backgroundColor: STATUS_BG[event.status], border: 'none' },
                })}
                onSelectEvent={(event: CalEvent) => setDate(event.start)}
              />
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-ink">Upcoming</h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface">
              <EmptyState
                icon={<CalendarDays size={24} />}
                title="No upcoming meetings"
                description="Schedule a meeting to see it here."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((m) => {
                const party = otherParty(m);
                const isInvitee = m.attendee.id === user?.id && m.status === 'pending';
                return (
                  <div key={m.id} className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-ink">{m.title}</p>
                      <Badge variant={STATUS_BADGE[m.status]} rounded size="sm" className="capitalize">
                        {m.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">with {party.name}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                      <Clock size={14} />
                      {format(new Date(m.start), 'EEE d MMM, h:mm a')}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {isInvitee && (
                        <>
                          <Button size="sm" variant="success" leftIcon={<Check size={15} />} onClick={() => runAction(acceptMeeting, m.id, 'Meeting accepted')}>
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" leftIcon={<X size={15} />} onClick={() => runAction(rejectMeeting, m.id, 'Meeting declined')}>
                            Decline
                          </Button>
                        </>
                      )}
                      {m.status === 'accepted' && (
                        <Link to={`/call/${m.roomId}`}>
                          <Button size="sm" leftIcon={<Video size={15} />}>
                            Join call
                          </Button>
                        </Link>
                      )}
                      {(m.status === 'pending' || m.status === 'accepted') && (
                        <Button size="sm" variant="ghost" onClick={() => runAction(cancelMeeting, m.id, 'Meeting cancelled')}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule a meeting"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} isLoading={submitting} leftIcon={<CalendarPlus size={16} />}>
              Send request
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSchedule}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              {user?.role === 'entrepreneur' ? 'Investor' : 'Entrepreneur'}
            </label>
            <select
              value={formAttendee}
              onChange={(e) => setFormAttendee(e.target.value)}
              required
              className="block w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink shadow-soft focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/35"
            >
              <option value="" disabled>
                Select a person
              </option>
              {counterparts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input label="Title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required fullWidth placeholder="e.g. Intro call" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Start" type="datetime-local" value={formStart} onChange={(e) => setFormStart(e.target.value)} required fullWidth />
            <Input label="End" type="datetime-local" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} required fullWidth />
          </div>
        </form>
      </Modal>
    </div>
  );
};
