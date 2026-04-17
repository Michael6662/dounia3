import { useState, useEffect } from 'react'
import { Globe as GlobeIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import PlaceCard from '../components/PlaceCard'
import Globe from '../components/Globe'
import SkeletonCard from '../components/SkeletonCard'

const CATEGORIES = ['Tout', 'Monument', 'Musée', 'Site naturel', 'Site historique', 'Lieu de culte',
  'Marché', "Objet d'art", 'Animal', 'Hôtel & Hébergement', 'Gastronomie',
  'Festival & Événement', 'Architecture', 'Nature & Paysage', 'Personnalité historique']

const HERO_EMBED = 'https://sketchfab.com/models/52d5b1578c33473c9b8013a980bc4da5/embed?autostart=1&ui_infos=0&ui_watermark=0&ui_controls=0'

export default function Home({ onAuthClick }) {
  const { user } = useAuth()
  const [lieux, setLieux] = useState([])
  const [filtered, setFiltered] = useState([])
  const [category, setCategory] = useState('Tout')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({ lieux: 0, visites: 0, pays: 0 })
  const [featured, setFeatured] = useState(null)
  const [lieuDuJour, setLieuDuJour] = useState(null)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 12
  const [selectedPays, setSelectedPays] = useState(null)
  const [pays, setPays] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('recent')
  const [partenaires, setPartenaires] = useState([])

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    let result = lieux
    if (category !== 'Tout') result = result.filter(l => l.categorie === category)
    if (search) result = result.filter(l =>
      l.nom.toLowerCase().includes(search.toLowerCase()) ||
      l.pays.toLowerCase().includes(search.toLowerCase())
    )
    if (selectedPays) result = result.filter(l => l.pays === selectedPays)
    if (sort === 'recent') result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (sort === 'popular') result = [...result].sort((a, b) => (b.nb_visites || 0) - (a.nb_visites || 0))
    if (sort === 'alpha') result = [...result].sort((a, b) => a.nom.localeCompare(b.nom))
    setFiltered(result)
    setPage(1)
  }, [lieux, category, search, selectedPays, sort])

  async function fetchAll() {
    setLoading(true)
    const { data } = await supabase.from('lieux').select('*').eq('statut', 'publie').order('created_at', { ascending: false })
    if (!data) { setLoading(false); return }
    setLieux(data)
    const uniquePays = [...new Set(data.map(l => l.pays))]
    setPays(uniquePays)
    const feat = data.find(l => l.is_featured)
    setFeatured(feat || null)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    setLieuDuJour(data[dayOfYear % data.length] || null)
    const totalVisites = data.reduce((sum, l) => sum + (l.nb_visites || 0), 0)
    setStats({ lieux: data.length, visites: totalVisites, pays: uniquePays.length })
    const { data: parts } = await supabase.from('partenaires').select('*').eq('actif', true).order('ordre')
    setPartenaires(parts || [])
    setLoading(false)
  }

  const newest = lieux.slice(0, 4)
  const mostVisited = [...lieux].sort((a, b) => (b.nb_visites || 0) - (a.nb_visites || 0)).slice(0, 4)

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-3d">
          <iframe src={HERO_EMBED} title="Dounia 3D" allowFullScreen allow="autoplay; fullscreen; xr-spatial-tracking" />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">Tourisme virtuel immersif</div>
          <div style={{height:'280px'}} />
          <div className="hero-bottom">
            <h1 className="hero-title">
              Explorez le patrimoine<br/>
              <span>culturel africain</span>
            </h1>
            <p className="hero-subtitle">Des lieux mythiques africains rendus accessibles à tous, depuis n'importe où dans le monde.</p>
            <div className="hero-actions">
              <a href="#explorer" className="btn btn-primary" style={{fontSize:'13px',padding:'16px 32px'}}>✦ Commencer l'exploration</a>
              {!user && (
                <button onClick={() => onAuthClick('signup')} className="btn btn-outline" style={{fontSize:'13px',padding:'16px 32px',fontFamily:'var(--font-display)',letterSpacing:'1px',textTransform:'uppercase'}}>Créer un compte</button>
              )}
            </div>
            <p className="hero-hint">🖱️ Faites tourner le modèle — c'est votre première visite Dounia</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item"><span className="stat-dot" style={{background:'#4ade80'}}/>🌍 {stats.lieux} lieux disponibles</div>
        <div className="stat-item"><span className="stat-dot"/>👁 {stats.visites} visites totales</div>
        <div className="stat-item"><span className="stat-dot" style={{background:'var(--gold)'}}/>🌐 {stats.pays} pays représentés</div>
      </div>

      <div style={{position:'relative',zIndex:1}}>

        {/* Lieu du jour */}
        {lieuDuJour && (
          <div className="section container">
            <div className="section-header">
              <div className="section-title">
                🌟 Lieu du jour
                <span style={{background:'rgba(200,151,42,0.15)',color:'var(--gold)',border:'1px solid rgba(200,151,42,0.3)',padding:'2px 10px',borderRadius:'6px',fontSize:'13px',fontWeight:'600',marginLeft:'8px'}}>Aujourd'hui</span>
              </div>
            </div>
            <PlaceCard lieu={lieuDuJour} featured />
          </div>
        )}

        {/* Coup de coeur */}
        {featured && featured.id !== lieuDuJour?.id && (
          <div className="section container">
            <div className="section-header">
              <div className="section-title">⭐ Coup de cœur de la semaine</div>
            </div>
            <PlaceCard lieu={featured} featured />
          </div>
        )}

        {/* Les plus visités */}
        {mostVisited.length > 0 && (
          <div className="section container">
            <div className="section-header">
              <div className="section-title">🔥 Les plus visités</div>
            </div>
            <div className="places-grid">
              {mostVisited.map(l => <PlaceCard key={l.id} lieu={l} />)}
            </div>
          </div>
        )}

        {/* Nouveaux lieux */}
        {newest.length > 0 && (
          <div className="section container">
            <div className="section-header">
              <div className="section-title">✨ Nouveaux lieux</div>
            </div>
            <div className="places-grid">
              {newest.map(l => <PlaceCard key={l.id} lieu={l} />)}
            </div>
          </div>
        )}

        {/* Globe */}
        {pays.length > 0 && (
          <div className="section container">
            <div className="section-header">
              <div className="section-title"><GlobeIcon size={24}/> Explorer par pays</div>
              <div className="section-sub">Faites tourner le globe et cliquez sur un pays pour filtrer les lieux</div>
            </div>
            <div style={{display:'flex',justifyContent:'center'}}>
              <Globe
                availableCountries={pays}
                selectedCountry={selectedPays}
                onSelectCountry={(p) => {
                  setSelectedPays(p)
                  if (p) document.getElementById('explorer')?.scrollIntoView({behavior:'smooth'})
                }}
              />
            </div>
          </div>
        )}

        {/* Tous les lieux */}
        <div className="section container" id="explorer">
          <div className="section-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'12px'}}>
            <div>
              <div className="section-title">✦ Tous les lieux</div>
              <div className="section-sub">Découvrez les merveilles du patrimoine africain en réalité virtuelle</div>
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} className="form-select" style={{width:'auto',minWidth:'160px',fontSize:'13px',padding:'8px 14px'}}>
              <option value="recent">🕐 Plus récents</option>
              <option value="popular">🔥 Plus visités</option>
              <option value="alpha">🔤 Alphabétique</option>
            </select>
          </div>

          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Rechercher un lieu ou un pays..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="filters">
            {CATEGORIES.map(c => (
              <button key={c} className={`filter-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
            {selectedPays && (
              <button className="filter-btn active" onClick={() => setSelectedPays(null)}>📍 {selectedPays} ✕</button>
            )}
          </div>

          {loading ? (
            <div className="places-grid">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 0',color:'var(--gray)'}}>
              <div style={{fontSize:'48px',marginBottom:'16px'}}>🌍</div>
              <div>Aucun lieu trouvé</div>
            </div>
          ) : (
            <>
              <div className="places-grid">
                {filtered.slice(0, page * ITEMS_PER_PAGE).map(l => <PlaceCard key={l.id} lieu={l} />)}
              </div>
              {filtered.length > page * ITEMS_PER_PAGE && (
                <div style={{textAlign:'center',marginTop:'32px'}}>
                  <button onClick={() => setPage(p => p + 1)} className="btn btn-outline" style={{padding:'12px 32px',fontFamily:'var(--font-display)',fontSize:'12px',letterSpacing:'1px'}}>
                    ▼ Voir plus ({filtered.length - page * ITEMS_PER_PAGE} autres)
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Partenaires */}
        {partenaires.length > 0 && (
          <div className="section container">
            <div style={{textAlign:'center',marginBottom:'32px'}}>
              <div style={{color:'var(--gray)',fontSize:'13px',fontFamily:'var(--font-display)',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px'}}>Ils nous font confiance</div>
              <div style={{height:'1px',background:'linear-gradient(to right, transparent, var(--border), transparent)'}}/>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'32px',flexWrap:'wrap',justifyContent:'center',padding:'24px',background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:'16px'}}>
              {partenaires.map(p => (
                <a key={p.id} href={p.site_url || '#'} target="_blank" rel="noopener noreferrer"
                  style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',textDecoration:'none',opacity:0.85,transition:'all 0.2s',textAlign:'center'}}
                  onMouseEnter={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='scale(1.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity='0.85'; e.currentTarget.style.transform='scale(1)' }}
                >
                  {p.logo_url ? (
                    <div style={{background:'white',borderRadius:'10px',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'center',minWidth:'80px',height:'56px'}}>
                      <img src={p.logo_url} alt={p.nom} style={{height:'36px',maxWidth:'120px',objectFit:'contain'}} />
                    </div>
                  ) : (
                    <div style={{background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:'10px',padding:'12px 20px',fontFamily:'var(--font-display)',fontSize:'13px',fontWeight:'700',color:'var(--white)',letterSpacing:'1px'}}>
                      {p.nom}
                    </div>
                  )}
                  <div style={{color:'var(--gray)',fontSize:'11px',fontFamily:'var(--font-sub)'}}>{p.nom}</div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer style={{borderTop:'1px solid var(--border)',position:'relative',zIndex:1,background:'rgba(13,27,62,0.8)',backdropFilter:'blur(10px)'}}>
        <div className="container" style={{padding:'60px 24px 40px'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'40px',marginBottom:'48px'}}>
            <div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'24px',fontWeight:'900',color:'var(--white)',letterSpacing:'3px',marginBottom:'12px'}}>DOUNIA</div>
              <div style={{color:'var(--gray)',fontSize:'14px',lineHeight:'1.7',maxWidth:'280px',fontFamily:'var(--font-sub)'}}>
                La plateforme de tourisme virtuel immersif qui rend le patrimoine culturel africain accessible à tous, depuis n'importe où dans le monde.
              </div>
              <div style={{marginTop:'16px',display:'flex',gap:'12px'}}>
                {['🌍','📧','📱'].map((icon,i) => (
                  <div key={i} style={{width:'36px',height:'36px',borderRadius:'8px',background:'var(--card-bg)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',cursor:'pointer'}}>{icon}</div>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'13px',fontWeight:'700',color:'var(--gold)',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'16px'}}>Explorer</div>
              {['Tous les lieux','Les plus visités','Lieu du jour','Lieu aléatoire','Explorer par pays'].map(l => (
                <div key={l} style={{color:'var(--gray)',fontSize:'14px',marginBottom:'10px',cursor:'pointer',fontFamily:'var(--font-sub)'}}
                  onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color=''}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'13px',fontWeight:'700',color:'var(--gold)',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'16px'}}>Catégories</div>
              {['Monuments','Musées','Sites naturels',"Objets d'art",'Animaux','Gastronomie'].map(l => (
                <div key={l} style={{color:'var(--gray)',fontSize:'14px',marginBottom:'10px',cursor:'pointer',fontFamily:'var(--font-sub)'}}
                  onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color=''}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'13px',fontWeight:'700',color:'var(--gold)',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'16px'}}>Contact</div>
              <div style={{color:'var(--gray)',fontSize:'14px',marginBottom:'10px',fontFamily:'var(--font-sub)'}}>📧 bakomichael66@gmail.com</div>
              <div style={{color:'var(--gray)',fontSize:'14px',marginBottom:'10px',fontFamily:'var(--font-sub)'}}>📞 +226 66 62 02 84</div>
              <div style={{color:'var(--gray)',fontSize:'14px',marginBottom:'10px',fontFamily:'var(--font-sub)'}}>📍 Ouagadougou, Burkina Faso</div>
              <div style={{marginTop:'16px'}}>
                <span style={{background:'rgba(200,151,42,0.15)',color:'var(--gold)',border:'1px solid rgba(200,151,42,0.3)',padding:'6px 14px',borderRadius:'20px',fontSize:'12px',fontFamily:'var(--font-display)',letterSpacing:'1px'}}>🚀 BÊTA</span>
              </div>
            </div>
          </div>
          <div style={{height:'1px',background:'var(--border)',marginBottom:'24px'}}/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
            <div style={{color:'var(--gray)',fontSize:'13px',fontFamily:'var(--font-sub)'}}>
              © 2026 <span style={{color:'var(--white)',fontWeight:'600'}}>Bako Babou Michael</span> — Tous droits réservés. Ouagadougou, Burkina Faso.
            </div>
            <div style={{display:'flex',gap:'24px'}}>
              {["Confidentialité","Conditions d'utilisation","À propos"].map(l => (
                <span key={l} style={{color:'var(--gray)',fontSize:'13px',cursor:'pointer',fontFamily:'var(--font-sub)'}}
                  onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color=''}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
