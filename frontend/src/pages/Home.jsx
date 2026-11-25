// Landing page pública com animações guiadas pelo scroll (GSAP + ScrollTrigger).
//
// Seções:
//  1. HERO        -> parallax: título, planeta e "chips" se movem em velocidades diferentes
//  2. ÓRBITA      -> seção fixada (pin): os anéis de mesas giram conforme o scroll e os passos mudam
//  3. COLISÃO     -> demonstra a REGRA DE NEGÓCIO: duas reservas na mesma mesa/horário -> 409
//  4. STACK       -> rolagem horizontal com as tecnologias do projeto
//  5. CTA         -> contadores animados + botão com efeito "warp"
//
// Quem prefere menos movimento (prefers-reduced-motion) vê a página estática.
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dispararWarp } from '../components/cosmos/CosmicBackground';
import { useAuth } from '../context/AuthContext';
import { useTilt } from '../hooks/useTilt';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PASSOS = [
  { n: '01', titulo: 'Escolha o momento', texto: 'Data, horário de chegada e quantas pessoas vão. Cada reserva ocupa a mesa por 2 horas.' },
  { n: '02', titulo: 'Veja as mesas livres', texto: 'O sistema consulta a API em tempo real e mostra quais mesas comportam o grupo naquele horário.' },
  { n: '03', titulo: 'Confirme e pronto', texto: 'A reserva é gravada no PostgreSQL e protegida por JWT. Só você (ou o admin) pode alterá-la.' },
];

// Mesas distribuídas em 3 anéis orbitais (ângulo em graus)
const ANEIS = [
  { tamanho: '42%', mesas: [{ n: 1, a: 20 }, { n: 2, a: 200 }] },
  { tamanho: '68%', mesas: [{ n: 3, a: 90 }, { n: 4, a: 230 }, { n: 5, a: 330 }] },
  { tamanho: '94%', mesas: [{ n: 6, a: 0 }, { n: 7, a: 120 }, { n: 8, a: 250 }] },
];

const STACK = [
  { nome: 'Node.js + Express 5', versao: 'arquitetura MVC', cor: 'from-neon-green', desc: 'API REST em camadas: rotas, controllers, services e models.' },
  { nome: 'Prisma ORM', versao: 'v7.10.0', cor: 'from-neon-cyan', desc: 'Schema, migrations versionadas e driver adapter do PostgreSQL.' },
  { nome: 'PostgreSQL', versao: 'v16', cor: 'from-sky-400', desc: 'Banco relacional: usuários, mesas e reservas com relacionamentos.' },
  { nome: 'JWT + bcrypt', versao: 'autenticação', cor: 'from-neon-amber', desc: 'Senhas com hash e token assinado protegendo cada rota.' },
  { nome: 'React', versao: 'v19', cor: 'from-neon-violet', desc: 'Componentes, Context API e rotas protegidas com React Router.' },
  { nome: 'Tailwind CSS', versao: 'v4.3.0', cor: 'from-neon-pink', desc: 'Tema próprio com @theme, utilitários customizados e responsividade.' },
  { nome: 'GSAP ScrollTrigger', versao: 'v3.15', cor: 'from-lime-400', desc: 'As animações guiadas pelo scroll que você está vendo agora.' },
];

const TERMINAL = [
  { cor: 'text-slate-400', linhas: ['$ aguardando requisição...'] },
  {
    cor: 'text-neon-red',
    linhas: [
      'POST /api/reservas  { mesaId: 2, inicio: "20:00" }',
      '← 409 Conflict',
      '"A mesa 2 já está reservada entre 19:00 e 21:00."',
    ],
  },
  {
    cor: 'text-neon-green',
    linhas: ['POST /api/reservas  { mesaId: 2, inicio: "21:00" }', '← 201 Created', '"Reserva confirmada na mesa 2!"'],
  },
];

