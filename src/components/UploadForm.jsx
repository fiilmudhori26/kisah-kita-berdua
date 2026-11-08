import { useRef, useState } from 'react';
import { X, Upload, MapPin, Mic, Square, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadPrivate, PHOTO_BUCKET, AUDIO_BUCKET } from '../lib/data';

export default function UploadForm({ couple, user, onClose, onDone }) {
  const recorderRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [place, setPlace] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [unlock, setUnlock] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function choose(f) {
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)) {
      setError('Use JPG, PNG, WEBP or GIF.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Maximum photo size is 10 MB.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  }

  async function record() {
    try {
      if (recording) {
        recorderRef.current?.stop();
        setRecording(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      recorderRef.current = r;
      const chunks = [];
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        setAudioBlob(new Blob(chunks, { type: r.mimeType || 'audio/webm' }));
        stream.getTracks().forEach((t) => t.stop());
      };
      r.start();
      setRecording(true);
      setTimeout(() => {
        if (r.state === 'recording') r.stop();
        setRecording(false);
      }, 30000);
    } catch (e) {
      setError('Microphone permission is unavailable. ' + e.message);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) return setError('Choose a photo first.');
    setBusy(true);
    setError('');
    try {
      const path = await uploadPrivate(PHOTO_BUCKET, couple.id, file);
      let voicePath = null;
      if (audioBlob) {
        const ext = audioBlob.type.includes('mp4')
          ? 'mp4'
          : audioBlob.type.includes('ogg')
            ? 'ogg'
            : 'webm';
        voicePath = await uploadPrivate(
          AUDIO_BUCKET,
          couple.id,
          new File([audioBlob], `note.${ext}`, { type: audioBlob.type })
        );
      }
      const { error: insertError } = await supabase.from('photos').insert({
        couple_id: couple.id,
        uploaded_by: user.id,
        storage_path: path,
        caption,
        taken_at: date,
        location_name: place || null,
        latitude: lat ? Number(lat) : null,
        longitude: lng ? Number(lng) : null,
        voice_note_path: voicePath,
        unlock_at: unlock ? new Date(unlock).toISOString() : null,
      });
      if (insertError) throw insertError;
      onDone();
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal upload-modal"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose}>
          <X />
        </button>
        <div className="eyebrow">Save a memory</div>
        <h2>Add to our archive</h2>
        <label className="dropzone">
          {preview ? (
            <img src={preview} alt="Preview" />
          ) : (
            <>
              <Upload size={24} />
              <strong>Choose a photo</strong>
              <span>JPG, PNG, WEBP · up to 10 MB</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => choose(e.target.files?.[0])}
          />
        </label>
        <label>
          Caption
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={2000}
            placeholder="What made this moment special?"
          />
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <div className="two-fields">
          <label>
            Place
            <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Where was this?" />
          </label>
          <label>
            Latitude
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              type="number"
              step="any"
              placeholder="-6.2"
            />
          </label>
          <label>
            Longitude
            <input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              type="number"
              step="any"
              placeholder="106.8"
            />
          </label>
        </div>
        <label>
          Open this memory later (optional)
          <input type="datetime-local" value={unlock} onChange={(e) => setUnlock(e.target.value)} />
        </label>
        <div className="record-row">
          <button
            type="button"
            className="soft-button"
            onClick={record}
          >
            {recording ? (
              <Square size={16} />
            ) : (
              <Mic size={16} />
            )}
            {recording ? 'Stop recording (max 30s)' : 'Record a voice note'}
          </button>
          {audioBlob && (
            <span>
              <Play size={14} /> Voice note ready
            </span>
          )}
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="primary-button wide" disabled={busy}>
          {busy ? 'Saving…' : 'Save memory'}
        </button>
      </form>
    </div>
  );
}