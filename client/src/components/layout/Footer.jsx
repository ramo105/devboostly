import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
import { COMPANY_INFO } from '@/lib/constants'
import Logo from './Logo._footer'
function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/50" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div className="container py-12">
        {/* Grille centrée */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 justify-center items-start text-center lg:text-left">
          {/* Company Info */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex items-center space-x-2 justify-center lg:justify-start">
               <div className="relative h-[110px] w-full flex lg:justify-start justify-space-between">
                <div className="absolute left-0 lg:left-0 scale-110 origin-left">
      <Logo />
    </div>
</div>
            </div>
            <p className="text-sm text-muted-foreground mb-6   ml-7 max-w-xs">
              Création de sites web professionnels pour booster votre activité en ligne.
            </p>
            <div className="flex space-x-4 justify-center lg:justify-center ml-6">
              <a href="https://www.facebook.com/share/17G1bwEg7H/?mibextid=wwXIfr"  target='_blank' className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://x.com/devboostly?s=21&t=5b5gSC5dnSvdI8J7q-QPmw" className="text-muted-foreground hover:text-primary"  target='_blank' >
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/devboostly?igsh=MTdra2xqOXV2azZjbQ%3D%3D&utm_source=qr" target='_blank' className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
             
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center lg:items-start">
            <h3 className="font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-primary">
                  Nos services
                </Link>
              </li>
              <li>
                <Link to="/offres" className="text-sm text-muted-foreground hover:text-primary">
                  Nos offres
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="text-sm text-muted-foreground hover:text-primary">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/devis" className="text-sm text-muted-foreground hover:text-primary">
                  Demander un devis
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col items-center lg:items-start">
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/mentions-legales" className="text-sm text-muted-foreground hover:text-primary">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/politique-confidentialite" className="text-sm text-muted-foreground hover:text-primary">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center lg:items-start">
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <a href={`mailto:${COMPANY_INFO.email}`} className="text-sm text-muted-foreground hover:text-primary">
                  {COMPANY_INFO.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 flex justify-center">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 {COMPANY_INFO.name}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
