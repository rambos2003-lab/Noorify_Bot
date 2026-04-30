# -*- coding: utf-8 -*-
import logging
import random
import os
import urllib.parse
from datetime import datetime, time, timedelta
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, constants
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler, MessageHandler, filters
import database

# استيراد الثوابت من الملف المساعد
try:
    from constants import WELCOME_TEXT, DHIKRS, EMOTIONAL_MESSAGES, ADMIN_USERNAME, BOOKS, GITHUB_REPO_URL, FASTING_HADITH
except ImportError:
    # في حال عدم وجود الملف (لأغراض الاختبار)
    WELCOME_TEXT = "مرحباً بكم في بوت نورِ فاي"
    DHIKRS = ["سبحان الله"]
    EMOTIONAL_MESSAGES = ["تقبل الله"]
    ADMIN_USERNAME = "@vx_rq"
    BOOKS = {}
    GITHUB_REPO_URL = ""
    FASTING_HADITH = {}

# إعدادات التسجيل
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# توكن البوت
TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")

# مخازن البيانات المؤقتة (يفضل استخدام قاعدة بيانات في الإنتاج)
# مخازن البيانات المؤقتة (تم استبدالها بقاعدة البيانات)
# user_tasbih_data = {}
# group_settings = {}

# --- وظائف مساعدة ---

async def is_admin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> bool:
    # في المحادثات الخاصة، يعتبر المستخدم دائماً مشرفاً
    if update.effective_chat.type == constants.ChatType.PRIVATE:
        return True
    """التحقق مما إذا كان المستخدم مشرفاً في المجموعة أو في محادثة خاصة"""
    user_id = update.effective_user.id
    try:
        member = await context.bot.get_chat_member(update.effective_chat.id, user_id)
        return member.status in [constants.ChatMemberStatus.OWNER, constants.ChatMemberStatus.ADMINISTRATOR]
    except Exception as e:
        logger.error(f"Error checking admin status: {e}")
        return False

def get_main_menu_keyboard():
    """لوحة المفاتيح الرئيسية"""
    return [
        [InlineKeyboardButton("📿 ذكر عشوائي", callback_data='random_dhikr')],
        [InlineKeyboardButton("🕋 المسبحة الإلكترونية", callback_data='tasbih_menu')],
        [InlineKeyboardButton("📚 المكتبة الإسلامية", callback_data='library_menu')],
        [InlineKeyboardButton("📊 إحصائياتي", callback_data='my_stats')],
        [InlineKeyboardButton("⚙️ إعدادات التذكير (للمشرفين)", callback_data='admin_settings')],
        [InlineKeyboardButton("ℹ️ مساعدة", callback_data='help_menu')]
    ]

# --- معالجات الأوامر ---

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """أمر البداية والرسالة الترحيبية"""
    keyboard = get_main_menu_keyboard()
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_msg = WELCOME_TEXT.format(admin=ADMIN_USERNAME)
    
    # إضافة لمسة جمالية للرسالة الترحيبية (صورة أو رمز تعبيري كبير)
    final_text = f"✨ *نورِ فاي | Noorify* ✨\n\n{welcome_msg}"
    
    if update.message:
        await update.message.reply_text(
            final_text,
            parse_mode=constants.ParseMode.MARKDOWN,
            reply_markup=reply_markup
        )
    else: # في حال استدعاء من callback
        await update.callback_query.edit_message_text(
            final_text,
            parse_mode=constants.ParseMode.MARKDOWN,
            reply_markup=reply_markup
        )

