import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, ShoppingCart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { orderService } from '@/services/orderService'
import { paymentService } from '@/services/paymentService'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID

function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [formData, setFormData] = useState({
    siteType: '',
    budget: '',
    deadline: '',
    description: '',
    additionalInfo: '',
  })

  useEffect(() => {
    // Récupérer l'offre depuis l'état de navigation
    const offer = location.state?.offer || location.state?.pack
    if (offer) {
      setSelectedOffer(offer)
      setFormData((prev) => ({
        ...prev,
        siteType: offer.name || '',
        budget: offer.price ? `${offer.price}€` : '',
      }))
    } else {
      toast.error('Aucune offre sélectionnée')
      navigate('/offres')
    }
  }, [location, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const createOrder = async (data, actions) => {
    try {
      setLoading(true)
      
      // Créer la commande dans notre base de données
      const orderData = {
        offerId: selectedOffer.id,
        amount: selectedOffer.price,
        projectDetails: formData,
      }

      const order = await orderService.createOrder(orderData)

      // Créer l'ordre PayPal
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: selectedOffer.price.toString(),
              currency_code: 'EUR',
            },
            description: selectedOffer.name,
          },
        ],
        application_context: {
          brand_name: 'Devboostly',
          shipping_preference: 'NO_SHIPPING',
        },
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la commande')
      toast.error('Erreur lors de la création de la commande')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const onApprove = async (data, actions) => {
    try {
      setLoading(true)
      
      // Capturer le paiement PayPal
      const details = await actions.order.capture()
      
      // Envoyer la confirmation au backend
      await paymentService.capturePayment(details.id)
      
      toast.success('Paiement effectué avec succès !')
      navigate('/commande-reussie', { state: { orderId: details.id } })
    } catch (err) {
      setError('Erreur lors du traitement du paiement')
      toast.error('Erreur lors du traitement du paiement')
    } finally {
      setLoading(false)
    }
  }

  const onError = (err) => {
    console.error('Erreur PayPal:', err)
    setError('Erreur lors du paiement. Veuillez réessayer.')
    toast.error('Erreur lors du paiement')
  }

  if (!selectedOffer) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold">Finaliser votre commande</h1>
            <p className="text-muted-foreground">
              Complétez les informations et procédez au paiement sécurisé
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Formulaire */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Détails du projet</CardTitle>
                  <CardDescription>
                    Donnez-nous plus d'informations sur votre projet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="siteType">Type de site *</Label>
                    <Input
                      id="siteType"
                      name="siteType"
                      value={formData.siteType}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Délai souhaité *</Label>
                    <select
                      id="deadline"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Sélectionnez un délai</option>
                      <option value="Urgent (moins d'1 mois)">Urgent (moins d'1 mois)</option>
                      <option value="1 à 2 mois">1 à 2 mois</option>
                      <option value="2 à 3 mois">2 à 3 mois</option>
                      <option value="Plus de 3 mois">Plus de 3 mois</option>
                      <option value="Pas de délai précis">Pas de délai précis</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description du projet *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Décrivez votre projet, vos besoins spécifiques..."
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">Informations complémentaires</Label>
                    <Textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      placeholder="Ajoutez toute information supplémentaire utile..."
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Informations client */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Vos informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Nom complet</Label>
                      <p className="text-sm text-muted-foreground">
                        {user?.firstName} {user?.lastName}
                      </p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Résumé commande */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <ShoppingCart className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{selectedOffer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedOffer.type === 'maintenance' ? 'Abonnement mensuel' : 'Paiement unique'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total</span>
                      <span>{formatPrice(selectedOffer.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>TVA (20%)</span>
                      <span>{formatPrice(selectedOffer.price * 0.2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(selectedOffer.price * 1.2)}</span>
                  </div>

                  <Separator />

                  {/* PayPal Buttons */}
                  {formData.description && formData.deadline ? (
                    <PayPalScriptProvider
                      options={{
                        'client-id': PAYPAL_CLIENT_ID,
                        currency: 'EUR',
                        intent: 'capture',
                      }}
                    >
                      <PayPalButtons
                        style={{
                          layout: 'vertical',
                          color: 'gold',
                          shape: 'rect',
                          label: 'paypal',
                        }}
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onError={onError}
                        disabled={loading}
                      />
                    </PayPalScriptProvider>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Veuillez remplir tous les champs obligatoires avant de payer
                      </AlertDescription>
                    </Alert>
                  )}

                  <p className="text-xs text-center text-muted-foreground">
                    Paiement sécurisé par PayPal
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout