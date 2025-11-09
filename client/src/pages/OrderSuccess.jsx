import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Download, FileText, ArrowRight } from 'lucide-react'

function OrderSuccess() {
  const location = useLocation()
  const [orderId, setOrderId] = useState(null)

  useEffect(() => {
    const id = location.state?.orderId
    if (id) {
      setOrderId(id)
    }
  }, [location])

  return (
    <div className="py-16">
      <div className="container">
        <div className="mx-auto max-w-2xl">
          <Card className="border-2 border-green-500">
            <CardContent className="p-8 text-center">
              {/* Icône succès */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>

              {/* Titre */}
              <h1 className="mb-4 text-3xl font-bold">
                Commande confirmée !
              </h1>

              {/* Message */}
              <p className="mb-6 text-lg text-muted-foreground">
                Votre paiement a été effectué avec succès. Nous avons bien reçu votre commande.
              </p>

              {/* Numéro de commande */}
              {orderId && (
                <div className="mb-8 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-muted-foreground">Numéro de transaction</p>
                  <p className="font-mono text-sm font-medium">{orderId}</p>
                </div>
              )}

              {/* Informations */}
              <div className="mb-8 space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Confirmation par email</p>
                    <p className="text-sm text-muted-foreground">
                      Un email de confirmation avec votre facture a été envoyé à votre adresse email.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Prochaines étapes</p>
                    <p className="text-sm text-muted-foreground">
                      Notre équipe va analyser votre projet et vous contacter sous 24-48h pour démarrer la réalisation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Download className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Accès à votre espace</p>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez suivre l'avancement de votre projet depuis votre espace client.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/espace-client">
                  <Button size="lg" className="w-full sm:w-auto">
                    Accéder à mon espace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Besoin d'aide */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Une question ?{' '}
              <Link to="/contact" className="text-primary hover:underline">
                Contactez-nous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess