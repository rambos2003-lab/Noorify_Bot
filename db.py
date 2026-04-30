import sqlite3

conn = sqlite3.connect("bot.db", check_same_thread=False)
cursor = conn.cursor()

def init():
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        dhikr TEXT,
        count INTEGER DEFAULT 0
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS groups (
        chat_id INTEGER PRIMARY KEY,
        enabled INTEGER DEFAULT 1,
        interval INTEGER DEFAULT 2
    )
    """)
    conn.commit()
