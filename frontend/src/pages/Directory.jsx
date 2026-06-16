import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Compass, Users, ChevronRight } from 'lucide-react';

export default function Directory() {
  const [creators, setCreators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await fetch(`${API_BASE}/creators`);
        if (!res.ok) throw new Error('Failed to fetch creators list');
        const data = await res.json();
        setCreators(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, [API_BASE]);

  const filteredCreators = creators.filter(c => 
    (c.display_name && c.display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.bio && c.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.username && c.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container">
      {/* Hero Header */}
      <div style={{ textAlign: 'center', margin: '48px 0 64px 0' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', background: 'linear-gradient(to right, #fff, hsl(var(--text-secondary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>
          Club Directory & Services
        </h1>
        <p style={{ fontSize: '18px', color: 'hsl(var(--text-secondary))', maxWidth: '600px', margin: '0 auto' }}>
          Subscribe to official Uganda Golf Club accounts, professional coaching channels, and the UGC Pro Shop to receive exclusive member benefits, tee-time alerts, and club announcements.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto 48px auto' }}>
        <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search coaches, services, or tournament keys..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '54px', height: '56px', fontSize: '16px', borderRadius: 'var(--radius-lg)' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Compass className="animate-spin" size={40} style={{ color: 'hsl(var(--primary))', marginBottom: '16px' }} />
          <p style={{ color: 'hsl(var(--text-secondary))' }}>Loading UGC directory registry...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', borderColor: 'hsl(var(--danger) / 0.3)' }}>
          <p style={{ color: 'hsl(var(--danger))' }}>{error}</p>
        </div>
      ) : (
        <div>
          {filteredCreators.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'hsl(var(--text-muted))' }}>
              <Users size={48} style={{ marginBottom: '16px', strokeWidth: 1.5 }} />
              <p style={{ fontSize: '16px' }}>No creators match your search query.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
              {filteredCreators.map(creator => (
                <Link 
                  key={creator.user_id} 
                  to={`/creator/${creator.user_id}`} 
                  className="glass-panel glass-panel-hover" 
                  style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}
                >
                  {/* Banner image */}
                  <div style={{ 
                    height: '120px', 
                    backgroundImage: `url(${creator.banner_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80'})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    position: 'relative'
                  }} />

                  {/* Avatar */}
                  <div style={{ padding: '24px', paddingTop: '0', flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <img 
                      src={creator.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'} 
                      alt={creator.display_name} 
                      style={{ 
                        width: '74px', 
                        height: '74px', 
                        borderRadius: '50%', 
                        border: '4px solid hsl(var(--bg-dark))', 
                        marginTop: '-37px', 
                        objectFit: 'cover',
                        backgroundColor: 'hsl(var(--bg-card))',
                        marginBottom: '16px'
                      }}
                    />
                    
                    <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '4px' }}>{creator.display_name}</h3>
                    <span style={{ fontSize: '13px', color: 'hsl(var(--primary))', fontWeight: '600', marginBottom: '12px', display: 'block' }}>@{creator.username}</span>
                    
                    <p style={{ 
                      color: 'hsl(var(--text-secondary))', 
                      fontSize: '14px', 
                      lineHeight: '1.5',
                      marginBottom: '24px',
                      flexGrow: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {creator.bio}
                    </p>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      paddingTop: '16px', 
                      borderTop: '1px solid hsl(var(--border-glass))',
                      fontSize: '14px',
                      color: 'hsl(var(--text-primary))',
                      fontWeight: '600'
                    }}>
                      <span>View Tiers & Posts</span>
                      <ChevronRight size={18} style={{ color: 'hsl(var(--primary))' }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
