import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, Post } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import PostCard from "@/components/PostCard";
import Icon from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function FeedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    api.posts.feed().then((data) => {
      setPosts(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;
    if (!user) { navigate("/auth"); return; }
    setPosting(true);
    try {
      const newPost = await api.posts.create(postText.trim());
      setPosts((prev) => [newPost, ...prev]);
      setPostText("");
    } catch (err: unknown) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "Не удалось опубликовать", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-black text-white tracking-tight">ВТФ</h1>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
                >
                  @{user.username}
                </button>
                <button onClick={handleLogout} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                  <Icon name="LogOut" size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="text-sm bg-white text-zinc-900 px-3 py-1 rounded-lg font-medium hover:bg-zinc-100 transition-all"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-4">
        {user && (
          <form onSubmit={handlePost} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
            <Textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Что происходит?"
              className="bg-transparent border-0 text-white placeholder:text-zinc-500 resize-none focus-visible:ring-0 p-0 text-sm min-h-[60px]"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800">
              <span className="text-xs text-zinc-600">{postText.length}/1000</span>
              <button
                type="submit"
                disabled={posting || !postText.trim()}
                className="px-4 py-1.5 bg-white text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-100 disabled:opacity-40 transition-all"
              >
                {posting ? "Публикую..." : "Опубликовать"}
              </button>
            </div>
          </form>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <Icon name="Loader2" size={24} className="text-zinc-500 animate-spin" />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">Пока никто ничего не написал. Будь первым!</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={(id, liked, count) =>
              setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, liked, likes_count: count } : p)))
            }
          />
        ))}
      </main>
    </div>
  );
}
