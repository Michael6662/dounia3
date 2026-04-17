import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function AuthModal({ mode, onClose, onSwitch }) {
  const { signIn, signUp } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', nom: '', role: 'visiteur' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(form.email, form.password)
        onClose()
      } else {
        await signUp(form.email, form.password, form.nom, form.role)
        setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    }
    setLoading(false)
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: window.location.origin + '/reset-password'
    })
    if (error) {
      setError(error.message)
    } else {
      setForgotSent(true)
    }
    setLoading(false)
  }

  // Forgot password view
  if (showForgot) {
    return (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
            <div>
              <div className="modal-title">Mot de passe oublié</div>
              <div className="modal-sub">Entrez votre email pour recevoir un lien de réinitialisation</div>
            </div>
            <button onClick={onClose} style={{background:'none',border:'none',color:'var(--gray)',cursor:'pointer'}}><X size={20}/></button>
          </div>

          {forgotSent ? (
            <div style={{textAlign:'center',padding:'24px 0'}}>
              <div style={{fontSize:'48px',marginBottom:'12px'}}>📧</div>
              <div style={{fontFamily:'var(--font-display)',fontWeight:'700',color:'#4ade80',marginBottom:'8px'}}>Email envoyé !</div>
              <div style={{color:'var(--gray)',fontSize:'14px',marginBottom:'20px'}}>Vérifiez votre boîte email et cliquez sur le lien de réinitialisation.</div>
              <button onClick={() => { setShowForgot(false); setForgotSent(false) }} className="btn btn-outline" style={{fontSize:'13px'}}>← Retour à la connexion</button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword}>
              {error && <div className="error-msg">{error}</div>}
              <div className="form-group">
                <label className="form-label">Votre email</label>
                <input className="form-input" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="votre@email.com" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px'}} disabled={loading}>
                {loading ? 'Envoi...' : '📧 Envoyer le lien'}
              </button>
              <div className="form-switch">
                <a onClick={() => setShowForgot(false)}>← Retour à la connexion</a>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
          <div>
            <div className="modal-title">{mode === 'login' ? 'Connexion' : 'Créer un compte'}</div>
            <div className="modal-sub">{mode === 'login' ? 'Bienvenue sur Dounia 🌍' : 'Rejoignez la communauté Dounia'}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--gray)',cursor:'pointer',padding:'4px'}}><X size={20}/></button>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Nom complet</label>
                <input className="form-input" name="nom" value={form.nom} onChange={handleChange} placeholder="Votre nom" required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required minLength={6} />
            </div>

            {mode === 'login' && (
              <div style={{textAlign:'right',marginBottom:'16px',marginTop:'-8px'}}>
                <a onClick={() => setShowForgot(true)} style={{color:'var(--cyan)',fontSize:'13px',cursor:'pointer',fontFamily:'var(--font-sub)'}}>
                  Mot de passe oublié ?
                </a>
              </div>
            )}

            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Vous êtes</label>
                <div className="role-selector">
                  {[
                    { value: 'visiteur', title: '🌍 Visiteur', sub: 'Explorer les lieux' },
                    { value: 'createur', title: '✨ Créateur', sub: 'Publier des lieux' }
                  ].map(r => (
                    <div key={r.value} className={`role-option ${form.role === r.value ? 'selected' : ''}`} onClick={() => setForm(f => ({...f, role: r.value}))}>
                      <div className="role-option-title">{r.title}</div>
                      <div className="role-option-sub">{r.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px'}} disabled={loading}>
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>
        )}

        <div className="form-switch">
          {mode === 'login' ? (
            <>Pas encore de compte ? <a onClick={() => onSwitch('signup')}>Créer un compte</a></>
          ) : (
            <>Déjà un compte ? <a onClick={() => onSwitch('login')}>Se connecter</a></>
          )}
        </div>
      </div>
    </div>
  )
}
