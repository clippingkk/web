'use client'

import { useEffect, useRef } from 'react'

// Light particle class
class Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  alpha: number

  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D | null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.size = Math.random() * 2 + 0.5
    this.speedX = (Math.random() - 0.5) * 0.5
    this.speedY = (Math.random() - 0.5) * 0.5

    // Create colors between cyan, purple, and blue
    const hue = Math.random() * 60 + 220 // Range between 220-280 (blue to purple)
    this.color = `hsl(${hue}, 80%, 50%)`
    this.alpha = Math.random() * 0.5 + 0.1
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY

    // Wrap around the screen
    if (this.x < 0) this.x = this.canvas.width
    if (this.x > this.canvas.width) this.x = 0
    if (this.y < 0) this.y = this.canvas.height
    if (this.y > this.canvas.height) this.y = 0
  }

  draw() {
    if (!this.ctx) return
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    this.ctx.fillStyle = this.color
    this.ctx.globalAlpha = this.alpha
    this.ctx.fill()
  }
}

// Moving Lights Canvas Component
function MovingLightsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas to full screen size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particles: Particle[] = []
    const particleCount = Math.min(
      70,
      Math.floor((window.innerWidth * window.innerHeight) / 15000)
    )

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas))
    }

    function connectParticles() {
      const maxDistance = 150
      if (!ctx) return

      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x
          const dy = particles[a].y - particles[b].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance
            ctx.beginPath()
            ctx.strokeStyle = `rgba(100, 150, 255, ${opacity * 0.15})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[a].x, particles[a].y)
            ctx.lineTo(particles[b].x, particles[b].y)
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      connectParticles()
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className='pointer-events-none absolute top-0 left-0 z-0 h-full w-full'
    />
  )
}

export default MovingLightsBackground
