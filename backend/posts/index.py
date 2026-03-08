"""
Посты ВТФ: создание, лента, лайки, комментарии, профиль.
Параметр action: feed | create | like | comments | comment | profile
"""
import json
import os
import psycopg2

DB = os.environ["DATABASE_URL"]
SCHEMA = "t_p39907740_project_quantum_leap"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(DB)


def get_user_by_token(cur, token):
    cur.execute(
        f"""SELECT u.id, u.username, u.avatar_url
            FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON s.user_id=u.id
            WHERE s.token=%s AND s.expires_at > NOW()""",
        (token,),
    )
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    body = json.loads(event.get("body") or "{}")
    headers = event.get("headers", {})
    token = headers.get("x-auth-token") or headers.get("X-Auth-Token")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    conn = get_conn()
    cur = conn.cursor()

    try:
        if action == "feed":
            viewer_id = None
            if token:
                u = get_user_by_token(cur, token)
                if u:
                    viewer_id = u[0]

            cur.execute(
                f"""SELECT p.id, p.content, p.image_url, p.created_at,
                           u.id, u.username, u.avatar_url,
                           COUNT(DISTINCT l.id) as likes_count,
                           COUNT(DISTINCT c.id) as comments_count,
                           BOOL_OR(l2.user_id = %s) as liked
                    FROM {SCHEMA}.posts p
                    JOIN {SCHEMA}.users u ON p.user_id = u.id
                    LEFT JOIN {SCHEMA}.likes l ON l.post_id = p.id
                    LEFT JOIN {SCHEMA}.likes l2 ON l2.post_id = p.id AND l2.user_id = %s
                    LEFT JOIN {SCHEMA}.comments c ON c.post_id = p.id
                    GROUP BY p.id, p.content, p.image_url, p.created_at, u.id, u.username, u.avatar_url
                    ORDER BY p.created_at DESC
                    LIMIT 50""",
                (viewer_id, viewer_id),
            )
            rows = cur.fetchall()
            posts = [
                {
                    "id": r[0],
                    "content": r[1],
                    "image_url": r[2],
                    "created_at": r[3].isoformat(),
                    "user": {"id": r[4], "username": r[5], "avatar_url": r[6]},
                    "likes_count": r[7],
                    "comments_count": r[8],
                    "liked": bool(r[9]),
                }
                for r in rows
            ]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(posts)}

        if action == "create":
            if not token:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Нужна авторизация"})}
            user = get_user_by_token(cur, token)
            if not user:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

            content = body.get("content", "").strip()
            if not content:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пост не может быть пустым"})}

            cur.execute(
                f"INSERT INTO {SCHEMA}.posts (user_id, content, image_url) VALUES (%s, %s, %s) RETURNING id, content, image_url, created_at",
                (user[0], content, body.get("image_url")),
            )
            post = cur.fetchone()
            conn.commit()
            return {
                "statusCode": 201,
                "headers": CORS,
                "body": json.dumps({
                    "id": post[0],
                    "content": post[1],
                    "image_url": post[2],
                    "created_at": post[3].isoformat(),
                    "user": {"id": user[0], "username": user[1], "avatar_url": user[2]},
                    "likes_count": 0,
                    "comments_count": 0,
                    "liked": False,
                }),
            }

        if action == "like":
            if not token:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Нужна авторизация"})}
            user = get_user_by_token(cur, token)
            if not user:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

            post_id = body.get("post_id")
            cur.execute(f"SELECT id FROM {SCHEMA}.likes WHERE user_id=%s AND post_id=%s", (user[0], post_id))
            existing = cur.fetchone()
            if existing:
                cur.execute(f"UPDATE {SCHEMA}.likes SET created_at=created_at WHERE id=%s RETURNING id", (existing[0],))
                cur.execute(f"SELECT id FROM {SCHEMA}.likes WHERE id=%s", (existing[0],))
                cur.execute(f"UPDATE {SCHEMA}.posts SET id=id WHERE id=%s", (post_id,))
                cur.execute(f"DELETE FROM {SCHEMA}.likes WHERE user_id=%s AND post_id=%s", (user[0], post_id))
                liked = False
            else:
                cur.execute(f"INSERT INTO {SCHEMA}.likes (user_id, post_id) VALUES (%s, %s)", (user[0], post_id))
                liked = True
            conn.commit()

            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.likes WHERE post_id=%s", (post_id,))
            count = cur.fetchone()[0]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"liked": liked, "likes_count": count})}

        if action == "comments":
            post_id = params.get("post_id")
            cur.execute(
                f"""SELECT c.id, c.content, c.created_at, u.id, u.username, u.avatar_url
                    FROM {SCHEMA}.comments c JOIN {SCHEMA}.users u ON c.user_id=u.id
                    WHERE c.post_id=%s ORDER BY c.created_at ASC""",
                (post_id,),
            )
            rows = cur.fetchall()
            comments = [
                {
                    "id": r[0],
                    "content": r[1],
                    "created_at": r[2].isoformat(),
                    "user": {"id": r[3], "username": r[4], "avatar_url": r[5]},
                }
                for r in rows
            ]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(comments)}

        if action == "comment":
            if not token:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Нужна авторизация"})}
            user = get_user_by_token(cur, token)
            if not user:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

            post_id = body.get("post_id")
            content = body.get("content", "").strip()
            if not content:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Комментарий пустой"})}

            cur.execute(
                f"INSERT INTO {SCHEMA}.comments (user_id, post_id, content) VALUES (%s, %s, %s) RETURNING id, content, created_at",
                (user[0], post_id, content),
            )
            c = cur.fetchone()
            conn.commit()
            return {
                "statusCode": 201,
                "headers": CORS,
                "body": json.dumps({
                    "id": c[0],
                    "content": c[1],
                    "created_at": c[2].isoformat(),
                    "user": {"id": user[0], "username": user[1], "avatar_url": user[2]},
                }),
            }

        if action == "profile":
            user_id = params.get("user_id")
            cur.execute(
                f"SELECT id, username, email, avatar_url, bio, created_at FROM {SCHEMA}.users WHERE id=%s",
                (user_id,),
            )
            u = cur.fetchone()
            if not u:
                return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Пользователь не найден"})}

            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.posts WHERE user_id=%s", (user_id,))
            posts_count = cur.fetchone()[0]

            viewer_id = None
            if token:
                viewer = get_user_by_token(cur, token)
                if viewer:
                    viewer_id = viewer[0]

            cur.execute(
                f"""SELECT p.id, p.content, p.image_url, p.created_at,
                           COUNT(DISTINCT l.id) as likes_count,
                           COUNT(DISTINCT c.id) as comments_count,
                           BOOL_OR(l2.user_id = %s) as liked
                    FROM {SCHEMA}.posts p
                    LEFT JOIN {SCHEMA}.likes l ON l.post_id = p.id
                    LEFT JOIN {SCHEMA}.likes l2 ON l2.post_id = p.id AND l2.user_id = %s
                    LEFT JOIN {SCHEMA}.comments c ON c.post_id = p.id
                    WHERE p.user_id = %s
                    GROUP BY p.id, p.content, p.image_url, p.created_at
                    ORDER BY p.created_at DESC""",
                (viewer_id, viewer_id, user_id),
            )
            rows = cur.fetchall()
            posts = [
                {
                    "id": r[0],
                    "content": r[1],
                    "image_url": r[2],
                    "created_at": r[3].isoformat(),
                    "user": {"id": u[0], "username": u[1], "avatar_url": u[3]},
                    "likes_count": r[4],
                    "comments_count": r[5],
                    "liked": bool(r[6]),
                }
                for r in rows
            ]

            return {
                "statusCode": 200,
                "headers": CORS,
                "body": json.dumps({
                    "user": {
                        "id": u[0],
                        "username": u[1],
                        "avatar_url": u[3],
                        "bio": u[4],
                        "created_at": u[5].isoformat(),
                        "posts_count": posts_count,
                    },
                    "posts": posts,
                }),
            }

        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажи action"})}

    finally:
        cur.close()
        conn.close()
