import { useEffect, useState, useCallback } from "react"
import { ThemedFlipDigit } from "./themed-flip-digit"
import { useTheme } from "./theme-context"
import { themes } from "@/lib/themes"
import { cn } from "@/lib/utils"

interface ThemedCountdownProps {
  targetDate: Date
  onComplete?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function padNumber(num: number): string[] {
  return num.toString().padStart(2, "0").split("")
}

export function ThemedCountdown({ targetDate, onComplete }: ThemedCountdownProps) {
  const { theme } = useTheme()
  const themeConfig = themes[theme]

  const calculateTimeLeft = useCallback((): TimeLeft => {
    const difference = targetDate.getTime() - new Date().getTime()

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    const totalSeconds = Math.floor(difference / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return { days, hours, minutes, seconds }
  }, [targetDate])

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setIsComplete(true)
        clearInterval(timer)
        onComplete?.()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [calculateTimeLeft, onComplete])

  const [d1, d2] = padNumber(timeLeft.days)
  const [h1, h2] = padNumber(timeLeft.hours)
  const [m1, m2] = padNumber(timeLeft.minutes)
  const [s1, s2] = padNumber(timeLeft.seconds)

  const colonColor =
    theme === "neon"
      ? "text-cyan-500 [text-shadow:0_0_10px_rgba(34,211,238,0.8)]"
      : theme === "terminal"
        ? "text-green-500"
        : theme === "luxury"
          ? "text-amber-400"
          : themeConfig.mutedForeground

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-1 md:gap-3 lg:gap-4">
        {/* Row 1: Days and Hours */}
        <div className="flex items-center gap-1 sm:gap-1 md:gap-3 lg:gap-4">
          {/* Days */}
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className="flex gap-0.5 sm:gap-1">
              <ThemedFlipDigit digit={d1} />
              <ThemedFlipDigit digit={d2} />
            </div>
            <span
              className={cn(
                "text-[10px] sm:text-xs uppercase tracking-widest",
                themeConfig.mutedForeground,
                themeConfig.fontClass,
              )}
            >
              Дни
            </span>
          </div>

          <span className={cn("text-xl sm:text-3xl md:text-4xl lg:text-5xl font-light -mt-4 sm:-mt-6", colonColor)}>
            :
          </span>

          {/* Hours */}
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className="flex gap-0.5 sm:gap-1">
              <ThemedFlipDigit digit={h1} />
              <ThemedFlipDigit digit={h2} />
            </div>
            <span
              className={cn(
                "text-[10px] sm:text-xs uppercase tracking-widest",
                themeConfig.mutedForeground,
                themeConfig.fontClass,
              )}
            >
              Часы
            </span>
          </div>

          <span
            className={cn(
              "hidden sm:block text-xl sm:text-3xl md:text-4xl lg:text-5xl font-light -mt-4 sm:-mt-6",
              colonColor,
            )}
          >
            :
          </span>
        </div>

        {/* Row 2: Minutes and Seconds */}
        <div className="flex items-center gap-1 sm:gap-1 md:gap-3 lg:gap-4">
          {/* Minutes */}
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className="flex gap-0.5 sm:gap-1">
              <ThemedFlipDigit digit={m1} />
              <ThemedFlipDigit digit={m2} />
            </div>
            <span
              className={cn(
                "text-[10px] sm:text-xs uppercase tracking-widest",
                themeConfig.mutedForeground,
                themeConfig.fontClass,
              )}
            >
              Минуты
            </span>
          </div>

          <span className={cn("text-xl sm:text-3xl md:text-4xl lg:text-5xl font-light -mt-4 sm:-mt-6", colonColor)}>
            :
          </span>

          {/* Seconds */}
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className="flex gap-0.5 sm:gap-1">
              <ThemedFlipDigit digit={s1} />
              <ThemedFlipDigit digit={s2} />
            </div>
            <span
              className={cn(
                "text-[10px] sm:text-xs uppercase tracking-widest",
                themeConfig.mutedForeground,
                themeConfig.fontClass,
              )}
            >
              Секунды
            </span>
          </div>
        </div>
      </div>

      {isComplete && (
        <div
          className={cn(
            "text-base sm:text-lg font-medium animate-pulse",
            theme === "neon"
              ? "text-cyan-400 [text-shadow:0_0_20px_rgba(34,211,238,0.8)]"
              : theme === "terminal"
                ? "text-green-400"
                : theme === "luxury"
                  ? "text-amber-400"
                  : themeConfig.foreground,
          )}
        >
          Время запуска!
        </div>
      )}
    </div>
  )
}
