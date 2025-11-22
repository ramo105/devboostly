import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom' // 🔑 useLocation est important
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, LogIn } from 'lucide-react' 
import { quoteService } from '@/services/quoteService'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth' 

const SITE_TYPES = [
  "Site Vitrine",
  "Site E-commerce",
  "Site Sur Mesure",
  "Autre",
]

const BUDGETS = [
  "Moins de 500€",
  "500€ - 1000€",
  "1000€ - 2000€",
  "2000€ - 5000€",
  "Plus de 5000€",
]

const DEADLINES = [
  "Urgent (moins d'1 mois)",
  "1 à 2 mois",
  "2 à 3 mois",
  "Plus de 3 mois",
  "Pas de délai précis",
]

function Quote() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth() 

  const [loading, setLoading] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    siteType: '',
    budget: '',
    deadline: '',
    description: '',
  })

  // LOGIQUE DE PRÉ-REMPLISSAGE (inchangée)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone || '', 
      }))
    }
  }, [user]) 

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const validate = () => {
    // ... (Logique de validation inchangée)
    const required = ['siteType', 'budget', 'deadline', 'description']
    if (!user) {
      required.unshift('name', 'email') 
    }

    for (const k of required) {
      const v = formData[k]
      if (!v || String(v).trim() === '') {
        setError(`Le champ "${k}" est requis.`)
        return false
      }
    }
    
    if (!user && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Veuillez saisir un email valide.')
      return false
    }

    if (!SITE_TYPES.includes(formData.siteType)) {
      setError('Valeur "Type de site" invalide.')
      return false
    }
    if (!BUDGETS.includes(formData.budget)) {
      setError('Valeur "Budget estimé" invalide.')
      return false
    }
    if (!DEADLINES.includes(formData.deadline)) {
      setError('Valeur "Délai souhaité" invalide.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    // ... (Logique de soumission inchangée)
    e.preventDefault()
    setError('')
    if (user) {
        formData.name = formData.name || `${user.firstName} ${user.lastName}`
        formData.email = formData.email || user.email
    }

    if (!validate()) return

    setLoading(true)
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        siteType: formData.siteType,
        budget: formData.budget,
        deadline: formData.deadline,
        description: formData.description.trim(),
      }

      const res = await quoteService.createQuote(payload)
      if (!res?.success || !res?.data) {
        throw new Error(res?.message || 'Réponse inattendue du serveur')
      }

      setSuccessData(res.data)
      toast.success(res.message || 'Demande de devis envoyée avec succès !')

      if (!user) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          siteType: '',
          budget: '',
          deadline: '',
          description: '',
        })
      } else {
        setFormData(prev => ({
            name: prev.name,
            email: prev.email,
            phone: prev.phone,
            siteType: '',
            budget: '',
            deadline: '',
            description: '',
        }))
      }
    } catch (err) {
      const server = err?.response?.data
      const detailed =
        server?.message ||
        (Array.isArray(server?.errors) ? server.errors.join(' • ') : null) ||
        err?.message ||
        'Une erreur est survenue'
      setError(detailed)
      console.error('Quote submit error:', server || err)
      toast.error('Erreur lors de l’envoi')
    } finally {
      setLoading(false)
    }
  }

  // AFFICHER MESSAGE DE SUCCÈS (inchangé)
  if (successData) {
    return (
      <div className="py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <Card className="border-2 border-green-500">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h2 className="mb-2 text-2xl font-bold">Demande envoyée avec succès !</h2>
                <p className="mb-6 text-muted-foreground">
                  Référence : <span className="font-semibold">{successData.quoteNumber}</span><br />
                  Vous pouvez suivre votre devis dans votre espace client.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => navigate('/espace-client?tab=quotes')}>
                    Voir mes devis
                  </Button>
                  <Button variant="outline" onClick={() => setSuccessData(null)}>
                    Faire une nouvelle demande
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // RENDU DU FORMULAIRE
  return (
    <div className="py-16">
      <div className="container">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold">Demander un Devis</h1>
            <p className="text-lg text-muted-foreground">
              Remplissez ce formulaire et recevez un devis personnalisé gratuitement
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informations du projet</CardTitle>
              <CardDescription>Tous les champs marqués * sont requis</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* 🔑 ALERTE ET REDIRECTION SI NON CONNECTÉ */}
              {!user && (
                <Alert className="mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <LogIn className="h-4 w-4 mr-3" />
                    <AlertDescription>
                      Vous n'êtes pas connecté. Pour suivre facilement votre devis, vous devez d'abord vous connecter.
                    </AlertDescription>
                  </div>
                  {/* 🔑 Nouveau bouton pour la redirection immédiate */}
                  <Button 
                    onClick={() => navigate(`/connexion`)} 
                    variant="default" // Couleur par défaut ou votre couleur d'accentuation
                    size="sm"
                  >
                    Se connecter
                  </Button>
                </Alert>
              )}


              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* CHAMPS MASQUÉS/PRÉ-REMPLIS SI CONNECTÉ (inchangé) */}
                {!user ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>
                  </>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="userInfo">Informations Client (Utilisateur Connecté)</Label>
                        <Alert variant="success">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                Le devis sera lié à votre compte: **{user.email}**
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                
                {/* Le champ téléphone reste affiché (inchangé) */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                </div>

                {/* --- Champs du projet (inchangés) --- */}
                
                <div className="space-y-2">
                  <Label htmlFor="siteType">Type de site souhaité *</Label>
                  <select
                    id="siteType"
                    name="siteType"
                    value={formData.siteType}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Sélectionnez un type</option>
                    {SITE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget estimé *</Label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Sélectionnez un budget</option>
                    {BUDGETS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
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
                    {DEADLINES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description du projet *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-500 text-white" size="lg" disabled={loading}>
                  {loading ? 'Envoi en cours...' : 'Envoyer ma demande de devis'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Quote