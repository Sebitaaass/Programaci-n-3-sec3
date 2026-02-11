import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagement from './pages/ProductManagement';
import ClientHome from './pages/ClientHome';
import UserProfile from './pages/UserProfile';
import AuthPromptModal from './components/AuthPromptModal';

function App() {
  const { user, loading } = useAuth();

  return (
    user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
    <>
      <Routes>
        {/* Rutas de autenticación */}
        <Route path="/login" element={<AuthPage />} />

        {/* Rutas de administrador */}
        <Route path="/admin" element={
          user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
        } />

        <Route path="/admin/products" element={
          user?.role === 'admin' ? <ProductManagement /> : <Navigate to="/" />
        } />

        {/* Rutas públicas */}
        <Route path="/shop" element={<ClientHome />} />
        <Route path="/" element={
          user?.role === 'admin' ? <Navigate to="/admin" /> : <ClientHome />
        } />

        {/* Rutas protegidas */}
        <Route path="/profile" element={user ? <UserProfile /> : <Navigate to="/login" />} />
      </Routes>
      <AuthPromptModal />
    </>
  );
}

export default App;
