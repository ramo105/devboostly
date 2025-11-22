import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'

// Contexts - CORRIGER LES CHEMINS
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Layout
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
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ClientSpace from './pages/ClientSpace'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import LegalMentions from './pages/LegalMentions'
import Privacy from './pages/Privacy'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/offres" element={<Offers />} />
              <Route path="/devis" element={<Quote />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Routes d'authentification */}
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
              <Route path="/reinitialiser-mot-de-passe/:token" element={<ResetPassword />} />
              
              {/* Routes légales */}
              <Route path="/mentions-legales" element={<LegalMentions />} />
              <Route path="/politique-confidentialite" element={<Privacy />} />

              {/* Routes protégées - Client */}
              <Route
                path="/espace-client"
                element={
                  <ProtectedRoute>
                    <ClientSpace />
                  </ProtectedRoute>
                }
              />
              <Route
  path="/checkout"
  element={
    <ProtectedRoute>
      <Checkout />
    </ProtectedRoute>
  }
/>
              <Route
                path="/commande-reussie/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderSuccess />
                  </ProtectedRoute>
                }
              />

              {/* Routes protégées - Admin */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                }
              />

              {/* Route 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            duration={4000}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App