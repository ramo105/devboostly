import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      toast.success('Connexion réussie !')
      navigate('/espace-client')
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full border-0 shadow-2xl bg-white/95 dark:bg-[#0A1128]/95 backdrop-blur-sm">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-3xl font-bold text-center text-[#3ae5ae] dark:text-[#3ae5ae]">
          Connexion
        </CardTitle>
        <CardDescription className="text-center text-base text-[#0A1128]/70 dark:text-gray-300">
          Connectez-vous à votre espace client
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="email" className="text-base font-semibold text-[#0A1128] dark:text-white">
              Email
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#3ae5ae] transition-colors" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-11 h-12 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-[#3ae5ae] dark:focus:border-[#3ae5ae] transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-base font-semibold text-[#0A1128] dark:text-white">
              Mot de passe
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#3ae5ae] transition-colors" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="pl-11 h-12 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-[#3ae5ae] dark:focus:border-[#3ae5ae] transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="text-right">
            <Link 
              to="/mot-de-passe-oublie" 
              className="text-sm font-medium text-[#3ae5ae] hover:text-[#2dd49d] dark:text-[#3ae5ae] dark:hover:text-[#3ae5ae] hover:underline transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold bg-[#3ae5ae] hover:bg-[#2dd49d] text-white shadow-lg hover:shadow-xl transition-all duration-200 group" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connexion...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Se connecter
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
          
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-[#0A1128] px-4 text-gray-500 dark:text-gray-400">
                ou
              </span>
            </div>
          </div>
          
          <p className="text-center text-base text-[#0A1128]/70 dark:text-gray-300">
            Pas encore de compte ?{' '}
            <Link 
              to="/inscription" 
              className="font-semibold text-[#3ae5ae] hover:text-[#2dd49d] dark:text-[#3ae5ae] dark:hover:text-[#3ae5ae] hover:underline transition-colors"
            >
              S'inscrire gratuitement
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

export default LoginForm