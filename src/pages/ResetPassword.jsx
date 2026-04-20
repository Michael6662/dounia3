import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase met le token dans l'URL hash automatiquement
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    // Vérifier si on a déjà une session recovery active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="page" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{background:'rgba(26,77,143,0.15)',border:'1px solid rgba(200,151,42,0.3)',borderRadius:'20px',padding:'40px',width:'100%',maxWidth:'440px'}}>

        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'24px',fontWeight:'900',letterSpacing:'3px',color:'var(--gold)',marginBottom:'8px'}}>DOUNIA</div>
          <div style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:'700',marginBottom:'4px'}}>Nouveau mot de passe</div>
          <div style={{color:'var(--gray)',fontSize:'14px',fontFamily:'var(--font-sub)'}}>Choisissez un nouveau mot de passe sécurisé</div>
        </div>

        {success ? (
          <div style={{textAlign:'center',padding:'24px 0'}}>
            <div style={{fontSize:'48px',marginBottom:'12px'}}>✅</div>
            <div style={{fontFamily:'var(--font-display)',fontWeight:'700',color:'#4ade80',marginBottom:'8px'}}>Mot de passe modifié !</div>
            <div style={{color:'var(--gray)',fontSize:'14px'}}>Redirection en cours...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.2)',borderRadius:'8px',padding:'10px',color:'#f87171',fontSize:'13px',marginBottom:'16px'}}>
                {error}
              </div>
            )}
            <div style={{marginBottom:'16px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:'700',color:'var(--gray)',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.5px'}}>
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{width:'100%',padding:'12px 16px',background:'rgba(13,27,62,0.6)',border:'1px solid rgba(200,151,42,0.2)',borderRadius:'10px',color:'var(--white)',fontSize:'15px',fontFamily:'var(--font-body)',outline:'none',boxSizing:'border-box'}}
              />
            </div>
            <div style={{marginBottom:'24px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:'700',color:'var(--gray)',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.5px'}}>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{width:'100%',padding:'12px 16px',background:'rgba(13,27,62,0.6)',border:'1px solid rgba(200,151,42,0.2)',borderRadius:'10px',color:'var(--white)',fontSize:'15px',fontFamily:'var(--font-body)',outline:'none',boxSizing:'border-box'}}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,var(--gold),#E8A020)',color:'var(--blue-deep)',border:'none',borderRadius:'10px',fontFamily:'var(--font-display)',fontSize:'12px',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase',cursor:'pointer'}}
            >
              {loading ? 'Modification...' : '✦ Changer le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
