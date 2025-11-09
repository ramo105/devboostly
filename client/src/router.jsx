import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Offers from './pages/Offers'
import Quote from './pages/Quote'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import ClientSpace from './pages/ClientSpace'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import LegalMentions from './pages/LegalMentions'
import Privacy from './pages/Privacy'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="a-propos" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="offres" element={<Offers />} />
        <Route path="devis" element={<Quote />} />
        <Route path="contact" element={<Contact />} />
        <Route path="mentions-legales" element={<LegalMentions />} />
        <Route path="confidentialite" element={<Privacy />} />
        
        {/* Auth */}
        <Route path="connexion" element={<Login />} />
        <Route path="inscription" element={<Register />} />
        
        {/* Routes protégées */}
        <Route path="espace-client" element={
          <ProtectedRoute>
            <ClientSpace />
          </ProtectedRoute>
        } />
        <Route path="checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="commande-reussie" element={
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        } />
        
        {/* Admin */}
        <Route path="admin" element={
          <ProtectedRoute adminOnly>
            <Admin />
          </ProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes