// Atualiza as variáveis CSS --mx e --my do elemento ".spotlight" sob o cursor,
// para o brilho radial acompanhar o mouse (veja @utility spotlight no index.css).
import { useEffect } from 'react';

export function useSpotlight() {
  useEffect(() => {
    const mover = (e) => {
      const alvo = e.target instanceof Element ? e.target.closest('.spotlight') : null;
      if (!alvo) return;
      const r = alvo.getBoundingClientRect();
      alvo.style.setProperty('--mx', `${e.clientX - r.left}px`);
      alvo.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    window.addEventListener('pointermove', mover);
    return () => window.removeEventListener('pointermove', mover);
  }, []);
}
