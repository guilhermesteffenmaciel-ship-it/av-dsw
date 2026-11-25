// Fundo cósmico animado desenhado em <canvas>.
//  - Estrelas em 3 dimensões: as mais "próximas" (z pequeno) são maiores e se movem mais
//    -> isso cria o efeito PARALLAX com o mouse e com o scroll.
//  - Estrelas cadentes aparecem de vez em quando.
//  - Ao receber o evento "cosmos:warp", as estrelas viram riscos (salto para a velocidade da luz).
// Respeita "prefers-reduced-motion": nesse caso desenha um céu estático.
import { useEffect, useRef } from 'react';

const CORES = ['#ffffff', '#c4b5fd', '#a5f3fc', '#fbcfe8', '#fde68a'];

export function dispararWarp(duracaoMs = 1100) {
  window.dispatchEvent(new CustomEvent('cosmos:warp', { detail: duracaoMs }));
}

export default function CosmicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let largura = 0;
    let altura = 0;
    let estrelas = [];
    let cadentes = [];
    let frame = 0;
    let warpAte = 0;
    let velocidade = 0.15; // velocidade atual de "viagem" (aumenta no warp)
    const mouse = { x: 0, y: 0, alvoX: 0, alvoY: 0 };

    function criarEstrelas() {
      largura = window.innerWidth;
      altura = window.innerHeight;
      canvas.width = largura * dpr;
      canvas.height = altura * dpr;
      canvas.style.width = `${largura}px`;
      canvas.style.height = `${altura}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const quantidade = Math.min(420, Math.floor((largura * altura) / 3800));
      estrelas = Array.from({ length: quantidade }, () => novaEstrela(true));
    }

    function novaEstrela(inicial) {
      return {
        x: (Math.random() - 0.5) * largura * 2,
        y: (Math.random() - 0.5) * altura * 2,
        z: inicial ? Math.random() * 1000 + 1 : 1000, // profundidade
        cor: CORES[Math.floor(Math.random() * CORES.length)],
        brilho: Math.random() * Math.PI * 2,
      };
    }

    function desenhar() {
      const warp = performance.now() < warpAte;
      // acelera/desacelera suavemente
      velocidade += ((warp ? 28 : 0.15) - velocidade) * (warp ? 0.08 : 0.05);
      mouse.x += (mouse.alvoX - mouse.x) * 0.05;
      mouse.y += (mouse.alvoY - mouse.y) * 0.05;

      // no warp deixamos "rastro" (fundo semitransparente)
      ctx.fillStyle = velocidade > 2 ? 'rgba(4,5,13,0.25)' : 'rgba(4,5,13,1)';
      ctx.fillRect(0, 0, largura, altura);

      const cx = largura / 2;
      const cy = altura / 2;
      const scroll = window.scrollY;

      for (const e of estrelas) {
        const zAnterior = e.z;
        e.z -= velocidade;
        if (e.z < 1) Object.assign(e, novaEstrela(false));

        const escala = 400 / e.z; // perspectiva
        // parallax: estrelas próximas se deslocam mais com o mouse e com o scroll
        const px = cx + e.x * escala * 0.5 - mouse.x * escala * 6;
        const py = cy + e.y * escala * 0.5 - mouse.y * escala * 6;
        // scroll: estrelas próximas sobem mais rápido; "dá a volta" quando sai da tela
        const faixa = altura * 1.4;
        const yWrap = (((py - scroll * escala * 0.06 + altura * 0.2) % faixa) + faixa) % faixa - altura * 0.2;
        if (px < -20 || px > largura + 20) continue;

        e.brilho += 0.03;
        const raio = Math.max(0.3, 1.6 * escala * 0.35);
        const alpha = Math.min(1, (1 - e.z / 1000) * 1.4) * (0.65 + Math.sin(e.brilho) * 0.35);

        ctx.globalAlpha = alpha;
        if (velocidade > 2) {
          // risco do warp: liga a posição anterior à atual
          const escalaAnt = 400 / zAnterior;
          const ax = cx + e.x * escalaAnt * 0.5 - mouse.x * escalaAnt * 6;
          const ay = cy + e.y * escalaAnt * 0.5 - mouse.y * escalaAnt * 6;
          ctx.strokeStyle = e.cor;
          ctx.lineWidth = raio;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          ctx.fillStyle = e.cor;
          ctx.beginPath();
          ctx.arc(px, yWrap, raio, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // estrelas cadentes
      if (!reduzido && Math.random() < 0.006 && cadentes.length < 2) {
        cadentes.push({ x: Math.random() * largura, y: Math.random() * altura * 0.5, vida: 1, vx: 9 + Math.random() * 6, vy: 3 + Math.random() * 3 });
      }
      cadentes = cadentes.filter((c) => c.vida > 0);
      for (const c of cadentes) {
        const grad = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * 10, c.y - c.vy * 10);
        grad.addColorStop(0, 'rgba(255,255,255,0.9)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = c.vida;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.vx * 10, c.y - c.vy * 10);
        ctx.stroke();
        c.x += c.vx;
        c.y += c.vy;
        c.vida -= 0.012;
      }
      ctx.globalAlpha = 1;

      if (!reduzido) frame = requestAnimationFrame(desenhar);
    }

    const aoMoverMouse = (ev) => {
      mouse.alvoX = (ev.clientX / largura - 0.5) * 2;
      mouse.alvoY = (ev.clientY / altura - 0.5) * 2;
    };
    const aoWarp = (ev) => {
      warpAte = performance.now() + (ev.detail || 1100);
    };

    criarEstrelas();
    desenhar();
    window.addEventListener('resize', criarEstrelas);
    window.addEventListener('pointermove', aoMoverMouse);
    window.addEventListener('cosmos:warp', aoWarp);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', criarEstrelas);
      window.removeEventListener('pointermove', aoMoverMouse);
      window.removeEventListener('cosmos:warp', aoWarp);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* nebulosas (manchas de cor desfocadas) */}
      <div className="absolute -left-40 top-[-10%] size-[42rem] rounded-full bg-neon-violet/20 blur-[140px] animate-pulse-glow" />
      <div className="absolute -right-40 top-[30%] size-[36rem] rounded-full bg-neon-cyan/10 blur-[140px]" />
      <div className="absolute bottom-[-20%] left-[25%] size-[40rem] rounded-full bg-neon-pink/10 blur-[160px]" />
    </div>
  );
}
