import logging
import random
import os
import urllib.parse
from datetime import datetime, time
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler, MessageHandler, filters

# استيراد الثوابت من ملف constants.py
try:
    from constants import WELCOME_TEXT, DHIKRS, EMOTIONAL_MESSAGES, ADMIN_USERNAME, BOOKS, GITHUB_REPO_URL
except ImportError:
    # قيم افتراضية في حال عدم وجود ملف الثوابت
    WELCOME_TEXT = "مرحباً بك في بوت نور فاي 🕌"
    ADMIN_USERNAME = "@admin"
    GITHUB_REPO_URL = ""
    BOOKS = {}
    DHIKRS = ["سبحان الله"]
    EMOTIONAL_MESSAGES = ["الله يبارك فيك"]

# إعدادات التسجيل (Logging)
logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

# المتغيرات العامة
TOKEN = os.getenv("BOT_TOKEN")
user_data = {} # لتخزين بيانات المسبحة
chat_configs = {} # لتخزين إعدادات التذكير لكل شات (خاص أو مجموعة)

# ==========================================
# 🛡️ دالة التحقق من الصلاحيات
# ==========================================
async def can_user_configure(update: Update, context: ContextTypes.DEFAULT_TYPE) -> bool:
    """
    تسمح للمستخدم في الخاص بالتحكم الكامل، 
    أما في المجموعات فتسمح للمشرفين فقط.
    """
    if update.effective_chat.type == "private":
        return True
    
    user_id = update.effective_user.id
    try:
        member = await update.effective_chat.get_member(user_id)
        return member.status in ["creator", "administrator"]
    except Exception:
        return False

# ==========================================
# ⌨️ لوحات المفاتيح (Keyboards)
# ==========================================
def get_main_keyboard():
    keyboard = [
        [InlineKeyboardButton("📿 ذِكْر عَشْوَائِي", callback_data='btn_random')],
        [InlineKeyboardButton("🕋 الْمِسْبَحَة الْإِلِكْتُرُونِيَّة", callback_data='btn_tasbih')],
        [InlineKeyboardButton("📚 الْمَكْتَبَة الْإِسْلَامِيَّة", callback_data='btn_library')],
        [InlineKeyboardButton("📊 إِحْصَائِيَّاتِي", callback_data='btn_stats')],
        [InlineKeyboardButton("⚙️ إِعْدَادَات التَّذْكِير", callback_data='btn_settings')]
    ]
    return InlineKeyboardMarkup(keyboard)

# ==========================================
# 🚀 أوامر البوت (Commands)
# ==========================================
async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """أمر /start والترحيب"""
    await update.message.reply_text(
        WELCOME_TEXT.format(admin=ADMIN_USERNAME),
        parse_mode='HTML',
        reply_markup=get_main_keyboard(),
        disable_web_page_preview=True
    )

async def cmd_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """أمر /menu لإظهار القائمة"""
    await update.message.reply_text("🕌 <b>قائمة نور فاي الرئيسية:</b>", parse_mode='HTML', reply_markup=get_main_keyboard())

