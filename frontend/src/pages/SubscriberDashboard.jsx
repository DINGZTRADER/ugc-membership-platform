import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Sparkles, Compass, Heart, ArrowUpRight } from 'lucide-react';

export default function SubscriberDashboard({ auth }) {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!auth) {
      navigate('/login');
      return;
    }

    const fetchSubscriptions = async () => {
      try {
        const res = await fetch(`${API_BASE}/subscriptions/active`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to retrieve subscription list');
        const data = await res.json();
        setSubscriptions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [auth, token, API_BASE, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Opening Subscriber Vault...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', color: '#fff' }}>My Memberships</h1>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Access exclusive assets and premium content from creators you support.</p>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '16px', background: 'hsl(var(--danger) / 0.1)', borderColor: 'hsl(var(--danger) / 0.3)', color: 'hsl(var(--danger))', marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <Heart size={48} style={{ color: 'hsl(var(--primary))', marginBottom: '16px', strokeWidth: 1.5 }} />
          <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '12px' }}>You aren't subscribed to anyone yet</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px auto' }}>
            Browse through our elite creator registry to find exclusive loops, neon layouts, and creative wallpapers.
          </p>
          <Link to="/" className="btn btn-primary">
            <Compass size={16} /> Explore Creators
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {subscriptions.map((sub) => (
            <div 
              key={sub.id} 
              className="glass-panel" 
              style={{ 
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                smDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <img 
                  src={sub.creator_avatar_url || sub.creator?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80'} 
                  alt="Creator Avatar" 
                  style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '1px solid hsl(var(--border-glass))' }}
                />
                <div>
                  <h3 style={{ color: '#fff', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {sub.creator_display_name || sub.creator?.display_name || 'Creator'}
                    <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                      {sub.tier_name || sub.tier?.name}
                    </span>
                  </h3>
                  <div style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>
                    Level {sub.tier_level || sub.tier?.level} membership • Active
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>
                    ${parseFloat(sub.tier_price || sub.tier?.price || 0).toFixed(2)}
                  </span>
                  <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'block' }}>/month</span>
                </div>
                <Link to={`/creator/${sub.creator_id}`} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Open Feed <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