# --- معالجات Callback Query ---

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    data = query.data
    await query.answer()

    if data == 'main_menu':
        await start(update, context)
    
    elif data == 'random_dhikr':
        dhikr = random.choice(DHIKRS)
        emotional = random.choice(EMOTIONAL_MESSAGES)
        text = f"✨ *{dhikr}*\n\n_{emotional}_"
        keyboard = [[InlineKeyboardButton("🔄 ذكر آخر", callback_data='random_dhikr')],
                    [InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]
        await query.edit_message_text(text, parse_mode=constants.ParseMode.MARKDOWN, reply_markup=InlineKeyboardMarkup(keyboard))

    elif data == 'tasbih_menu':
        text = "🕋 *المسبحة الإلكترونية التفاعلية*\n\nاختر الذكر الذي تود البدء به:"
        keyboard = [[InlineKeyboardButton(d, callback_data=f'set_tasbih_{i}')] for i, d in enumerate(DHIKRS[:6])]
        keyboard.append([InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')])
        await query.edit_message_text(text, parse_mode=constants.ParseMode.MARKDOWN, reply_markup=InlineKeyboardMarkup(keyboard))

    elif data.startswith('set_tasbih_'):
        index = int(data.split('_')[-1])
        dhikr = DHIKRS[index]
        user_id = update.effective_user.id
        database.update_user_data(user_id, dhikr=dhikr, count=0)
        await show_tasbih_counter(query, dhikr, 0)

    elif data == 'increment_tasbih' or data == 'increment_10':
        user_id = update.effective_user.id
        user_data = database.get_user_data(user_id)
        if user_data:
            inc = 10 if data == 'increment_10' else 1
            new_count = user_data["count"] + inc
            database.update_user_data(user_id, count=new_count)
            await show_tasbih_counter(query, user_data["dhikr"], new_count)
        else:
            await query.edit_message_text("عذراً، انتهت الجلسة. ابدأ من جديد.", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='tasbih_menu')]]))

    elif data == 'reset_tasbih':
        user_id = update.effective_user.id
        user_data = database.get_user_data(user_id)
        if user_data:
            database.update_user_data(user_id, count=0)
            await show_tasbih_counter(query, user_data["dhikr"], 0)

    elif data == 'library_menu':
        await show_library_page(query, 0)

    elif data.startswith('lib_page_'):
        page = int(data.split('_')[-1])
        await show_library_page(query, page)

    elif data.startswith('book_'):
        index = int(data.split('_')[-1])
        book_name = list(BOOKS.keys())[index]
        file_name = BOOKS[book_name]
        # تأكد من أن الرابط ينتهي بـ .pdf كما في طلبك
        if not file_name.endswith(".pdf"):
            file_name += ".pdf"
        file_url = f"{GITHUB_REPO_URL}{urllib.parse.quote(file_name)}"
        
        await query.message.reply_chat_action(constants.ChatAction.UPLOAD_DOCUMENT)
        try:
            await query.message.reply_document(
                document=file_url,
                caption=f"📖 تم جلب كتاب: *{book_name}*\n\n_نسأل الله لكم النفع والقبول._",
                parse_mode=constants.ParseMode.MARKDOWN
            )
        except Exception as e:
            logger.error(f"Error sending book: {e}")
            # محاولة إرسال رسالة توضح الخطأ مع الرابط للمساعدة في التصحيح
            await query.message.reply_text(f"⚠️ عذراً، تعذر تحميل الكتاب حالياً.\n\nتأكد من وجود الملف باسم `{file_name}` في مستودع GitHub الخاص بك.")

    elif data == 'my_stats':
        user_id = update.effective_user.id
        user_data = database.get_user_data(user_id)
        count = user_data["count"] if user_data else 0
        dhikr = user_data["dhikr"] if user_data else "لم يبدأ بعد"
        text = f"📊 *إحصائياتك الإيمانية*\n\n• آخر ذكر استخدمته: *{dhikr}*\n• إجمالي التسبيحات في الجلسة: *{count}*\n\n_استمر، فكل تسبيحة هي غرس في الجنة._"
        await query.edit_message_text(text, parse_mode=constants.ParseMode.MARKDOWN, reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))

    elif data == 'admin_settings':
        if not await is_admin(update, context):
            await query.answer("⚠️ عذراً، هذا القسم مخصص للمشرفين فقط.", show_alert=True)
            return
        
        text = "⚙️ *إعدادات التحكم (للمشرفين فقط)*\n\nيمكنكم تفعيل أو تعطيل التذكيرات التلقائية وتغيير مدتها:"
        keyboard = [
            [InlineKeyboardButton("✅ تفعيل التذكيرات", callback_data='enable_rem'), InlineKeyboardButton("❌ تعطيل التذكيرات", callback_data='disable_rem')],
            [InlineKeyboardButton("⏱️ تغيير الفترة الزمنية", callback_data='change_int')],
            [InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]
        ]
        await query.edit_message_text(text, parse_mode=constants.ParseMode.MARKDOWN, reply_markup=InlineKeyboardMarkup(keyboard))

    elif data == 'enable_rem':
        chat_id = update.effective_chat.id
        database.update_group_settings(chat_id, enabled=True)
        await setup_repeating_job(chat_id, context)
        await query.edit_message_text("✅ تم تفعيل التذكيرات التلقائية بنجاح.", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='admin_settings')]]))

    elif data == 'disable_rem':
        chat_id = update.effective_chat.id
        database.update_group_settings(chat_id, enabled=False)
        remove_job(chat_id, context)
        await query.edit_message_text("🔕 تم إيقاف التذكيرات التلقائية.", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='admin_settings')]]))

    elif data == 'change_int':
        keyboard = [
            [InlineKeyboardButton("كل ساعة", callback_data='int_1'), InlineKeyboardButton("كل ساعتين", callback_data='int_2')],
            [InlineKeyboardButton("كل 4 ساعات", callback_data='int_4'), InlineKeyboardButton("كل 8 ساعات", callback_data='int_8')],
            [InlineKeyboardButton("🔙 رجوع", callback_data='admin_settings')]
        ]
        await query.edit_message_text("⏱️ اختر الفترة الزمنية بين كل ذكر وآخر:", reply_markup=InlineKeyboardMarkup(keyboard))

    elif data.startswith('int_'):
        interval = int(data.split('_')[-1])
        chat_id = update.effective_chat.id
        database.update_group_settings(chat_id, interval=interval)
        group_settings_db = database.get_group_settings(chat_id)
        if group_settings_db and group_settings_db["enabled"]:
            await setup_repeating_job(chat_id, context)
        await query.edit_message_text(f"✅ تم تحديث الفترة الزمنية إلى: كل {interval} ساعة.", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='admin_settings')]]))

    elif data == 'help_menu':
        help_text = "📖 *دليل نورِ فاي*\n\n• البوت يقدم مسبحة تفاعلية تحفظ عدادك.\n• مكتبة PDF غنية بالكتب الإسلامية.\n• تذكير بصيام الاثنين والخميس تلقائياً.\n• تذكيرات دورية في المجموعات.\n\n_في حال وجود أي مشكلة، تواصل مع المطور._"
        await query.edit_message_text(help_text, parse_mode=constants.ParseMode.MARKDOWN, reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔙 رجوع", callback_data='main_menu')]]))

async def show_library_page(query, page):
    """عرض صفحة المكتبة مع دعم التنقل"""
    book_list = list(BOOKS.keys())
    items_per_page = 6
    start_idx = page * items_per_page
    end_idx = start_idx + items_per_page
    current_books = book_list[start_idx:end_idx]
    
    text = "📚 *المكتبة الإسلامية المنظمة*\n\nاختر الكتاب لتحميله مباشرة بصيغة PDF:\n_كل الكتب منسقة ومرفوعة على GitHub._"
    
    keyboard = []
    # توزيع الكتب في صفوف من زرين
    for i in range(0, len(current_books), 2):
        row = []
        book1 = current_books[i]
        row.append(InlineKeyboardButton(book1, callback_data=f'book_{start_idx + i}'))
        if i + 1 < len(current_books):
            book2 = current_books[i+1]
            row.append(InlineKeyboardButton(book2, callback_data=f'book_{start_idx + i + 1}'))
        keyboard.append(row)
    
    # أزرار التنقل
    nav_row = []
    if page > 0:
        nav_row.append(InlineKeyboardButton("⬅️ السابق", callback_data=f'lib_page_{page-1}'))
    if end_idx < len(book_list):
        nav_row.append(InlineKeyboardButton("التالي ➡️", callback_data=f'lib_page_{page+1}'))
    if nav_row:
        keyboard.append(nav_row)
        
    keyboard.append([InlineKeyboardButton("🔙 رجوع للقائمة الرئيسية", callback_data='main_menu')])
    
    await query.edit_message_text(text, parse_mode=constants.ParseMode.MARKDOWN, reply_markup=InlineKeyboardMarkup(keyboard))

async def show_tasbih_counter(query, dhikr, count):
    """عرض واجهة المسبحة التفاعلية"""
    # اختيار رسالة تشجيعية بناءً على العدد
    encouragement = ""
    if count > 0 and count % 33 == 0:
        encouragement = "\n\n✨ *ما شاء الله! أكملت 33 تسبيحة، زادك الله من فضله.*"
    elif count > 0 and count % 100 == 0:
        encouragement = "\n\n🌟 *رائع! 100 تسبيحة، هنيئاً لك هذا الأجر العظيم.*"

    text = f"📿 *المسبحة الإلكترونية التفاعلية*\n\nالذكر: *{dhikr}*\n\nالعدد الحالي: 💠 [ *{count}* ] 💠{encouragement}"
    
    keyboard = [
        [InlineKeyboardButton("➕ سبح (1)", callback_data='increment_tasbih'), InlineKeyboardButton("➕➕ (10)", callback_data='increment_10')],
        [InlineKeyboardButton("🔄 إعادة تعيين", callback_data='reset_tasbih'), InlineKeyboardButton("🔙 تغيير الذكر", callback_data='tasbih_menu')],
        [InlineKeyboardButton("🏠 القائمة الرئيسية", callback_data='main_menu')]
    ]
    await query.edit_message_text(text, parse_mode=constants.ParseMode.MARKDOWN, reply_markup=InlineKeyboardMarkup(keyboard))

# --- نظام المهام المجدولة والتذكير ---

async def setup_repeating_job(chat_id, context):
    """إعداد مهمة التذكير المتكررة"""
    remove_job(chat_id, context)
    group_settings_db = database.get_group_settings(chat_id)
    interval = group_settings_db["interval"] if group_settings_db else 2
    context.job_queue.run_repeating(
        send_reminder_job,
        interval=interval * 3600,
        first=10,
        chat_id=chat_id,
        name=f"job_{chat_id}"
    )

def remove_job(chat_id, context):
    """حذف مهمة التذكير"""
    current_jobs = context.job_queue.get_jobs_by_name(f"job_{chat_id}")
    for job in current_jobs:
        job.schedule_removal()

async def send_reminder_job(context: ContextTypes.DEFAULT_TYPE) -> None:
    """إرسال الذكر المجدول"""
    chat_id = context.job.chat_id
    dhikr = random.choice(DHIKRS)
    emotional = random.choice(EMOTIONAL_MESSAGES)
    text = f"🔔 *تذكير دوري*\n\n✨ *{dhikr}*\n\n_{emotional}_"
    try:
        await context.bot.send_message(chat_id=chat_id, text=text, parse_mode=constants.ParseMode.MARKDOWN)
    except Exception as e:
        logger.error(f"Failed to send job message to {chat_id}: {e}")

async def fasting_reminder_job(context: ContextTypes.DEFAULT_TYPE) -> None:
    """تذكير صيام الاثنين والخميس (يتم استدعاؤه يومياً)"""
    now = datetime.now()
    day_of_week = now.weekday()
    
    msg = None
    if day_of_week == 6: # الأحد (تذكير للاثنين)
        msg = FASTING_HADITH.get("Monday")
    elif day_of_week == 2: # الأربعاء (تذكير للخميس)
        msg = FASTING_HADITH.get("Thursday")
        
    if msg:
        enabled_groups = database.get_all_enabled_groups()
        for chat_id, _ in enabled_groups:
            try:
                # إرسال التذكير مع زر للمشاركة لنشر الأجر
                keyboard = [[InlineKeyboardButton("📢 شارك التذكير لنشر الأجر", url=f"https://t.me/share/url?url=https://t.me/{(await context.bot.get_me()).username}&text={urllib.parse.quote(msg)}")]]
                await context.bot.send_message(
                    chat_id=chat_id, 
                    text=msg, 
                    parse_mode=constants.ParseMode.MARKDOWN,
                    reply_markup=InlineKeyboardMarkup(keyboard)
                )
            except Exception as e:
                logger.error(f"Failed to send fasting reminder to {chat_id}: {e}")

async def on_new_chat_member(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """التعامل مع إضافة البوت لمجموعة جديدة"""
    for member in update.message.new_chat_members:
        if member.id == context.bot.id:
            chat_id = update.effective_chat.id
            text = "✅ *تم التحقق والتأكد من الإضافة بنجاح!*\n\nسيقوم البوت بإرسال تذكير تلقائي كل ساعتين بشكل افتراضي. يمكن للمشرفين تغيير الإعدادات من القائمة الرئيسية."
            await context.bot.send_message(chat_id=chat_id, text=text, parse_mode=constants.ParseMode.MARKDOWN)
            
            # تفعيل افتراضي
            database.update_group_settings(chat_id, enabled=True, interval=2)
            await setup_repeating_job(chat_id, context)

# --- التشغيل الرئيسي ---

def main() -> None:
    if TOKEN == "YOUR_BOT_TOKEN_HERE":
        print("الرجاء وضع توكن البوت في متغيرات البيئة باسم BOT_TOKEN")
        return

    application = Application.builder().token(TOKEN).build()

    # الأوامر
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("menu", start))
    
    # الردود التفاعلية
    application.add_handler(CallbackQueryHandler(handle_callback))
    
    # مراقبة الإضافة للمجموعات
    application.add_handler(MessageHandler(filters.StatusUpdate.NEW_CHAT_MEMBERS, on_new_chat_member))

    # جدولة مهام الصيام (تعمل كل يوم الساعة 8 مساءً مثلاً)
    application.job_queue.run_daily(fasting_reminder_job, time=time(20, 0, 0))

    # بدء البوت
    database.init_db()
    print("بوت نورِ فاي يعمل الآن...")
    application.run_polling()

if __name__ == "__main__":
    main()
