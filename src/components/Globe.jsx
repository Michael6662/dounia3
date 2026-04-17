import { useEffect, useRef, useState } from 'react'

const COUNTRIES = [
  { name: 'Burkina Faso', lat: 12.3, lng: -1.5 },
  { name: 'Sénégal', lat: 14.4, lng: -14.5 },
  { name: 'Mali', lat: 17.5, lng: -4.0 },
  { name: 'Côte d\'Ivoire', lat: 7.5, lng: -5.5 },
  { name: 'Ghana', lat: 8.0, lng: -1.0 },
  { name: 'Nigeria', lat: 9.0, lng: 8.7 },
  { name: 'Cameroun', lat: 3.8, lng: 11.5 },
  { name: 'Éthiopie', lat: 9.0, lng: 38.7 },
  { name: 'Kenya', lat: -0.5, lng: 37.9 },
  { name: 'Maroc', lat: 31.8, lng: -7.1 },
  { name: 'Tunisie', lat: 33.9, lng: 9.5 },
  { name: 'Égypte', lat: 26.8, lng: 30.8 },
  { name: 'Afrique du Sud', lat: -29.0, lng: 25.0 },
  { name: 'Tanzania', lat: -6.4, lng: 34.9 },
]

function latLngTo3D(lat, lng, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  }
}

function project(point, rotX, rotY, size) {
  // Rotate around Y
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
  const x1 = point.x * cosY - point.z * sinY
  const z1 = point.x * sinY + point.z * cosY

  // Rotate around X
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX)
  const y2 = point.y * cosX - z1 * sinX
  const z2 = point.y * sinX + z1 * cosX

  const fov = 3
  const scale = fov / (fov + z2)
  return {
    x: x1 * scale * size * 0.38 + size / 2,
    y: y2 * scale * size * 0.38 + size / 2,
    z: z2,
    visible: z2 > -0.2,
  }
}

