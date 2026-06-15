import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Shield } from 'lucide-react';

export default function Register({ setAuth }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, isCreator })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuth(data.user);

      if (data.user.isCreator) {
        navigate('/creator-dashboard');
      } else {
        navigate('/subscriber-dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '60px auto', padding: '0 16px' }}>
      <div className="glass-panel" style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', color: '#fff', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>Join Horizon UGC today</p>
        </div>

        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'hsl(var(--danger) / 0.1)', 
            border: '1px solid hsl(var(--danger) / 0.3)', 
            padding: '12px', 
            borderRadius: 'var(--radius-md)', 
            color: 'hsl(var(--danger))',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'hsl(var(--text-secondary))' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="choose_username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '48px' }}
                required 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'hsl(var(--text-secondary))' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '48px' }}
                required 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'hsl(var(--text-secondary))' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '48px' }}
                required 
              />
            </div>
          </div>

          {/* Creator Account Checkbox styling */}
          <div 
            onClick={() => setIsCreator(!isCreator)}
            className="glass-panel" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              padding: '16px', 
              cursor: 'pointer',
              borderColor: isCreator ? 'hsl(var(--primary))' : 'hsl(var(--border-glass))',
              background: isCreator ? 'hsl(var(--primary-glow))' : 'hsl(var(--bg-glass))'
            }}
          >
            <div style={{ 
              width: '22px', 
              height: '22px', 
              borderRadius: '6px', 
              border: '2px solid', 
              borderColor: isCreator ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isCreator ? 'hsl(var(--primary))' : 'transparent',
              transition: 'all 0.2s'
            }}>
              {isCreator && <Shield size={14} color="#fff" />}
            </div>
            <div>
              <div style={{ fontWeight: '600', color: '#fff', fontSize: '15px' }}>Register as a Content Creator</div>
              <div style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>Publish exclusive posts and set membership pricing tiers.</div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'hsl(var(--primary))', fontWeight: '600' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
