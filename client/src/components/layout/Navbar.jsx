import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Accueil', path: '/' },
  { name: 'À propos', path: '/a-propos' },
  { name: 'Services', path: '/services' },
  { name: 'Nos offres', path: '/offres' },
  { name: 'Contact', path: '/contact' },
]

function Navbar({ className }) {
  const location = useLocation()

  return (
    <nav className={cn('flex items-center space-x-6', className)}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            location.pathname === item.path
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}

export default Navbar