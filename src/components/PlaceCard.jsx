import { Link } from 'react-router-dom'
import { MapPin, Eye } from 'lucide-react'

const CATEGORY_COLORS = {
  'Monument': ['#1A4D8F', '#0D1B3E'],
  'Musée': ['#2D1B6E', '#0D1B3E'],
  'Site naturel': ['#1B4D2D', '#0D2318'],
  'Site historique': ['#4D2D1B', '#2B1A0D'],
  'Lieu de culte': ['#4D1B3E', '#2B0D1F'],
  'Marché': ['#4D3D1B', '#2B220D'],
  'Objet d\'art': ['#3D1B4D', '#1F0D2B'],
  'Animal': ['#1B3D2D', '#0D2018'],
  'Hôtel & Hébergement': ['#1B2D4D', '#0D1820'],
  'Gastronomie': ['#4D2B1B', '#2B160D'],
  'Festival & Événement': ['#4D1B1B', '#2B0D0D'],
  'Architecture': ['#1B4D4D', '#0D2828'],
  'Nature & Paysage': ['#2B4D1B', '#162B0D'],
  'Personnalité historique': ['#3D3D1B', '#22220D'],
  'Autre': ['#1A4D8F', '#0D1B3E'],
}

const CATEGORY_LABELS = {
  'Monument': '🏛', 'Musée': '🏺', 'Site naturel': '🌿',
  'Site historique': '⚔', 'Lieu de culte': '🕌', 'Marché': '🛍',
  'Objet d\'art': '🎨', 'Animal': '🦁', 'Hôtel & Hébergement': '🏨',
  'Gastronomie': '🍽', 'Festival & Événement': '🎭',
  'Architecture': '🏗', 'Nature & Paysage': '🏞', 'Personnalité historique': '👤',
  'Autre': '📍'
}

function ImagePlaceholder({ categorie, nom }) {
  const colors = CATEGORY_COLORS[categorie] || CATEGORY_COLORS['Autre']
  return (
    <div style={{
      width: '100%', height: '100%', minHeight: '200px',
      background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Grid lines effect */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,229,255,0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,229,255,0.08) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px'
      }}/>
      {/* Glow circle */}
      <div style={{
        position: 'absolute', width: '120px', height: '120px',
        borderRadius: '50%', background: 'rgba(0,229,255,0.08)',
        border: '1px solid rgba(0,229,255,0.2)',
        boxShadow: '0 0 40px rgba(0,229,255,0.1)'
      }}/>
      <div style={{fontSize: '36px', position: 'relative', zIndex: 1, marginBottom: '8px'}}>
        {CATEGORY_LABELS[categorie] || '📍'}
      </div>
      <div style={{
        position: 'relative', zIndex: 1,
        color: 'rgba(255,255,255,0.5)', fontSize: '11px',
        fontFamily: 'var(--font-display)', letterSpacing: '1px',
        textAlign: 'center', padding: '0 16px',
        maxWidth: '160px',
        textTransform: 'uppercase'
      }}>{nom}</div>
    </div>
  )
}

export default function PlaceCard({ lieu, featured = false }) {
  if (featured) {
    return (
      <Link to={`/lieu/${lieu.id}`} className="featured-card">
        <div className="featured-card-img">
          {lieu.url_image
            ? <img src={lieu.url_image} alt={lieu.nom} />
            : <ImagePlaceholder categorie={lieu.categorie} nom={lieu.nom} />
          }
        </div>
        <div className="featured-card-body">
          <div className="featured-label">⭐ Coup de cœur de la semaine</div>
          <div style={{display:'inline-block',background:'var(--gold)',color:'var(--blue-deep)',padding:'3px 10px',borderRadius:'6px',fontSize:'12px',fontWeight:'700',marginBottom:'12px',fontFamily:'var(--font-display)',letterSpacing:'1px',textTransform:'uppercase'}}>{lieu.categorie}</div>
          <div className="featured-title">{lieu.nom}</div>
          <div className="featured-desc">{lieu.description?.slice(0, 150)}...</div>
          <div style={{display:'flex',alignItems:'center',gap:'6px',color:'var(--cyan)',fontSize:'14px',fontWeight:'600'}}>
            <MapPin size={14}/> {lieu.pays}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/lieu/${lieu.id}`} className="place-card">
      <div className="place-card-img">
        {lieu.url_image
          ? <img src={lieu.url_image} alt={lieu.nom} />
          : <ImagePlaceholder categorie={lieu.categorie} nom={lieu.nom} />
        }
        <span className="place-badge">{lieu.categorie}</span>
        {lieu.is_featured && <span className="featured-badge">⭐ Vedette</span>}
      </div>
      <div className="place-card-body">
        <div className="place-card-title">{lieu.nom}</div>
        <div className="place-card-location"><MapPin size={13}/> {lieu.pays}</div>
        <div className="place-card-desc">{lieu.description}</div>
        <div className="place-card-footer">
          <span className="visit-link">👁 Visite virtuelle</span>
          <span className="visitors-count"><Eye size={12}/> {lieu.nb_visites || 0}</span>
        </div>
      </div>
    </Link>
  )
}
