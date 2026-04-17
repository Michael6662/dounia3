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
      <nav className="navbar">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="navbar-logo">D</div>
          <span className="navbar-name">DOUNIA</span>
        </Link>

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

        <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-nav-link" onClick={closeMenu}>🏠 Accueil</Link>
          <Link to="/about" className="mobile-nav-link" onClick={closeMenu}>ℹ️ À propos</Link>
          <button onClick={handleRandom} className="mobile-nav-link btn-reset">🎲 Lieu aléatoire</button>
          <div style={{height:'1px',background:'var(--border)',margin:'8px 0'}}/>
          {user ? (
            <>
              <Link to="/dashboard" className="mobile-nav-link" onClick={closeMenu}>📊 Mon espace</Link>
              {isAdmin && <Link to="/admin" className="mobile-nav-link" onClick={closeMenu} style={{color:'var(--gold)'}}>⚙️ Admin</Link>}
              <button onClick={handleSignOut} className="mobile-nav-link btn-reset" style={{color:'#f87171'}}>
                🚪 Déconnexion — {profile?.nom?.split(' ')[0]}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { onAuthClick('login'); closeMenu() }} className="mobile-nav-link btn-reset">🔑 Connexion</button>
              <button onClick={() => { onAuthClick('signup'); closeMenu() }} className="btn btn-primary" style={{marginTop:'8px',justifyContent:'center'}}>
                ✦ Créer un compte
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