function CartaoStack({ item }) {
  const tilt = useTilt(12);
  return (
    <div
      {...tilt}
      className="stack-card glass spotlight group relative flex h-72 w-[78vw] max-w-sm shrink-0 flex-col justify-between overflow-hidden rounded-3xl p-7 transition-transform duration-200 will-change-transform sm:w-96"
    >
      <div className={`absolute -right-16 -top-16 size-48 rounded-full bg-linear-to-br ${item.cor} to-transparent opacity-25 blur-2xl transition group-hover:opacity-50`} />
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500">{item.versao}</span>
      <div>
        <h3 className="font-display text-2xl font-bold text-white">{item.nome}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const raiz = useRef(null);
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [passo, setPasso] = useState(0);
  const [estadoTerminal, setEstadoTerminal] = useState(0);
  const passoRef = useRef(0);
  const terminalRef = useRef(0);

  function decolar() {
    dispararWarp(1200);
    setTimeout(() => navigate(usuario ? '/reservas' : '/cadastro'), 750);
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // ---------- 1. HERO: entrada ----------
        gsap.from('.hero-palavra', { yPercent: 110, opacity: 0, rotate: 4, duration: 1.1, stagger: 0.08, ease: 'expo.out', delay: 0.15 });
        gsap.from('.hero-fade', { y: 24, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', delay: 0.6 });
        gsap.from('.hero-planeta', { scale: 0.6, opacity: 0, duration: 1.8, ease: 'expo.out', delay: 0.2 });

        // HERO: parallax (cada camada com uma velocidade, controlada pelo scroll)
        const heroScroll = { trigger: '.secao-hero', start: 'top top', end: 'bottom top', scrub: true };
        gsap.to('.hero-texto', { yPercent: -35, opacity: 0, ease: 'none', scrollTrigger: heroScroll });
        gsap.to('.hero-planeta', { yPercent: 45, scale: 1.25, rotate: 25, ease: 'none', scrollTrigger: heroScroll });
        gsap.utils.toArray('[data-velocidade]').forEach((el) => {
          gsap.to(el, { y: () => -window.innerHeight * Number(el.dataset.velocidade), ease: 'none', scrollTrigger: heroScroll });
        });

        // ---------- 2. ÓRBITA: pin + rotação dos anéis ----------
        const tlOrbita = gsap.timeline({
          scrollTrigger: {
            trigger: '.secao-orbita',
            start: 'top top',
            end: '+=250%',
            scrub: 1,
            pin: true,
            onUpdate: (self) => {
              const indice = Math.min(PASSOS.length - 1, Math.floor(self.progress * PASSOS.length));
              if (indice !== passoRef.current) {
                passoRef.current = indice;
                setPasso(indice);
              }
            },
          },
        });
        tlOrbita
          .to('.anel-0', { rotate: 360, ease: 'none' }, 0)
          .to('.contra-0', { rotate: -360, ease: 'none' }, 0)
          .to('.anel-1', { rotate: -240, ease: 'none' }, 0)
          .to('.contra-1', { rotate: 240, ease: 'none' }, 0)
          .to('.anel-2', { rotate: 160, ease: 'none' }, 0)
          .to('.contra-2', { rotate: -160, ease: 'none' }, 0)
          .fromTo('.orbita-progresso', { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
          .fromTo('.orbita-sistema', { scale: 0.85 }, { scale: 1.05, ease: 'none' }, 0);

        // ---------- 3. COLISÃO: a regra de negócio animada ----------
        const tlColisao = gsap.timeline({
          scrollTrigger: {
            trigger: '.secao-colisao',
            start: 'top top',
            end: '+=220%',
            scrub: 1,
            pin: true,
            onUpdate: (self) => {
              const p = self.progress;
              const estado = p < 0.28 ? 0 : p < 0.62 ? 1 : 2;
              if (estado !== terminalRef.current) {
                terminalRef.current = estado;
                setEstadoTerminal(estado);
              }
            },
          },
        });
        tlColisao
          .fromTo('.barra-maria', { clipPath: 'inset(0 100% 0 0 round 12px)' }, { clipPath: 'inset(0 0% 0 0 round 12px)', duration: 0.6, ease: 'power2.out' })
          // João tenta 20:00 -> sobrepõe
          .fromTo('.barra-joao', { left: '110%' }, { left: '33.333%', duration: 1, ease: 'power2.inOut' })
          .to('.zona-conflito', { opacity: 1, duration: 0.25 }, '<0.8')
          .to('.barra-joao', { backgroundColor: 'rgb(251 113 133 / 0.35)', borderColor: 'rgb(251 113 133)', duration: 0.2 }, '<')
          .to('.barra-joao', { x: -8, duration: 0.05, repeat: 5, yoyo: true }, '>')
          .to({}, { duration: 0.4 }) // pausa dramática
          // João desloca para 21:00 -> aceito
          .to('.zona-conflito', { opacity: 0, duration: 0.2 })
          .to('.barra-joao', { left: '50%', x: 0, duration: 0.9, ease: 'power2.inOut' }, '<')
          .to('.barra-joao', { backgroundColor: 'rgb(52 211 153 / 0.3)', borderColor: 'rgb(52 211 153)', duration: 0.2 })
          .from('.selo-ok', { scale: 0, opacity: 0, duration: 0.3, ease: 'back.out(3)' })
          .to({}, { duration: 0.4 });

        // ---------- 4. STACK: rolagem horizontal ----------
        const trilho = document.querySelector('.stack-trilho');
        const distancia = () => Math.max(0, trilho.scrollWidth - window.innerWidth + 48);
        gsap.to(trilho, {
          x: () => -distancia(),
          ease: 'none',
          scrollTrigger: { trigger: '.secao-stack', start: 'top top', end: () => `+=${distancia()}`, scrub: 1, pin: true, invalidateOnRefresh: true },
        });

        // ---------- 5. Contadores + entrada dos blocos ----------
        gsap.utils.toArray('.contador').forEach((el) => {
          const alvo = Number(el.dataset.alvo);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: alvo,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
            onUpdate: () => { el.textContent = Math.round(obj.v) + (el.dataset.sufixo || ''); },
          });
        });
        gsap.utils.toArray('.revelar').forEach((el) => {
          gsap.from(el, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
        });
      });

      // Sem animações: mostra a cena final da regra (reserva aceita às 21h)
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('.barra-joao', { left: '50%', backgroundColor: 'rgb(52 211 153 / 0.3)', borderColor: 'rgb(52 211 153)' });
        setEstadoTerminal(2);
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  const titulo = ['Sua', 'mesa,', 'em', 'órbita.'];

  return (
    <div ref={raiz} className="overflow-x-clip">
      {/* ================= 1. HERO ================= */}
      <section className="secao-hero relative flex min-h-svh items-center px-4 pb-16 pt-28">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hero-texto relative z-10">
            <p className="hero-fade inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
              <span className="size-1.5 animate-pulse rounded-full bg-neon-cyan shadow-[0_0_8px] shadow-neon-cyan" />
              Sistema online<span className="hidden sm:inline"> · reservas em tempo real</span>
            </p>
            <h1 className="mt-6 font-display text-6xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
              {titulo.map((p, i) => (
                <span key={p} className="mr-[0.22em] inline-block overflow-hidden pb-2 align-bottom">
                  <span className={`hero-palavra inline-block ${i >= 2 ? 'text-gradient' : ''}`}>{p}</span>
                </span>
              ))}
            </h1>
            <p className="hero-fade mt-6 max-w-lg text-lg leading-relaxed text-slate-400">
              Reserve mesas em segundos. Escolha o horário, veja o que está livre e garanta seu lugar.
              <span className="text-slate-200"> Sem ligações, sem papel, sem reservas em dobro.</span>
            </p>
            <div className="hero-fade mt-9 flex flex-wrap items-center gap-3">
              <button
                onClick={decolar}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-7 py-3.5 font-semibold text-space-950 transition hover:shadow-[0_0_50px] hover:shadow-neon-cyan/50"
              >
                <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-neon-cyan via-neon-violet to-neon-pink transition duration-500 group-hover:translate-x-0" />
                <span className="relative transition group-hover:text-white">{usuario ? 'Ir para minhas reservas' : 'Reservar uma mesa'}</span>
                <span className="relative transition group-hover:translate-x-1 group-hover:text-white">→</span>
              </button>
              <a href="#orbita" className="rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-slate-300 transition hover:border-white/40 hover:text-white">
                Como funciona
              </a>
            </div>
          </div>

          {/* Planeta + chips flutuantes (camadas de parallax) */}
          <div className="relative mx-auto aspect-square w-full max-w-[30rem]">
            <div className="hero-planeta absolute inset-[12%]">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_28%,#fde68a_0%,#f472b6_30%,#7c3aed_62%,#1e1b4b_100%)] shadow-[0_0_120px_-10px] shadow-neon-violet/70" />
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_70%_75%,transparent_45%,rgb(4_5_13/0.75)_75%)]" />
              {/* anel do planeta */}
              <div className="absolute -inset-x-[22%] inset-y-[38%] rounded-[50%] border-2 border-neon-cyan/50 [transform:rotate(-18deg)] shadow-[0_0_30px] shadow-neon-cyan/30" />
              {/* lua orbitando */}
              <div className="absolute -inset-[18%] animate-spin-slow">
                <span className="absolute left-1/2 top-0 size-5 rounded-full bg-slate-200 shadow-[0_0_20px] shadow-white/60" />
              </div>
            </div>
            <div data-velocidade="0.35" className="glass absolute left-0 top-[14%] rounded-2xl px-4 py-3 shadow-xl">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Mesa 04 · Varanda</p>
              <p className="mt-0.5 flex items-center gap-2 text-sm font-semibold text-neon-green"><span className="size-2 rounded-full bg-neon-green" />Livre às 20:00</p>
            </div>
            <div data-velocidade="0.6" className="glass absolute bottom-[12%] right-0 rounded-2xl px-4 py-3 shadow-xl">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Reserva #128</p>
              <p className="mt-0.5 text-sm font-semibold text-white">👥 4 pessoas · 19:30</p>
            </div>
            <div data-velocidade="0.15" className="glass absolute bottom-[30%] left-[-4%] rounded-xl px-3 py-2 font-mono text-[11px] text-neon-amber shadow-xl">
              JWT ✓ autenticado
            </div>
          </div>
        </div>

        <a href="#orbita" className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500 hover:text-white">
          Role
          <span className="flex h-9 w-5 justify-center rounded-full border border-white/20 pt-1.5">
            <span className="h-2 w-0.5 animate-bounce rounded-full bg-neon-cyan" />
          </span>
        </a>
      </section>

      {/* ================= 2. ÓRBITA ================= */}
      <section id="orbita" className="secao-orbita relative flex min-h-svh items-center px-4 py-20">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan">// como funciona</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">Cada mesa é um planeta. <span className="text-gradient">Você escolhe a órbita.</span></h2>
            <ol className="mt-8 space-y-3">
              {PASSOS.map((p, i) => (
                <li
                  key={p.n}
                  className={`rounded-2xl border p-4 transition duration-500 ${
                    passo === i ? 'glass border-neon-cyan/40 shadow-[0_0_40px_-12px] shadow-neon-cyan/40' : 'border-transparent opacity-40'
                  }`}
                >
                  <div className="flex items-baseline gap-4">
                    <span className={`font-mono text-sm ${passo === i ? 'text-neon-cyan' : 'text-slate-500'}`}>{p.n}</span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white">{p.titulo}</h3>
                      <p className={`overflow-hidden text-sm text-slate-400 transition-all duration-500 ${passo === i ? 'mt-1 max-h-24' : 'max-h-0'}`}>{p.texto}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 h-px w-full overflow-hidden bg-white/10">
              <div className="orbita-progresso h-full origin-left bg-linear-to-r from-neon-cyan to-neon-violet" />
            </div>
          </div>

          <div className="orbita-sistema relative mx-auto aspect-square w-full max-w-[32rem]">
            {/* núcleo: o restaurante */}
            <div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle,#fde68a,#f59e0b_55%,#b45309)] text-3xl shadow-[0_0_80px_10px] shadow-neon-amber/40">
              🍽️
            </div>
            {ANEIS.map((anel, i) => (
              <div
                key={i}
                className={`anel-${i} absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/15`}
                style={{ width: anel.tamanho, height: anel.tamanho }}
              >
                {anel.mesas.map((m) => (
                  <div key={m.n} className="absolute inset-0" style={{ transform: `rotate(${m.a}deg)` }}>
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                      <div style={{ transform: `rotate(${-m.a}deg)` }}>
                        <div className={`contra-${i}`}>
                          <div className="glass grid size-12 place-items-center rounded-full border-white/20 font-mono text-xs font-bold text-white shadow-[0_0_24px_-4px] shadow-neon-violet/60 sm:size-14">
                            M{m.n}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 3. COLISÃO (regra de negócio) ================= */}
      <section className="secao-colisao relative flex min-h-svh items-center px-4 py-20">
        <div className="bg-grid absolute inset-0 -z-10" />
        <div className="mx-auto w-full max-w-5xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-pink">// protocolo anti-colisão</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold text-white sm:text-5xl">
            Duas reservas na mesma mesa e no mesmo horário? <span className="text-gradient">Impossível.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-slate-400">
            Antes de gravar, o backend verifica se o novo intervalo cruza com alguma reserva confirmada da mesma mesa:
            <code className="mx-1 rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-neon-cyan">existente.inicio &lt; novo.fim && existente.fim &gt; novo.inicio</code>
          </p>

          {/* linha do tempo da mesa 2 */}
          <div className="glass mt-10 overflow-hidden rounded-3xl p-5 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display font-semibold text-white">Mesa 2 · Salão</span>
              <span className="font-mono text-xs text-slate-500">sex · 20/12</span>
            </div>
            <div className="relative h-36">
              {/* marcações de hora */}
              <div className="absolute inset-x-0 bottom-0 flex justify-between font-mono text-[10px] text-slate-500">
                {['18h', '19h', '20h', '21h', '22h', '23h', '00h'].map((h) => <span key={h} className="w-0 whitespace-nowrap text-center">{h}</span>)}
              </div>
              <div className="absolute inset-x-0 bottom-5 top-0 grid grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="border-l border-white/5 last:border-r" />)}
              </div>
              <div className="zona-conflito absolute bottom-5 top-0 bg-[repeating-linear-gradient(135deg,rgb(251_113_133/0.25)_0_8px,transparent_8px_16px)] opacity-0" style={{ left: '33.333%', width: '16.667%' }} />
              <div className="barra-maria absolute top-3 flex h-11 items-center rounded-xl border border-neon-violet bg-neon-violet/30 px-3 text-xs font-medium text-white shadow-[0_0_24px_-6px] shadow-neon-violet" style={{ left: '16.667%', width: '33.333%' }}>
                Maria · 19h–21h
              </div>
              <div className="barra-joao absolute top-16 flex h-11 items-center gap-2 rounded-xl border border-neon-cyan bg-neon-cyan/20 px-3 text-xs font-medium text-white" style={{ left: '110%', width: '33.333%' }}>
                João · 2h
                <span className="selo-ok ml-auto rounded-full bg-neon-green px-1.5 font-mono text-[10px] text-space-950">OK</span>
              </div>
            </div>
          </div>

          {/* terminal com a resposta da API */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-space-950/80 font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-neon-red/70" />
              <span className="size-2.5 rounded-full bg-neon-amber/70" />
              <span className="size-2.5 rounded-full bg-neon-green/70" />
              <span className="ml-3 text-[11px] text-slate-500">reservaService.js</span>
            </div>
            <div className={`min-h-28 space-y-1 p-4 ${TERMINAL[estadoTerminal].cor}`} aria-live="polite">
              {TERMINAL[estadoTerminal].linhas.map((l) => <p key={l} className="break-words">{l}</p>)}
              <span className="inline-block h-4 w-2 animate-pulse bg-current align-middle" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. STACK (scroll horizontal) ================= */}
      <section className="secao-stack relative flex min-h-svh flex-col justify-center overflow-hidden py-20">
        <div className="mx-auto w-full max-w-6xl px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-violet">// tecnologia de bordo</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">Construído com uma <span className="text-gradient">stack moderna</span>.</h2>
        </div>
        <div className="stack-trilho mt-12 flex w-max gap-5 px-4 sm:px-[max(1rem,calc((100vw-72rem)/2+1rem))]">
          {STACK.map((item) => <CartaoStack key={item.nome} item={item} />)}
        </div>
      </section>

      {/* ================= 5. NÚMEROS + CTA ================= */}
      <section className="relative px-4 pb-20 pt-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { alvo: 2, sufixo: 'h', rotulo: 'de mesa garantida por reserva' },
            { alvo: 0, sufixo: '', rotulo: 'reservas sobrepostas possíveis' },
            { alvo: 6, sufixo: '', rotulo: 'regras de negócio no backend' },
            { alvo: 15, sufixo: '', rotulo: 'rotas REST documentadas' },
          ].map((n) => (
            <div key={n.rotulo} className="revelar glass spotlight rounded-3xl p-6">
              <p className="contador font-display text-5xl font-bold text-white" data-alvo={n.alvo} data-sufixo={n.sufixo}>{n.alvo}{n.sufixo}</p>
              <p className="mt-2 text-sm text-slate-400">{n.rotulo}</p>
            </div>
          ))}
        </div>

        <div className="revelar relative mx-auto mt-24 max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/10 px-6 py-20 text-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgb(139_92_246/0.35),transparent_60%),radial-gradient(ellipse_at_bottom,rgb(34_211_238/0.2),transparent_60%)]" />
          <div className="bg-grid absolute inset-0 -z-10" />
          <h2 className="font-display text-4xl font-bold text-white sm:text-6xl">Pronto para <span className="text-gradient">decolar?</span></h2>
          <p className="mx-auto mt-4 max-w-md text-slate-400">Crie sua conta grátis e faça a primeira reserva em menos de um minuto.</p>
          <button
            onClick={decolar}
            className="group mt-9 inline-flex items-center gap-3 rounded-full bg-linear-to-r from-neon-cyan via-neon-violet to-neon-pink p-[2px] transition hover:shadow-[0_0_60px] hover:shadow-neon-violet/60"
          >
            <span className="rounded-full bg-space-950 px-8 py-4 font-semibold text-white transition group-hover:bg-transparent">
              🚀 {usuario ? 'Ir para minhas reservas' : 'Iniciar decolagem'}
            </span>
          </button>
        </div>
      </section>

      <footer className="border-t border-white/5 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 font-mono text-[11px] text-slate-500 sm:flex-row">
          <span>Órbita.Reservas · DSW · AV1 &amp; AV2</span>
          <span>
            <Link to="/login" className="hover:text-white">Entrar</Link> · <Link to="/cadastro" className="hover:text-white">Criar conta</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
