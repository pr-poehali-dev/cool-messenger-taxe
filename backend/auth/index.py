"""
Аутентификация пользователей TAXE: регистрация, вход, получение профиля.
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = "t_p87581554_cool_messenger_taxe"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    headers = event.get("headers") or {}

    # GET /me — получить текущего пользователя по токену
    if method == "GET":
        token = headers.get("x-session-token") or headers.get("X-Session-Token")
        if not token:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, email, username, color, bio, status, photo FROM {SCHEMA}.users WHERE session_token = %s",
            (token,)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия недействительна"})}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "id": row[0], "email": row[1], "username": row[2],
            "color": row[3], "bio": row[4], "status": row[5], "photo": row[6]
        })}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        action = body.get("action")

        # Регистрация
        if action == "register":
            email = (body.get("email") or "").strip().lower()
            username = (body.get("username") or "").strip()
            password = body.get("password") or ""

            if not email or not username or not password:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполни все поля"})}
            if len(password) < 6:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пароль минимум 6 символов"})}
            if len(username) < 3:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Имя минимум 3 символа"})}

            pw_hash = hash_password(password)
            token = secrets.token_hex(32)

            conn = get_conn()
            cur = conn.cursor()
            try:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.users (email, password_hash, username, session_token) VALUES (%s, %s, %s, %s) RETURNING id, username, color, bio, status",
                    (email, pw_hash, username, token)
                )
                row = cur.fetchone()
                conn.commit()
                conn.close()
            except Exception as e:
                try:
                    conn.rollback()
                    conn.close()
                except Exception:
                    pass
                err_str = str(e).lower()
                if "unique" in err_str or "duplicate" in err_str:
                    msg = "Этот email уже занят" if "email" in err_str else "Это имя уже занято"
                    return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": msg})}
                return {"statusCode": 500, "headers": CORS, "body": json.dumps({"error": "Ошибка сервера"})}

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                "token": token, "user": {
                    "id": row[0], "email": email, "username": row[1],
                    "color": row[2], "bio": row[3], "status": row[4], "photo": None
                }
            })}

        # Вход
        if action == "login":
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""

            if not email or not password:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Введи email и пароль"})}

            pw_hash = hash_password(password)
            token = secrets.token_hex(32)

            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT id, username, color, bio, status, photo FROM {SCHEMA}.users WHERE email = %s AND password_hash = %s",
                (email, pw_hash)
            )
            row = cur.fetchone()
            if not row:
                conn.close()
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}

            cur.execute(f"UPDATE {SCHEMA}.users SET session_token = %s WHERE id = %s", (token, row[0]))
            conn.commit()
            conn.close()

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                "token": token, "user": {
                    "id": row[0], "email": email, "username": row[1],
                    "color": row[2], "bio": row[3], "status": row[4], "photo": row[5]
                }
            })}

        # Выход
        if action == "logout":
            token = headers.get("x-session-token") or headers.get("X-Session-Token")
            if token:
                conn = get_conn()
                cur = conn.cursor()
                cur.execute(f"UPDATE {SCHEMA}.users SET session_token = NULL WHERE session_token = %s", (token,))
                conn.commit()
                conn.close()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}