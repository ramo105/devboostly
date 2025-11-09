import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logoLight from './react.svg'
import logoDark from './react1.svg'

function Logo() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Vérifie si le thème sombre est activé
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark')
      setIsDark(isDarkMode)
    }

    // Vérifie au montage
    checkTheme()

    // Observe les changements de classe sur l'élément html
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  const currentLogo = isDark ? logoDark : logoLight

  return (
    <Link to="/" className="flex items-center">
      <img 
        src={currentLogo} 
        alt="Devboostly Logo" 
        style={{ minWidth: '150px', minHeight: '150px', marginLeft: '40px' }}
        className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] lg:w-[120px] lg:h-[120px] xl:w-[120px] xl:h-[120px] transition-all duration-300"
      />
    </Link>
  )
}

export default Logo