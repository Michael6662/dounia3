export default function SkeletonCard() {
  return (
    <div className="place-card" style={{cursor:'default'}}>
      <div className="place-card-img" style={{background:'rgba(26,77,143,0.2)'}}>
        <div style={{width:'100%',height:'100%',background:'linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.03) 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite'}}/>
      </div>
      <div className="place-card-body">
        <div style={{height:'18px',borderRadius:'4px',background:'rgba(255,255,255,0.08)',marginBottom:'8px',width:'70%',animation:'shimmer 1.5s infinite'}}/>
        <div style={{height:'14px',borderRadius:'4px',background:'rgba(255,255,255,0.05)',marginBottom:'10px',width:'40%',animation:'shimmer 1.5s infinite'}}/>
        <div style={{height:'12px',borderRadius:'4px',background:'rgba(255,255,255,0.05)',marginBottom:'6px',width:'100%',animation:'shimmer 1.5s infinite'}}/>
        <div style={{height:'12px',borderRadius:'4px',background:'rgba(255,255,255,0.05)',marginBottom:'16px',width:'80%',animation:'shimmer 1.5s infinite'}}/>
        <div style={{height:'14px',borderRadius:'4px',background:'rgba(255,255,255,0.05)',width:'45%',animation:'shimmer 1.5s infinite'}}/>
      </div>
    </div>
  )
}
