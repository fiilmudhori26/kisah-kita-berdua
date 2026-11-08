import { useEffect, useState } from 'react';
import { CalendarDays, Trash2 } from 'lucide-react';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';
import { getCouple } from '../lib/data';
import { useAuth } from '../context/AuthContext';

export default function DatesPage() {
  const { user } = useAuth();
  const [couple, setCouple] = useState(null);
  const [dates, setDates] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [repeat, setRepeat] = useState(true);

  async function load() {
    const c = await getCouple();
    setCouple(c);
    if (c) {
      const { data } = await supabase
        .from('special_dates')
        .select('*')
        .eq('couple_id', c.id)
        .order('event_date');
      setDates(data || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    const { error } = await supabase.from('special_dates').insert({
      couple_id: couple.id,
      title,
      event_date: date,
      repeats_yearly: repeat,
      created_by: user.id,
    });
    if (error) return alert(error.message);
    setTitle('');
    setDate('');
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this date?')) return;
    await supabase.from('special_dates').delete().eq('id', id);
    load();
  }

  function days(d) {
    const now = new Date();
    let target = parseISO(d + 'T00:00:00');
    if (dates.find((x) => x.event_date === d)?.repeats_yearly) {
      target.setFullYear(now.getFullYear());
      if (target < new Date(now.toDateString())) {
        target.setFullYear(now.getFullYear() + 1);
      }
    }
    return differenceInCalendarDays(target, new Date(now.toDateString()));
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Mark the moments</p>
          <h1>Our special dates</h1>
          <p className="muted">The days that mean a little more.</p>
        </div>
      </section>

      {couple && (
        <form className="inline-form" onSubmit={add}>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Anniversary, first trip…"
          />
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <label className="check-label">
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
            />
            Every year
          </label>
          <button className="primary-button">
            <CalendarDays size={16} /> Add date
          </button>
        </form>
      )}

      <div className="date-list">
        {dates.map((d) => (
          <article className="date-card" key={d.id}>
            <div className="date-icon">
              <CalendarDays />
            </div>
            <div className="date-info">
              <strong>{d.title}</strong>
              <span>
                {format(parseISO(d.event_date), 'd MMMM yyyy')}
                {d.repeats_yearly ? ' · yearly' : ''}
              </span>
            </div>
            <div className="countdown">
              <strong>
                {days(d.event_date) === 0 ? 'Today!' : `${days(d.event_date)} days`}
              </strong>
              <span>
                {days(d.event_date) === 0 ? 'A special day' : 'to go'}
              </span>
            </div>
            <button className="icon-button" onClick={() => remove(d.id)}>
              <Trash2 size={16} />
            </button>
          </article>
        ))}
      </div>

      {couple && !dates.length && (
        <div className="empty-state">
          <div>✧</div>
          <h2>Save a date worth remembering.</h2>
          <p>Your first special day is waiting to be marked.</p>
        </div>
      )}
    </>
  );
}