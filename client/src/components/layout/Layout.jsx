import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from '../../pages/ScrollToTop'

function Layout({ children }) {
  const { pathname } = useLocation()

  // Dashboards sans header/footer
  const isDashboard =
    pathname.startsWith('/admin') || pathname.startsWith('/espace-client')

  return (
    <div className="flex min-h-screen flex-col">
      {!isDashboard && <Header />}

      <main className="flex-1">
        {children}
      </main>

      {!isDashboard && <Footer />}
      <ScrollToTop />
    </div>
  )
}

export default Layout
