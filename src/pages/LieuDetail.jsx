import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Eye, Heart, Share2, ArrowLeft, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function LieuDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lieu, setLieu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [avgRating, setAvgRating] = useState(0)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [isFavoris, setIsFavoris] = useState(false)
  const [toast, setToast] = useState(null)
  const [showHints, setShowHints] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowHints(false), 5000)
    return () => clearTimeout(timer)
  }, [id])

  useEffect(() => { fetchLieu() }, [id])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function fetchLieu() {
    const { data } = await supabase.from('lieux').select('*').eq('id', id).single()
    if (!data) { navigate('/'); return }
    setLieu(data)
    setLoading(false)
    document.title = `${data.nom} — Dounia`

    // Increment visit count
    await supabase.from('lieux').update({ nb_visites: (data.nb_visites || 0) + 1 }).eq('id', id)

    // Log visit
    if (user) await supabase.from('visites').insert({ user_id: user.id, lieu_id: id })

    // Fetch ratings
    const { data: ratings } = await supabase.from('ratings').select('note').eq('lieu_id', id)
    if (ratings?.length) {
      setAvgRating((ratings.reduce((s, r) => s + r.note, 0) / ratings.length).toFixed(1))
    }

    // User's rating
    if (user) {
      const { data: myRating } = await supabase.from('ratings').select('note').eq('lieu_id', id).eq('user_id', user.id).single()
      if (myRating) setUserRating(myRating.note)
    }

    // Comments
    const { data: comms } = await supabase.from('commentaires').select('*, profiles(nom)').eq('lieu_id', id).order('created_at', { ascending: false }).limit(10)
    setComments(comms || [])

    // Favoris
    if (user) {
      const { data: fav } = await supabase.from('favoris').select('id').eq('lieu_id', id).eq('user_id', user.id).single()
      setIsFavoris(!!fav)
    }
  }

  async function handleRating(note) {
    if (!user) { showToast('Connectez-vous pour noter', 'error'); return }
    setUserRating(note)
    await supabase.from('ratings').upsert({ user_id: user.id, lieu_id: id, note }, { onConflict: 'user_id,lieu_id' })
    showToast('Note enregistrée !')
    fetchLieu()
  }

  async function handleComment() {
    if (!user) { showToast('Connectez-vous pour commenter', 'error'); return }
    if (!comment.trim()) return
    await supabase.from('commentaires').insert({ user_id: user.id, lieu_id: id, texte: comment })
    setComment('')
    fetchLieu()
  }

  async function handleFavoris() {
    if (!user) { showToast('Connectez-vous pour ajouter aux favoris', 'error'); return }
    if (isFavoris) {
      await supabase.from('favoris').delete().eq('lieu_id', id).eq('user_id', user.id)
      setIsFavoris(false)
      showToast('Retiré des favoris')
    } else {
      await supabase.from('favoris').insert({ user_id: user.id, lieu_id: id })
      setIsFavoris(true)
      showToast('Ajouté aux favoris !')
    }
  }

  function handleShare() {
    const url = window.location.href
    const text = `Découvrez "${lieu.nom}" sur Dounia — Le monde à portée de main 🌍`
    if (navigator.share) {
      navigator.share({ title: lieu.nom, text, url })
    } else {
      navigator.clipboard.writeText(url)
      showToast('Lien copié !')
    }
  }

  function shareWhatsApp() {
    const url = window.location.href
    const text = `Découvrez "${lieu.nom}" sur Dounia 🌍 ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')
  }

  if (loading) return <div className="loading"><div className="spinner"/><span style={{color:'var(--gray)'}}>Chargement...</span></div>

  return (
    <div className="page">
      {/* 3D Hero */}
      <div className="place-detail-hero">
        {lieu.embed_3d ? (
          <iframe src={lieu.embed_3d} title={lieu.nom} allowFullScreen allow="autoplay; fullscreen; xr-spatial-tracking" />
        ) : (
          <div style={{width:'100%',height:'100%',background:'rgba(26,77,143,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'80px',marginTop:'64px'}}>🌍</div>
        )}
        <div className="place-detail-overlay"/>

        {/* Hints bar */}
        <div style={{
          position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(13,27,62,0.85)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,229,255,0.2)', borderRadius: '30px',
          padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '20px',
          whiteSpace: 'nowrap', zIndex: 10,
          opacity: showHints ? 1 : 0,
          transition: 'opacity 1s ease',
          pointerEvents: 'none',
          fontSize: '13px', color: 'rgba(255,255,255,0.8)',
          fontFamily: 'var(--font-sub)',
        }}>
          <span>🖱️ Glisser pour tourner</span>
          <span style={{color:'rgba(0,229,255,0.4)'}}>•</span>
          <span>📜 Scroll pour zoomer</span>
          <span style={{color:'rgba(0,229,255,0.4)'}}>•</span>
          <span>👆 Double-clic pour centrer</span>
        </div>
      </div>

      <div className="container place-detail-content">
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{marginBottom:'24px',display:'flex',alignItems:'center',gap:'6px'}}>
          <ArrowLeft size={14}/> Retour
        </button>

        <div style={{display:'inline-block',background:'var(--gold)',color:'var(--blue-deep)',padding:'4px 12px',borderRadius:'6px',fontSize:'13px',fontWeight:'700',marginBottom:'12px'}}>{lieu.categorie}</div>
        <h1 className="place-detail-title">{lieu.nom}</h1>

        <div className="place-detail-meta">
          <span className="place-meta-item"><MapPin size={14}/> {lieu.pays}</span>
          <span className="place-meta-item"><Eye size={14}/> {lieu.nb_visites || 0} visiteurs</span>
          {avgRating > 0 && <span className="place-meta-item">⭐ {avgRating}/5</span>}
        </div>

        <div style={{display:'flex',gap:'8px',marginBottom:'32px',flexWrap:'wrap'}}>
          <button onClick={handleFavoris} className={`btn ${isFavoris ? 'btn-primary' : 'btn-outline'} btn-sm`} style={{display:'flex',alignItems:'center',gap:'6px'}}>
            <Heart size={14} fill={isFavoris ? 'currentColor' : 'none'}/> {isFavoris ? 'Favoris ✓' : 'Favoris'}
          </button>
          <button onClick={handleShare} className="btn btn-outline btn-sm" style={{display:'flex',alignItems:'center',gap:'6px'}}>
            <Share2 size={14}/> Partager
          </button>
          <button onClick={shareWhatsApp} className="btn btn-outline btn-sm" style={{color:'#25D366',borderColor:'rgba(37,211,102,0.3)'}}>
            WhatsApp
          </button>
          <button onClick={shareFacebook} className="btn btn-outline btn-sm" style={{color:'#1877F2',borderColor:'rgba(24,119,242,0.3)'}}>
            Facebook
          </button>
        </div>

        {/* Description */}
        <div className="card" style={{marginBottom:'24px'}}>
          <p style={{color:'rgba(255,255,255,0.85)',lineHeight:'1.8',fontWeight:'300'}}>{lieu.description}</p>
        </div>

        {/* Rating */}
        <div className="card" style={{marginBottom:'24px'}}>
          <div style={{fontFamily:'var(--font-display)',fontWeight:'700',fontSize:'18px',marginBottom:'16px'}}>Notez ce lieu</div>
          <div className="stars">
            {[1,2,3,4,5].map(n => (
              <span key={n} className={`star ${n <= (rating || userRating) ? 'filled' : ''}`}
                onMouseEnter={() => setRating(n)} onMouseLeave={() => setRating(0)}
                onClick={() => handleRating(n)}>★</span>
            ))}
          </div>
          {avgRating > 0 && <div style={{marginTop:'8px',color:'var(--gray)',fontSize:'14px'}}>Moyenne : {avgRating}/5</div>}
        </div>

        {/* Comments */}
        <div className="card" style={{marginBottom:'24px'}}>
          <div style={{fontFamily:'var(--font-display)',fontWeight:'700',fontSize:'18px',marginBottom:'16px'}}>Commentaires</div>
          <div className="comment-input-row">
            <input className="form-input" value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              onKeyDown={e => e.key === 'Enter' && handleComment()} />
            <button onClick={handleComment} className="btn btn-primary" style={{padding:'12px'}}><Send size={16}/></button>
          </div>
          {comments.length === 0 ? (
            <div style={{textAlign:'center',color:'var(--gray)',padding:'20px 0',fontSize:'14px'}}>Soyez le premier à commenter ✨</div>
          ) : comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-author">{c.profiles?.nom || 'Visiteur'}</div>
              <div className="comment-text">{c.texte}</div>
              <div className="comment-date">{new Date(c.created_at).toLocaleDateString('fr-FR')}</div>
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <div className="coming-soon-card">
          <div className="coming-soon-icon">🤖</div>
          <div>
            <div style={{fontWeight:'700',marginBottom:'4px'}}>Guide IA multilingue <span className="coming-soon-badge">Bientôt</span></div>
            <div style={{color:'var(--gray)',fontSize:'14px'}} className="coming-soon-langs">
              Votre guide intelligent en <a>français</a>, <a>mooré</a>, <a>dioula</a> et <a>anglais</a> arrive bientôt. Posez vos questions sur l'histoire, la culture et les secrets de ce lieu.
            </div>
          </div>
        </div>

        <div className="coming-soon-card">
          <div className="coming-soon-icon">👥</div>
          <div>
            <div style={{fontWeight:'700',marginBottom:'4px'}}>Visite sociale <span className="coming-soon-badge">Bientôt</span></div>
            <div style={{color:'var(--gray)',fontSize:'14px'}}>Explorez ce lieu avec vos amis en temps réel, bientôt disponible. Partagez vos découvertes et commentez ensemble les merveilles du patrimoine africain.</div>
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
