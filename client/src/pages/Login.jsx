import LoginForm from '@/components/auth/LoginForm'
import { Link } from 'react-router-dom'
import { Zap, Shield, TrendingUp, Code, Sparkles, Rocket } from 'lucide-react'

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-[#0A1128] dark:via-[#0A1128] dark:to-[#1a1f3a] relative overflow-hidden p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3ae5ae]/20 dark:bg-[#3ae5ae]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#3ae5ae]/15 dark:bg-[#3ae5ae]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#3ae5ae]/10 dark:bg-[#3ae5ae]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Main container */}
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        
        {/* Left side - Branding & Features */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          {/* Logo & Title */}
          <div className="space-y-4">
            <p className="text-2xl font-semibold text-[#0A1128] dark:text-white">
              Boostez votre présence digitale
            </p>
            <p className="text-lg text-[#0A1128]/70 dark:text-gray-300">
              Rejoignez des centaines d'entreprises qui transforment leur business en ligne
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="group p-5 rounded-2xl bg-white/80 dark:bg-[#0A1128]/80 backdrop-blur-sm border border-[#3ae5ae]/20 dark:border-[#3ae5ae]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3ae5ae] to-[#2dd49d] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0A1128] dark:text-white mb-1 text-lg">Performance Optimale</h3>
                  <p className="text-sm text-[#0A1128]/70 dark:text-gray-300">Sites ultra-rapides et optimisés pour tous les appareils</p>
                </div>
              </div>
            </div>

            <div className="group p-5 rounded-2xl bg-white/80 dark:bg-[#0A1128]/80 backdrop-blur-sm border border-[#3ae5ae]/20 dark:border-[#3ae5ae]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3ae5ae] to-[#2dd49d] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0A1128] dark:text-white mb-1 text-lg">Sécurité Maximale</h3>
                  <p className="text-sm text-[#0A1128]/70 dark:text-gray-300">Protection SSL et mises à jour de sécurité régulières</p>
                </div>
              </div>
            </div>

            <div className="group p-5 rounded-2xl bg-white/80 dark:bg-[#0A1128]/80 backdrop-blur-sm border border-[#3ae5ae]/20 dark:border-[#3ae5ae]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3ae5ae] to-[#2dd49d] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0A1128] dark:text-white mb-1 text-lg">Croissance Garantie</h3>
                  <p className="text-sm text-[#0A1128]/70 dark:text-gray-300">Augmentez votre visibilité et vos conversions en ligne</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#3ae5ae]/20 dark:border-[#3ae5ae]/30">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#3ae5ae] dark:text-[#3ae5ae] mb-1">100+</div>
              <div className="text-sm text-[#0A1128]/70 dark:text-gray-400 font-medium">Clients Satisfaits</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#3ae5ae] dark:text-[#3ae5ae] mb-1">150+</div>
              <div className="text-sm text-[#0A1128]/70 dark:text-gray-400 font-medium">Projets Réalisés</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#3ae5ae] dark:text-[#3ae5ae] mb-1">98%</div>
              <div className="text-sm text-[#0A1128]/70 dark:text-gray-400 font-medium">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              
              <p className="text-[#0A1128]/70 dark:text-gray-300">
                Bienvenue ! Connectez-vous pour continuer
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login