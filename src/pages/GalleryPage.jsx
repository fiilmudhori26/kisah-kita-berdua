import { useEffect, useState } from 'react';
import { Plus, Copy, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCouple } from '../lib/data';
import { useAuth } from '../context/AuthContext';
import PhotoCard from '../components/PhotoCard';
import PhotoModal from '../components/PhotoModal';
import UploadForm from '../components/UploadForm';

export default function GalleryPage() {
  const { user } = useAuth();
  const [couple, setCouple] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [upload, setUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  async function load() {
    setLoading(true);
    try {
      const c = await getCouple();
      setCouple(c);
      if (c) {
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .eq('couple_id', c.id)
          .order('taken_at', { ascending: false });
        if (error) throw error;
        setPhotos(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="screen-center">
        Gathering your memories…
      </div>
    );
  }

  if (!couple) {
    return (
      <div className="welcome-card">
        <div className="brand-mark large">
          <Heart size={32} />
        </div>
        <p className="eyebrow">Your shared space</p>
        <h1>A little place for your favourite moments.</h1>
        <p>
          Link your account with your partner to start collecting memories
          together.
        </p>
        <a className="primary-button" href="/connect">
          Set up our space
        </a>
      </div>
    );
  }

  const visible = photos.filter(
    (p) =>
      filter === 'all' ||
      (filter === 'locked' && p.unlock_at && new Date(p.unlock_at) > new Date()) ||
      (filter === 'open' && (!p.unlock_at || new Date(p.unlock_at) <= new Date()))
  );

  return (
    <>
      {/* Couple cover hero */}
      <section className="couple-cover">
        <div className="couple-cover-placeholder">
          💕
        </div>
        <div className="couple-cover-overlay">
          <div>
            <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Our story
            </p>
            <h1 className="couple-cover-title">{couple.name}</h1>
            <p className="couple-cover-subtitle">
              A private gallery for your favorite memories.
            </p>
          </div>
        </div>
      </section>

      <section className="page-heading">
        <div>
          <p className="eyebrow">Our private collection</p>
          <h1>{couple.name}</h1>
          <p className="muted">Every little moment, in one place.</p>
        </div>
        <button className="primary-button" onClick={() => setUpload(true)}>
          <Plus size={17} /> Add memory
        </button>
      </section>

      <section className="invite-strip">
        <span>
          Invite your person with this code:
          <strong>{couple.invite_code}</strong>
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(couple.invite_code)}
        >
          <Copy size={15} /> Copy
        </button>
      </section>

      <div className="filter-row">
        <button
          className={filter === 'all' ? 'filter-active' : ''}
          onClick={() => setFilter('all')}
        >
          All memories
        </button>
        <button
          className={filter === 'open' ? 'filter-active' : ''}
          onClick={() => setFilter('open')}
        >
          Unlocked
        </button>
        <button
          className={filter === 'locked' ? 'filter-active' : ''}
          onClick={() => setFilter('locked')}
        >
          Time capsules
        </button>
        <span>{visible.length} memories</span>
      </div>

      {visible.length ? (
        <div className="photo-grid">
          {visible.map((p) => (
            <PhotoCard key={p.id} photo={p} onClick={() => setSelected(p)} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div>♡</div>
          <h2>Nothing here just yet.</h2>
          <p>Your first memory is waiting to be saved.</p>
          <button className="soft-button" onClick={() => setUpload(true)}>
            Add your first photo
          </button>
        </div>
      )}

      {upload && (
        <UploadForm
          couple={couple}
          user={user}
          onClose={() => setUpload(false)}
          onDone={() => {
            setUpload(false);
            load();
          }}
        />
      )}
      {selected && (
        <PhotoModal
          photo={selected}
          couple={couple}
          user={user}
          onClose={() => setSelected(null)}
          onChanged={load}
        />
      )}
    </>
  );
}