// Inclinação 3D de um elemento conforme a posição do mouse (efeito "holograma").
import { useRef } from 'react';

export function useTilt(intensidade = 10) {
  const ref = useRef(null);

  function onPointerMove(e) {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * intensidade}deg) rotateY(${x * intensidade}deg) translateZ(0)`;
  }

  function onPointerLeave() {
    if (ref.current) ref.current.style.transform = '';
  }

  return { ref, onPointerMove, onPointerLeave };
}
