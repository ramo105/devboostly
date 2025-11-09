import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Accueil', path: '/' },
  { name: 'À propos', path: '/a-propos' },
  { name: 'Services', path: '/services' },
  { name: 'Nos offres', path: '/offres' },
  { name: 'Contact', path: '/contact' },
]

function MobileMenu({ isOpen, onClose }) {
  const { isAuthenticated, user } = useAuth()

  return (
    <div
      className={cn(
        'fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur md:hidden',
        isOpen ? 'block' : 'hidden'
      )}
    >
      <nav className="container flex flex-col space-y-4 py-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className="text-lg font-medium hover:text-primary"
          >
            {item.name}
          </Link>
        ))}
        
        <div className="border-t pt-4">
          {isAuthenticated ? (
            <Link to={user?.role === 'admin' ? '/admin' : '/espace-client'} onClick={onClose}>
              <Button className="w-full" variant="outline">
                {user?.role === 'admin' ? 'Admin' : 'Mon Espace'}
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/connexion" onClick={onClose}>
                <Button className="mb-2 w-full" variant="outline">
                  Connexion
                </Button>
              </Link>
              <Link to="/devis" onClick={onClose}>
                <Button className="w-full">Demander un devis</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  )
}

export default MobileMenu