import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LinkCouplePage() {
  const [mode, setMode] = useState('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [display, setDisplay] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const { data, error } =
        mode === 'create'
          ? await supabase.rpc('create_couple', {
              couple_name: name || 'Our memories',
              member_name: display,
            })
          : await supabase.rpc('join_couple', { code, member_name: display });
      if (error) throw error;
      if (mode === 'create') {
        setMessage(
          `Couple created! Share this invite code with your partner: ${data?.[0]?.invite_code || 'Check your couple settings'}`
        );
      } else {
        nav('/');
      }
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand-mark large">
          <span style={{ fontSize: '28px' }}>✧</span>
        </div>
        <p className="eyebrow">One space, two people</p>
        <h1>Make it ours.</h1>
        <p className="muted">Create a private space or join your partner's.</p>
        <div className="segmented">
          <button
            type="button"
            className={mode === 'create' ? 'selected' : ''}
            onClick={() => setMode('create')}
          >
            Create space
          </button>
          <button
            type="button"
            className={mode === 'join' ? 'selected' : ''}
            onClick={() => setMode('join')}
          >
            Join with code
          </button>
        </div>
        <label>
          Your name
          <input
            value={display}
            onChange={(e) => setDisplay(e.target.value)}
            placeholder="What should we call you?"
          />
        </label>
        {mode === 'create' ? (
          <label>
            Space name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Our little archive"
            />
          </label>
        ) : (
          <label>
            Invite code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              placeholder="Paste your partner's code"
            />
          </label>
        )}
        {message && <p className="notice">{message}</p>}
        <button className="primary-button wide" disabled={busy}>
          {busy ? 'Working…' : mode === 'create' ? 'Create private space' : 'Join space'}
        </button>
        {mode === 'create' && message && (
          <button type="button" className="text-button" onClick={() => nav('/')}>
            Continue to gallery
          </button>
        )}
      </form>
    </main>
  );
}