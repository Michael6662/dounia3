import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Trash2, Star, StarOff, Users, MapPin, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Admin() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [lieux, setLieux] = useState([])
  const [users, setUsers] = useState([])
  const [comments, setComments] = useState([])
  const [stats, setStats] = useState({ lieux: 0, visites: 0, users: 0, pays: 0 })
  const [tab, setTab] = useState('lieux')
  const [featuredId, setFeaturedId] = useState('')
  const [toast, setToast] = useState(null)
  const [partenaires, setPartenaires] = useState([])
  const [partForm, setPartForm] = useState({ nom: '', logo_url: '', site_url: '', categorie: 'Institution' })
  const [showPartForm, setShowPartForm] = useState(false)

  useEffect(() => {
    if (!user || !isAdmin) { navigate('/'); return }
    fetchAll()
  }, [user, isAdmin])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function fetchAll() {
    const { data: l } = await supabase.from('lieux').select('*, profiles(nom, email)').order('created_at', { ascending: false })
    setLieux(l || [])
    const current = l?.find(x => x.is_featured)
    if (current) setFeaturedId(current.id)

    const totalVisites = (l || []).reduce((s, x) => s + (x.nb_visites || 0), 0)
    const uniquePays = [...new Set((l || []).map(x => x.pays))]
    setStats({ lieux: l?.length || 0, visites: totalVisites, pays: uniquePays.length })

    const { data: u } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(u || [])
    setStats(s => ({ ...s, users: u?.length || 0 }))

    const { data: c } = await supabase.from('commentaires').select('*, profiles(nom), lieux(nom)').order('created_at', { ascending: false }).limit(20)
    setComments(c || [])

    const { data: p } = await supabase.from('partenaires').select('*').order('ordre', { ascending: true })
    setPartenaires(p || [])
  }

  const [uploading, setUploading] = useState(false)

  async function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const filename = `partenaires/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filename, file, { upsert: true })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(filename)
      setPartForm(f => ({ ...f, logo_url: urlData.publicUrl }))
      showToast('Logo uploadé !')
    } catch (err) {
      showToast('Erreur upload: ' + err.message, 'error')
    }
    setUploading(false)
  }

  async function handleAddPartenaire(e) {
    e.preventDefault()
    const { data, error } = await supabase.from('partenaires').insert({
      nom: partForm.nom,
      logo_url: partForm.logo_url || null,
      site_url: partForm.site_url || null,
      categorie: partForm.categorie,
      actif: true,
      ordre: partenaires.length
    }).select()
    if (error) {
      showToast('Erreur: ' + error.message, 'error')
      return
    }
    setPartForm({ nom: '', logo_url: '', site_url: '', categorie: 'Institution' })
    setShowPartForm(false)
    showToast('Partenaire ajouté !')
    fetchAll()
  }

  async function handleDeletePartenaire(id) {
    if (!confirm('Supprimer ce partenaire ?')) return
    await supabase.from('partenaires').delete().eq('id', id)
    showToast('Partenaire supprimé')
    fetchAll()
  }

  async function handleTogglePartenaire(id, actif) {
    await supabase.from('partenaires').update({ actif: !actif }).eq('id', id)
    fetchAll()
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce lieu ?')) return
    await supabase.from('lieux').delete().eq('id', id)
    showToast('Lieu supprimé')
    fetchAll()
  }

  async function handleFeatured(id, current) {
    await supabase.from('lieux').update({ is_featured: false }).neq('id', '')
    if (!current) await supabase.from('lieux').update({ is_featured: true }).eq('id', id)
    showToast(current ? 'Retiré de la vedette' : 'Mis en vedette !')
    fetchAll()
  }

  async function handleDeleteComment(id) {
    await supabase.from('commentaires').delete().eq('id', id)
    showToast('Commentaire supprimé')
    fetchAll()
  }

  async function handleSetFeatured() {
    if (!featuredId) return
    await supabase.from('lieux').update({ is_featured: false }).neq('id', '')
    await supabase.from('lieux').update({ is_featured: true }).eq('id', featuredId)
    showToast('Coup de cœur mis à jour !')
    fetchAll()
  }

  return (
    <div className="page">
      <div className="dashboard-header container">
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
          <Shield size={28} color="var(--gold)"/>
          <div className="dashboard-title">Espace Admin</div>
        </div>
        <div className="dashboard-sub">Gestion complète de la plateforme Dounia</div>
      </div>

      <div className="container" style={{paddingBottom:'80px'}}>
        {/* Global stats */}
        <div className="stats-grid" style={{marginBottom:'32px'}}>
          {[
            { icon: <MapPin size={20}/>, value: stats.lieux, label: 'Lieux total', color: 'blue' },
            { icon: <Eye size={20}/>, value: stats.visites, label: 'Visites totales', color: 'blue' },
            { icon: <Users size={20}/>, value: stats.users, label: 'Utilisateurs', color: 'gold' },
            { icon: '🌍', value: stats.pays, label: 'Pays', color: 'green' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className={`stat-icon ${s.color}`}>{typeof s.icon === 'string' ? <span style={{fontSize:'20px'}}>{s.icon}</span> : s.icon}</div>
              <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          ))}
        </div>

        {/* Featured selector */}
        <div className="card" style={{marginBottom:'24px'}}>
          <div style={{fontFamily:'var(--font-display)',fontWeight:'700',fontSize:'18px',marginBottom:'16px'}}>⭐ Coup de cœur de la semaine</div>
          <div style={{display:'flex',gap:'12px',alignItems:'center',flexWrap:'wrap'}}>
            <select className="form-select" value={featuredId} onChange={e => setFeaturedId(e.target.value)} style={{flex:1,minWidth:'200px'}}>
              <option value="">— Sélectionner un lieu —</option>
              {lieux.map(l => <option key={l.id} value={l.id}>{l.nom} ({l.pays})</option>)}
            </select>
            <button onClick={handleSetFeatured} className="btn btn-primary">Enregistrer</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:'8px',marginBottom:'24px',flexWrap:'wrap'}}>
          {[['lieux','🗺️ Lieux'],['users','👥 Utilisateurs'],['comments','💬 Commentaires'],['partenaires','🤝 Partenaires']].map(([t,label]) => (
            <button key={t} onClick={() => setTab(t)} className={`filter-btn ${tab === t ? 'active' : ''}`}>{label}</button>
          ))}
        </div>

        {/* Lieux tab */}
        {tab === 'lieux' && (
          <div className="card" style={{overflowX:'auto'}}>
            <table className="admin-table">
              <thead>
                <tr><th>Lieu</th><th>Pays</th><th>Catégorie</th><th>Créateur</th><th>Visites</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {lieux.map(l => (
                  <tr key={l.id}>
                    <td style={{fontWeight:'600'}}>{l.nom} {l.is_featured && <span style={{color:'var(--gold)',fontSize:'12px'}}>⭐</span>}</td>
                    <td style={{color:'var(--gray)'}}>{l.pays}</td>
                    <td><span style={{background:'rgba(200,151,42,0.15)',color:'var(--gold)',padding:'2px 8px',borderRadius:'4px',fontSize:'12px'}}>{l.categorie}</span></td>
                    <td style={{color:'var(--gray)',fontSize:'13px'}}>{l.profiles?.nom || '—'}</td>
                    <td style={{color:'var(--cyan)'}}>{l.nb_visites || 0}</td>
                    <td>
                      <div style={{display:'flex',gap:'8px'}}>
                        <button onClick={() => handleFeatured(l.id, l.is_featured)} className="btn btn-sm btn-outline" title={l.is_featured ? 'Retirer vedette' : 'Mettre en vedette'}>
                          {l.is_featured ? <StarOff size={14}/> : <Star size={14}/>}
                        </button>
                        <button onClick={() => handleDelete(l.id)} className="btn btn-sm btn-danger"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div className="card" style={{overflowX:'auto'}}>
            <table className="admin-table">
              <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{fontWeight:'600'}}>{u.nom}</td>
                    <td style={{color:'var(--gray)',fontSize:'13px'}}>{u.email}</td>
                    <td><span style={{background: u.role === 'createur' ? 'rgba(200,151,42,0.15)' : 'rgba(26,77,143,0.3)', color: u.role === 'createur' ? 'var(--gold)' : 'var(--cyan)', padding:'2px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'700'}}>{u.role}</span></td>
                    <td style={{color:'var(--gray)',fontSize:'13px'}}>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Comments tab */}
        {tab === 'comments' && (
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {comments.map(c => (
              <div key={c.id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'16px 20px'}}>
                <div>
                  <div style={{fontWeight:'600',marginBottom:'2px'}}>{c.profiles?.nom} <span style={{color:'var(--gray)',fontWeight:'400',fontSize:'13px'}}>sur {c.lieux?.nom}</span></div>
                  <div style={{color:'rgba(255,255,255,0.8)',fontSize:'14px'}}>{c.texte}</div>
                  <div style={{color:'var(--gray)',fontSize:'12px',marginTop:'4px'}}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</div>
                </div>
                <button onClick={() => handleDeleteComment(c.id)} className="btn btn-sm btn-danger"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        )}

        {/* Partenaires tab */}
        {tab === 'partenaires' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <div style={{fontFamily:'var(--font-display)',fontWeight:'700',fontSize:'18px'}}>🤝 Partenaires ({partenaires.length})</div>
              <button onClick={() => setShowPartForm(!showPartForm)} className="btn btn-primary btn-sm">+ Ajouter un partenaire</button>
            </div>

            {showPartForm && (
              <div className="card" style={{marginBottom:'24px'}}>
                <form onSubmit={handleAddPartenaire}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                    <div className="form-group">
                      <label className="form-label">Nom du partenaire *</label>
                      <input className="form-input" value={partForm.nom} onChange={e => setPartForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: Ministère de la Culture" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Catégorie</label>
                      <select className="form-select" value={partForm.categorie} onChange={e => setPartForm(f=>({...f,categorie:e.target.value}))}>
                        {['Institution','Hôtel','ONG','Média','Entreprise','Autre'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <label className="form-label">Logo — Importer un fichier</label>
                      <input
                        type="file" accept="image/*"
                        onChange={handleLogoUpload}
                        style={{width:'100%',padding:'10px',background:'rgba(13,27,62,0.6)',border:'1px solid var(--border)',borderRadius:'10px',color:'var(--white)',cursor:'pointer'}}
                        disabled={uploading}
                      />
                      {uploading && <div style={{color:'var(--cyan)',fontSize:'13px',marginTop:'6px'}}>⏳ Upload en cours...</div>}
                      {partForm.logo_url && (
                        <div style={{marginTop:'10px',display:'flex',alignItems:'center',gap:'10px'}}>
                          <img src={partForm.logo_url} alt="preview" style={{height:'40px',objectFit:'contain',background:'white',padding:'4px',borderRadius:'6px'}} />
                          <span style={{color:'#4ade80',fontSize:'13px'}}>✓ Logo chargé</span>
                        </div>
                      )}
                    </div>
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <label className="form-label">Ou URL du logo (optionnel)</label>
                      <input className="form-input" value={partForm.logo_url} onChange={e => setPartForm(f=>({...f,logo_url:e.target.value}))} placeholder="https://..." />
                    </div>
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <label className="form-label">Site web</label>
                      <input className="form-input" value={partForm.site_url} onChange={e => setPartForm(f=>({...f,site_url:e.target.value}))} placeholder="https://..." />
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
                    <button type="submit" className="btn btn-primary" disabled={uploading}>✦ Ajouter</button>
                    <button type="button" className="btn btn-outline" onClick={() => setShowPartForm(false)}>Annuler</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'16px'}}>
              {partenaires.length === 0 ? (
                <div className="card" style={{textAlign:'center',padding:'40px',color:'var(--gray)',gridColumn:'1/-1'}}>
                  Aucun partenaire pour l'instant. Ajoutez-en un !
                </div>
              ) : partenaires.map(p => (
                <div key={p.id} className="card" style={{opacity: p.actif ? 1 : 0.5}}>
                  <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.nom} style={{width:'48px',height:'48px',objectFit:'contain',borderRadius:'8px',background:'white',padding:'4px'}} />
                    ) : (
                      <div style={{width:'48px',height:'48px',borderRadius:'8px',background:'var(--card-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🤝</div>
                    )}
                    <div>
                      <div style={{fontWeight:'700',fontSize:'15px'}}>{p.nom}</div>
                      <div style={{color:'var(--gray)',fontSize:'12px'}}>{p.categorie}</div>
                    </div>
                  </div>
                  {p.site_url && <div style={{color:'var(--cyan)',fontSize:'13px',marginBottom:'12px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.site_url}</div>}
                  <div style={{display:'flex',gap:'8px'}}>
                    <button onClick={() => handleTogglePartenaire(p.id, p.actif)} className="btn btn-outline btn-sm" style={{flex:1}}>
                      {p.actif ? '👁 Visible' : '🚫 Masqué'}
                    </button>
                    <button onClick={() => handleDeletePartenaire(p.id)} className="btn btn-danger btn-sm"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
