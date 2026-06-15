import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, Unlock, Eye, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function CreatorProfile({ auth }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [creator, setCreator] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscribingId, setSubscribingId] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      // Fetch creator details + tiers
      const creatorRes = await fetch(`${API_BASE}/creators/${id}`);
      if (!creatorRes.ok) throw new Error('Creator profile not found');
      const creatorData = await creatorRes.json();
      setCreator(creatorData);

      // Fetch creator posts (authenticated if token is present)
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const postsRes = await fetch(`${API_BASE}/posts/creator/${id}`, { headers });
      if (!postsRes.ok) throw new Error('Failed to fetch posts');
      const postsData = await postsRes.json();
      setPosts(postsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, token, API_BASE]);

  const handleSubscribe = async (tierId) => {
    if (!auth) {
      navigate('/login');
      return;
    }

    setSubscribingId(tierId);
    try {
      const res = await fetch(`${API_BASE}/subscriptions/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ creator_id: id, tier_id: tierId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Subscription transaction failed');

      alert(`🎉 Successfully subscribed to the ${creator.tiers.find(t => t.id === tierId).name}!`);
      // Reload posts and profile to reflect unlocked states
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubscribingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Gathering exclusive creator content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderColor: 'hsl(var(--danger) / 0.3)' }}>
          <ShieldAlert size={48} style={{ color: 'hsl(var(--danger))', marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '12px' }}>Profile Unavailable</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '24px' }}>{error}</p>
          <Link to="/" className="btn btn-primary">Back to Creator Directory</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div style={{ 
        height: '280px', 
        backgroundImage: `url(${creator.banner_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80'})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center'
      }} />

      <div className="container" style={{ marginTop: '-80px', position: 'relative', zIndex: 2 }}>
        {/* Profile Card Header */}
        <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', mdDirection: 'row', alignItems: 'flex-start', gap: '24px' }}>
            <img 
              src={creator.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'} 
              alt={creator.display_name} 
              style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '24px', 
                border: '4px solid hsl(var(--bg-glass))', 
                objectFit: 'cover',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
              }}
            />
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '32px', color: '#fff' }}>{creator.display_name}</h1>
                <span className="badge badge-primary">Creator</span>
              </div>
              <p style={{ color: 'hsl(var(--primary))', fontWeight: '600', marginBottom: '16px' }}>@{creator.username}</p>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '16px', maxWidth: '800px' }}>{creator.bio}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '350px 1fr', gap: '40px', alignItems: 'start' }}>
          {/* Left Column: Subscription Tiers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '22px', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} style={{ color: 'hsl(var(--primary))' }} />
              Choose Membership Tier
            </h2>

            {creator.tiers && creator.tiers.map((tier) => (
              <div 
                key={tier.id} 
                className="glass-panel" 
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  borderWidth: '2px',
                  borderColor: 'hsl(var(--border-glass))',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Visual effect for higher tiers */}
                {tier.level === 3 && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '0', 
                    right: '0', 
                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderBottomLeftRadius: '12px',
                    color: '#fff'
                  }}>
                    VIP EXCLUSIVE
                  </div>
                )}
                
                <div>
                  <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '4px' }}>{tier.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '8px 0' }}>
                    <span style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>${parseFloat(tier.price).toFixed(2)}</span>
                    <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px' }}>/month</span>
                  </div>
                  <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', minHeight: '44px' }}>{tier.description}</p>
                </div>

                <button 
                  onClick={() => handleSubscribe(tier.id)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px' }}
                  disabled={subscribingId === tier.id || auth?.id === creator.user_id}
                >
                  {auth?.id === creator.user_id 
                    ? 'Owner Profile' 
                    : subscribingId === tier.id 
                      ? 'Processing...' 
                      : `Join Tier`}
                </button>
              </div>
            ))}
          </div>

          {/* Right Column: Content Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <h2 style={{ fontSize: '22px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={20} style={{ color: 'hsl(var(--primary))' }} />
              Content Feed
            </h2>

            {posts.length === 0 ? (
              <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                <p>No posts published yet by this creator.</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                  {post.image_url && (
                    <div style={{ 
                      height: '240px', 
                      backgroundImage: `url(${post.image_url})`, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center',
                      filter: post.is_locked ? 'blur(10px) brightness(0.6)' : 'none',
                      transition: 'all 0.3s'
                    }} />
                  )}

                  <div style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <span className={`badge ${post.required_tier_level === 0 ? 'badge-success' : 'badge-primary'}`}>
                        {post.required_tier_level === 0 ? 'Public' : `Tier ${post.required_tier_level}+`}
                      </span>
                      <span style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                        {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '22px', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {post.is_locked ? <Lock size={18} style={{ color: 'hsl(var(--accent))' }} /> : <Unlock size={18} style={{ color: 'hsl(var(--success))' }} />}
                      {post.title}
                    </h3>

                    <p style={{ 
                      color: post.is_locked ? 'hsl(var(--text-muted))' : 'hsl(var(--text-secondary))', 
                      fontSize: '15px', 
                      lineHeight: '1.6',
                      background: post.is_locked ? 'rgba(0,0,0,0.15)' : 'transparent',
                      padding: post.is_locked ? '16px' : '0',
                      borderRadius: post.is_locked ? 'var(--radius-md)' : '0',
                      border: post.is_locked ? '1px dashed hsl(var(--border-glass))' : 'none'
                    }}>
                      {post.body}
                    </p>

                    {post.is_locked && (
                      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Unlock this post by subscribing to a qualifying tier.</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
