import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',textAlign:'center',padding:'24px'}}>
      <div style={{fontFamily:'var(--font-display)',fontSize:'120px',fontWeight:'900',color:'var(--gold)',opacity:0.3,lineHeight:1}}>404</div>
      <div style={{fontFamily:'var(--font-display)',fontSize:'28px',fontWeight:'700',marginBottom:'12px',marginTop:'-16px'}}>Page introuvable</div>
      <div style={{color:'var(--gray)',fontSize:'16px',maxWidth:'400px',marginBottom:'32px',fontFamily:'var(--font-sub)'}}>
        Le lieu que vous cherchez n'existe pas ou a été déplacé. Retournez explorer le patrimoine culturel africain.
      </div>
      <div style={{display:'flex',gap:'12px',flexWrap:'wrap',justifyContent:'center'}}>
        <Link to="/" className="btn btn-primary" style={{fontSize:'13px',padding:'14px 28px'}}>✦ Retour à l'accueil</Link>
        <Link to="/" className="btn btn-outline" style={{fontSize:'13px',padding:'14px 28px'}}>🎲 Lieu aléatoire</Link>
      </div>
      <div style={{marginTop:'60px',fontFamily:'var(--font-display)',fontSize:'20px',fontWeight:'900',letterSpacing:'3px',color:'var(--gold)',opacity:0.4}}>DOUNIA</div>
    </div>
  )
}
