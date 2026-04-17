import { Link } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function About() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function handleContact(e) {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const { error: err } = await supabase.from('messages_contact').insert({
        nom: form.nom,
        email: form.email,
        sujet: form.sujet,
        message: form.message
      })
      if (err) throw err
      setSent(true)
      setForm({ nom: '', email: '', sujet: '', message: '' })
    } catch (err) {
      setError('Erreur lors de l\'envoi. Contactez-nous directement à bakomichael66@gmail.com')
    }
    setSending(false)
  }

  return (
    <div className="page" style={{paddingTop:'100px',paddingBottom:'80px'}}>
      <div className="container" style={{maxWidth:'800px'}}>

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:'64px'}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'clamp(32px,5vw,56px)',fontWeight:'900',letterSpacing:'3px',marginBottom:'8px'}}>DOUNIA</div>
          <div style={{color:'var(--gold)',fontFamily:'var(--font-sub)',fontSize:'20px',fontStyle:'italic',marginBottom:'24px'}}>Le monde à portée de main</div>
          <div style={{height:'2px',background:'linear-gradient(to right, transparent, var(--gold), transparent)',maxWidth:'200px',margin:'0 auto'}}/>
        </div>

        {/* Vision */}
        <div className="card" style={{marginBottom:'24px',borderColor:'rgba(200,151,42,0.3)'}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:'700',color:'var(--gold)',marginBottom:'16px',letterSpacing:'1px'}}>🌍 NOTRE VISION</div>
          <p style={{color:'rgba(255,255,255,0.85)',lineHeight:'1.8',fontFamily:'var(--font-sub)',fontSize:'16px'}}>
            Dounia est née d'une conviction simple : chaque endroit du monde a une histoire qui mérite d'être racontée et visitée. Pas uniquement le Louvre ou le British Museum — mais aussi une mosquée en banco au Sahel, un marché traditionnel à Ouagadougou, des ruines millénaires en Éthiopie.
          </p>
          <p style={{color:'rgba(255,255,255,0.85)',lineHeight:'1.8',fontFamily:'var(--font-sub)',fontSize:'16px',marginTop:'12px'}}>
            Aujourd'hui, des milliers de sites culturels africains sont invisibles numériquement. Dounia change cela en posant une couche culturelle interactive sur le monde réel — accessible sans visa, sans billet d'avion, sans contrainte.
          </p>
        </div>

        {/* Mission */}
        <div className="card" style={{marginBottom:'24px'}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:'700',color:'var(--gold)',marginBottom:'16px',letterSpacing:'1px'}}>🎯 NOTRE MISSION</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            {[
              {icon:'🏛️', title:'Valoriser', desc:'Le patrimoine culturel africain souvent ignoré des grandes plateformes numériques.'},
              {icon:'🌐', title:'Rendre accessible', desc:'Des expériences immersives 3D et AR sans équipement coûteux.'},
              {icon:'💰', title:'Rémunérer', desc:'Les créateurs et communautés locales qui partagent leur patrimoine.'},
              {icon:'🤝', title:'Connecter', desc:'Les visiteurs du monde entier au patrimoine africain authentique.'},
            ].map(item => (
              <div key={item.title} style={{background:'rgba(26,77,143,0.2)',borderRadius:'12px',padding:'20px',border:'1px solid var(--border)'}}>
                <div style={{fontSize:'28px',marginBottom:'8px'}}>{item.icon}</div>
                <div style={{fontFamily:'var(--font-display)',fontWeight:'700',fontSize:'14px',marginBottom:'6px'}}>{item.title}</div>
                <div style={{color:'var(--gray)',fontSize:'14px',fontFamily:'var(--font-sub)',lineHeight:'1.5'}}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fondateur */}
        <div className="card" style={{marginBottom:'24px',borderColor:'rgba(200,151,42,0.3)'}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:'700',color:'var(--gold)',marginBottom:'20px',letterSpacing:'1px'}}>👤 LE FONDATEUR</div>
          <div style={{display:'flex',alignItems:'flex-start',gap:'20px',flexWrap:'wrap'}}>
            <div style={{width:'80px',height:'80px',borderRadius:'50%',background:'linear-gradient(135deg,var(--blue),var(--cyan))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontSize:'28px',fontWeight:'900',flexShrink:0}}>B</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'20px',fontWeight:'700',marginBottom:'4px'}}>Bako Babou Michael</div>
              <div style={{color:'var(--gold)',fontSize:'14px',marginBottom:'12px',fontFamily:'var(--font-sub)'}}>Entrepreneur Tech • Ouagadougou, Burkina Faso</div>
              <p style={{color:'rgba(255,255,255,0.8)',lineHeight:'1.7',fontFamily:'var(--font-sub)',fontSize:'15px'}}>
                Entrepreneur indépendant basé à Ouagadougou, Michael développe des solutions tech adaptées aux réalités africaines. Dounia est né de sa conviction que la technologie doit s'adapter à l'Afrique, et non l'inverse.
              </p>
              <div style={{display:'flex',gap:'12px',marginTop:'16px',flexWrap:'wrap'}}>
                <span style={{color:'var(--gray)',fontSize:'13px',fontFamily:'var(--font-sub)'}}>📧 bakomichael66@gmail.com</span>
                <span style={{color:'var(--gray)',fontSize:'13px',fontFamily:'var(--font-sub)'}}>📍 Ouagadougou, Burkina Faso</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stack */}
        <div className="card" style={{marginBottom:'24px'}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:'700',color:'var(--gold)',marginBottom:'16px',letterSpacing:'1px'}}>⚡ TECHNOLOGIE</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'10px'}}>
            {['React','Supabase','Sketchfab 3D','WebAR','Vite','PostgreSQL','Row Level Security'].map(tech => (
              <span key={tech} style={{background:'rgba(0,229,255,0.1)',border:'1px solid rgba(0,229,255,0.2)',color:'var(--cyan)',padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontFamily:'var(--font-display)',letterSpacing:'1px'}}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="card" style={{marginBottom:'40px',borderColor:'rgba(200,151,42,0.3)'}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:'700',color:'var(--gold)',marginBottom:'8px',letterSpacing:'1px',textAlign:'center'}}>📬 NOUS CONTACTER</div>
          <div style={{color:'var(--gray)',marginBottom:'24px',fontFamily:'var(--font-sub)',textAlign:'center'}}>Partenariats, questions, suggestions — nous sommes à l'écoute.</div>

          {sent ? (
            <div style={{textAlign:'center',padding:'24px'}}>
              <div style={{fontSize:'48px',marginBottom:'12px'}}>✅</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:'700',color:'#4ade80',marginBottom:'8px'}}>Message envoyé !</div>
              <div style={{color:'var(--gray)',fontFamily:'var(--font-sub)'}}>Nous vous répondrons dans les plus brefs délais.</div>
              <button onClick={() => setSent(false)} className="btn btn-outline" style={{marginTop:'16px',fontSize:'13px'}}>Envoyer un autre message</button>
            </div>
          ) : (
            <>
              {!showForm ? (
                <div style={{textAlign:'center'}}>
                  <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{fontSize:'13px',padding:'14px 28px'}}>
                    ✉️ Envoyer un message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContact}>
                  {error && <div className="error-msg">{error}</div>}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                    <div className="form-group">
                      <label className="form-label">Votre nom *</label>
                      <input className="form-input" value={form.nom} onChange={e => setForm(f=>({...f,nom:e.target.value}))} placeholder="Votre nom complet" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Votre email *</label>
                      <input className="form-input" type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="votre@email.com" required />
                    </div>
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <label className="form-label">Sujet *</label>
                      <select className="form-select" value={form.sujet} onChange={e => setForm(f=>({...f,sujet:e.target.value}))} required>
                        <option value="">— Sélectionnez un sujet —</option>
                        <option>Partenariat</option>
                        <option>Proposition de lieu</option>
                        <option>Question technique</option>
                        <option>Presse & Médias</option>
                        <option>Investissement</option>
                        <option>Autre</option>
                      </select>
                    </div>
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <label className="form-label">Message *</label>
                      <textarea className="form-input" value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))} placeholder="Décrivez votre demande..." rows={5} style={{resize:'vertical'}} required />
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
                    <button type="submit" className="btn btn-primary" disabled={sending} style={{fontSize:'13px',padding:'14px 28px'}}>
                      {sending ? '⏳ Envoi...' : '✉️ Envoyer'}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} style={{fontSize:'13px'}}>Annuler</button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        <div style={{textAlign:'center'}}>
          <Link to="/" className="btn btn-outline" style={{fontSize:'13px',padding:'14px 28px'}}>← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  )
}
