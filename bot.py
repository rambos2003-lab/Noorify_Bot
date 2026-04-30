import logging
import random
import os
import urllib.parse
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler, MessageHandler, filters
from constants import WELCOME_TEXT, DHIKRS, EMOTIONAL_MESSAGES, ADMIN_USERNAME, BOOKS, GITHUB_REPO_URL
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, time, timedelta

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Get bot token from environment variable
TOKEN = os.getenv("BOT_TOKEN")

# Global data stores
user_tasbih_data = {}
group_settings = {}

# --- Helper Functions ---

async def is_admin(update: Update) -> bool:
    """Checks if the user is an admin in the chat."""
    if update.effective_chat.type == "private":
        return True
    user_id = update.effective_user.id
    try:
        member = await update.effective_chat.get_member(user_id)
        return member.status in ["creator", "administrator"]
    except Exception as e:
        logger.error(f"Error checking admin status: {e}")
        return False

async def get_main_menu_keyboard():
    return [
        [InlineKeyboardButton("📿 ذكر عشوائي", callback_data='random_dhikr')],
        [InlineKeyboardButton("🕋 المسبحة الإلكترونية", callback_data='tasbih_menu')],
        [InlineKeyboardButton("📚 المكتبة الإسلامية", callback_data='library_menu')],
        [InlineKeyboardButton("📊 إحصائياتي", callback_data='my_stats')],
        [InlineKeyboardButton("🔔 تفعيل التذكيرات (للمشرفين)", callback_data='enable_reminders_admin')],
        [InlineKeyboardButton("🔕 إيقاف التذكيرات (للمشرفين)", callback_data='disable_reminders_admin')],
        [InlineKeyboardButton("⚙️ ضبط فترة التذكير (للمشرفين)", callback_data='set_reminder_interval_admin')],
        [InlineKeyboardButton("ℹ️ مساعدة", callback_data='help_menu')]
    ]

# --- Command Handlers ---

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    keyboard = await get_main_menu_keyboard()
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        WELCOME_TEXT.format(admin=ADMIN_USERNAME),
        parse_mode='Markdown',
        reply_markup=reply_markup
    )

async def main_menu_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    keyboard = await get_main_menu_keyboard()
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        WELCOME_TEXT.format(admin=ADMIN_USERNAME),
        parse_mode='Markdown',
        reply_markup=reply_markup
    )

