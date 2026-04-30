import random
import urllib.parse
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from db import cursor, conn
from data import DHIKRS, MESSAGES, BOOKS
from keyboards import main_menu, back
from config import GITHUB_REPO

async def is_admin(update, context):
    if update.effective_chat.type == "private":
        return True
    member = await context.bot.get_chat_member(
        update.effective_chat.id,
        update.effective_user.id
    )
    return member.status in ["administrator", "creator"]

async def start(update, context):
    text = f"""
✨ *نورِ فاي | Noorify*

السلام عليكم ورحمة الله وبركاته 🌙

📿 مسبحة ذكية
📚 مكتبة PDF
🔔 تذكيرات تلقائية

⚙️ أضف البوت كمشرف

✨ لا تنسوا مشاركة البوت

👨‍💻 {context.bot.username}
"""
    await update.message.reply_text(text, parse_mode="Markdown", reply_markup=main_menu())

async def callback(update, context):
    q = update.callback_query
    await q.answer()

    uid = q.from_user.id
    data = q.data

    if data == "menu":
        await q.edit_message_text("🏠 القائمة", reply_markup=main_menu())

    elif data == "random":
        d = random.choice(DHIKRS)
        m = random.choice(MESSAGES)
        await q.edit_message_text(f"✨ *{d}*\n\n_{m}_", parse_mode="Markdown", reply_markup=main_menu())

    elif data == "tasbih":
        cursor.execute("INSERT OR IGNORE INTO users VALUES (?, ?, ?)", (uid, "سبحان الله", 0))
        conn.commit()
        await show_counter(q, uid)

    elif data == "inc":
        cursor.execute("UPDATE users SET count=count+1 WHERE user_id=?", (uid,))
        conn.commit()
        await show_counter(q, uid)

    elif data == "reset":
        cursor.execute("UPDATE users SET count=0 WHERE user_id=?", (uid,))
        conn.commit()
        await show_counter(q, uid)

    elif data == "library":
        kb = []
        for i, b in enumerate(BOOKS):
            kb.append([InlineKeyboardButton(b, callback_data=f"book_{i}")])
        kb.append([InlineKeyboardButton("🔙 رجوع", callback_data="menu")])
        await q.edit_message_text("📚 اختر كتاب:", reply_markup=InlineKeyboardMarkup(kb))

    elif data.startswith("book_"):
        i = int(data.split("_")[1])
        name = list(BOOKS.keys())[i]
        url = GITHUB_REPO + urllib.parse.quote(BOOKS[name])
        await q.message.reply_document(url, caption=name)

    elif data == "stats":
        cursor.execute("SELECT count FROM users WHERE user_id=?", (uid,))
        row = cursor.fetchone()
        c = row[0] if row else 0
        await q.edit_message_text(f"📊 عدد التسبيحات: {c}", reply_markup=main_menu())

    elif data == "admin":
        if not await is_admin(update, context):
            await q.answer("❌ للمشرفين فقط", show_alert=True)
            return

        kb = [
            [InlineKeyboardButton("✅ تشغيل التذكير", callback_data="enable")],
            [InlineKeyboardButton("❌ إيقاف التذكير", callback_data="disable")],
            [InlineKeyboardButton("🔙 رجوع", callback_data="menu")]
        ]
        await q.edit_message_text("⚙️ إعدادات الأدمن", reply_markup=InlineKeyboardMarkup(kb))
