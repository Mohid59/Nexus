import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimplePeer, { Instance as PeerInstance, SignalData } from 'simple-peer';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Loader2, AlertCircle } from 'lucide-react';
import { getSocket, disconnectSocket } from '../../lib/socket';
import { Button } from '../../components/ui/Button';

const RemoteTile: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
      <video ref={ref} autoPlay playsInline className="h-full w-full object-cover" />
    </div>
  );
};

export const CallPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, PeerInstance>>({});

  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    const socket = getSocket();

    const removePeer = (socketId: string) => {
      peersRef.current[socketId]?.destroy();
      delete peersRef.current[socketId];
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    const createPeer = (socketId: string, initiator: boolean, stream: MediaStream): PeerInstance => {
      const peer = new SimplePeer({ initiator, trickle: true, stream });
      peer.on('signal', (data) => socket.emit('call:signal', { to: socketId, data }));
      peer.on('stream', (remote: MediaStream) => setRemoteStreams((prev) => ({ ...prev, [socketId]: remote })));
      peer.on('close', () => removePeer(socketId));
      peer.on('error', () => removePeer(socketId));
      peersRef.current[socketId] = peer;
      return peer;
    };

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setReady(true);

        socket.on('call:peers', ({ peers }: { peers: string[] }) => {
          peers.forEach((sid) => createPeer(sid, true, stream));
        });
        socket.on('call:peer-joined', ({ socketId }: { socketId: string }) => {
          createPeer(socketId, false, stream);
        });
        socket.on('call:signal', ({ from, data }: { from: string; data: SignalData }) => {
          const peer = peersRef.current[from] ?? createPeer(from, false, stream);
          peer.signal(data);
        });
        socket.on('call:peer-left', ({ socketId }: { socketId: string }) => removePeer(socketId));

        socket.emit('call:join', roomId);
      } catch {
        setError('Camera and microphone access is required to join the call.');
      }
    })();

    return () => {
      cancelled = true;
      socket.emit('call:leave');
      socket.off('call:peers');
      socket.off('call:peer-joined');
      socket.off('call:signal');
      socket.off('call:peer-left');
      Object.values(peersRef.current).forEach((p) => p.destroy());
      peersRef.current = {};
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      disconnectSocket();
    };
  }, [roomId]);

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  };

  const endCall = () => navigate(-1);

  const remoteEntries = Object.entries(remoteStreams);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-950 px-6 text-center text-white">
        <AlertCircle size={40} className="text-accent-400" />
        <p className="max-w-sm text-white/80">{error}</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="border-white/30 bg-transparent text-white hover:bg-white/10">
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      <div className="flex items-center justify-between px-6 py-4 text-white">
        <p className="font-display text-lg font-semibold">Nexus Call</p>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {remoteEntries.length > 0 ? `${remoteEntries.length + 1} in call` : 'Waiting for others to join…'}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div
          className={`grid w-full max-w-5xl gap-4 ${remoteEntries.length === 0 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}
        >
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
            <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center text-white/60">
                <Loader2 className="animate-spin" />
              </div>
            )}
            <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-xs text-white">You</span>
          </div>
          {remoteEntries.map(([sid, stream]) => (
            <RemoteTile key={sid} stream={stream} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pb-8">
        <button
          onClick={toggleMic}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${micOn ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-error-500 text-white'}`}
          aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button
          onClick={endCall}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-error-500 text-white transition-colors hover:bg-error-600"
          aria-label="End call"
        >
          <PhoneOff size={22} />
        </button>
        <button
          onClick={toggleCam}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${camOn ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-error-500 text-white'}`}
          aria-label={camOn ? 'Turn camera off' : 'Turn camera on'}
        >
          {camOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
        </button>
      </div>
    </div>
  );
};