# ==========================================
# 🎮 معالج التفاعلات (Callback Handler)
# ==========================================
async def handle_interactions(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    data = query.data
    chat_id = update.effective_chat.id
    user_id = update.effective_user.id

    # العودة للقائمة الرئيسية
    if data == 'go_home':
        await query.answer()
        await query.edit_message_text(WELCOME_TEXT.format(admin=ADMIN_USERNAME), parse_mode='HTML', reply_markup=get_main_keyboard(), disable_web_page_preview=True)

    # 1. الذكر العشوائي
    elif data == 'btn_random':
        await query.answer()
        text = f"📿 <b>{random.choice(DHIKRS)}</b>\n\n<i>{random.choice(EMOTIONAL_MESSAGES)}</i>"
        kb = [[InlineKeyboardButton("🔄 ذكر آخر", callback_data='btn_random')], [InlineKeyboardButton("🔙 رجوع", callback_data='go_home')]]
        await query.edit_message_text(text, parse_mode='HTML', reply_markup=InlineKeyboardMarkup(kb))

    # 2. المسبحة
    elif data == 'btn_tasbih':
        await query.answer()
        kb = [[InlineKeyboardButton(d, callback_data=f'set_dhikr_{i}')] for i, d in enumerate(DHIKRS[:5])]
        kb.append([InlineKeyboardButton("🔙 رجوع", callback_data='go_home')])
        await query.edit_message_text("🕋 <b>المسبحة:</b> اختر الذكر الذي تود البدء به:", parse_mode='HTML', reply_markup=InlineKeyboardMarkup(kb))

    elif data.startswith('set_dhikr_'):
        idx = int(data.split('_')[2])
        dhikr = DHIKRS[idx]
        user_data[user_id] = {"text": dhikr, "count": 0}
        await query.answer(f"بدأت بـ {dhikr}")
        kb = [
            [InlineKeyboardButton(f"👆 سبّح (0)", callback_data='inc_tasbih')],
            [InlineKeyboardButton("🔄 تصفير", callback_data=data), InlineKeyboardButton("🔙 رجوع", callback_data='btn_tasbih')]
        ]
        await query.edit_message_text(f"🕋 جاري التسبيح بـ:\n<b>( {dhikr} )</b>", parse_mode='HTML', reply_markup=InlineKeyboardMarkup(kb))

    elif data == 'inc_tasbih':
        if user_id in user_data:
            user_data[user_id]["count"] += 1
            c = user_data[user_id]["count"]
            t = user_data[user_id]["text"]
            await query.answer()
            kb = [
                [InlineKeyboardButton(f"👆 سبّح ({c})", callback_data='inc_tasbih')],
                [InlineKeyboardButton("🔄 تصفير", callback_data=f'set_dhikr_0'), InlineKeyboardButton("🔙 رجوع", callback_data='btn_tasbih')]
            ]
            await query.edit_message_text(f"🕋 جاري التسبيح بـ:\n<b>( {t} )</b>\nالعدد الحالي: {c}", parse_mode='HTML', reply_markup=InlineKeyboardMarkup(kb))
        else:
            await query.answer("انتهت الجلسة، ابدأ من جديد")

    # 3. المكتبة الإسلامية (إصلاح الروابط العربية)
    elif data == 'btn_library':
        await query.answer()
        buttons = []
        book_list = list(BOOKS.items())
        for i in range(0, len(book_list), 2):
            row = [InlineKeyboardButton(f"📘 {book_list[i][0]}", callback_data=f'dl_{i}')]
            if i+1 < len(book_list):
                row.append(InlineKeyboardButton(f"📘 {book_list[i+1][0]}", callback_data=f'dl_{i+1}'))
            buttons.append(row)
        buttons.append([InlineKeyboardButton("🔙 رجوع", callback_data='go_home')])
        await query.edit_message_text("📚 <b>المكتبة الإسلامية:</b>\nاختر كتاباً للتحميل المباشر:", parse_mode='HTML', reply_markup=InlineKeyboardMarkup(buttons))

    elif data.startswith('dl_'):
        idx = int(data.split('_')[1])
        name, filename = list(BOOKS.items())[idx]
        await query.answer(f"جاري إرسال {name}...")
        
        # تشفير الرابط ليدعم المسافات والأسماء العربية (مثل حصن المسلم)
        encoded_file = urllib.parse.quote(filename)
        file_url = f"{GITHUB_REPO_URL}{encoded_file}"
        
        try:
            await context.bot.send_document(chat_id=chat_id, document=file_url, caption=f"📖 كتاب: <b>{name}</b>", parse_mode='HTML')
        except Exception as e:
            logger.error(f"Error sending book: {e}")
            await query.message.reply_text("⚠️ عذراً، حدث خطأ أثناء تحميل الكتاب من السيرفر.")

    # 4. إعدادات التذكير (المنطق المطلوب)
    elif data == 'btn_settings':
        # التحقق: في الخاص مسموح، في المجموعات للمشرفين فقط
        if not await can_user_configure(update, context):
            await query.answer("⛔️ هذه الإعدادات متاحة للمشرفين فقط في المجموعات!", show_alert=True)
            return
        
        await query.answer()
        conf = chat_configs.get(chat_id, {"on": True, "int": 2})
        status = "✅ مفعّل" if conf["on"] else "❌ معطّل"
        text = f"⚙️ <b>إعدادات التذكير الذكي:</b>\n\nالحالة الحالية: {status}\nالفترة: كل {conf['int']} ساعة"
        
        kb = [
            [InlineKeyboardButton("🔔 تفعيل", callback_data='cfg_on'), InlineKeyboardButton("🔕 إيقاف", callback_data='cfg_off')],
            [InlineKeyboardButton("⏱ ضبط المدة", callback_data='cfg_time_menu')],
            [InlineKeyboardButton("🔙 رجوع", callback_data='go_home')]
        ]
        await query.edit_message_text(text, parse_mode='HTML', reply_markup=InlineKeyboardMarkup(kb))

    elif data.startswith('cfg_'):
        if not await can_user_configure(update, context): return
        
        action = data.replace('cfg_', '')
        if action == 'on':
            chat_configs[chat_id] = chat_configs.get(chat_id, {"on": True, "int": 2})
            chat_configs[chat_id]["on"] = True
            await query.answer("تم تفعيل التذكير بنجاح")
        elif action == 'off':
            chat_configs[chat_id] = chat_configs.get(chat_id, {"on": True, "int": 2})
            chat_configs[chat_id]["on"] = False
            await query.answer("تم إيقاف التذكير")
        
        # تحديث الواجهة
        query.data = 'btn_settings'
        await handle_interactions(update, context)

    # 5. الإحصائيات
    elif data == 'btn_stats':
        await query.answer()
        count = user_data.get(user_id, {}).get("count", 0)
        dhikr = user_data.get(user_id, {}).get("text", "لا يوجد")
        text = f"📊 <b>إحصائياتك الإيمانية:</b>\n\n• آخر ذكر: {dhikr}\n• إجمالي التسبيح: {count}\n\n<i>استمر، فالله يحب الذاكرين!</i>"
        kb = [[InlineKeyboardButton("🔙 رجوع", callback_data='go_home')]]
        await query.edit_message_text(text, parse_mode='HTML', reply_markup=InlineKeyboardMarkup(kb))

# ==========================================
# ⏰ الجدولة والتنبيهات
# ==========================================
async def send_auto_reminder(context: ContextTypes.DEFAULT_TYPE):
    """وظيفة ترسل تذكيرات للمجموعات والخاص المفعلين"""
    dhikr = random.choice(DHIKRS)
    msg = random.choice(EMOTIONAL_MESSAGES)
    text = f"🔔 <b>تذكير بالذكر</b>\n\n<b>{dhikr}</b>\n\n<i>{msg}</i>"
    
    for chat_id, conf in chat_configs.items():
        if conf.get("on", False):
            try:
                await context.bot.send_message(chat_id=chat_id, text=text, parse_mode='HTML')
            except:
                pass

# ==========================================
# 🛠️ تشغيل البوت
# ==========================================
def main():
    if not TOKEN:
        print("خطأ: لم يتم العثور على TOKEN")
        return

    application = Application.builder().token(TOKEN).build()

    # الأوامر الأساسية
    application.add_handler(CommandHandler("start", cmd_start))
    application.add_handler(CommandHandler("menu", cmd_menu))
    application.add_handler(CommandHandler("dhikr", cmd_start)) # اختصار
    
    # معالج الأزرار
    application.add_handler(CallbackQueryHandler(handle_interactions))

    # التذكير التلقائي (كل ساعتين)
    application.job_queue.run_repeating(send_auto_reminder, interval=7200, first=10)

    print("بوت نور فاي انطلق بنجاح...")
    application.run_polling()

if __name__ == "__main__":
    main()
