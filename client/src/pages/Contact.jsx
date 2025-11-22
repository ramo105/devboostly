import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react'
import { COMPANY_INFO } from '@/lib/constants'
import { toast } from 'sonner'
import HCaptcha from '@hcaptcha/react-hcaptcha'

const WEB3FORMS_ACCESS_KEY = '136dc74e-4f53-4d08-89e0-1e48f32c4210'

function Contact() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const handleCaptchaVerify = (token) => {
  setCaptchaToken(token)
}
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
     if (!captchaToken) {
    setError('Veuillez valider le captcha avant d’envoyer le formulaire.')
    setLoading(false)
    return
  }
    try {
      // on construit les données pour Web3Forms
      const data = new FormData()
      data.append('access_key', WEB3FORMS_ACCESS_KEY)

      // champs du formulaire
      data.append('name', formData.name)
      data.append('email', formData.email)
      data.append('phone', formData.phone)
      data.append('subject', formData.subject || 'Nouveau message depuis le formulaire de contact')
      data.append('message', formData.message)

      // tu peux ajouter des infos supplémentaires si tu veux
      data.append('from_name', 'Devboosty website – Formulaire de contact')
      data.append('h-captcha-response', captchaToken)
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
      })

      const json = await res.json()

      if (!json.success) {
        throw new Error(json.message || "Une erreur est survenue lors de l’envoi du message.")
      }

      setSuccess(true)
      toast.success('Message envoyé avec succès !')

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
    } catch (err) {
      console.error('Erreur Web3Forms :', err)
      const msg =
        err?.message || 'Une erreur est survenue lors de l’envoi du message.'
      setError(msg)
      toast.error('Erreur lors de l’envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-16">
      <div className="container">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Contactez-nous</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Une question ? Un projet ? N&apos;hésitez pas à nous contacter
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Infos contact */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
                <CardDescription>Plusieurs moyens de nous joindre</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a
                      href={`mailto:${COMPANY_INFO?.email ?? ''}`}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {COMPANY_INFO?.email ?? 'contact@example.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-sm text-muted-foreground">
                      {COMPANY_INFO?.phone ?? '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-sm text-muted-foreground">
                      {COMPANY_INFO?.address ?? '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Maps */}
            <Card>
              <CardContent className="p-0">
                <div className="h-64 w-full rounded-lg bg-gray-200">
                  <iframe
                    src="https://maps.google.com/maps?q=Les%20Mureaux%2C%20France&t=&z=13&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: '0.5rem' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps"
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            {success ? (
              <Card className="border-2 border-green-500">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
                  <h2 className="mb-4 text-2xl font-bold">Message envoyé !</h2>
                  <p className="mb-6 text-muted-foreground">
                    Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <Button onClick={() => setSuccess(false)}>Envoyer un autre message</Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Envoyez-nous un message</CardTitle>
                  <CardDescription>Nous vous répondrons sous 24h ouvrées</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Jean Dupont"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="jean.dupont@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="06 12 34 56 78"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Sujet</Label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          placeholder="Objet de votre message"
                          value={formData.subject}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Votre message..."
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        required
                      />
                    </div>
                     <HCaptcha
  sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2"  // sitekey public Web3Forms pour plan gratuit
  reCaptchaCompat={false}
  onVerify={handleCaptchaVerify}
/>
                    <Button
                      type="submit"
                      className="w-full bg-[linear-gradient(135deg,#9b4dff,#6e28c9)] text-white"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* SECTION CTA */}
      <div className="mt-16">
        <section
          className="w-full py-40 transition-colors duration-500 border-t dark:border-border
             bg-[linear-gradient(135deg,#9b4dff,#6e28c9)]
             dark:bg-[linear-gradient(135deg,#120a25,#220f40)]"
        >
          <div
            className="
              flex flex-col
              w-full
              px-4
              max-w-6xl
              mx-auto
              md:items-start
              md:ml-40
              md:w-[35%]
            "
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-white text-left">
              Créez un Site Web qui Convertit Vos Visiteurs en Clients !
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 text-gray-200 text-left">
              Nous concevons des sites web sur-mesure, modernes et performants pour vous aider à
              atteindre vos objectifs.
            </p>
            <Link to="/devis">
              <button
                className="bg-white text-[#993bf6] font-semibold uppercase py-4 px-10 sm:px-16 rounded-full
                   transition-all duration-300 hover:scale-105 hover:opacity-95
                   dark:bg-transparent dark:text-white dark:border dark:border-white
                   dark:hover:bg-[linear-gradient(135deg,#120a25,#220f40)]"
              >
                Commencez maintenant
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Contact
