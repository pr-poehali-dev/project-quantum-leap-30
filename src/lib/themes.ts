export type ThemeMode = "minimal-light" | "dark" | "retro" | "neon" | "monochrome" | "glass" | "terminal" | "luxury"

export interface ThemeConfig {
  name: string
  description: string
  background: string
  foreground: string
  card: string
  cardForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  border: string
  shadow: string
  fontClass?: string
}

export const themes: Record<ThemeMode, ThemeConfig> = {
  "minimal-light": {
    name: "Светлая",
    description: "Чистая и современная",
    background: "bg-gray-50",
    foreground: "text-gray-900",
    card: "bg-white",
    cardForeground: "text-gray-900",
    muted: "bg-gray-100",
    mutedForeground: "text-gray-500",
    accent: "bg-gray-900",
    accentForeground: "text-white",
    border: "border-gray-200",
    shadow: "shadow-sm",
  },
  dark: {
    name: "Темная",
    description: "Стильная и сфокусированная",
    background: "bg-zinc-950",
    foreground: "text-zinc-50",
    card: "bg-zinc-900",
    cardForeground: "text-zinc-50",
    muted: "bg-zinc-800",
    mutedForeground: "text-zinc-400",
    accent: "bg-white",
    accentForeground: "text-zinc-900",
    border: "border-zinc-800",
    shadow: "shadow-lg shadow-black/20",
  },
  retro: {
    name: "Ретро",
    description: "Ностальгия",
    background: "bg-amber-50",
    foreground: "text-amber-950",
    card: "bg-amber-100",
    cardForeground: "text-amber-950",
    muted: "bg-amber-100/50",
    mutedForeground: "text-amber-800",
    accent: "bg-amber-900",
    accentForeground: "text-amber-50",
    border: "border-amber-200",
    shadow: "shadow-md shadow-amber-900/10",
  },
  neon: {
    name: "Неон",
    description: "Киберпанк",
    background: "bg-slate-950",
    foreground: "text-cyan-400",
    card: "bg-slate-900",
    cardForeground: "text-cyan-300",
    muted: "bg-slate-800",
    mutedForeground: "text-cyan-500/70",
    accent: "bg-cyan-500",
    accentForeground: "text-slate-950",
    border: "border-cyan-500/30",
    shadow: "shadow-lg shadow-cyan-500/20",
  },
  monochrome: {
    name: "Монохром",
    description: "Изысканность",
    background: "bg-slate-100",
    foreground: "text-slate-800",
    card: "bg-slate-200",
    cardForeground: "text-slate-900",
    muted: "bg-slate-300/50",
    mutedForeground: "text-slate-600",
    accent: "bg-slate-700",
    accentForeground: "text-slate-50",
    border: "border-slate-300",
    shadow: "shadow-md shadow-slate-400/20",
  },
  glass: {
    name: "Стекло",
    description: "Премиум",
    background: "bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100",
    foreground: "text-slate-800",
    card: "bg-white/60 backdrop-blur-xl",
    cardForeground: "text-slate-900",
    muted: "bg-white/40 backdrop-blur-md",
    mutedForeground: "text-slate-600",
    accent: "bg-indigo-500",
    accentForeground: "text-white",
    border: "border-white/50",
    shadow: "shadow-xl shadow-indigo-500/10",
  },
  terminal: {
    name: "Терминал",
    description: "Хакерская эстетика",
    background: "bg-black",
    foreground: "text-green-400",
    card: "bg-green-950/30",
    cardForeground: "text-green-400",
    muted: "bg-green-950/20",
    mutedForeground: "text-green-600",
    accent: "bg-green-500",
    accentForeground: "text-black",
    border: "border-green-900/50",
    shadow: "shadow-lg shadow-green-500/10",
    fontClass: "font-mono",
  },
  luxury: {
    name: "Люкс",
    description: "Элегантность",
    background: "bg-stone-950",
    foreground: "text-amber-100",
    card: "bg-stone-900",
    cardForeground: "text-amber-200",
    muted: "bg-stone-800",
    mutedForeground: "text-amber-200/60",
    accent: "bg-gradient-to-r from-amber-400 to-yellow-500",
    accentForeground: "text-stone-950",
    border: "border-amber-500/30",
    shadow: "shadow-xl shadow-amber-500/10",
  },
}
