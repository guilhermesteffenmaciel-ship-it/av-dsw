// Layout compartilhado das telas de login e cadastro: painel holográfico + formulário de vidro.
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

export default function AuthLayout({ rotulo, titulo, subtitulo, children }) {
  const raiz = useRef(null);

  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.auth-entrar', { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
      gsap.from('.auth-planeta', { scale: 0.5, opacity: 0, rotate: -40, duration: 1.6, ease: 'expo.out' });
    });
  }, { scope: raiz });

  return (
    <div ref={raiz} className="grid min-h-svh items-center px-4 pb-10 pt-24 lg:grid-cols-2 lg:gap-10">
      <div className="relative hidden h-full min-h-[34rem] items-end justify-center lg:flex">
        <div className="auth-planeta absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 animate-float rounded-full bg-[radial-gradient(circle_at_30%_25%,#a5f3fc,#22d3ee_25%,#7c3aed_60%,#0b0a2a)] shadow-[0_0_120px_-10px] shadow-neon-cyan/60" />
          <div className="absolute -inset-10 animate-spin-slow rounded-full border border-dashed border-white/15">
            <span className="absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-amber shadow-[0_0_14px] shadow-neon-amber" />
          </div>
          <div className="absolute -inset-24 animate-spin-slow rounded-full border border-white/5 [animation-direction:reverse] [animation-duration:70s]">
            <span className="absolute bottom-[14%] right-[6%] size-2 rounded-full bg-neon-pink shadow-[0_0_10px] shadow-neon-pink" />
          </div>
        </div>
        <div className="auth-entrar glass relative z-10 mb-4 max-w-md rounded-3xl p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan">// transmissão recebida</p>
          <p className="mt-2 font-display text-2xl font-bold text-white">Sua mesa garantida, sem fila e sem ligação.</p>
          <p className="mt-2 text-sm text-slate-400">Escolha o dia, o horário e quantas pessoas vão. O sistema mostra as mesas livres e confirma na hora.</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="auth-entrar glass spotlight relative overflow-hidden rounded-[2rem] bg-space-900/50 p-7 shadow-[0_0_80px_-30px] shadow-neon-violet sm:p-9">
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-neon-violet to-transparent" />
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan">{rotulo}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white">{titulo}</h1>
          <p className="mt-1.5 text-sm text-slate-400">{subtitulo}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
