import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, Shield, Home as HomeIcon, ShoppingBag, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from '@/components/ThemeToggle'
import Logo from './Logo.jsx'

function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/services', label: 'Services' },
    { to: '/offres', label: 'Offres' },
    { to: '/a-propos', label: 'À propos' },
    { to: '/contact', label: 'Contact' },
  ]

  const isActive = (path) => location.pathname === path

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      {/* Wrapper pour créer l'effet arrondi */}
      <div className="sticky top-0 z-50 px-4 pt-4">
        <header className={`
          w-full rounded-2xl border transition-all duration-300
          ${scrolled 
            ? 'bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-lg' 
            : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md'
          }
        `}>
          <div className="container flex h-16 md:h-20 lg:h-24 items-center justify-between px-6">
            <div className="logo-animation">
              <Logo />
            </div>

            <nav className="hidden items-center space-x-6 lg:space-x-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link text-sm lg:text-base font-medium transition-all duration-300 relative group ${
                    isActive(link.to) ? 'text-primary' : 'text-foreground/80 hover:text-primary'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 rounded-full ${
                    isActive(link.to) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
              ))}
            </nav>

            <div className="hidden items-center space-x-4 md:flex">
              <div className="theme-toggle-animation">
                <ThemeToggle />
              </div>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="button-hover flex items-center gap-2 px-3 py-2 h-auto rounded-xl hover:shadow-md transition-all cursor-pointer"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                          {getInitials(user?.firstName, user?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user?.firstName}</span>
                      {isAdmin && (
                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5">
                          <Shield className="h-3 w-3 text-primary" />
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {isAdmin ? (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Dashboard Admin</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/')} className="cursor-pointer">
                          <HomeIcon className="mr-2 h-4 w-4" />
                          <span>Accueil du site</span>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/espace-client')} className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Mon Espace</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/offres')} className="cursor-pointer">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          <span>Nos Offres</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => navigate('/services')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Services</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/connexion">
                    <Button 
                      variant="ghost" 
                      size="default" 
                      className="button-hover lg:text-base hover:bg-primary/10 transition-all rounded-xl"
                    >
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/inscription">
                    <Button 
                      className="button-hover bg-[#3ae5ae] text-white hover:opacity-90 lg:text-base transition-all shadow-md hover:shadow-lg rounded-xl" 
                      size="default"
                    >
                      Inscription
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2 md:hidden">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative menu-button rounded-xl"
                aria-label="Toggle menu"
              >
                <div className="relative w-6 h-6">
                  <span className={`menu-icon ${isOpen ? 'menu-icon-close' : ''}`}>
                    <Menu className="h-6 w-6" />
                  </span>
                  <span className={`menu-icon ${isOpen ? '' : 'menu-icon-close'}`}>
                    <X className="h-6 w-6" />
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </header>
      </div>

      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`fixed top-[88px] right-4 bottom-4 w-[280px] bg-background border shadow-2xl z-40 md:hidden rounded-2xl transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <nav className="flex flex-col h-full overflow-y-auto rounded-2xl">
          <div className="flex flex-col space-y-1 p-4">
            {navLinks.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-nav-link px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.to) ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="h-px bg-border mx-4 my-4" />

          <div className="flex flex-col space-y-2 p-4 mt-auto">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link to="/admin">
                    <Button variant="ghost" className="mobile-button w-full justify-start hover:bg-primary/10 rounded-xl">
                      <Shield className="mr-2 h-4 w-4" />
                      Dashboard Admin
                    </Button>
                  </Link>
                ) : (
                  <Link to="/espace-client">
                    <Button variant="ghost" className="mobile-button w-full justify-start hover:bg-primary/10 rounded-xl">
                      <User className="mr-2 h-4 w-4" />
                      {user?.firstName || 'Mon espace'}
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  className="mobile-button w-full justify-start hover:bg-destructive/10 hover:text-destructive hover:border-destructive rounded-xl"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link to="/connexion">
                  <Button variant="ghost" className="mobile-button w-full justify-start hover:bg-primary/10 rounded-xl">
                    🔐 Connexion
                  </Button>
                </Link>
                <Link to="/inscription">
                  <Button
  className="mobile-button w-full bg-[#3ae5ae] text-white shadow-lg hover:bg-[#34d09d] hover:shadow-xl focus:bg-[#3ae5ae] transition-all rounded-xl"
>
  ✨ Inscription
</Button>

                </Link>
              </>
            )}
          </div>

          <div className="p-4 text-center text-xs text-muted-foreground border-t mt-4 rounded-b-2xl">
            <p>© 2024 Devboostly</p>
            <p className="mt-1">Tous droits réservés</p>
          </div>
        </nav>
      </div>

      <style>{`
        .logo-animation {
          animation: logo-fade-in 0.6s ease-out;
        }

        @keyframes logo-fade-in {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        .nav-link {
          animation: nav-fade-in 0.5s ease-out backwards;
        }

        .nav-link:nth-child(1) { animation-delay: 0.1s; }
        .nav-link:nth-child(2) { animation-delay: 0.15s; }
        .nav-link:nth-child(3) { animation-delay: 0.2s; }
        .nav-link:nth-child(4) { animation-delay: 0.25s; }
        .nav-link:nth-child(5) { animation-delay: 0.3s; }

        @keyframes nav-fade-in {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .button-hover {
          animation: button-fade-in 0.6s ease-out backwards;
          animation-delay: 0.4s;
        }

        .button-hover:hover {
          transform: translateY(-2px);
        }

        .button-hover:active {
          transform: translateY(0);
        }

        @keyframes button-fade-in {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        .theme-toggle-animation {
          animation: fade-in 0.5s ease-out backwards;
          animation-delay: 0.35s;
        }

        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .menu-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.3s ease;
        }

        .menu-icon-close {
          opacity: 0;
          transform: translate(-50%, -50%) rotate(180deg);
        }

        .menu-button:hover .menu-icon {
          transform: translate(-50%, -50%) scale(1.1);
        }

        .menu-button:hover .menu-icon-close {
          transform: translate(-50%, -50%) scale(1.1) rotate(180deg);
        }

        .mobile-nav-link {
          animation: slide-in-right 0.4s ease-out backwards;
        }

        .mobile-nav-link:nth-child(1) { animation-delay: 0.05s; }
        .mobile-nav-link:nth-child(2) { animation-delay: 0.1s; }
        .mobile-nav-link:nth-child(3) { animation-delay: 0.15s; }
        .mobile-nav-link:nth-child(4) { animation-delay: 0.2s; }
        .mobile-nav-link:nth-child(5) { animation-delay: 0.25s; }

        @keyframes slide-in-right {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        .mobile-button {
          animation: fade-slide-in 0.4s ease-out backwards;
        }

        .mobile-button:nth-child(1) { animation-delay: 0.3s; }
        .mobile-button:nth-child(2) { animation-delay: 0.35s; }

        @keyframes fade-slide-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        * {
          -webkit-tap-highlight-color: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </>
  )
}

export default Header