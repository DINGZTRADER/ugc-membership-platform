import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, PlusCircle, UserCheck, Eye, ShieldCheck, Settings, AlertCircle } from 'lucide-react';

export default function CreatorDashboard({ auth }) {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [profile, setProfile] = useState({ display_name: '', bio: '', avatar_url: '', banner_url: '', tiers: [] });
  
  // Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postRequiredTier, setPostRequiredTier] = useState('0');
  const [postImageUrl, setPostImageUrl] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!auth || !auth.isCreator) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch Creator Profile
        const profileRes = await fetch(`${API_BASE}/creators/${auth.id}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        // Fetch Creator Analytics
        const analyticsRes = await fetch(`${API_BASE}/analytics/creator`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!analyticsRes.ok) throw new Error('Failed to retrieve analytics data');
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [auth, token, API_BASE, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch(`${API_BASE}/creators/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setMessage('🎉 Profile and pricing tiers updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: postTitle,
          body: postBody,
          required_tier_level: parseInt(postRequiredTier),
          image_url: postImageUrl || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish post');
      
      setMessage('🚀 Post published successfully to your subscriber feed!');
      setPostTitle('');
      setPostBody('');
      setPostRequiredTier('0');
      setPostImageUrl('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTierChange = (index, field, value) => {
    const updatedTiers = [...profile.tiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setProfile({ ...profile, tiers: updatedTiers });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Opening Creator Space...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: '#fff' }}>Creator Workspace</h1>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>Manage your premium empire, posts, and subscriptions.</p>
        </div>
        <button onClick={() => navigate(`/creator/${auth.id}`)} className="btn btn-outline">
          <Eye size={16} /> View Public Profile
        </button>
      </div>

      {message && (
        <div className="glass-panel" style={{ padding: '16px', background: 'hsl(var(--success) / 0.1)', borderColor: 'hsl(var(--success) / 0.3)', color: 'hsl(var(--success))', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <ShieldCheck size={20} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ padding: '16px', background: 'hsl(var(--danger) / 0.1)', borderColor: 'hsl(var(--danger) / 0.3)', color: 'hsl(var(--danger))', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsl(var(--primary-glow))', display: 'flex', alignItems: 'center', justify: 'center', color: 'hsl(var(--primary))' }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', display: 'block' }}>Active Subscribers</span>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>{analytics?.subscribersCount || 0}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsl(var(--accent-glow))', display: 'flex', alignItems: 'center', justify: 'center', color: 'hsl(var(--accent))' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', display: 'block' }}>Total Earnings</span>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>${analytics?.totalEarnings || '0.00'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
        
        {/* Left Column: Create Post & Transactions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Create Post Form */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PlusCircle size={20} style={{ color: 'hsl(var(--primary))' }} />
              Publish Exclusive Post
            </h2>
            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>Post Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="E.g., Secret Project Concept Art"
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>Post Content</label>
                <textarea 
                  className="form-input" 
                  rows={5}
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder="Share a secret link, code snippet, or write an article..."
                  style={{ resize: 'vertical' }}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>Image URL (Optional)</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    value={postImageUrl}
                    onChange={(e) => setPostImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..." 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>Required Membership Level</label>
                  <select 
                    className="form-input"
                    value={postRequiredTier}
                    onChange={(e) => setPostRequiredTier(e.target.value)}
                    style={{ background: 'hsl(var(--bg-card))' }}
                  >
                    <option value="0">Public (Everyone)</option>
                    <option value="1">Tier 1+ (Bronze)</option>
                    <option value="2">Tier 2+ (Silver)</option>
                    <option value="3">Tier 3 (Gold / VIP Only)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                Publish Post
              </button>
            </form>
          </div>

          {/* Transactions List */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCheck size={20} style={{ color: 'hsl(var(--accent))' }} />
              Recent Support Activities
            </h2>
            {analytics?.transactions?.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '24px' }}>No payments logged yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {analytics?.transactions?.map((t) => (
                  <div key={t.id} style={{ display: 'flex', justify: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid hsl(var(--border-glass))' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: '600' }}>Subscriber @{t.subscriber_name || 'Anonymous User'}</div>
                      <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{new Date(t.created_at).toLocaleString()}</div>
                    </div>
                    <span className="badge badge-success">+${parseFloat(t.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profile & Tiers Configuration */}
        <div>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings size={20} style={{ color: 'hsl(var(--primary))' }} />
              Customize Creator Settings
            </h2>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>Display Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.display_name || ''}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>Creator Bio</label>
                <textarea 
                  className="form-input" 
                  rows={3}
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>Avatar URL</label>
                <input 
                  type="url" 
                  className="form-input" 
                  value={profile.avatar_url || ''}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>Banner URL</label>
                <input 
                  type="url" 
                  className="form-input" 
                  value={profile.banner_url || ''}
                  onChange={(e) => setProfile({ ...profile, banner_url: e.target.value })}
                />
              </div>

              <h3 style={{ fontSize: '16px', color: '#fff', marginTop: '16px', marginBottom: '8px', borderTop: '1px solid hsl(var(--border-glass))', paddingTop: '16px' }}>Configure Subscription Pricing Tiers</h3>

              {profile.tiers && profile.tiers.map((tier, index) => (
                <div key={tier.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '12px', background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Tier Name (Level {tier.level})</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ padding: '8px', fontSize: '13px' }}
                      value={tier.name}
                      onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-input" 
                      style={{ padding: '8px', fontSize: '13px' }}
                      value={tier.price}
                      onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <button type="submit" className="btn btn-secondary" style={{ marginTop: '8px' }}>
                Save Settings
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
