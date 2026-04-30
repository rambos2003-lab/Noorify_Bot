import logging
import random
import sqlite3
import os

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    ContextTypes
)

# ------------------ إعدادات ------------------
TOKEN = os.getenv("BOT_TOKEN")

if not TOKEN:
    print("❌ حط BOT_TOKEN أول")
    exit()

logging.basicConfig(level=logging.INFO)

# ------------------ قاعدة البيانات ------------------
conn = sqlite3.connect("bot.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    dhikr TEXT,
    count INTEGER
)
""")
conn.commit()

# ------------------ البيانات ------------------
DHIKRS = [
    "سبحان الله",
    "الحمد لله",
    "الله أكبر",
    "لا إله إلا الله"
]

# ------------------ أوامر ------------------

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("📿 ذكر عشوائي", callback_data="random")],
        [InlineKeyboardButton("🧮 المسبحة", callback_data="tasbih")]
    ]

    await update.message.reply_text(
        "✨ أهلاً بك في بوت الذكر ✨",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

# ------------------ Callback ------------------

async def handle(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    user_id = query.from_user.id

    if query.data == "random":
        dhikr = random.choice(DHIKRS)
        await query.edit_message_text(f"✨ {dhikr}")

    elif query.data == "tasbih":
        cursor.execute("INSERT OR IGNORE INTO users VALUES (?, ?, ?)", (user_id, "سبحان الله", 0))
        conn.commit()

        await show_counter(query, user_id)

    elif query.data == "inc":
        cursor.execute("UPDATE users SET count = count + 1 WHERE user_id = ?", (user_id,))
        conn.commit()

        await show_counter(query, user_id)

# ------------------ عرض العداد ------------------

async def show_counter(query, user_id):
    cursor.execute("SELECT dhikr, count FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()

    dhikr, count = row

    keyboard = [
        [InlineKeyboardButton("➕", callback_data="inc")]
    ]

    await query.edit_message_text(
        f"📿 {dhikr}\n\nالعدد: {count}",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

# ------------------ التشغيل ------------------

def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(handle))

    print("✅ Bot Running...")
    app.run_polling()

if __name__ == "__main__":
    main()
