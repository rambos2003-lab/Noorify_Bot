# -*- coding: utf-8 -*-
import logging
import random
import sqlite3
import os
import urllib.parse
from datetime import datetime, time

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, constants
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes, MessageHandler, filters

# ================= CONFIG =================
TOKEN = os.getenv("BOT_TOKEN")

if not TOKEN:
    print("❌ لازم تحط BOT_TOKEN")
    exit()

ADMIN_USERNAME = "@vx_rq"
GITHUB_REPO = "https://raw.githubusercontent.com/vx_rq/Noorify/main/"

# ================= LOG =================
logging.basicConfig(level=logging.INFO)

# ================= DATABASE =================
conn = sqlite3.connect("bot.db", check_same_thread=False)
cursor = conn.cursor()

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

# ================= DATA =================
DHIKRS = [
    "سبحان الله", "الحمد لله", "الله أكبر", "لا إله إلا الله",
    "أستغفر الله", "سبحان الله وبحمده", "سبحان الله العظيم"
]

MESSAGES = [
    "اللهم تقبل منك", "الله يثبتك", "زادك الله نوراً",
    "الله يزيدك من فضله", "هنيئاً لك الأجر", "الله يسعد قلبك"
]

BOOKS = {
    "حصن مسلم": "pdf.حصن مسلم",
    "رياض الصالحين": "pdf.رياض الصالحين",
    "أذكار الصباح والمساء": "pdf.أذكار الصباح والمساء"
}

# ================= HELPERS =================
async def is_admin(update, context):
    if update.effective_chat.type == "private":
        return True
    member = await context.bot.get_chat_member(update.effective_chat.id, update.effective_user.id)
    return member.status in ["administrator", "creator"]

def main_menu():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("📿 ذكر عشوائي", callback_data="random")],
        [InlineKeyboardButton("🧮 المسبحة", callback_data="tasbih")],
        [InlineKeyboardButton("📚 المكتبة", callback_data="library")],
        [InlineKeyboardButton("📊 إحصائياتي", callback_data="stats")],
        [InlineKeyboardButton("⚙️ إعدادات (أدمن)", callback_data="admin")]
    ])

# ================= START =================
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = f"""
✨ *نورِ فاي | Noorify*

السلام عليكم ورحمة الله وبركاته 🌙

أهلاً بكم في بوت نورِ فاي 🤍

📌 *طريقة الاستخدام:*
• مسبحة ذكية بعداد
• مكتبة PDF
• تذكيرات تلقائية

⚙️ أضف البوت كمشرف في المجموعات

✨ لا تنسوا مشاركة البوت

👨‍💻 المطور: {ADMIN_USERNAME}
"""
    await update.message.reply_text(text, parse_mode="Markdown", reply_markup=main_menu())

# ================= CALLBACK =================
async def callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    user_id = query.from_user.id
    data = query.data

    if data == "random":
        dhikr = random.choice(DHIKRS)
        msg = random.choice(MESSAGES)
        await query.edit_message_text(f"✨ *{dhikr}*\n\n_{msg}_", parse_mode="Markdown", reply_markup=main_menu())

    elif data == "tasbih":
        cursor.execute("INSERT OR IGNORE INTO users VALUES (?, ?, ?)", (user_id, "سبحان الله", 0))
        conn.commit()
        await show_counter(query, user_id)

    elif data == "inc":
        cursor.execute("UPDATE users SET count = count + 1 WHERE user_id = ?", (user_id,))
        conn.commit()
        await show_counter(query, user_id)

    elif data == "library":
        keyboard = []
        for i, name in enumerate(BOOKS.keys()):
            keyboard.append([InlineKeyboardButton(name, callback_data=f"book_{i}")])
        keyboard.append([InlineKeyboardButton("🔙 رجوع", callback_data="menu")])
        await query.edit_message_text("📚 اختر كتاب:", reply_markup=InlineKeyboardMarkup(keyboard))

    elif data.startswith("book_"):
        i = int(data.split("_")[1])
        name = list(BOOKS.keys())[i]
        file = BOOKS[name]
        url = GITHUB_REPO + urllib.parse.quote(file)

        await query.message.reply_document(url, caption=name)

    elif data == "stats":
        cursor.execute("SELECT count FROM users WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        count = row[0] if row else 0
        await query.edit_message_text(f"📊 عدد التسبيحات: {count}", reply_markup=main_menu())

    elif data == "admin":
        if not await is_admin(update, context):
            await query.answer("❌ للمشرفين فقط", show_alert=True)
            return

        keyboard = [
            [InlineKeyboardButton("تشغيل التذكير", callback_data="enable")],
            [InlineKeyboardButton("إيقاف التذكير", callback_data="disable")],
            [InlineKeyboardButton("🔙 رجوع", callback_data="menu")]
        ]
        await query.edit_message_text("⚙️ إعدادات", reply_markup=InlineKeyboardMarkup(keyboard))

    elif data == "menu":
        await query.edit_message_text("🏠 القائمة الرئيسية", reply_markup=main_menu())

# ================= COUNTER =================
async def show_counter(query, user_id):
    cursor.execute("SELECT dhikr, count FROM users WHERE user_id = ?", (user_id,))
    dhikr, count = cursor.fetchone()

    keyboard = [
        [InlineKeyboardButton("➕", callback_data="inc")],
        [InlineKeyboardButton("🔙 رجوع", callback_data="menu")]
    ]

    await query.edit_message_text(f"📿 {dhikr}\n\nالعدد: {count}", reply_markup=InlineKeyboardMarkup(keyboard))

# ================= REMINDER =================
async def reminder(context):
    for row in cursor.execute("SELECT chat_id FROM groups WHERE enabled=1"):
        chat_id = row[0]
        dhikr = random.choice(DHIKRS)
        msg = random.choice(MESSAGES)
        await context.bot.send_message(chat_id, f"🔔 {dhikr}\n\n{msg}")

# ================= MAIN =================
def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(callback))

    print("✅ Bot Running...")
    app.run_polling()

if __name__ == "__main__":
    main()
