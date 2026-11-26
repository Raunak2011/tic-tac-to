import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  ChevronLeft,
  Download,
  Image as ImageIcon,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  SwitchCamera,
  Trash2,
  X,
} from 'lucide-react';
import Brand from '../components/Brand.jsx';
import AppFooter from '../components/AppFooter.jsx';

const ERROR_COPY = {
  NotAllowedError: 'Camera access was blocked. Allow it in your browser settings, then try again.',
  PermissionDeniedError: 'Camera access was blocked. Allow it in your browser settings, then try again.',
  NotFoundError: 'No camera was found on this device.',
  DevicesNotFoundError: 'No camera was found on this device.',
  NotReadableError: 'The camera is busy in another app. Close it and try again.',
  TrackStartError: 'The camera could not start. Close any other camera apps and try again.',
  OverconstrainedError: 'This camera does not support the requested mode. Try again.',
  SecurityError: 'Camera access needs HTTPS or localhost.',
};

const stamp = () =>
  new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

export default function CameraApp() {
  const [status, setStatus] = useState('idle');
  const [facing, setFacing] = useState('environment');
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const aliveRef = useRef(true);
  const flashTimer = useRef(null);
  const requestRef = useRef(0);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async (mode) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }
    if (window.isSecureContext === false) {
      setStatus('unsupported');
      setMessage('Camera access needs HTTPS or localhost. Open this page on a secure connection.');
      return;
    }

    setStatus('starting');
    setMessage('');

    const request = requestRef.current + 1;
    requestRef.current = request;

    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (!aliveRef.current || request !== requestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      if (aliveRef.current && request === requestRef.current) setStatus('live');
    } catch (error) {
      if (!aliveRef.current || request !== requestRef.current) return;
      stopStream();
      setMessage(ERROR_COPY[error?.name] ?? 'The camera could not start. Give it another try.');
      setStatus('error');
    }
  }, [stopStream]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      stopStream();
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    };
  }, [stopStream]);

  const switchCamera = () => {
    const next = facing === 'environment' ? 'user' : 'environment';
    setFacing(next);
    startCamera(next);
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (facing === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photo = {
      id: `${Date.now()}`,
      src: canvas.toDataURL('image/jpeg', 0.9),
      time: stamp(),
    };
    setPhotos((prev) => [photo, ...prev]);
    setFlash(true);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(false), 220);
  };

  const removePhoto = (id) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
    setSelected((prev) => (prev?.id === id ? null : prev));
  };

  const statusBanner = () => {
    if (status === 'idle') {
      return (
        <div className="cam-state">
          <span className="cam-state-icon"><Camera size={30} /></span>
          <b>Camera is off</b>
          <span>Nothing is recorded until you turn it on. Everything stays on this device.</span>
        </div>
      );
    }
    if (status === 'starting') {
      return (
        <div className="cam-state">
          <LoaderCircle size={28} className="spin" />
          <b>Waking up the camera</b>
          <span>Allow access when your browser asks.</span>
        </div>
      );
    }
    if (status === 'unsupported') {
      return (
        <div className="cam-state">
          <span className="cam-state-icon"><CameraOff size={28} /></span>
          <b>Camera unavailable</b>
          <span>{message || 'This browser cannot reach a camera right now.'}</span>
        </div>
      );
    }
    if (status === 'error') {
      return (
        <div className="cam-state">
          <span className="cam-state-icon"><CameraOff size={28} /></span>
          <b>Couldn&apos;t start the camera</b>
          <span>{message}</span>
        </div>
      );
    }
    return null;
  };

  const showVideo = status === 'live' || status === 'starting';

  return (
    <main className="app-shell">
      <header className="topbar">
        <Brand />
        <span className="top-label"><span className="online-dot" /> LOCAL CAPTURE</span>
      </header>

      <div className="crumb-bar">
        <a className="back-link" href="#/"><ChevronLeft size={13} /> ALL TOOLS</a>
        <span className="crumb-current">TOOL 04 — CAMERA</span>
      </div>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={13} /> POINT · SHOOT · KEEP</div>
        <h1>Your pocket<br /><span>photo booth.</span></h1>
        <p>A live camera, a one-tap shutter and a strip of shots that never leave your phone.</p>
      </section>

      <section className="stage">
        <div className="game-card cam-card">
          <div className="cam-viewport">
            <video
              ref={videoRef}
              className={`cam-video ${facing === 'user' ? 'mirror' : ''} ${showVideo ? 'visible' : ''}`}
              autoPlay
              muted
              playsInline
            />

            {status === 'live' && (
              <>
                <div className="cam-chips">
                  <span className="cam-live"><span className="online-dot" /> LIVE</span>
                  <span className="cam-facing">{facing === 'user' ? 'FRONT' : 'BACK'}</span>
                </div>
                <div className={`cam-flash ${flash ? 'on' : ''}`} />
              </>
            )}

            {statusBanner()}
          </div>

          <div className="cam-controls">
            {status === 'live' ? (
              <>
                <button className="cam-round" onClick={switchCamera} aria-label="Switch camera">
                  <SwitchCamera size={20} />
                </button>
                <button className="shutter" onClick={capture} aria-label="Take photo">
                  <span />
                </button>
                <button
                  className="cam-round"
                  onClick={() => {
                    requestRef.current += 1;
                    stopStream();
                    setStatus('idle');
                  }}
                  aria-label="Turn camera off"
                >
                  <CameraOff size={20} />
                </button>
              </>
            ) : (
              <button
                className="start-button cam-start"
                onClick={() => startCamera(facing)}
                disabled={status === 'starting'}
              >
                {status === 'starting' ? (
                  <><LoaderCircle size={15} className="spin" /><span>STARTING…</span></>
                ) : status === 'unsupported' ? (
                  <><RefreshCw size={15} /><span>TRY AGAIN</span></>
                ) : (
                  <><Camera size={15} /><span>TURN ON CAMERA</span></>
                )}
              </button>
            )}
          </div>

          <div className="cam-gallery-head">
            <span><ImageIcon size={12} /> SHOTS THIS SESSION</span>
            <span>{String(photos.length).padStart(2, '0')}</span>
          </div>

          {photos.length === 0 ? (
            <p className="cam-empty">No shots yet — your captures will line up here.</p>
          ) : (
            <ul className="cam-gallery">
              {photos.map((photo) => (
                <li key={photo.id}>
                  <button className="cam-thumb" onClick={() => setSelected(photo)} aria-label={`Open photo from ${photo.time}`}>
                    <img src={photo.src} alt={`Capture at ${photo.time}`} />
                    <span className="cam-thumb-time">{photo.time}</span>
                  </button>
                  <button className="cam-remove" onClick={() => removePhoto(photo.id)} aria-label="Delete photo">
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="card-hint">PHOTOS LIVE IN MEMORY ONLY · NOTHING IS UPLOADED</div>
        </div>
      </section>

      {selected && (
        <div className="photo-viewer" role="dialog" aria-modal="true" aria-label="Photo preview">
          <button className="viewer-close" onClick={() => setSelected(null)} aria-label="Close preview">
            <X size={20} />
          </button>
          <img src={selected.src} alt={`Capture at ${selected.time}`} />
          <div className="viewer-actions">
            <a className="viewer-btn" href={selected.src} download={`toolbox-${selected.id}.jpg`}>
              <Download size={15} /> SAVE
            </a>
            <button className="viewer-btn danger" onClick={() => removePhoto(selected.id)}>
              <Trash2 size={15} /> DELETE
            </button>
          </div>
        </div>
      )}

      <AppFooter note="KEEP IT LOCAL" />
    </main>
  );
}
