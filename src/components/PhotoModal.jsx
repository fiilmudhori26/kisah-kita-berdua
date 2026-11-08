import { useEffect, useState } from 'react';
import { X, Heart, MessageCircle, MapPin, Lock, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { signedMedia, PHOTO_BUCKET, AUDIO_BUCKET } from '../lib/data';

export default function PhotoModal({ photo, couple, user, onClose, onChanged }) {
  const [url, setUrl] = useState('');
  const [audio, setAudio] = useState('');
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [liked, setLiked] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      setUrl(await signedMedia(PHOTO_BUCKET, photo.storage_path));
      if (photo.voice_note_path) setAudio(await signedMedia(AUDIO_BUCKET, photo.voice_note_path));
      const [{ data: c }, { data: r }] = await Promise.all([
        supabase
          .from('photo_comments')
          .select('*')
          .eq('photo_id', photo.id)
          .order('created_at'),
        supabase
          .from('photo_reactions')
          .select('id')
          .eq('photo_id', photo.id)
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);
      if (live) {
        setComments(c || []);
        setLiked(!!r);
      }
    })();
    return () => {
      live = false;
    };
  }, [photo]);

  const locked = photo.unlock_at && new Date(photo.unlock_at) > new Date();

  async function comment(e) {
    e.preventDefault();
    if (!body.trim()) return;
    const { error } = await supabase.from('photo_comments').insert({
      photo_id: photo.id,
      couple_id: couple.id,
      user_id: user.id,
      body: body.trim(),
    });
    if (error) return alert(error.message);
    setBody('');
    const { data } = await supabase
      .from('photo_comments')
      .select('*')
      .eq('photo_id', photo.id)
      .order('created_at');
    setComments(data || []);
  }

  async function toggleLike() {
    if (liked) {
      await supabase
        .from('photo_reactions')
        .delete()
        .eq('photo_id', photo.id)
        .eq('user_id', user.id);
      setLiked(false);
    } else {
      await supabase
        .from('photo_reactions')
        .insert({ photo_id: photo.id, couple_id: couple.id, user_id: user.id });
      setLiked(true);
    }
    onChanged?.();
  }

  if (locked) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <section className="modal capsule-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            <X />
          </button>
          <Lock size={34} />
          <h2>A memory for later</h2>
          <p>
            This photo opens on{' '}
            {format(new Date(photo.unlock_at), 'd MMMM yyyy, HH:mm')}.
          </p>
          <div className="locked-photo">✦</div>
        </section>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal photo-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X />
        </button>
        <div className="modal-image">
          <img src={url} alt={photo.caption || 'Shared memory'} />
        </div>
        <aside className="modal-details">
          <div className="eyebrow">
            {format(new Date(photo.taken_at + 'T12:00:00'), 'd MMMM yyyy')}
          </div>
          <h2>{photo.caption || 'A little moment'}</h2>
          {photo.location_name && (
            <p className="muted">
              <MapPin size={14} /> {photo.location_name}
            </p>
          )}
          <div className="action-row">
            <button
              className={liked ? 'heart-button active' : 'heart-button'}
              onClick={toggleLike}
            >
              <Heart size={17} fill={liked ? 'currentColor' : 'none'} />
              {liked ? 'Loved' : 'Send love'}
            </button>
            {audio && (
              <button
                className="soft-button"
                onClick={() => {
                  const a = document.getElementById('voice-note');
                  if (a?.paused) {
                    a.play();
                    setPlaying(true);
                  } else {
                    a?.pause();
                    setPlaying(false);
                  }
                }}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />} Voice note
                <audio
                  id="voice-note"
                  src={audio}
                  onEnded={() => setPlaying(false)}
                />
              </button>
            )}
          </div>
          <div className="comments">
            <h3>
              <MessageCircle size={16} /> Little notes
            </h3>
            <div className="comment-list">
              {comments.map((c) => (
                <p key={c.id}>
                  {c.body}
                  <small>{format(new Date(c.created_at), 'd MMM, HH:mm')}</small>
                </p>
              ))}
            </div>
            <form onSubmit={comment} className="comment-form">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={500}
                placeholder="Leave a little note…"
              />
              <button className="primary-button" type="submit">
                Send
              </button>
            </form>
          </div>
        </aside>
      </section>
    </div>
  );
}