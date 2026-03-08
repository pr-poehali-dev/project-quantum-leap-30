import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      navigate("/");
    } catch (err: unknown) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "Что-то пошло не так", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-tight">ВТФ</h1>
          <p className="text-zinc-400 mt-1 text-sm">социальная сеть для своих</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="flex mb-6 bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === "login" ? "bg-white text-zinc-900" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Войти
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === "register" ? "bg-white text-zinc-900" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === "register" && (
              <Input
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                required
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              required
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              required
              minLength={6}
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-semibold mt-2"
            >
              {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
