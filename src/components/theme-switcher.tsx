import { useTheme } from "./theme-context"
import { themes, type ThemeMode } from "@/lib/themes"
import { cn } from "@/lib/utils"

const themeOrder: ThemeMode[] = ["minimal-light", "dark", "retro", "neon", "monochrome", "glass", "terminal", "luxury"]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-xl bg-black/5 backdrop-blur-sm items-center max-w-[95vw] sm:max-w-none">
      {themeOrder.map((themeKey) => {
        const themeConfig = themes[themeKey]
        const isActive = theme === themeKey

        return (
          <button
            key={themeKey}
            onClick={() => setTheme(themeKey)}
            className={cn(
              "px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200",
              "hover:scale-105 active:scale-95",
              isActive ? "bg-white text-gray-900 shadow-md" : "bg-white/50 text-gray-700 hover:bg-white/80",
            )}
          >
            {themeConfig.name}
          </button>
        )
      })}
    </div>
  )
}
