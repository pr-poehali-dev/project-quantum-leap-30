import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, Post, ProfileUser } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import PostCard from "@/components/PostCard";
import Icon from "@/components/ui/icon";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

function Avatar({ username, url, size = 64 }: { username: string; url?: string | null; size?: number }) {
  if (url) return <img src={url} alt={username} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <div
      className="rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white"
      style={{ width: size, height: size, fontSize: size / 3 }}
    >
      {username[0]?.toUpperCase()}
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.posts.profile(Number(id)).then((data) => {
      setProfile(data.user);
      setPosts(data.posts);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Icon name="Loader2" size={24} className="text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Пользователь не найден</p>
      </div>
    );
  }

  const isOwn = user?.id === profile.id;
  const joinedAgo = formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: ru });

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-zinc-400 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <h1 className="text-lg font-bold text-white">@{profile.username}</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-start gap-4">
            <Avatar username={profile.username} url={profile.avatar_url} size={72} />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white">@{profile.username}</h2>
              {profile.bio && <p className="text-zinc-400 text-sm mt-1">{profile.bio}</p>}
              <div className="flex gap-4 mt-3">
                <div className="text-center">
                  <p className="text-white font-bold">{profile.posts_count}</p>
                  <p className="text-zinc-500 text-xs">постов</p>
                </div>
              </div>
              <p className="text-zinc-600 text-xs mt-3">Зарегистрирован {joinedAgo}</p>
            </div>
          </div>

          {isOwn && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-zinc-500 text-xs">Это твой профиль</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500 text-sm">Нет постов</p>
            </div>
          )}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={(postId, liked, count) =>
                setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, liked, likes_count: count } : p)))
              }
            />
          ))}
        </div>
      </main>
    </div>
  );
}
