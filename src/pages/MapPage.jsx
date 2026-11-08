import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCouple, signedMedia, PHOTO_BUCKET } from '../lib/data';
import { supabase } from '../lib/supabase';

const markerIcon = new L.Icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapPage() {
  const [photos, setPhotos] = useState([]);
  const [urls, setUrls] = useState({});
  const [center, setCenter] = useState([-2.5, 118]);

  useEffect(() => {
    (async () => {
      const c = await getCouple();
      if (!c) return;
      const { data } = await supabase
        .from('photos')
        .select('*')
        .eq('couple_id', c.id)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      const p = data || [];
      setPhotos(p);
      if (p.length) setCenter([p[0].latitude, p[0].longitude]);
      const entries = await Promise.all(
        p.map(async (x) => [x.id, await signedMedia(PHOTO_BUCKET, x.storage_path)])
      );
      setUrls(Object.fromEntries(entries));
    })();
  }, []);

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Memories, on the map</p>
          <h1>Places we've been</h1>
          <p className="muted">A map of the moments tied to a place.</p>
        </div>
      </section>

      {photos.length ? (
        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom
          className="memory-map"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {photos.map((p) => (
            <Marker
              key={p.id}
              position={[p.latitude, p.longitude]}
              icon={markerIcon}
            >
              <Popup>
                <div className="map-popup">
                  {urls[p.id] && <img src={urls[p.id]} alt={p.caption} />}
                  <strong>{p.caption || 'A little memory'}</strong>
                  <span>{p.location_name || 'Somewhere special'}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="empty-state">
          <div>⌖</div>
          <h2>No places pinned yet.</h2>
          <p>
            Add latitude and longitude when saving a photo to see it here.
          </p>
        </div>
      )}
    </>
  );
}