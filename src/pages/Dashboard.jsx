import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, Eye, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import PlaceCard from '../components/PlaceCard'

const CATEGORIES = ['Monument', 'Musée', 'Site naturel', 'Site historique', 'Lieu de culte', 'Marché',
  'Objet d\'art', 'Animal', 'Hôtel & Hébergement', 'Gastronomie', 'Festival & Événement',
  'Architecture', 'Nature & Paysage', 'Personnalité historique', 'Autre']

function getBadge(count) {
  if (count >= 10) return { label: '🏆 Créateur Expert', className: 'badge-expert' }
  if (count >= 3) return { label: '⭐ Créateur Certifié', className: 'badge-certified' }
  return { label: '🌱 Nouveau Créateur', className: 'badge-new' }
}

export default function Dashboard() {
  const { user, profile, isCreateur } = useAuth()
  const navigate = useNavigate()
  const [lieux, setLieux] = useState([])
  const [favoris, setFavoris] = useState([])
  const [visites, setVisites] = useState([])
  const [totalVisites, setTotalVisites] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: '', description: '', pays: 'Burkina Faso', categorie: 'Monument', url_image: '', embed_3d: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    fetchData()
  }, [user])

  async function fetchData() {
    if (isCreateur) {
      const { data: mes } = await supabase.from('lieux').select('*').eq('createur_id', user.id).order('created_at', { ascending: false })
      setLieux(mes || [])
      setTotalVisites((mes || []).reduce((s, l) => s + (l.nb_visites || 0), 0))
    }
    const { data: favs } = await supabase.from('favoris').select('*, lieux(*)').eq('user_id', user.id)
    setFavoris((favs || []).map(f => f.lieux).filter(Boolean))

    const { data: vis } = await supabase.from('visites').select('*, lieux(nom, pays, categorie)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
    setVisites(vis || [])
  }

  const [showAllLieux, setShowAllLieux] = useState(false)
  const [showAllVisites, setShowAllVisites] = useState(false)
  const [showAllFavoris, setShowAllFavoris] = useState(false)
  const [editingLieu, setEditingLieu] = useState(null)

  function handleEditLieu(lieu) {
    setForm({
      nom: lieu.nom,
      description: lieu.description || '',
      pays: lieu.pays,
      categorie: lieu.categorie,
      url_image: lieu.url_image || '',
      embed_3d: lieu.embed_3d || ''
    })
    setEditingLieu(lieu.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDeleteLieu(id) {
    if (!confirm('Supprimer ce lieu définitivement ?')) return
    await supabase.from('lieux').delete().eq('id', id)
    fetchData()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (editingLieu) {
        await supabase.from('lieux').update({ ...form }).eq('id', editingLieu)
        setSuccess('Lieu modifié avec succès !')
        setEditingLieu(null)
      } else {
        await supabase.from('lieux').insert({ ...form, createur_id: user.id, statut: 'publie', nb_visites: 0 })
        setSuccess('Lieu publié avec succès !')
      }
      setShowForm(false)
      setForm({ nom: '', description: '', pays: 'Burkina Faso', categorie: 'Monument', url_image: '', embed_3d: '' })
      fetchData()
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  const badge = getBadge(lieux.length)

  return (
    <div className="page">
      <div className="dashboard-header container">
        <div className="dashboard-title">
          {isCreateur ? 'Mon espace Créateur' : 'Mon espace'}
        </div>
        <div className="dashboard-sub">Bienvenue, {profile?.nom || user?.email} {isCreateur && <span className={`creator-badge ${badge.className}`} style={{marginLeft:'8px'}}>{badge.label}</span>}</div>
      </div>

      <div className="container" style={{paddingBottom:'80px'}}>
        {isCreateur && (
          <>
            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue"><MapPin size={20}/></div>
                <div><div className="stat-value">{lieux.length}</div><div className="stat-label">Lieux publiés</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue"><Eye size={20}/></div>
                <div><div className="stat-value">{totalVisites}</div><div className="stat-label">Visites totales</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon gold"><span style={{fontSize:'20px'}}>💰</span></div>
                <div><div className="stat-value">0</div><div className="stat-label">Revenus (FCFA)</div></div>
              </div>
            </div>

            {/* Add place button */}
            <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{marginBottom:'32px',fontSize:'15px',padding:'12px 24px'}}>
              <Plus size={18}/> Ajouter un nouveau lieu
            </button>

            {/* Add form */}
            {showForm && (
              <div className="card" style={{marginBottom:'32px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
                  <div style={{fontFamily:'var(--font-display)',fontSize:'20px',fontWeight:'700'}}>{editingLieu ? 'Modifier le lieu' : 'Nouveau lieu'}</div>
                  <button onClick={() => { setShowForm(false); setEditingLieu(null) }} style={{background:'none',border:'none',color:'var(--gray)',cursor:'pointer'}}><X size={20}/></button>
                </div>
                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}
                <form onSubmit={handleSubmit}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <label className="form-label">Nom du lieu *</label>
                      <input className="form-input" value={form.nom} onChange={e => setForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: Ruines de Loropéni" required />
                    </div>
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <label className="form-label">Description</label>
                      <textarea className="form-input" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Décrivez ce lieu..." rows={4} style={{resize:'vertical'}} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pays</label>
                      <input className="form-input" value={form.pays} onChange={e => setForm(f=>({...f,pays:e.target.value}))} placeholder="Burkina Faso" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Catégorie *</label>
                      <select className="form-select" value={form.categorie} onChange={e => setForm(f=>({...f,categorie:e.target.value}))}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <label className="form-label">URL de l'image</label>
                      <input className="form-input" value={form.url_image} onChange={e => setForm(f=>({...f,url_image:e.target.value}))} placeholder="https://..." />
                    </div>
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <label className="form-label">Lien embed 3D (Sketchfab / Matterport)</label>
                      <input className="form-input" value={form.embed_3d} onChange={e => setForm(f=>({...f,embed_3d:e.target.value}))} placeholder="https://sketchfab.com/models/.../embed" />
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Enregistrement...' : editingLieu ? '✏️ Enregistrer les modifications' : '✦ Publier le lieu'}</button>
                    <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditingLieu(null) }}>Annuler</button>
                  </div>
                </form>
              </div>
            )}

            {/* My places */}
            <div style={{fontFamily:'var(--font-display)',fontSize:'20px',fontWeight:'700',marginBottom:'16px'}}>Mes lieux publiés</div>
            {lieux.length === 0 ? (
              <div className="card" style={{textAlign:'center',padding:'40px',color:'var(--gray)'}}>
                <div style={{fontSize:'48px',marginBottom:'12px'}}>🌍</div>
                <div>Vous n'avez pas encore ajouté de lieu</div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{marginTop:'16px'}}>Ajouter mon premier lieu</button>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                {lieux.slice(0, showAllLieux ? lieux.length : 3).map(l => (
                  <div key={l.id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:'var(--font-display)',fontWeight:'700',fontSize:'16px',marginBottom:'4px'}}>{l.nom}</div>
                      <div style={{color:'var(--gray)',fontSize:'13px'}}>{l.pays} • {l.categorie} • {l.nb_visites || 0} visites</div>
                    </div>
                    <div style={{display:'flex',gap:'8px',flexShrink:0}}>
                      <button onClick={() => handleEditLieu(l)} className="btn btn-outline btn-sm">✏️ Modifier</button>
                      <button onClick={() => handleDeleteLieu(l.id)} className="btn btn-danger btn-sm">🗑️ Supprimer</button>
                    </div>
                  </div>
                ))}
                {lieux.length > 3 && (
                  <button onClick={() => setShowAllLieux(!showAllLieux)} className="btn btn-outline" style={{alignSelf:'center',marginTop:'8px'}}>
                    {showAllLieux ? '▲ Voir moins' : `▼ Voir plus (${lieux.length - 3} autres)`}
                  </button>
                )}
              </div>
            )}

            <div className="divider"/>

            {/* Revenus */}
            <div style={{fontFamily:'var(--font-display)',fontSize:'20px',fontWeight:'700',marginBottom:'16px'}}>Mes revenus</div>
            <div className="card" style={{textAlign:'center',padding:'40px'}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'48px',fontWeight:'800',color:'var(--gold)'}}>0 FCFA</div>
              <div style={{color:'var(--gray)',marginTop:'8px'}}>Le système de monétisation sera activé prochainement</div>
            </div>
            <div className="divider"/>
          </>
        )}

        {/* Visites récentes */}
        <div style={{fontFamily:'var(--font-display)',fontSize:'20px',fontWeight:'700',marginBottom:'16px'}}>Mes visites récentes</div>
        {visites.length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:'40px',color:'var(--gray)'}}>
            <div style={{fontSize:'48px',marginBottom:'12px'}}>🗺️</div>
            <div>Aucune visite pour le moment</div>
            <a href="/" className="btn btn-primary" style={{marginTop:'16px',display:'inline-flex'}}>Commencer à explorer →</a>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {visites.slice(0, showAllVisites ? visites.length : 5).map(v => (
              <div key={v.id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px'}}>
                <div>
                  <div style={{fontWeight:'600'}}>{v.lieux?.nom}</div>
                  <div style={{color:'var(--gray)',fontSize:'13px'}}>{v.lieux?.pays} • {v.lieux?.categorie}</div>
                </div>
                <div style={{color:'var(--gray)',fontSize:'13px'}}>{new Date(v.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
            ))}
            {visites.length > 5 && (
              <button onClick={() => setShowAllVisites(!showAllVisites)} className="btn btn-outline" style={{alignSelf:'center',marginTop:'8px'}}>
                {showAllVisites ? '▲ Voir moins' : `▼ Voir plus (${visites.length - 5} autres)`}
              </button>
            )}
          </div>
        )}

        <div className="divider"/>

        {/* Favoris */}
        <div style={{fontFamily:'var(--font-display)',fontSize:'20px',fontWeight:'700',marginBottom:'16px'}}>❤️ Lieux favoris</div>
        {favoris.length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:'40px',color:'var(--gray)'}}>
            <div style={{fontSize:'48px',marginBottom:'12px'}}>💙</div>
            <div>Vous pourrez sauvegarder vos lieux préférés ici</div>
          </div>
        ) : (
          <>
            <div className="places-grid">
              {favoris.slice(0, showAllFavoris ? favoris.length : 8).map(l => <PlaceCard key={l.id} lieu={l} />)}
            </div>
            {favoris.length > 8 && (
              <div style={{textAlign:'center',marginTop:'16px'}}>
                <button onClick={() => setShowAllFavoris(!showAllFavoris)} className="btn btn-outline">
                  {showAllFavoris ? '▲ Voir moins' : `▼ Voir plus (${favoris.length - 8} autres)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
