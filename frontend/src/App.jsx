// Definição das rotas (páginas) da aplicação.
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import RotaProtegida from './components/RotaProtegida';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Mesas from './pages/Mesas';
import NaoEncontrada from './pages/NaoEncontrada';
import Reservas from './pages/Reservas';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/reservas" replace />} />
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
