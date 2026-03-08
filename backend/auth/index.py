"""
Аутентификация пользователей ВТФ: регистрация, вход, выход, проверка сессии.
Параметр action: register | login | me | logout
"""
import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta

DB = os.environ["DATABASE_URL"]
SCHEMA = "t_p39907740_project_quantum_leap"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(DB)


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


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
        if action == "register":
            username = body.get("username", "").strip()
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")

            if not username or not email or not password:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполни все поля"})}
            if len(password) < 6:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пароль минимум 6 символов"})}

            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email=%s OR username=%s", (email, username))
            if cur.fetchone():
                return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Пользователь уже существует"})}

            pw_hash = hash_password(password)
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id, username, email",
                (username, email, pw_hash),
            )
            user = cur.fetchone()
            user_id = user[0]

            tok = secrets.token_hex(32)
            expires = datetime.now() + timedelta(days=30)
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
                (user_id, tok, expires),
            )
            conn.commit()

            return {
                "statusCode": 201,
                "headers": CORS,
                "body": json.dumps({"token": tok, "user": {"id": user_id, "username": user[1], "email": user[2]}}),
            }

        if action == "login":
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")

            cur.execute(
                f"SELECT id, username, email, avatar_url, bio FROM {SCHEMA}.users WHERE email=%s AND password_hash=%s",
                (email, hash_password(password)),
            )
            user = cur.fetchone()
            if not user:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}

            tok = secrets.token_hex(32)
            expires = datetime.now() + timedelta(days=30)
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
                (user[0], tok, expires),
            )
            conn.commit()

            return {
                "statusCode": 200,
                "headers": CORS,
                "body": json.dumps({
                    "token": tok,
                    "user": {"id": user[0], "username": user[1], "email": user[2], "avatar_url": user[3], "bio": user[4]},
                }),
            }

        if action == "me":
            if not token:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Нет токена"})}
            cur.execute(
                f"""SELECT u.id, u.username, u.email, u.avatar_url, u.bio
                    FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON s.user_id=u.id
                    WHERE s.token=%s AND s.expires_at > NOW()""",
                (token,),
            )
            user = cur.fetchone()
            if not user:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}
            return {
                "statusCode": 200,
                "headers": CORS,
                "body": json.dumps({"id": user[0], "username": user[1], "email": user[2], "avatar_url": user[3], "bio": user[4]}),
            }

        if action == "logout":
            if token:
                cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at=NOW() WHERE token=%s", (token,))
                conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажи action"})}

    finally:
        cur.close()
        conn.close()
