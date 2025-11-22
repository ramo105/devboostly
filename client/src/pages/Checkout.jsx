import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, ShoppingCart } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { orderService } from '@/services/orderService'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import { toast } from 'sonner'

// Clé publique Stripe (front)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

// --------------------
// Composant interne
// --------------------
function CheckoutInner() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [order, setOrder] = useState(null)

  const [formData, setFormData] = useState({
    siteType: '',
    budget: '',
    deadline: '',
    description: '',
    additionalInfo: '',
  })

  const stripe = useStripe()
  const elements = useElements()

  // Récupérer l'offre depuis Offers.jsx (location.state)
  useEffect(() => {
    const { itemId, itemType, itemName, itemPrice } = location.state || {}

    if (itemId && itemType) {
      const offer = {
        id: itemId,
        name: itemName,
        price: Number(itemPrice) || 0,
        type: itemType,
      }
      setSelectedOffer(offer)

      // Pré-remplir type de site + budget (lecture seule)
      setFormData((prev) => ({
        ...prev,
        siteType: itemName || '',
        budget: itemPrice ? `${itemPrice}€` : '',
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

  const validateForm = () => {
    if (!selectedOffer) {
      setError('Aucune offre sélectionnée')
      return false
    }

    if (!formData.deadline) {
      setError('Merci de sélectionner un délai souhaité.')
      return false
    }

    if (!formData.description.trim()) {
      setError('Merci de décrire votre projet.')
      return false
    }

    if (!user?.email) {
      setError("Votre email est manquant. Veuillez mettre à jour votre profil.")
      return false
    }

    return true
  }

  const handlePayNow = async () => {
    setError('')

    if (!stripe || !elements) {
      setError('Le module de paiement n’est pas prêt. Veuillez patienter.')
      return
    }

    if (!validateForm()) return
    if (!selectedOffer) return

    setLoading(true)

    try {
      let currentOrder = order

      // 1️⃣ Créer la commande si elle n'existe pas encore
      if (!currentOrder) {
        const isTemp = String(selectedOffer.id).startsWith('temp_')

        const orderData = {
          itemId: selectedOffer.id,
          itemType: selectedOffer.type,
          projectDetails: formData,
          billingInfo: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
          },
        }

        if (isTemp) {
          orderData.itemName = selectedOffer.name
          orderData.itemPrice = Number(selectedOffer.price)
        }

        const res = await orderService.createOrder(orderData)
        const createdOrder = res?.data?.data || res?.data || res

        if (!createdOrder || !createdOrder._id) {
          throw new Error('Commande créée mais réponse invalide du backend.')
        }

        currentOrder = createdOrder
        setOrder(createdOrder)
        toast.success('Commande créée')
      }

      const orderId = currentOrder._id || currentOrder.id

      // 2️⃣ Demander au backend de créer le PaymentIntent pour l'acompte (40 %)
      const payRes = await api.post(`/orders/${orderId}/pay-deposit`)
      const { clientSecret, amount, currency } = payRes.data || {}

      if (!clientSecret) {
        throw new Error("Impossible d'initialiser le paiement (clientSecret manquant).")
      }

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Champ carte bancaire introuvable.')
      }

      // 3️⃣ Confirmer le paiement Stripe côté front
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || undefined,
              email: user?.email || undefined,
            },
          },
        })

      if (stripeError) {
        console.error('Stripe error:', stripeError)
        setError(stripeError.message || 'Erreur lors du paiement.')
        toast.error(stripeError.message || 'Erreur lors du paiement.')
        return
      }

      if (paymentIntent?.status === 'succeeded') {
  try {
    await api.post(`/orders/${orderId}/confirm-deposit`, {
      orderId: orderId,
      paymentIntentId: paymentIntent.id
    })
    toast.success(`Acompte paye avec succes.`)
    navigate('/espace-client?tab=orders', { state: { orderId } })
  } catch (confirmError) {
    console.error('Erreur confirmation:', confirmError)
    toast.warning('Paiement reussi. Actualisez la page.')
    navigate('/espace-client?tab=orders')
  }
} else {
        setError("Le paiement n'a pas été confirmé. Statut: " + paymentIntent?.status)
        toast.error("Le paiement n'a pas été confirmé.")
      }
    } catch (err) {
      console.error('Erreur paiement acompte:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors du paiement.')
      toast.error(err.response?.data?.message || 'Erreur lors du paiement.')
    } finally {
      setLoading(false)
    }
  }

  if (!selectedOffer) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const totalAmount = Number(selectedOffer.price) || 0
const isPack = selectedOffer.type === 'pack'

// Pour les packs, le backend met déjà 100 % en "deposit.amount"
const depositAmount =
  order?.deposit?.amount ??
  (isPack ? totalAmount : totalAmount * 0.4)

const remainingAmount = Math.max(totalAmount - depositAmount, 0)


  return (
    <div className="py-12">
      <div className="container">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold">Finaliser votre commande</h1>
            <p className="text-muted-foreground">
  {isPack
    ? 'Complétez les informations et réglez votre pack en une seule fois'
    : 'Complétez les informations et payez un acompte sécurisé de 40 %'}
</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Formulaire */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Détails du projet</CardTitle>
                  <CardDescription>
                    Donnez-nous plus d&apos;informations sur votre projet
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
                      <option value="Urgent (moins d'1 mois)">Urgent (moins d&apos;1 mois)</option>
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

            {/* Résumé commande + paiement */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <ShoppingCart className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{selectedOffer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedOffer.type === 'pack'
                          ? 'Abonnement mensuel'
                          : 'Paiement unique'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1 text-sm">
  <div className="flex justify-between">
    <span>Total</span>
    <span className="font-medium">
      {formatPrice(totalAmount)}
    </span>
  </div>

  {isPack ? (
    <div className="flex justify-between">
      <span>Montant à payer maintenant</span>
      <span className="font-semibold text-primary">
        {formatPrice(depositAmount)}
      </span>
    </div>
  ) : (
    <>
      <div className="flex justify-between">
        <span>Acompte (40 %)</span>
        <span className="font-semibold text-primary">
          {formatPrice(depositAmount)}
        </span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Solde restant (60 %)</span>
        <span>{formatPrice(remainingAmount)}</span>
      </div>
    </>
  )}
</div>


                  <Separator />

                  <div className="space-y-3">
                    <Label>Moyen de paiement</Label>
                    <div className="rounded-md border p-3">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#111827',
                              '::placeholder': {
                                color: '#9CA3AF',
                              },
                            },
                            invalid: {
                              color: '#EF4444',
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {formData.description && formData.deadline ? (
                    <Button
                      onClick={handlePayNow}
                      disabled={loading || !stripe || !elements}
                      className="w-full bg-green-500 text-white hover:bg-primary/90"
                      size="lg"
                    >
                     {loading ? (
  <>
    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
    Traitement.
  </>
) : isPack ? (
  <>Payer {formatPrice(depositAmount)}</>
) : (
  <>Payer l&apos;acompte de {formatPrice(depositAmount)}</>
)}

                    </Button>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Veuillez remplir tous les champs obligatoires avant de payer
                      </AlertDescription>
                    </Alert>
                  )}

                  <p className="text-center text-xs text-muted-foreground">
  {isPack
    ? 'Paiement sécurisé par carte bancaire (Stripe). Ce pack est réglé en une seule fois.'
    : 'Paiement sécurisé par carte bancaire (Stripe). Le solde de 60 % sera à régler une fois le projet terminé, depuis votre espace client.'}
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

// --------------------
// Wrapper Stripe
// --------------------
function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner />
    </Elements>
  )
}

export default Checkout
