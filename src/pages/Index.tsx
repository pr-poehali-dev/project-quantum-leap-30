import { ThemeProvider } from "@/components/theme-context"
import { LandingPage } from "@/components/landing-page"

const Index = () => {
  return (
    <ThemeProvider>
      <LandingPage />
    </ThemeProvider>
  )
}

export default Index
