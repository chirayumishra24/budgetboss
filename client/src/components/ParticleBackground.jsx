import React, { useEffect, useRef } from 'react';

export const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const c = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Financial symbols
    const symbols = ['₹', '📈', '💰', '🏦', '📊', '⬆', '⬇', '%'];

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.size = Math.random() * 16 + 10;
        this.speed = Math.random() * 0.4 + 0.15;
        this.opacity = Math.random() * 0.15 + 0.03;
        this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.01 + 0.005;
      }
      update() {
        this.y -= this.speed;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.3;
        if (this.y < -30) this.reset();
      }
      draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.font = `${this.size}px Inter, sans-serif`;
        c.fillText(this.symbol, this.x, this.y);
        c.restore();
      }
    }

    // Also draw floating connection lines
    class Line {
      constructor() {
        this.reset();
      }
      reset() {
        this.x1 = Math.random() * canvas.width;
        this.y1 = Math.random() * canvas.height;
        this.length = Math.random() * 80 + 40;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.002 + 0.001;
        this.opacity = Math.random() * 0.06 + 0.02;
      }
      update() {
        this.angle += this.speed;
      }
      draw() {
        const x2 = this.x1 + Math.cos(this.angle) * this.length;
        const y2 = this.y1 + Math.sin(this.angle) * this.length;
        c.save();
        c.globalAlpha = this.opacity;
        c.strokeStyle = '#38bdf8';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(this.x1, this.y1);
        c.lineTo(x2, y2);
        c.stroke();
        
        // Small dot at endpoint
        c.fillStyle = '#38bdf8';
        c.beginPath();
        c.arc(x2, y2, 2, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    for (let i = 0; i < 25; i++) {
      const p = new Particle();
      p.y = Math.random() * canvas.height; // scatter initially
      particles.push(p);
    }
    const lines = [];
    for (let i = 0; i < 12; i++) lines.push(new Line());

    const loop = () => {
      c.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      lines.forEach(l => { l.update(); l.draw(); });
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};