async def tasbih_menu_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    keyboard = [
        [InlineKeyboardButton("ابدأ التسبيح (سبحان الله)", callback_data='start_tasbih_سبحان الله')],
        [InlineKeyboardButton("اختر ذكرًا آخر", callback_data='choose_dhikr')],
        [InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("اختر الذكر الذي تريد التسبيح به:", reply_markup=reply_markup)

async def library_menu_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    keyboard = []
    for book_name in BOOKS.keys():
        keyboard.append([InlineKeyboardButton(book_name, callback_data=f'send_book_{book_name}')])
    keyboard.append([InlineKeyboardButton("🔙 رجوع للقائمة الرئيسية", callback_data='main_menu')])
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("📚 *المكتبة الإسلامية*\n\nاختر الكتاب الذي تود قراءته أو تحميله بصيغة PDF:", parse_mode='Markdown', reply_markup=reply_markup)

async def my_stats_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    count = user_tasbih_data.get(user_id, {}).get("count", 0)
    stats_text = f"📊 *إحصائياتك في نورِ فاي*\n\n• عدد التسبيحات الحالية: *{count}*\n• الحالة: *{'نشط' if count > 0 else 'بانتظار البدء'}*\n\n_استمر في ذكر الله، فبذكر الله تطمئن القلوب._"
    await update.message.reply_text(stats_text, parse_mode='Markdown', reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))

# --- Callback Query Handlers ---

async def main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    keyboard = await get_main_menu_keyboard()
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text(
        WELCOME_TEXT.format(admin=ADMIN_USERNAME),
        parse_mode='Markdown',
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
    message_text = f"*{dhikr}*\n\n_{emotional_msg}_"

    keyboard = [
        [InlineKeyboardButton("📿 ذكر عشوائي آخر", callback_data='random_dhikr')],
        [InlineKeyboardButton("🔙 رجوع للقائمة الرئيسية", callback_data='main_menu')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await context.bot.send_message(chat_id=chat_id, text=message_text, parse_mode='Markdown', reply_markup=reply_markup)

async def tasbih_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    keyboard = [
        [InlineKeyboardButton("ابدأ التسبيح (سبحان الله)", callback_data='start_tasbih_سبحان الله')],
        [InlineKeyboardButton("اختر ذكرًا آخر", callback_data='choose_dhikr')],
        [InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]
    ]
    await query.edit_message_text("اختر الذكر الذي تريد التسبيح به:", reply_markup=InlineKeyboardMarkup(keyboard))

async def choose_dhikr(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    dhikr_options = [[InlineKeyboardButton(dhikr, callback_data=f'start_tasbih_{dhikr}')] for dhikr in DHIKRS[:5]]
    dhikr_options.append([InlineKeyboardButton("🔙 رجوع", callback_data='tasbih_menu')])
    await query.edit_message_text("اختر الذكر من القائمة:", reply_markup=InlineKeyboardMarkup(dhikr_options))

async def start_tasbih(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    dhikr_to_tasbih = query.data.replace("start_tasbih_", "")
    user_tasbih_data[user_id] = {"dhikr": dhikr_to_tasbih, "count": 0}
    keyboard = [
        [InlineKeyboardButton(f"سبح ({dhikr_to_tasbih}) - العدد: 0", callback_data='increment_tasbih')],
        [InlineKeyboardButton("إعادة تعيين", callback_data='reset_tasbih')],
        [InlineKeyboardButton("🔙 رجوع للمسبحة", callback_data='tasbih_menu')]
    ]
    await query.edit_message_text(f"بدأت التسبيح بـ: *{dhikr_to_tasbih}*\nاضغط على الزر للتسبيح.", parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard))

async def increment_tasbih(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    if user_id in user_tasbih_data:
        user_tasbih_data[user_id]["count"] += 1
        count = user_tasbih_data[user_id]["count"]
        dhikr = user_tasbih_data[user_id]["dhikr"]
        keyboard = [
            [InlineKeyboardButton(f"سبح ({dhikr}) - العدد: {count}", callback_data='increment_tasbih')],
            [InlineKeyboardButton("إعادة تعيين", callback_data='reset_tasbih')],
            [InlineKeyboardButton("🔙 رجوع للمسبحة", callback_data='tasbih_menu')]
        ]
        await query.edit_message_text(f"بدأت التسبيح بـ: *{dhikr}*\nاضغط على الزر للتسبيح.", parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard))

async def reset_tasbih(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    if user_id in user_tasbih_data:
        user_tasbih_data[user_id]["count"] = 0
        dhikr = user_tasbih_data[user_id]["dhikr"]
        keyboard = [
            [InlineKeyboardButton(f"سبح ({dhikr}) - العدد: 0", callback_data='increment_tasbih')],
            [InlineKeyboardButton("إعادة تعيين", callback_data='reset_tasbih')],
            [InlineKeyboardButton("🔙 رجوع للمسبحة", callback_data='tasbih_menu')]
        ]
        await query.edit_message_text(f"تم إعادة تعيين التسبيح. بدأت التسبيح بـ: *{dhikr}*", parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard))

async def library_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    keyboard = [[InlineKeyboardButton(name, callback_data=f'send_book_{name}')] for name in BOOKS.keys()]
    keyboard.append([InlineKeyboardButton("🔙 رجوع للقائمة الرئيسية", callback_data='main_menu')])
    await query.edit_message_text("📚 *المكتبة الإسلامية*\n\nاختر الكتاب الذي تود قراءته:", parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard))

async def send_book(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    book_name = query.data.replace("send_book_", "")
    file_name = BOOKS.get(book_name)
    if file_name:
        file_url = f"{GITHUB_REPO_URL}{urllib.parse.quote(file_name)}"
        await query.message.reply_chat_action("upload_document")
        try:
            await query.message.reply_document(document=file_url, caption=f"📖 كتاب: *{book_name}*", parse_mode='Markdown')
        except Exception as e:
            logger.error(f"Error sending book: {e}")
            await query.message.reply_text("عذراً، حدث خطأ أثناء إرسال الكتاب.")

async def my_stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    count = user_tasbih_data.get(user_id, {}).get("count", 0)
    stats_text = f"📊 *إحصائياتك في نورِ فاي*\n\n• عدد التسبيحات الحالية: *{count}*\n\n_استمر في ذكر الله._"
    await query.edit_message_text(stats_text, parse_mode='Markdown', reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))

# --- Admin & Reminder Handlers ---

async def enable_reminders_admin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    if not await is_admin(update):
        await query.message.reply_text("⚠️ هذا الأمر مخصص للمشرفين فقط.")
        return
    chat_id = update.effective_chat.id
    group_settings[chat_id] = group_settings.get(chat_id, {"enabled": True, "interval": 2})
    group_settings[chat_id]["enabled"] = True
    interval = group_settings[chat_id]["interval"]
    context.job_queue.run_repeating(send_scheduled_reminder, interval=interval*3600, first=10, chat_id=chat_id, name=f"reminder_{chat_id}")
    await query.edit_message_text(f"✅ تم تفعيل التذكيرات كل {interval} ساعة.", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))

async def disable_reminders_admin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    if not await is_admin(update):
        await query.message.reply_text("⚠️ هذا الأمر مخصص للمشرفين فقط.")
        return
    chat_id = update.effective_chat.id
    if chat_id in group_settings:
        group_settings[chat_id]["enabled"] = False
    for job in context.job_queue.get_jobs_by_name(f"reminder_{chat_id}"):
        job.schedule_removal()
    await query.edit_message_text("🔕 تم إيقاف التذكيرات.", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))

async def set_reminder_interval_admin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    if not await is_admin(update):
        await query.message.reply_text("⚠️ هذا الأمر مخصص للمشرفين فقط.")
        return
    keyboard = [
        [InlineKeyboardButton("كل ساعة", callback_data='set_int_1'), InlineKeyboardButton("كل ساعتين", callback_data='set_int_2')],
        [InlineKeyboardButton("كل 4 ساعات", callback_data='set_int_4'), InlineKeyboardButton("كل 6 ساعات", callback_data='set_int_6')],
        [InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]
    ]
    await query.edit_message_text("اختر الفترة الزمنية للتذكير:", reply_markup=InlineKeyboardMarkup(keyboard))

async def apply_interval(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    interval = int(query.data.replace("set_int_", ""))
    chat_id = update.effective_chat.id
    group_settings[chat_id] = group_settings.get(chat_id, {"enabled": True, "interval": interval})
    group_settings[chat_id]["interval"] = interval
    if group_settings[chat_id]["enabled"]:
        for job in context.job_queue.get_jobs_by_name(f"reminder_{chat_id}"):
            job.schedule_removal()
        context.job_queue.run_repeating(send_scheduled_reminder, interval=interval*3600, first=10, chat_id=chat_id, name=f"reminder_{chat_id}")
    await query.edit_message_text(f"✅ تم ضبط الفترة لتكون كل {interval} ساعة.", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))

async def help_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    help_text = "📖 *دليل استخدام بوت نورِ فاي*\n\n• المسبحة، الأذكار، المكتبة، التذكيرات، والصيام.\n\n📌 للمشرفين: التحكم متاح عبر القائمة الرئيسية."
    await query.edit_message_text(help_text, parse_mode='Markdown', reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))

# --- Scheduled Tasks ---

async def send_scheduled_reminder(context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = context.job.chat_id
    dhikr = random.choice(DHIKRS)
    emotional_msg = random.choice(EMOTIONAL_MESSAGES)
    await context.bot.send_message(chat_id=chat_id, text=f"🔔 *تذكير*\n\n*{dhikr}*\n\n_{emotional_msg}_", parse_mode='Markdown')

async def send_fasting_reminder(context: ContextTypes.DEFAULT_TYPE) -> None:
    day = datetime.now().weekday()
    if day == 6: # Sunday
        msg = "🌙 *تذكير بصيام غدٍ الاثنين*\n\nقال ﷺ: 'تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ'"
    elif day == 2: # Wednesday
        msg = "🌙 *تذكير بصيام غدٍ الخميس*\n\nقال ﷺ: 'تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ'"
    else: return
    for chat_id, settings in group_settings.items():
        if settings.get("enabled"):
            try: await context.bot.send_message(chat_id=chat_id, text=msg, parse_mode='Markdown')
            except: pass

async def on_bot_added(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    for member in update.message.new_chat_members:
        if member.id == context.bot.id:
            chat_id = update.effective_chat.id
            await context.bot.send_message(chat_id=chat_id, text="✅ تم تفعيل البوت بنجاح. سيتم إرسال تذكيرات كل ساعتين.", parse_mode='Markdown')
            group_settings[chat_id] = {"enabled": True, "interval": 2}
            context.job_queue.run_repeating(send_scheduled_reminder, interval=2*3600, first=10, chat_id=chat_id, name=f"reminder_{chat_id}")

# --- Main ---

def main() -> None:
    if not TOKEN:
        logger.error("No BOT_TOKEN found in environment variables!")
        return
    application = Application.builder().token(TOKEN).build()

    # Handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("menu", main_menu_cmd))
    application.add_handler(CommandHandler("dhikr", random_dhikr))
    application.add_handler(CommandHandler("tasbih", tasbih_menu_cmd))
    application.add_handler(CommandHandler("library", library_menu_cmd))
    application.add_handler(CommandHandler("stats", my_stats_cmd))
    application.add_handler(MessageHandler(filters.StatusUpdate.NEW_CHAT_MEMBERS, on_bot_added))

    # Callbacks
    application.add_handler(CallbackQueryHandler(random_dhikr, pattern='^random_dhikr$'))
    application.add_handler(CallbackQueryHandler(main_menu, pattern='^main_menu$'))
    application.add_handler(CallbackQueryHandler(tasbih_menu, pattern='^tasbih_menu$'))
    application.add_handler(CallbackQueryHandler(choose_dhikr, pattern='^choose_dhikr$'))
    application.add_handler(CallbackQueryHandler(start_tasbih, pattern='^start_tasbih_.*$'))
    application.add_handler(CallbackQueryHandler(increment_tasbih, pattern='^increment_tasbih$'))
    application.add_handler(CallbackQueryHandler(reset_tasbih, pattern='^reset_tasbih$'))
    application.add_handler(CallbackQueryHandler(library_menu, pattern='^library_menu$'))
    application.add_handler(CallbackQueryHandler(send_book, pattern='^send_book_.*$'))
    application.add_handler(CallbackQueryHandler(my_stats, pattern='^my_stats$'))
    application.add_handler(CallbackQueryHandler(enable_reminders_admin, pattern='^enable_reminders_admin$'))
    application.add_handler(CallbackQueryHandler(disable_reminders_admin, pattern='^disable_reminders_admin$'))
    application.add_handler(CallbackQueryHandler(set_reminder_interval_admin, pattern='^set_reminder_interval_admin$'))
    application.add_handler(CallbackQueryHandler(apply_interval, pattern='^set_int_.*$'))
    application.add_handler(CallbackQueryHandler(help_menu, pattern='^help_menu$'))

    # Jobs
    application.job_queue.run_daily(send_fasting_reminder, time=time(20, 0, 0))

    application.run_polling()

if __name__ == "__main__":
    main()