export default function Globe({ availableCountries = [], onSelectCountry, selectedCountry }) {
  const canvasRef = useRef(null)
  const rotRef = useRef({ x: 0.3, y: 0 })
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 })
  const animRef = useRef(null)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = canvas.width

    function draw() {
      ctx.clearRect(0, 0, size, size)

      const rotX = rotRef.current.x
      const rotY = rotRef.current.y

      // Draw globe circle
      const cx = size / 2, cy = size / 2
      const r = size * 0.38

      // Outer glow
      const grad = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.3)
      grad.addColorStop(0, 'rgba(0,229,255,0.05)')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2)
      ctx.fill()

      // Globe base
      const globeGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r)
      globeGrad.addColorStop(0, 'rgba(26,77,143,0.6)')
      globeGrad.addColorStop(1, 'rgba(13,27,62,0.9)')
      ctx.fillStyle = globeGrad
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()

      // Globe border
      ctx.strokeStyle = 'rgba(0,229,255,0.3)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(0,229,255,0.08)'
        ctx.lineWidth = 0.5
        for (let lng = -180; lng <= 180; lng += 5) {
          const p = latLngTo3D(lat, lng, 1)
          const proj = project(p, rotX, rotY, size)
          if (lng === -180) ctx.moveTo(proj.x, proj.y)
          else if (proj.visible) ctx.lineTo(proj.x, proj.y)
        }
        ctx.stroke()
      }

      // Longitude lines
      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(0,229,255,0.08)'
        ctx.lineWidth = 0.5
        for (let lat = -90; lat <= 90; lat += 5) {
          const p = latLngTo3D(lat, lng, 1)
          const proj = project(p, rotX, rotY, size)
          if (lat === -90) ctx.moveTo(proj.x, proj.y)
          else if (proj.visible) ctx.lineTo(proj.x, proj.y)
        }
        ctx.stroke()
      }

      // Countries dots
      COUNTRIES.forEach(country => {
        const p = latLngTo3D(country.lat, country.lng, 1.02)
        const proj = project(p, rotX, rotY, size)
        if (!proj.visible) return

        const hasPlaces = availableCountries.includes(country.name)
        const isSelected = selectedCountry === country.name
        const isHov = hovered === country.name

        const dotR = hasPlaces ? (isSelected || isHov ? 8 : 6) : 3

        // Glow for countries with places
        if (hasPlaces) {
          const glowGrad = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, dotR * 3)
          glowGrad.addColorStop(0, isSelected ? 'rgba(200,151,42,0.5)' : 'rgba(0,229,255,0.3)')
          glowGrad.addColorStop(1, 'transparent')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(proj.x, proj.y, dotR * 3, 0, Math.PI * 2)
          ctx.fill()
        }

        // Dot
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, dotR, 0, Math.PI * 2)
        ctx.fillStyle = isSelected
          ? '#C8972A'
          : hasPlaces
            ? (isHov ? '#00E5FF' : 'rgba(0,229,255,0.8)')
            : 'rgba(138,155,188,0.3)'
        ctx.fill()

        // Label
        if (hasPlaces && (isSelected || isHov || proj.z > 0.3)) {
          ctx.fillStyle = isSelected ? '#C8972A' : '#00E5FF'
          ctx.font = `${isSelected ? '600' : '500'} 11px Rajdhani, sans-serif`
          ctx.textAlign = 'center'
          ctx.fillText(country.name, proj.x, proj.y - dotR - 4)
        }
      })

      // Highlight ring for selected
      if (selectedCountry) {
        const country = COUNTRIES.find(c => c.name === selectedCountry)
        if (country) {
          const p = latLngTo3D(country.lat, country.lng, 1.02)
          const proj = project(p, rotX, rotY, size)
          if (proj.visible) {
            ctx.strokeStyle = 'rgba(200,151,42,0.6)'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.arc(proj.x, proj.y, 14, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      }

      if (!dragRef.current.dragging) {
        rotRef.current.y += 0.003
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [availableCountries, selectedCountry, hovered])

  function handleMouseDown(e) {
    dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY }
  }

  function handleMouseMove(e) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width)
    const my = (e.clientY - rect.top) * (canvas.height / rect.height)
    const size = canvas.width
    const rotX = rotRef.current.x, rotY = rotRef.current.y

    // Check hover
    let foundHover = null
    COUNTRIES.forEach(country => {
      if (!availableCountries.includes(country.name)) return
      const p = latLngTo3D(country.lat, country.lng, 1.02)
      const proj = project(p, rotX, rotY, size)
      if (!proj.visible) return
      const dx = proj.x - mx, dy = proj.y - my
      if (Math.sqrt(dx*dx + dy*dy) < 12) foundHover = country.name
    })
    setHovered(foundHover)
    canvas.style.cursor = foundHover ? 'pointer' : 'grab'

    if (dragRef.current.dragging) {
      const dx = e.clientX - dragRef.current.lastX
      const dy = e.clientY - dragRef.current.lastY
      rotRef.current.y += dx * 0.005
      rotRef.current.x += dy * 0.005
      rotRef.current.x = Math.max(-1.2, Math.min(1.2, rotRef.current.x))
      dragRef.current.lastX = e.clientX
      dragRef.current.lastY = e.clientY
    }
  }

  function handleMouseUp(e) {
    if (!dragRef.current.dragging) return
    dragRef.current.dragging = false
    // Check click on country
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width)
    const my = (e.clientY - rect.top) * (canvas.height / rect.height)
    const size = canvas.width

    COUNTRIES.forEach(country => {
      if (!availableCountries.includes(country.name)) return
      const p = latLngTo3D(country.lat, country.lng, 1.02)
      const proj = project(p, rotRef.current.x, rotRef.current.y, size)
      if (!proj.visible) return
      const dx = proj.x - mx, dy = proj.y - my
      if (Math.sqrt(dx*dx + dy*dy) < 12) {
        onSelectCountry(country.name === selectedCountry ? null : country.name)
      }
    })
  }

  function handleTouchStart(e) {
    const t = e.touches[0]
    dragRef.current = { dragging: true, lastX: t.clientX, lastY: t.clientY }
  }

  function handleTouchMove(e) {
    if (!dragRef.current.dragging) return
    const t = e.touches[0]
    const dx = t.clientX - dragRef.current.lastX
    const dy = t.clientY - dragRef.current.lastY
    rotRef.current.y += dx * 0.005
    rotRef.current.x += dy * 0.005
    rotRef.current.x = Math.max(-1.2, Math.min(1.2, rotRef.current.x))
    dragRef.current.lastX = t.clientX
    dragRef.current.lastY = t.clientY
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <canvas
        ref={canvasRef}
        width={480} height={480}
        style={{ width: '100%', maxWidth: '480px', cursor: 'grab', borderRadius: '50%' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { dragRef.current.dragging = false; setHovered(null) }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => { dragRef.current.dragging = false }}
      />
      <div style={{ color: 'var(--gray)', fontSize: '13px', fontFamily: 'var(--font-sub)' }}>
        🖱️ Faites tourner le globe • Cliquez sur un pays doré pour filtrer
      </div>
      {selectedCountry && (
        <button
          onClick={() => onSelectCountry(null)}
          className="btn btn-outline btn-sm"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '1px', fontSize: '11px' }}
        >
          ✕ Retirer le filtre — {selectedCountry}
        </button>
      )}
    </div>
  )
}
