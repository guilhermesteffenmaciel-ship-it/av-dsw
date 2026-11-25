// Halo luminoso que segue o cursor (somente em dispositivos com mouse).
import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const el = ref.current;
    let x = 0, y = 0, alvoX = 0, alvoY = 0, frame;
    const mover = (e) => { alvoX = e.clientX; alvoY = e.clientY; el.style.opacity = '1'; };
    const animar = () => {
      x += (alvoX - x) * 0.15;
      y += (alvoY - y) * 0.15;
      el.style.transform = `translate3d(${x - 200}px, ${y - 200}px, 0)`;
      frame = requestAnimationFrame(animar);
    };
    window.addEventListener('pointermove', mover);
    animar();
    return () => { window.removeEventListener('pointermove', mover); cancelAnimationFrame(frame); };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 size-[400px] rounded-full opacity-0 mix-blend-screen transition-opacity duration-500"
      style={{ background: 'radial-gradient(circle, rgb(139 92 246 / 0.13), transparent 65%)' }}
    />
  );
}
