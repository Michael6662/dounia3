import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Shuffle, LayoutDashboard, LogOut, Shield, Menu, X, Info } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export default function Navbar({ onAuthClick }) {
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleRandom() {
    setLoading(true)
    setMenuOpen(false)
    const { data } = await supabase.from('lieux').select('id').eq('statut', 'publie')
    if (data && data.length > 0) {
      const random = data[Math.floor(Math.random() * data.length)]
      navigate(`/lieu/${random.id}`)
    }
    setLoading(false)
  }

  async function handleSignOut() {
    await signOut()
    setMenuOpen(false)
    navigate('/')
  }

  function closeMenu() { setMenuOpen(false) }

  return (
    <>
      <nav className="navbar" style={{position:'fixed',top:0,left:0,right:0,zIndex:1000}}>
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="navbar-logo">D</div>
          <span className="navbar-name">DOUNIA</span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-nav desktop-nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Accueil</Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`} style={{display:'flex',alignItems:'center',gap:'4px'}}>
            <Info size={14}/> À propos
          </Link>
          <button onClick={handleRandom} className="nav-link" style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px'}} disabled={loading}>
            <Shuffle size={14}/> Aléatoire
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${location.pathname.includes('dashboard') ? 'active' : ''}`} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <LayoutDashboard size={14}/> Mon espace
              </Link>
              {isAdmin && (
                <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`} style={{display:'flex',alignItems:'center',gap:'6px',color:'var(--gold)'}}>
                  <Shield size={14}/> Admin
                </Link>
              )}
              <button onClick={handleSignOut} className="btn btn-outline btn-sm" style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <LogOut size={14}/> {profile?.nom?.split(' ')[0] || 'Déconnexion'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onAuthClick('login')} className="nav-link" style={{background:'none',border:'none',cursor:'pointer'}}>Connexion</button>
              <button onClick={() => onAuthClick('signup')} className="btn btn-primary btn-sm">Créer un compte</button>
            </>
          )}
        </div>

        {/* Hamburger button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display:'none',background:'none',border:'none',
            color:'var(--white)',cursor:'pointer',padding:'8px',
            zIndex:1001,position:'relative'
          }}
          className="hamburger-btn"
        >
          {menuOpen ? <X size={28}/> : <Menu size={28}/>}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          style={{
            position:'fixed',top:0,left:0,right:0,bottom:0,
            background:'rgba(13,27,62,0.99)',
            zIndex:999,
            display:'flex',flexDirection:'column',
            padding:'80px 24px 24px',
            gap:'4px',
            overflowY:'auto'
          }}
        >
          {/* Close button top right */}
          <button
            onClick={closeMenu}
            style={{position:'absolute',top:'16px',right:'16px',background:'none',border:'none',color:'var(--white)',cursor:'pointer',padding:'8px'}}
          >
            <X size={28}/>
          </button>

          {[
            { to:'/', label:'🏠 Accueil' },
            { to:'/about', label:'ℹ️ À propos' },
          ].map(item => (
            <Link key={item.to} to={item.to} onClick={closeMenu} style={{
              display:'block',padding:'16px 20px',borderRadius:'12px',
              color:'var(--white)',textDecoration:'none',fontSize:'18px',
              fontFamily:'var(--font-sub)',fontWeight:'500',
              background:'rgba(255,255,255,0.05)',marginBottom:'4px'
            }}>
              {item.label}
            </Link>
          ))}

          <button onClick={handleRandom} style={{
            display:'block',padding:'16px 20px',borderRadius:'12px',
            color:'var(--white)',fontSize:'18px',textAlign:'left',width:'100%',
            fontFamily:'var(--font-sub)',fontWeight:'500',
            background:'rgba(255,255,255,0.05)',marginBottom:'4px',
            border:'none',cursor:'pointer'
          }}>
            🎲 Lieu aléatoire
          </button>

          <div style={{height:'1px',background:'var(--border)',margin:'8px 0'}}/>

          {user ? (
            <>
              <Link to="/dashboard" onClick={closeMenu} style={{
                display:'block',padding:'16px 20px',borderRadius:'12px',
                color:'var(--white)',textDecoration:'none',fontSize:'18px',
                fontFamily:'var(--font-sub)',fontWeight:'500',
                background:'rgba(255,255,255,0.05)',marginBottom:'4px'
              }}>📊 Mon espace</Link>

              {isAdmin && (
                <Link to="/admin" onClick={closeMenu} style={{
                  display:'block',padding:'16px 20px',borderRadius:'12px',
                  color:'var(--gold)',textDecoration:'none',fontSize:'18px',
                  fontFamily:'var(--font-sub)',fontWeight:'500',
                  background:'rgba(200,151,42,0.1)',marginBottom:'4px'
                }}>⚙️ Admin</Link>
              )}

              <button onClick={handleSignOut} style={{
                display:'block',padding:'16px 20px',borderRadius:'12px',
                color:'#f87171',fontSize:'18px',textAlign:'left',width:'100%',
                fontFamily:'var(--font-sub)',fontWeight:'500',
                background:'rgba(220,38,38,0.1)',marginBottom:'4px',
                border:'none',cursor:'pointer'
              }}>
                🚪 Déconnexion — {profile?.nom?.split(' ')[0]}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { onAuthClick('login'); closeMenu() }} style={{
                display:'block',padding:'16px 20px',borderRadius:'12px',
                color:'var(--white)',fontSize:'18px',textAlign:'left',width:'100%',
                fontFamily:'var(--font-sub)',fontWeight:'500',
                background:'rgba(255,255,255,0.05)',marginBottom:'4px',
                border:'none',cursor:'pointer'
              }}>🔑 Connexion</button>

              <button onClick={() => { onAuthClick('signup'); closeMenu() }} className="btn btn-primary" style={{
                marginTop:'12px',justifyContent:'center',fontSize:'16px',
                padding:'16px',width:'100%'
              }}>
                ✦ Créer un compte
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
