import logging
import random
import os
import urllib.parse
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler, MessageHandler, filters
from constants import WELCOME_TEXT, DHIKRS, EMOTIONAL_MESSAGES, ADMIN_USERNAME, BOOKS, GITHUB_REPO_URL
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, time

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

TOKEN = os.getenv("BOT_TOKEN")
user_tasbih_data = {}
group_settings = {}
scheduler = AsyncIOScheduler()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    keyboard = [
        [InlineKeyboardButton("📿 ذكر عشوائي", callback_data='random_dhikr')],
        [InlineKeyboardButton("🕋 المسبحة الإلكترونية", callback_data='tasbih_menu')],
        [InlineKeyboardButton("📚 المكتبة الإسلامية", callback_data='library_menu')],
        [InlineKeyboardButton("📊 إحصائياتي", callback_data='my_stats')],
        [InlineKeyboardButton("🔔 تفعيل التذكيرات", callback_data='enable_reminders_admin')],
        [InlineKeyboardButton("🔕 إيقاف التذكيرات", callback_data='disable_reminders_admin')],
        [InlineKeyboardButton("ℹ️ مساعدة", callback_data='help_menu')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    # ملاحظة: تأكد أن WELCOME_TEXT في ملف constants يستخدم وسوم HTML مثل <b> بدلاً من *
    await update.message.reply_text(
        WELCOME_TEXT.format(admin=ADMIN_USERNAME),
        parse_mode='HTML',
        reply_markup=reply_markup
    )

async def random_dhikr(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    if query:
        await query.answer()
        chat_id = query.message.chat_id
    else:
        chat_id = update.message.chat_id

    dhikr = random.choice(DHIKRS)
    emotional_msg = random.choice(EMOTIONAL_MESSAGES)
    # استخدام HTML
    message_text = f"<b>{dhikr}</b>\n\n<i>{emotional_msg}</i>"

    keyboard = [
        [InlineKeyboardButton("📿 ذكر عشوائي آخر", callback_data='random_dhikr')],
        [InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await context.bot.send_message(
        chat_id=chat_id,
        text=message_text,
        parse_mode='HTML',
        reply_markup=reply_markup
    )

async def main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    keyboard = [
        [InlineKeyboardButton("📿 ذكر عشوائي", callback_data='random_dhikr')],
        [InlineKeyboardButton("🕋 المسبحة الإلكترونية", callback_data='tasbih_menu')],
        [InlineKeyboardButton("📚 المكتبة الإسلامية", callback_data='library_menu')],
        [InlineKeyboardButton("📊 إحصائياتي", callback_data='my_stats')],
        [InlineKeyboardButton("🔔 تفعيل التذكيرات", callback_data='enable_reminders_admin')],
        [InlineKeyboardButton("🔕 إيقاف التذكيرات", callback_data='disable_reminders_admin')],
        [InlineKeyboardButton("ℹ️ مساعدة", callback_data='help_menu')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text(
        WELCOME_TEXT.format(admin=ADMIN_USERNAME),
        parse_mode='HTML',
        reply_markup=reply_markup
    )

async def tasbih_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    keyboard = [
        [InlineKeyboardButton("ابدأ التسبيح (سبحان الله)", callback_data='start_tasbih_سبحان الله')],
        [InlineKeyboardButton("اختر ذكرًا آخر", callback_data='choose_dhikr')],
        [InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text("اختر الذكر الذي تريد التسبيح به:", reply_markup=reply_markup)

async def choose_dhikr(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    dhikr_options = [[InlineKeyboardButton(dhikr, callback_data=f'start_tasbih_{dhikr}')] for dhikr in DHIKRS[:5]] 
    dhikr_options.append([InlineKeyboardButton("🔙 رجوع", callback_data='tasbih_menu')])
    reply_markup = InlineKeyboardMarkup(dhikr_options)
    await query.edit_message_text("اختر الذكر من القائمة:", reply_markup=reply_markup)

async def start_tasbih(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    dhikr_to_tasbih = query.data.replace("start_tasbih_", "")

    user_tasbih_data[user_id] = {"dhikr": dhikr_to_tasbih, "count": 0}

    keyboard = [
        [InlineKeyboardButton(f"سبح ({dhikr_to_tasbih}) - العدد: 0", callback_data='increment_tasbih')],
        [InlineKeyboardButton("إعادة تعيين", callback_data='reset_tasbih')],
        [InlineKeyboardButton("🔙 رجوع", callback_data='tasbih_menu')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text(
        f"بدأت التسبيح بـ: <b>{dhikr_to_tasbih}</b>\nاضغط على الزر للتسبيح.",
        parse_mode='HTML',
        reply_markup=reply_markup
    )

async def increment_tasbih(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    if user_id in user_tasbih_data:
        user_tasbih_data[user_id]["count"] += 1
        current_count = user_tasbih_data[user_id]["count"]
        dhikr = user_tasbih_data[user_id]["dhikr"]

        keyboard = [
            [InlineKeyboardButton(f"سبح ({dhikr}) - العدد: {current_count}", callback_data='increment_tasbih')],
            [InlineKeyboardButton("إعادة تعيين", callback_data='reset_tasbih')],
            [InlineKeyboardButton("🔙 رجوع للمسبحة", callback_data='tasbih_menu')]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(
            f"بدأت التسبيح بـ: <b>{dhikr}</b>\nاضغط على الزر للتسبيح.",
            parse_mode='HTML',
            reply_markup=reply_markup
        )

async def reset_tasbih(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    if user_id in user_tasbih_data:
        dhikr = user_tasbih_data[user_id]["dhikr"]
        user_tasbih_data[user_id]["count"] = 0
        keyboard = [
            [InlineKeyboardButton(f"سبح ({dhikr}) - العدد: 0", callback_data='increment_tasbih')],
            [InlineKeyboardButton("إعادة تعيين", callback_data='reset_tasbih')],
            [InlineKeyboardButton("🔙 رجوع", callback_data='tasbih_menu')]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(
            f"تم إعادة تعيين التسبيح. بدأت التسبيح بـ: <b>{dhikr}</b>\nاضغط على الزر للتسبيح.",
            parse_mode='HTML',
            reply_markup=reply_markup
        )

async def library_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    keyboard = [[InlineKeyboardButton(book_name, callback_data=f'send_book_{book_name}')] for book_name in BOOKS.keys()]
    keyboard.append([InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')])
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text(
        "📚 <b>المكتبة الإسلامية</b>\n\nاختر الكتاب الذي تود قراءته:",
        parse_mode='HTML',
        reply_markup=reply_markup
    )

async def send_book(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    book_name = query.data.replace("send_book_", "")
    file_name = BOOKS.get(book_name)
    if file_name:
        file_url = f"{GITHUB_REPO_URL}{urllib.parse.quote(file_name)}"
        await query.message.reply_document(
            document=file_url,
            caption=f"📖 كتاب: <b>{book_name}</b>\n\n<i>تم الإرسال من بوت نورِ فاي</i>",
            parse_mode='HTML'
        )

async def my_stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    count = user_tasbih_data.get(query.from_user.id, {}).get("count", 0)
    stats_text = f"📊 <b>إحصائياتك في نورِ فاي</b>\n\n• عدد التسبيحات الحالية: <b>{count}</b>\n\n<i>استمر في ذكر الله.</i>"
    await query.edit_message_text(stats_text, parse_mode='HTML', reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))

# باقي الدوال (enable_reminders, help_menu, etc.) اتبع نفس المنطق:
# 1. غير parse_mode='Markdown' إلى parse_mode='HTML'
# 2. غير وسوم التنسيق من * إلى <b> ومن _ إلى <i>

# تأكد من تعديل دالة send_scheduled_reminder أيضاً:
async def send_scheduled_reminder(context: ContextTypes.DEFAULT_TYPE) -> None:
    job = context.job
    chat_id = job.chat_id
    dhikr = random.choice(DHIKRS)
    msg = random.choice(EMOTIONAL_MESSAGES)
    await context.bot.send_message(chat_id=chat_id, text=f"🔔 <b>تذكير بالذكر</b>\n\n<b>{dhikr}</b>\n\n<i>{msg}</i>", parse_mode='HTML')

# (قم بتعديل الدوال المتبقية بنفس الطريقة)
# Run the bot
def main() -> None:
    application = Application.builder().token(TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CallbackQueryHandler(random_dhikr, pattern='^random_dhikr$'))
    application.add_handler(CallbackQueryHandler(main_menu, pattern='^main_menu$'))
    application.add_handler(CallbackQueryHandler(tasbih_menu, pattern='^tasbih_menu$'))
    application.add_handler(CallbackQueryHandler(start_tasbih, pattern='^start_tasbih_.*$'))
    application.add_handler(CallbackQueryHandler(increment_tasbih, pattern="^increment_tasbih$"))
    application.add_handler(CallbackQueryHandler(reset_tasbih, pattern="^reset_tasbih$"))
    application.add_handler(CallbackQueryHandler(library_menu, pattern='^library_menu$'))
    application.add_handler(CallbackQueryHandler(send_book, pattern='^send_book_.*$'))
    application.add_handler(CallbackQueryHandler(my_stats, pattern='^my_stats$'))
    # أضف باقي الهاندلرز بنفس التسلسل القديم
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
