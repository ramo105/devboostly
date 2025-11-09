import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="container">
        <div className="mx-auto max-w-md text-center">
          {/* 404 */}
          <h1 className="mb-4 text-9xl font-bold text-primary">404</h1>
          
          {/* Message */}
          <h2 className="mb-4 text-3xl font-bold">Page introuvable</h2>
          <p className="mb-8 text-muted-foreground">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Page précédente
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound