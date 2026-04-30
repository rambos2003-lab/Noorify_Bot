import logging
import random
import os
import urllib.parse
from datetime import datetime, time
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler, MessageHandler, filters

from constants import WELCOME_TEXT, DHIKRS, EMOTIONAL_MESSAGES, ADMIN_USERNAME, BOOKS, GITHUB_REPO_URL

# إعدادات التسجيل (Logging)
logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

# المتغيرات العامة
TOKEN = os.getenv("BOT_TOKEN")
user_tasbih_data = {}
group_settings = {}

# ==========================================
# الدوال المساعدة (Helper Functions)
# ==========================================
async def is_admin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> bool:
    """التحقق مما إذا كان المستخدم أدمن في المجموعة"""
    if update.effective_chat.type == "private":
        return True
    user_id = update.effective_user.id
    try:
        member = await update.effective_chat.get_member(user_id)
        return member.status in ["creator", "administrator"]
    except Exception as e:
        logger.error(f"Error checking admin: {e}")
        return False

# ==========================================
# دوال الواجهة الرئيسية والتنقل
# ==========================================
def get_main_keyboard(is_group=False):
    """بناء الكيبورد الرئيسي بناءً على نوع المحادثة"""
    keyboard = [
        [InlineKeyboardButton("📿 ذِكْر عَشْوَائِي", callback_data='random_dhikr')],
        [InlineKeyboardButton("🕋 الْمِسْبَحَة الْإِلِكْتُرُونِيَّة", callback_data='tasbih_menu')],
        [InlineKeyboardButton("📚 الْمَكْتَبَة الْإِسْلَامِيَّة", callback_data='library_menu')],
        [InlineKeyboardButton("📊 إِحْصَائِيَّاتِي", callback_data='my_stats')]
    ]
    # إظهار أزرار التحكم للأدمن فقط إذا كانت في مجموعة
    if is_group:
        keyboard.append([InlineKeyboardButton("⚙️ إعدادات التذكير (للمشرفين)", callback_data='admin_settings')])
    return InlineKeyboardMarkup(keyboard)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    is_group = update.effective_chat.type != "private"
    await update.message.reply_text(
        WELCOME_TEXT.format(admin=ADMIN_USERNAME),
        parse_mode='HTML',
        reply_markup=get_main_keyboard(is_group),
        disable_web_page_preview=True
    )

async def main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    is_group = update.effective_chat.type != "private"
    await query.edit_message_text(
        WELCOME_TEXT.format(admin=ADMIN_USERNAME),
        parse_mode='HTML',
        reply_markup=get_main_keyboard(is_group),
        disable_web_page_preview=True
    )

# ==========================================
# قسم الذكر العشوائي
# ==========================================
async def random_dhikr(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    chat_id = query.message.chat_id if query else update.message.chat_id
    if query: await query.answer()
    
    dhikr = random.choice(DHIKRS)
    emotional = random.choice(EMOTIONAL_MESSAGES)
    
    text = f"📿 <b>{dhikr}</b>\n\n<i>{emotional}</i>"
    keyboard = [
        [InlineKeyboardButton("🔄 ذِكْر آخَر", callback_data='random_dhikr')],
        [InlineKeyboardButton("🔙 رُجُوع لِلْقَائِمَة", callback_data='main_menu')]
    ]
    
    if query:
        await query.edit_message_text(text, parse_mode='HTML', reply_markup=InlineKeyboardMarkup(keyboard))
    else:
        await context.bot.send_message(chat_id=chat_id, text=text, parse_mode='HTML', reply_markup=InlineKeyboardMarkup(keyboard))

# ==========================================
# قسم المسبحة الإلكترونية
# ==========================================
async def tasbih_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    keyboard = [
        [InlineKeyboardButton("🟢 ابْدَأ التَّسْبِيح (سُبْحَانَ الله)", callback_data='start_tasbih_سُبْحَانَ اللَّهِ')],
        [InlineKeyboardButton("📝 اخْتَرْ ذِكْراً آخَر", callback_data='choose_dhikr')],
        [InlineKeyboardButton("🔙 رُجُوع", callback_data='main_menu')]
    ]
    await query.edit_message_text("<b>🕋 الْمِسْبَحَة الْإِلِكْتُرُونِيَّة</b>\n\nاختر كيف تود أن تبدأ التسبيح:", parse_mode='HTML', reply_markup=InlineKeyboardMarkup(keyboard))

async def choose_dhikr(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    # عرض أول 6 أذكار في زرين بكل سطر لترتيب أجمل
    buttons = []
    for i in range(0, 6, 2):
        row = [InlineKeyboardButton(DHIKRS[i], callback_data=f'start_tasbih_{DHIKRS[i]}')]
        if i+1 < len(DHIKRS):
            row.append(InlineKeyboardButton(DHIKRS[i+1], callback_data=f'start_tasbih_{DHIKRS[i+1]}'))
        buttons.append(row)
        
    buttons.append([InlineKeyboardButton("🔙 رُجُوع لِلْمِسْبَحَة", callback_data='tasbih_menu')])
    await query.edit_message_text("<b>📝 اخْتَرْ الذِّكْرَ الَّذِي تُرِيدُهُ:</b>", parse_mode='HTML', reply_markup=InlineKeyboardMarkup(buttons))

async def start_tasbih(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    dhikr = query.data.replace("start_tasbih_", "")
    
    # حفظ حالة التسبيح
    if user_id not in user_tasbih_data or user_tasbih_data[user_id].get("dhikr") != dhikr:
        user_tasbih_data[user_id] = {"dhikr": dhikr, "count": 0}
        
    count = user_tasbih_data[user_id]["count"]
    
    keyboard = [
        [InlineKeyboardButton(f"👆 اِضْغَط لِلتَّسْبِيح ({count})", callback_data='increment_tasbih')],
        [InlineKeyboardButton("🔄 تَصْفِير العَدَّاد", callback_data='reset_tasbih')],
        [InlineKeyboardButton("🔙 رُجُوع", callback_data='tasbih_menu')]
    ]
    await query.edit_message_text(f"🕋 <b>جَارِي التَّسْبِيح بـ:</b>\n\n( {dhikr} )\n\n<i>اضغط على الزر بالأسفل للعد.</i>", parse_mode='HTML', reply_markup=InlineKeyboardMarkup(keyboard))

async def increment_tasbih(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer() # بدون نص لتكون سريعة جداً
    user_id = query.from_user.id
    
    if user_id in user_tasbih_data:
        user_tasbih_data[user_id]["count"] += 1
        count = user_tasbih_data[user_id]["count"]
        dhikr = user_tasbih_data[user_id]["dhikr"]
        
        keyboard = [
            [InlineKeyboardButton(f"👆 اِضْغَط لِلتَّسْبِيح ({count})", callback_data='increment_tasbih')],
            [InlineKeyboardButton("🔄 تَصْفِير", callback_data='reset_tasbih')],
            [InlineKeyboardButton("🔙 رُجُوع", callback_data='tasbih_menu')]
        ]
        await query.edit_message_text(f"🕋 <b>جَارِي التَّسْبِيح بـ:</b>\n\n( {dhikr} )\n\n<i>العدد الحالي: {count}</i>", parse_mode='HTML', reply_markup=InlineKeyboardMarkup(keyboard))

async def reset_tasbih(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer("تم تصفير العداد ✅")
    user_id = query.from_user.id
    if user_id in user_tasbih_data:
        dhikr = user_tasbih_data[user_id]["dhikr"]
        user_tasbih_data[user_id]["count"] = 0
        keyboard = [
            [InlineKeyboardButton(f"👆 اِضْغَط لِلتَّسْبِيح (0)", callback_data='increment_tasbih')],
            [InlineKeyboardButton("🔙 رُجُوع", callback_data='tasbih_menu')]
        ]
        await query.edit_message_text(f"🕋 <b>تَمَّ تَصْفِير الْعَدَّاد لـ:</b>\n\n( {dhikr} )", parse_mode='HTML', reply_markup=InlineKeyboardMarkup(keyboard))

async def my_stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    count = user_tasbih_data.get(user_id, {}).get("count", 0)
    dhikr = user_tasbih_data.get(user_id, {}).get("dhikr", "لم تبدأ بعد")
    
    text = f"""
📊 <b>إِحْصَائِيَّاتُك فِي نُورِ فَاي:</b>

• <b>الذِّكْر الْحَالِي:</b> {dhikr}
• <b>عَدَدُ التَّسْبِيحَاتِ:</b> {count} 📿

<i>"أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ"</i>
    """
    await query.edit_message_text(text, parse_mode='HTML', reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رُجُوع", callback_data='main_menu')]]))

# ==========================================
# قسم المكتبة الإسلامية
# ==========================================
async def library_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    buttons = []
    # ترتيب الأزرار زرين في كل سطر
    book_names = list(BOOKS.keys())
    for i in range(0, len(book_names), 2):
        row = [InlineKeyboardButton(f"📘 {book_names[i]}", callback_data=f'send_book_{i}')]
        if i+1 < len(book_names):
            row.append(InlineKeyboardButton(f"📘 {book_names[i+1]}", callback_data=f'send_book_{i+1}'))
        buttons.append(row)
        
    buttons.append([InlineKeyboardButton("🔙 رُجُوع", callback_data='main_menu')])
    await query.edit_message_text("📚 <b>الْمَكْتَبَة الْإِسْلَامِيَّة</b>\n\nاختر الكتاب الذي تود تحميله وقراءته:", parse_mode='HTML', reply_markup=InlineKeyboardMarkup(buttons))

async def send_book(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer("جاري جلب الكتاب... ⏳")
    
    book_index = int(query.data.replace("send_book_", ""))
    book_name = list(BOOKS.keys())[book_index]
    file_name = BOOKS[book_name]
    
    # تحويل الاسم العربي ليكون صالحاً كـ URL
    encoded_file = urllib.parse.quote(file_name)
    file_url = f"{GITHUB_REPO_URL}{encoded_file}"
    
    caption = f"📖 <b>كِتَاب:</b> {book_name}\n\n<i>تم الإرسال من بوت نُورِ فَاي 🕌</i>"
    
    try:
        await query.message.reply_document(document=file_url, caption=caption, parse_mode='HTML')
    except Exception as e:
        logger.error(f"Book error: {e}")
        await query.message.reply_text("⚠️ عذراً، حدث خطأ أثناء جلب الكتاب. يرجى إبلاغ المطور.")

# ==========================================
# قسم الإدمن والتذكيرات (المجموعات)
# ==========================================
async def admin_settings(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    # حماية الزر: التنبيه يظهر كـ Popup
    if not await is_admin(update, context):
        await query.answer("⛔️ عذراً، هذا القسم مخصص لمشرفي المجموعة فقط!", show_alert=True)
        return
        
    await query.answer()
    chat_id = update.effective_chat.id
    is_enabled = group_settings.get(chat_id, {}).get("enabled", True)
    
    status_text = "🟢 مفعّل" if is_enabled else "🔴 معطّل"
    text = f"⚙️ <b>إِعْدَادَاتُ الْمَجْمُوعَة:</b>\n\nالحالة الحالية: {status_text}\nاختر ما تريد القيام به:"
    
    keyboard = [
        [InlineKeyboardButton("🔔 تَفْعِيل التَّذْكِير", callback_data='toggle_rem_on'), 
         InlineKeyboardButton("🔕 إِيقَاف التَّذْكِير", callback_data='toggle_rem_off')],
        [InlineKeyboardButton("⏱️ ضَبْط فَتْرَة التَّذْكِير", callback_data='set_interval_menu')],
        [InlineKeyboardButton("🔙 رُجُوع", callback_data='main_menu')]
    ]
    await query.edit_message_text(text, parse_mode='HTML', reply_markup=InlineKeyboardMarkup(keyboard))

async def toggle_reminder(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    if not await is_admin(update, context):
        await query.answer("⛔️ للمشرفين فقط!", show_alert=True)
        return
        
    chat_id = update.effective_chat.id
    action = query.data.replace("toggle_rem_", "")
    
    if chat_id not in group_settings:
        group_settings[chat_id] = {"enabled": True, "interval": 2}
        
    if action == "on":
        group_settings[chat_id]["enabled"] = True
        interval = group_settings[chat_id]["interval"]
        # إعادة تشغيل الـ Job
        for job in context.job_queue.get_jobs_by_name(f"rem_{chat_id}"): job.schedule_removal()
        context.job_queue.run_repeating(send_group_reminder, interval=interval*3600, first=10, chat_id=chat_id, name=f"rem_{chat_id}")
        await query.answer("✅ تم التفعيل بنجاح", show_alert=True)
    else:
        group_settings[chat_id]["enabled"] = False
        for job in context.job_queue.get_jobs_by_name(f"rem_{chat_id}"): job.schedule_removal()
        await query.answer("🔕 تم الإيقاف بنجاح", show_alert=True)
        
    await admin_settings(update, context)

async def set_interval_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    if not await is_admin(update, context):
        await query.answer("⛔️ للمشرفين فقط!", show_alert=True)
        return
    await query.answer()
    
    keyboard = [
        [InlineKeyboardButton("1 سَاعَة", callback_data='set_int_1'), InlineKeyboardButton("2 سَاعَة", callback_data='set_int_2')],
        [InlineKeyboardButton("4 سَاعَات", callback_data='set_int_4'), InlineKeyboardButton("6 سَاعَات", callback_data='set_int_6')],
        [InlineKeyboardButton("🔙 رُجُوع لِلْإِعْدَادَات", callback_data='admin_settings')]
    ]
    await query.edit_message_text("⏱️ <b>اخْتَرْ كُلَّ مَتَى تُرِيدُ إِرْسَالَ ذِكْر:</b>", parse_mode='HTML', reply_markup=InlineKeyboardMarkup(keyboard))

async def apply_interval(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    if not await is_admin(update, context):
        await query.answer("⛔️ للمشرفين فقط!", show_alert=True)
        return
        
    interval = int(query.data.replace("set_int_", ""))
    chat_id = update.effective_chat.id
    
    group_settings[chat_id] = {"enabled": True, "interval": interval}
    
    for job in context.job_queue.get_jobs_by_name(f"rem_{chat_id}"): job.schedule_removal()
    context.job_queue.run_repeating(send_group_reminder, interval=interval*3600, first=10, chat_id=chat_id, name=f"rem_{chat_id}")
    
    await query.answer(f"✅ تم ضبط التذكير كل {interval} ساعة", show_alert=True)
    await admin_settings(update, context)

async def send_group_reminder(context: ContextTypes.DEFAULT_TYPE) -> None:
    """إرسال الذكر للمجموعات"""
    job = context.job
    chat_id = job.chat_id
    dhikr = random.choice(DHIKRS)
    msg = random.choice(EMOTIONAL_MESSAGES)
    text = f"🔔 <b>تَذْكِيرٌ بِالذِّكْرِ</b>\n\n<b>{dhikr}</b>\n\n<i>{msg}</i>"
    try:
        await context.bot.send_message(chat_id=chat_id, text=text, parse_mode='HTML')
    except Exception:
        pass # Group might have kicked the bot

# ==========================================
# تذكير الصيام (الاثنين والخميس)
# ==========================================
async def send_fasting_reminder(context: ContextTypes.DEFAULT_TYPE) -> None:
    """نظام ذكي يرسل تذكير بصيام الاثنين (يوم الأحد) والخميس (يوم الأربعاء)"""
    today = datetime.now().weekday() # 0=Monday, 6=Sunday
    
    if today == 6: # الأحد
        title = "🌙 <b>تَذْكِيرٌ بِصِيَامِ غَدٍ الِاثْنَيْنِ</b>"
    elif today == 2: # الأربعاء
        title = "🌙 <b>تَذْكِيرٌ بِصِيَامِ غَدٍ الْخَمِيسِ</b>"
    else:
        return
        
    hadith = "قَالَ رَسُولُ اللَّهِ ﷺ:\n<i>«تُعْرَضُ الْأَعْمَالُ يَوْمَ الِاثْنَيْنِ وَالْخَمِيسِ، فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ»</i>"
    text = f"{title}\n\n{hadith}\n\n<b>لا تنسوا تبييت النية، تقبل الله منا ومنكم 🤍</b>"
    
    for chat_id, settings in group_settings.items():
        if settings.get("enabled", False):
            try:
                await context.bot.send_message(chat_id=chat_id, text=text, parse_mode='HTML')
            except Exception:
                pass

# ==========================================
# الترحيب عند الإضافة للمجموعات
# ==========================================
async def on_bot_added(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """يتم استدعاؤها فقط عند إضافة البوت لمجموعة جديدة"""
    for member in update.message.new_chat_members:
        if member.id == context.bot.id:
            chat_id = update.effective_chat.id
            chat_title = update.effective_chat.title
            
            text = f"✅ <b>تَمَّ التَّحَقُّقُ وَالِانْضِمَامُ إِلَى:</b> {chat_title}\n\n"
            text += "شكراً لاستضافتي! 🕌\n"
            text += "سأقوم بإرسال أذكار وتذكيرات تلقائية كل <b>ساعتين</b> بشكل افتراضي.\n\n"
            text += "<i>ملاحظة: يمكن لمشرفي المجموعة فقط تعديل وقت التذكير أو إيقافه عبر الأزرار أدناه.</i>"
            
            keyboard = [[InlineKeyboardButton("⚙️ إعدادات التذكير (للمشرفين)", callback_data='admin_settings')]]
            await context.bot.send_message(chat_id=chat_id, text=text, parse_mode='HTML', reply_markup=InlineKeyboardMarkup(keyboard))
            
            # تفعيل التذكير الافتراضي
            group_settings[chat_id] = {"enabled": True, "interval": 2}
            context.job_queue.run_repeating(send_group_reminder, interval=2*3600, first=3600, chat_id=chat_id, name=f"rem_{chat_id}")

# ==========================================
# دالة التشغيل الرئيسية
# ==========================================
def main() -> None:
    application = Application.builder().token(TOKEN).build()
    
    # Handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.StatusUpdate.NEW_CHAT_MEMBERS, on_bot_added))
    
    # Callback Handlers (الاستجابة للأزرار)
    application.add_handler(CallbackQueryHandler(random_dhikr, pattern='^random_dhikr$'))
    application.add_handler(CallbackQueryHandler(main_menu, pattern='^main_menu$'))
    
    # مسبحة
    application.add_handler(CallbackQueryHandler(tasbih_menu, pattern='^tasbih_menu$'))
    application.add_handler(CallbackQueryHandler(choose_dhikr, pattern='^choose_dhikr$'))
    application.add_handler(CallbackQueryHandler(start_tasbih, pattern='^start_tasbih_.*$'))
    application.add_handler(CallbackQueryHandler(increment_tasbih, pattern="^increment_tasbih$"))
    application.add_handler(CallbackQueryHandler(reset_tasbih, pattern="^reset_tasbih$"))
    application.add_handler(CallbackQueryHandler(my_stats, pattern='^my_stats$'))
    
    # مكتبة
    application.add_handler(CallbackQueryHandler(library_menu, pattern='^library_menu$'))
    application.add_handler(CallbackQueryHandler(send_book, pattern='^send_book_.*$'))
    
    # إدمن ومجموعات
    application.add_handler(CallbackQueryHandler(admin_settings, pattern='^admin_settings$'))
    application.add_handler(CallbackQueryHandler(toggle_reminder, pattern='^toggle_rem_.*$'))
    application.add_handler(CallbackQueryHandler(set_interval_menu, pattern='^set_interval_menu$'))
    application.add_handler(CallbackQueryHandler(apply_interval, pattern='^set_int_.*$'))
    
    # وظيفة يومية للصيام (تعمل كل يوم الساعة 20:00 مساءً)
    application.job_queue.run_daily(send_fasting_reminder, time=time(hour=20, minute=0, second=0))
    
    # Start bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
