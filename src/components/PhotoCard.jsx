import { useEffect, useState } from 'react';
import { Heart, Lock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { signedMedia, PHOTO_BUCKET } from '../lib/data';

export default function PhotoCard({ photo, onClick }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let active = true;
    signedMedia(PHOTO_BUCKET, photo.storage_path)
      .then((v) => {
        if (active) setUrl(v);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [photo.storage_path]);

  const locked = photo.unlock_at && new Date(photo.unlock_at) > new Date();

  return (
    <button className="photo-card" onClick={onClick} aria-label={photo.caption || 'Memory'}>
      <div className="photo-thumb">
        {url ? (
          <img src={url} alt={photo.caption || 'Memory'} loading="lazy" />
        ) : (
          <div className="image-placeholder">♡</div>
        )}
        {locked && (
          <div className="lock-overlay">
            <Lock size={20} />
            <span>Opens {format(new Date(photo.unlock_at), 'd MMM yyyy')}</span>
          </div>
        )}
      </div>
      <div className="photo-meta">
        <strong>{photo.caption || 'Untitled memory'}</strong>
        <span>
          {format(new Date(photo.taken_at + 'T12:00:00'), 'd MMM yyyy')}
          {photo.location_name && (
            <>
              <span> · </span>
              <MapPin size={12} />
              {photo.location_name}
            </>
          )}
        </span>
      </div>
    </button>
  );
}