import logging
import random
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler
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

# Dictionary to store tasbih counts for each user
user_tasbih_data = {}
# Dictionary to store group settings (reminder interval, enabled/disabled)
group_settings = {}
# Scheduler for reminders
scheduler = AsyncIOScheduler()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends a welcome message when the command /start is issued."""
    keyboard = [
        [InlineKeyboardButton("📿 ذكر عشوائي", callback_data=\'random_dhikr\')],
        [InlineKeyboardButton("🕋 المسبحة الإلكترونية", callback_data=\'tasbih_menu\')],
        [InlineKeyboardButton("📚 المكتبة الإسلامية", callback_data=\'library_menu\')],
        [InlineKeyboardButton("📊 إحصائياتي", callback_data=\'my_stats\')],
        [InlineKeyboardButton("🔔 تفعيل التذكيرات (للمشرفين)", callback_data=\'enable_reminders_admin\')],
        [InlineKeyboardButton("🔕 إيقاف التذكيرات (للمشرفين)", callback_data=\'disable_reminders_admin\')],
        [InlineKeyboardButton("⚙️ ضبط فترة التذكير (للمشرفين)", callback_data=\'set_reminder_interval_admin\')],
        [InlineKeyboardButton("ℹ️ مساعدة", callback_data=\'help_menu\')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        WELCOME_TEXT.format(admin=ADMIN_USERNAME),
        parse_mode=\'Markdown\',
        reply_markup=reply_markup
    )

async def random_dhikr(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends a random dhikr with an emotional message."""
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
        [InlineKeyboardButton("📿 ذكر عشوائي آخر", callback_data=\'random_dhikr\')],
        [InlineKeyboardButton("🔙 رجوع للقائمة الرئيسية", callback_data=\'main_menu\')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await context.bot.send_message(
        chat_id=chat_id,
        text=message_text,
        parse_mode=\'Markdown\',
        reply_markup=reply_markup
    )

async def main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Returns to the main menu."""
    query = update.callback_query
    await query.answer()
    keyboard = [
        [InlineKeyboardButton("📿 ذكر عشوائي", callback_data=\'random_dhikr\')],
        [InlineKeyboardButton("🕋 المسبحة الإلكترونية", callback_data=\'tasbih_menu\')],
        [InlineKeyboardButton("📚 المكتبة الإسلامية", callback_data=\'library_menu\')],
        [InlineKeyboardButton("📊 إحصائياتي", callback_data=\'my_stats\')],
        [InlineKeyboardButton("🔔 تفعيل التذكيرات (للمشرفين)", callback_data=\'enable_reminders_admin\')],
        [InlineKeyboardButton("🔕 إيقاف التذكيرات (للمشرفين)", callback_data=\'disable_reminders_admin\')],
        [InlineKeyboardButton("⚙️ ضبط فترة التذكير (للمشرفين)", callback_data=\'set_reminder_interval_admin\')],
        [InlineKeyboardButton("ℹ️ مساعدة", callback_data=\'help_menu\')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text(
        WELCOME_TEXT.format(admin=ADMIN_USERNAME),
        parse_mode=\'Markdown\',
        reply_markup=reply_markup
    )

async def tasbih_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Shows options for tasbih: choose dhikr or start with default."""
    query = update.callback_query
    await query.answer()
    keyboard = [
        [InlineKeyboardButton("ابدأ التسبيح (سبحان الله)", callback_data=\'start_tasbih_سبحان الله\')],
        [InlineKeyboardButton("اختر ذكرًا آخر", callback_data=\'choose_dhikr\')],
        [InlineKeyboardButton("🔙 رجوع", callback_data=\'main_menu\')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text(
        "اختر الذكر الذي تريد التسبيح به:",
        reply_markup=reply_markup
    )

async def choose_dhikr(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Allows user to choose a dhikr from a list for tasbih."""
    query = update.callback_query
    await query.answer()
    dhikr_options = [[InlineKeyboardButton(dhikr, callback_data=f\'start_tasbih_{dhikr}\\')] for dhikr in DHIKRS[:5]] # Show first 5 dhikrs for selection
    dhikr_options.append([InlineKeyboardButton("🔙 رجوع", callback_data=\'tasbih_menu\')])
    reply_markup = InlineKeyboardMarkup(dhikr_options)
    await query.edit_message_text(
        "اختر الذكر من القائمة:",
        reply_markup=reply_markup
    )

async def start_tasbih(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Starts the tasbih session for the chosen dhikr."""
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    dhikr_to_tasbih = query.data.replace("start_tasbih_", "")

    user_tasbih_data[user_id] = {
        "dhikr": dhikr_to_tasbih,
        "count": 0
    }

    keyboard = [
        [InlineKeyboardButton(f"سبح ({dhikr_to_tasbih}) - العدد: 0", callback_data=\'increment_tasbih\')],
        [InlineKeyboardButton("إعادة تعيين", callback_data=\'reset_tasbih\')],
        [InlineKeyboardButton("🔙 رجوع للمسبحة", callback_data=\'tasbih_menu\')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text(
        f"بدأت التسبيح بـ: *{dhikr_to_tasbih}*\nاضغط على الزر للتسبيح.",
        parse_mode=\'Markdown\',
        reply_markup=reply_markup
    )

async def increment_tasbih(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Increments the tasbih count."""
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id

    if user_id in user_tasbih_data:
        user_tasbih_data[user_id]["count"] += 1
        current_count = user_tasbih_data[user_id]["count"]
        dhikr = user_tasbih_data[user_id]["dhikr"]

        keyboard = [
            [InlineKeyboardButton(f"سبح ({dhikr}) - العدد: {current_count}", callback_data=\'increment_tasbih\')],
            [InlineKeyboardButton("إعادة تعيين", callback_data=\'reset_tasbih\')],
            [InlineKeyboardButton("🔙 رجوع للمسبحة", callback_data=\'tasbih_menu\')]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(
            f"بدأت التسبيح بـ: *{dhikr}*\nاضغط على الزر للتسبيح.",
            parse_mode=\'Markdown\',
            reply_markup=reply_markup
        )
    else:
        await query.edit_message_text("حدث خطأ. يرجى البدء من جديد.",
                                      reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع للقائمة الرئيسية", callback_data=\'main_menu\')]]))

async def reset_tasbih(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Resets the tasbih count."""
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id

    if user_id in user_tasbih_data:
        dhikr = user_tasbih_data[user_id]["dhikr"]
        user_tasbih_data[user_id]["count"] = 0

        keyboard = [
            [InlineKeyboardButton(f"سبح ({dhikr}) - العدد: 0", callback_data=\'increment_tasbih\')],
            [InlineKeyboardButton("إعادة تعيين", callback_data=\'reset_tasbih\')],
            [InlineKeyboardButton("🔙 رجوع للمسبحة", callback_data=\'tasbih_menu\')]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(
            f"تم إعادة تعيين التسبيح. بدأت التسبيح بـ: *{dhikr}*\nاضغط على الزر للتسبيح.",
            parse_mode=\'Markdown\',
            reply_markup=reply_markup
        )
    else:
        await query.edit_message_text("حدث خطأ. يرجى البدء من جديد.",
                                      reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع للقائمة الرئيسية", callback_data=\'main_menu\')]]))

async def library_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Shows the library menu with available books."""
    query = update.callback_query
    await query.answer()
    
    keyboard = []
    # Create buttons for each book in BOOKS constant
    for book_name in BOOKS.keys():
        keyboard.append([InlineKeyboardButton(book_name, callback_data=f'send_book_{book_name}')])
    
    keyboard.append([InlineKeyboardButton("🔙 رجوع للقائمة الرئيسية", callback_data='main_menu')])
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(
        "📚 *المكتبة الإسلامية*\n\nاختر الكتاب الذي تود قراءته أو تحميله بصيغة PDF:",
        parse_mode='Markdown',
        reply_markup=reply_markup
    )

async def send_book(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends the selected PDF book to the user."""
    query = update.callback_query
    await query.answer()
    
    book_name = query.data.replace("send_book_", "")
    file_name = BOOKS.get(book_name)
    
    if file_name:
        # Construct the raw GitHub URL for the PDF file
        import urllib.parse
        encoded_file_name = urllib.parse.quote(file_name)
        file_url = f"{GITHUB_REPO_URL}{encoded_file_name}"
        
        await query.message.reply_chat_action("upload_document")
        try:
            await query.message.reply_document(
                document=file_url,
                caption=f"📖 كتاب: *{book_name}*\n\n_تم الإرسال من بوت نورِ فاي_",
                parse_mode='Markdown'
            )
        except Exception as e:
            logger.error(f"Error sending book {book_name}: {e}")
            await query.message.reply_text(f"عذراً، حدث خطأ أثناء محاولة إرسال الكتاب. يرجى التأكد من وجود الملف في المستودع.\nالرابط المحاول: {file_url}")
    else:
        await query.message.reply_text("عذراً، لم يتم العثور على الكتاب المطلوب.")

async def my_stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Shows user statistics."""
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    
    count = 0
    if user_id in user_tasbih_data:
        count = user_tasbih_data[user_id].get("count", 0)
        
    stats_text = f"""
📊 *إحصائياتك في نورِ فاي*

• عدد التسبيحات الحالية: *{count}*
• الحالة: *{"نشط" if count > 0 else "بانتظار البدء"}*

_استمر في ذكر الله، فبذكر الله تطمئن القلوب._
"""
    await query.edit_message_text(stats_text, parse_mode='Markdown',
                                  reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))

async def is_admin(update: Update) -> bool:
    """Checks if the user is an admin in the chat."""
    if update.effective_chat.type == "private":
        return True
    
    user_id = update.effective_user.id
    chat_id = update.effective_chat.id
    
    try:
        member = await update.effective_chat.get_member(user_id)
        return member.status in ["creator", "administrator"]
    except Exception as e:
        logger.error(f"Error checking admin status: {e}")
        return False

async def enable_reminders_admin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Enables reminders for the group (admin only)."""
    query = update.callback_query
    await query.answer()
    
    if not await is_admin(update):
        await query.message.reply_text("⚠️ هذا الأمر مخصص للمشرفين فقط.")
        return

    chat_id = update.effective_chat.id
    if chat_id not in group_settings:
        group_settings[chat_id] = {"enabled": True, "interval": 2}
    else:
        group_settings[chat_id]["enabled"] = True

    # Start the job
    interval = group_settings[chat_id]["interval"]
    context.job_queue.run_repeating(send_scheduled_reminder, interval=interval*3600, first=10, chat_id=chat_id, name=f"reminder_{chat_id}")
    
    await query.edit_message_text(f"✅ تم تفعيل التذكيرات التلقائية كل {interval} ساعة.",
                                  reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))

async def disable_reminders_admin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Disables reminders for the group (admin only)."""
    query = update.callback_query
    await query.answer()
    
    if not await is_admin(update):
        await query.message.reply_text("⚠️ هذا الأمر مخصص للمشرفين فقط.")
        return

    chat_id = update.effective_chat.id
    if chat_id in group_settings:
        group_settings[chat_id]["enabled"] = False
    
    # Remove the job
    current_jobs = context.job_queue.get_jobs_by_name(f"reminder_{chat_id}")
    for job in current_jobs:
        job.schedule_removal()
        
    await query.edit_message_text("🔕 تم إيقاف التذكيرات التلقائية.",
                                  reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))

async def set_reminder_interval_admin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Shows options to set reminder interval (admin only)."""
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
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text("اختر الفترة الزمنية للتذكير:", reply_markup=reply_markup)

async def apply_interval(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Applies the chosen interval."""
    query = update.callback_query
    await query.answer()
    
    interval = int(query.data.replace("set_int_", ""))
    chat_id = update.effective_chat.id
    
    if chat_id not in group_settings:
        group_settings[chat_id] = {"enabled": True, "interval": interval}
    else:
        group_settings[chat_id]["interval"] = interval
        
    # Restart job with new interval if enabled
    if group_settings[chat_id]["enabled"]:
        current_jobs = context.job_queue.get_jobs_by_name(f"reminder_{chat_id}")
        for job in current_jobs:
            job.schedule_removal()
        context.job_queue.run_repeating(send_scheduled_reminder, interval=interval*3600, first=10, chat_id=chat_id, name=f"reminder_{chat_id}")

    await query.edit_message_text(f"✅ تم ضبط فترة التذكير لتكون كل {interval} ساعة.",
                                  reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))]))

async def help_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Shows the help menu."""
    query = update.callback_query
    await query.answer()
    help_text = """
📖 *دليل استخدام بوت نورِ فاي*

• *المسبحة:* تتيح لك التسبيح التفاعلي مع إمكانية اختيار الذكر.
• *الأذكار:* الحصول على ذكر عشوائي مع رسالة إيمانية محفزة.
• *المكتبة:* تحميل كتب إسلامية قيمة بصيغة PDF مباشرة.
• *التذكيرات:* في المجموعات، يقوم البوت بإرسال أذكار تلقائية.
• *الصيام:* يرسل البوت تذكيرات بصيام الاثنين والخميس قبل يوم (الأحد والأربعاء).

📌 *للمشرفين في المجموعات:*
يمكنكم التحكم في تفعيل/إيقاف التذكيرات وضبط الفترة الزمنية من القائمة الرئيسية.
"""
    await query.edit_message_text(help_text, parse_mode='Markdown',
                                  reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))

async def send_scheduled_reminder(context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends a random dhikr to all enabled groups."""
    job = context.job
    chat_id = job.chat_id
    
    dhikr = random.choice(DHIKRS)
    emotional_msg = random.choice(EMOTIONAL_MESSAGES)
    message_text = f"🔔 *تذكير بالذكر*\n\n*{dhikr}*\n\n_{emotional_msg}_"
    
    await context.bot.send_message(chat_id=chat_id, text=message_text, parse_mode='Markdown')

async def send_fasting_reminder(context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends a reminder for fasting on Mondays and Thursdays."""
    day_of_week = datetime.now().weekday() # 0=Monday, 6=Sunday
    
    if day_of_week == 6: # Sunday, remind for Monday
        title = "🌙 *تذكير بصيام غدٍ الاثنين*"
        hadith = "قال رسول الله ﷺ: 'تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ'"
    elif day_of_week == 2: # Wednesday, remind for Thursday
        title = "🌙 *تذكير بصيام غدٍ الخميس*"
        hadith = "قال رسول الله ﷺ: 'تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ'"
    else:
        return

    message_text = f"{title}\n\n{hadith}\n\n_لا تنسوا صيام غدٍ لنيل الأجر والثواب_"
    
    # Send to all chats that have reminders enabled
    for chat_id in group_settings:
        if group_settings[chat_id].get("enabled", False):
            try:
                await context.bot.send_message(chat_id=chat_id, text=message_text, parse_mode='Markdown')
            except Exception as e:
                logger.error(f"Error sending fasting reminder to {chat_id}: {e}")

async def on_bot_added(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends a message when the bot is added to a group."""
    for member in update.message.new_chat_members:
        if member.id == context.bot.id:
            chat_id = update.effective_chat.id
            chat_title = update.effective_chat.title
            
            welcome_msg = f"✅ تم التحقق والتأكد من إضافة البوت لمجموعة: *{chat_title}*\n\nسيتم إرسال ذكر أو تذكير تلقائي كل ساعتين بشكل افتراضي. يمكن للمشرفين تغيير الإعدادات من القائمة الرئيسية."
            
            await context.bot.send_message(chat_id=chat_id, text=welcome_msg, parse_mode='Markdown')
            
            # Enable default reminders
            group_settings[chat_id] = {"enabled": True, "interval": 2}
            context.job_queue.run_repeating(send_scheduled_reminder, interval=2*3600, first=10, chat_id=chat_id, name=f"reminder_{chat_id}")

def main() -> None:
    """Start the bot."""
    application = Application.builder().token(TOKEN).build()

    # Command handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("dhikr", random_dhikr)) # For direct command /dhikr

    # Message handlers
    from telegram.ext import MessageHandler, filters
    application.add_handler(MessageHandler(filters.StatusUpdate.NEW_CHAT_MEMBERS, on_bot_added))

    # Callback query handlers
    application.add_handler(CallbackQueryHandler(random_dhikr, pattern='^random_dhikr$' ))
    application.add_handler(CallbackQueryHandler(main_menu, pattern='^main_menu$' ))
    application.add_handler(CallbackQueryHandler(tasbih_menu, pattern='^tasbih_menu$' ))
    application.add_handler(CallbackQueryHandler(choose_dhikr, pattern='^choose_dhikr$' ))
    application.add_handler(CallbackQueryHandler(start_tasbih, pattern='^start_tasbih_.*$' ))
    application.add_handler(CallbackQueryHandler(increment_tasbih, pattern="^increment_tasbih$" ))
    application.add_handler(CallbackQueryHandler(reset_tasbih, pattern="^reset_tasbih$" ))
    application.add_handler(CallbackQueryHandler(library_menu, pattern='^library_menu$' ))
    application.add_handler(CallbackQueryHandler(send_book, pattern='^send_book_.*$' ))
    application.add_handler(CallbackQueryHandler(my_stats, pattern='^my_stats$' ))
    application.add_handler(CallbackQueryHandler(enable_reminders_admin, pattern='^enable_reminders_admin$' ))
    application.add_handler(CallbackQueryHandler(disable_reminders_admin, pattern='^disable_reminders_admin$' ))
    application.add_handler(CallbackQueryHandler(set_reminder_interval_admin, pattern='^set_reminder_interval_admin$' ))
    application.add_handler(CallbackQueryHandler(apply_interval, pattern='^set_int_.*$' ))
    application.add_handler(CallbackQueryHandler(help_menu, pattern='^help_menu$' ))

    # Schedule fasting reminders (every day at 8 PM to check for next day)
    application.job_queue.run_daily(send_fasting_reminder, time=time(20, 0, 0))

    # Run the bot until the user presses Ctrl-C
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
