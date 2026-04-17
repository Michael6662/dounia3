import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Particles from './components/Particles'
import AuthModal from './components/AuthModal'
import Home from './pages/Home'
import LieuDetail from './pages/LieuDetail'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import About from './pages/About'
import NotFound from './pages/NotFound'

function Onboarding({ onClose }) {
  const [step, setStep] = useState(0)
  const steps = [
    { icon: '🌍', title: 'Bienvenue sur Dounia !', desc: "La plateforme qui rend le patrimoine culturel africain accessible à tous depuis n'importe où dans le monde." },
    { icon: '🖱️', title: 'Explorez en 3D', desc: 'Faites tourner les modèles 3D avec votre souris ou votre doigt. Plongez dans des lieux extraordinaires sans quitter votre maison.' },
    { icon: '✨', title: 'Devenez Créateur', desc: 'Vous connaissez un lieu culturel exceptionnel ? Publiez-le sur Dounia et faites-le découvrir au monde entier.' },
  ]
  const current = steps[step]
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>{current.icon}</div>
        <div className="modal-title" style={{ textAlign: 'center' }}>{current.title}</div>
        <div className="modal-sub" style={{ textAlign: 'center', marginBottom: '32px' }}>{current.desc}</div>
        <div className="onboarding-steps">
          {steps.map((_, i) => <div key={i} className={`onboarding-step ${i === step ? 'active' : ''}`} />)}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {step > 0 && <button className="btn btn-outline" onClick={() => setStep(s => s - 1)}>Précédent</button>}
          {step < steps.length - 1
            ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Suivant →</button>
            : <button className="btn btn-primary" onClick={onClose}>Commencer l'exploration ✦</button>
          }
        </div>
      </div>
    </div>
  )
}

function AdminGuard({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!user || !isAdmin) return <Navigate to="/" replace />
  return children
}

function TitleManager() {
  const location = useLocation()
  useEffect(() => {
    const titles = {
      '/': 'Dounia — Le monde à portée de main',
      '/about': 'À propos — Dounia',
      '/dashboard': 'Mon espace — Dounia',
      '/admin': 'Administration — Dounia',
    }
    document.title = titles[location.pathname] || 'Dounia — Tourisme virtuel immersif'
  }, [location])
  return null
}

export default function App() {
  const { user, loading } = useAuth()
  const [authModal, setAuthModal] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (user) {
      const seen = localStorage.getItem('dounia_onboarded_' + user.id)
      if (!seen) setTimeout(() => setShowOnboarding(true), 800)
    }
  }, [user])

  function handleOnboardingClose() {
    setShowOnboarding(false)
    if (user) localStorage.setItem('dounia_onboarded_' + user.id, '1')
  }

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '800', letterSpacing: '4px', color: 'var(--gold)' }}>DOUNIA</div>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <>
      <Particles />
      <TitleManager />
      <Navbar onAuthClick={setAuthModal} />

      <Routes>
        <Route path="/" element={<Home onAuthClick={setAuthModal} />} />
        <Route path="/lieu/:id" element={<LieuDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSwitch={setAuthModal} />
      )}
      {showOnboarding && <Onboarding onClose={handleOnboardingClose} />}
    </>
  )
}
