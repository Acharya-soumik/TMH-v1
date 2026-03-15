import { useEffect, useState } from "react"

export function useTheme() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Default to dark mode if no preference
    const stored = localStorage.getItem("tmh_theme")
    const isDarkMode = stored === "light" ? false : true
    
    setIsDark(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem("tmh_theme", newTheme ? "dark" : "light")
    
    if (newTheme) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return { isDark, toggleTheme }
}
