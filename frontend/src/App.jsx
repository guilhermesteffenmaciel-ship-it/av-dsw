// Definição das rotas (páginas) da aplicação + camadas visuais globais (fundo cósmico e cursor).
import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import CosmicBackground from './components/cosmos/CosmicBackground';
import CursorGlow from './components/cosmos/CursorGlow';
import Navbar from './components/Navbar';
import RotaProtegida from './components/RotaProtegida';
import { useSpotlight } from './hooks/useSpotlight';
import Cadastro from './pages/Cadastro';
import Home from './pages/Home';
import Login from './pages/Login';
import Mesas from './pages/Mesas';
import NaoEncontrada from './pages/NaoEncontrada';
import Reservas from './pages/Reservas';

// Volta ao topo sempre que a página muda
function RolarParaTopo() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  useSpotlight();

  return (
    <div className="relative min-h-svh">
      <CosmicBackground />
      <CursorGlow />
      <RolarParaTopo />
      <Navbar />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Páginas que exigem login */}
          <Route element={<RotaProtegida />}>
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/mesas" element={<Mesas />} />
          </Route>

          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </main>
    </div>
  );
}
