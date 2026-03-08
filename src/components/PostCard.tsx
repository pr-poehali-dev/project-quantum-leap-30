import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Post, Comment, api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface PostCardProps {
  post: Post;
  onLike?: (postId: number, liked: boolean, count: number) => void;
}

function Avatar({ username, url }: { username: string; url?: string | null }) {
  if (url) return <img src={url} alt={username} className="w-9 h-9 rounded-full object-cover" />;
  return (
    <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-white">
      {username[0]?.toUpperCase()}
    </div>
  );
}

export default function PostCard({ post, onLike }: PostCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);

  const handleLike = async () => {
    if (!user) { navigate("/auth"); return; }
    const prev = { liked, likesCount };
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    try {
      const res = await api.posts.like(post.id);
      setLiked(res.liked);
      setLikesCount(res.likes_count);
      onLike?.(post.id, res.liked, res.likes_count);
    } catch {
      setLiked(prev.liked);
      setLikesCount(prev.likesCount);
    }
  };

  const handleToggleComments = async () => {
    setShowComments(!showComments);
    if (!commentsLoaded) {
      const data = await api.posts.comments(post.id);
      setComments(data);
      setCommentsLoaded(true);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    setCommentLoading(true);
    try {
      const c = await api.posts.comment(post.id, commentText.trim());
      setComments((prev) => [...prev, c]);
      setCommentsCount((n) => n + 1);
      setCommentText("");
    } catch (e) {
      console.error(e);
    } finally {
      setCommentLoading(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ru });

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => navigate(`/profile/${post.user.id}`)}>
          <Avatar username={post.user.username} url={post.user.avatar_url} />
        </button>
        <div>
          <button
            onClick={() => navigate(`/profile/${post.user.id}`)}
            className="font-semibold text-white hover:text-zinc-300 transition-colors text-sm"
          >
            @{post.user.username}
          </button>
          <p className="text-xs text-zinc-500">{timeAgo}</p>
        </div>
      </div>

      <p className="text-zinc-100 text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>

      {post.image_url && (
        <img src={post.image_url} alt="" className="w-full rounded-xl mb-3 object-cover max-h-80" />
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-zinc-800">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? "text-red-400" : "text-zinc-500 hover:text-red-400"
          }`}
        >
          <Icon name={liked ? "Heart" : "Heart"} size={16} className={liked ? "fill-red-400" : ""} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Icon name="MessageCircle" size={16} />
          <span>{commentsCount}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <div className="flex flex-col gap-2 mb-3 max-h-48 overflow-y-auto">
            {comments.length === 0 && <p className="text-zinc-500 text-xs">Пока нет комментариев</p>}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <Avatar username={c.user.username} url={c.user.avatar_url} />
                <div className="bg-zinc-800 rounded-xl px-3 py-2 flex-1">
                  <span className="font-semibold text-xs text-zinc-300">@{c.user.username} </span>
                  <span className="text-xs text-zinc-200">{c.content}</span>
                </div>
              </div>
            ))}
          </div>
          {user && (
            <form onSubmit={handleComment} className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Написать комментарий..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 text-sm h-8"
              />
              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="px-3 py-1 bg-white text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 transition-all"
              >
                <Icon name="Send" size={14} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}