import asyncio
import random
import logging
import sys
import time
import re
import os
from dotenv import load_dotenv
from datetime import datetime
from typing import Dict, Any, List, Union, Optional

# تحميل المتغيرات من ملف .env
load_dotenv()

from aiogram import Bot, Dispatcher, F, html
from aiogram.filters import Command, ChatMemberUpdatedFilter
from aiogram.types import (
    InlineKeyboardButton, 
    InlineKeyboardMarkup, 
    Message, 
    CallbackQuery, 
    ChatMemberUpdated,
    BotCommand
)
from aiogram.enums import ParseMode, ChatMemberStatus
from aiogram.client.default import DefaultBotProperties
from aiogram.exceptions import TelegramForbiddenError, TelegramBadRequest

# --- [ الإعدادات العليا للنظام الملكي ] ---
TOKEN = os.getenv("TOKEN")
MY_USER_ID = 1408037752
MY_GROUP_ID = -1003650088178
DEVELOPER_URL = "https://t.me/vx_rq"
TECH_CHANNEL = "https://t.me/RamiAILab"

dp = Dispatcher()

# --- [ قاعدة البيانات العملاقة - أضخم قائمة أذكار غير مختصرة ] ---
ADHKAR_LIST = [
    "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
    "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ نِعْمَ الْمَوْلَىٰ وَنِعْمَ النَّصِيرُ",
    "لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي",
    "رَبِّ زِدْنِي عِلْمًا وَأَلْحِقْنِي بِالصَّالِحِينَ",
    "رَبِّ اغْفِرْ لِي وَلِوالِدَيَّ وَلِمَن دَخَلَ بَيْتِيَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ",
    "وَتُبْ عَلَيْنَا إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ",
    "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
    "رَبِّ نَجِّنِي مِنَ الْقَوْمِ الظَّالِمِينَ",
    "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ 🕊️",
    "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
    "وَقُل رَّبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ",
    "إِنَّ مَعَ الْعُسْرِ يُسْرًا ✨ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    "سَلَامٌ قَوْلًا مِن رَّبٍّ رَّحِيمٍ",
    "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ 💡",
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
    "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ",
    "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ",
    "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    "الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ كَمَا يُحِبُّ رَبُّنَا وَيَرْضَى",
    "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
    "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ",
    "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ",
    "فَسُبْحَانَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ",
    "وَمَن يَتَوَكَّل عَلَى اللَّهِ فَهُوَ حَسبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ",
    "رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ ۖ إِنَّ عَذَابَهَا كَانَ غَرَامًا",
    "سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ ✨ وَسَلَامٌ عَلَى الْمُرْسَلِينَ",
    "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ 🌍",
    "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ ، وَالْعَجْزِ وَالْكَسَلِ",
    "مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ 💎",
    "سُبْحَانَ اللَّهِ عَدَدَ مَا خَلَقَ ، سُبْحَانَ اللَّهِ مِلْءَ مَا خَلَقَ",
    "يا ذا الجلال والإكرام ، يا حي يا قيوم برحمتك أستغيث",
    "اللهم اجعل في قلبي نوراً، وفي بصري نوراً، وفي سمعي نوراً",
    "اللهم أنت ربي لا إله إلا أنت خلقتني وأنا عبدك وأنا على عهدك ووعدك ما استطعت",
    "اللهم إني أعوذ بك من علم لا ينفع، ومن قلب لا يخشع، ومن نفس لا تشبع",
    "أستغفر الله العظيم لي وللمؤمنين والمؤمنات والمسلمين والمسلمات الأحياء منهم والأموات",
    "اللَّهُمَّ رَبَّ السَّمَوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ",
    "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
    "اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي",
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
    "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ وَتَحَوُّلِ عَافِيَتِكَ وَفُجَاءَةِ نِقْمَتِكَ",
    "اللَّهُمَّ مَتِّعْنِي بِسَمْعِي وَبَصَرِي وَاجْعَلْهُمَا الْوَارِثَ مِنِّي",
    "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ",
    "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ",
    "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الْخَيْرِ كُلِّهِ عَاجِلِهِ وَآجِلِهِ مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ"
]

TASBIH_TYPES = [
    "🟢 سُبْحَانَ اللَّهِ", "⚪ الْحَمْدُ لِلَّهِ", "🟡 لَا إِلَهَ إِلَّا اللَّهُ", "🟠 اللَّهُ أَكْبَرُ",
    "🔴 أَسْتَغْفِرُ اللَّهَ", "🔵 صَلِّ عَلَى مُحَمَّدٍ", "🟣 لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    "🟤 سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", "⚪ سُبْحَانَ اللَّهِ الْعَظِيمِ", "🟢 يَا حَيُّ يَا قَيُّومُ",
    "🟡 رَبِّ اغْفِرْ لِي", "🟠 حَسْبِيَ اللَّهُ", "🔴 لَا إِلَهَ إِلَّا أَنْتَ", "🔵 تَوَكَّلْتُ عَلَى اللَّهِ",
    "⚫ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", "🟪 اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    "🟨 حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", "🟩 لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    "🟦 يَا رَزَّاقُ يَا ذَا الْقُوَّةِ الْمَتِينُ", "🟥 اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    "🟫 يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ", "⚪ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ",
    "🟢 أستغفر الله العظيم وأتوب إليه", "🟡 لا إله إلا الله الملك الحق المبين",
    "🟠 اللهم إني أسألك الجنة", "🔴 اللهم إني أعوذ بك من النار",
    "🔵 يا فتاح يا عليم", "🟣 يا رحمن يا رحيم",
    "🟤 اللهم صل وسلم على نبينا محمد", "⚪ رب اجعلني مقيم الصلاة ومن ذريتي"
]

# --- [ إدارة الحالة وقاعدة البيانات في الذاكرة ] ---
active_chats: Dict[int, Dict[str, Any]] = {}
user_db: Dict[int, Dict[str, Any]] = {}

# --- [ الدوال المنطقية المتقدمة - محرك الذكاء الاصطناعي ] ---

def get_unique_progress(current: int, limit: int = 33) -> str:
    """توليد شريط تقدم احترافي"""
    slots = 12
    filled = int((min(current, limit) / limit) * slots)
    bar = "◈" * filled + "◇" * (slots - filled)
    return f"【 {bar} 】 ⚡ {int((current/limit)*100)}%"

async def is_admin(event: Union[Message, CallbackQuery]) -> bool:
    """التحقق من صلاحيات الإدارة"""
    uid = event.from_user.id
    if uid == MY_USER_ID: return True
    chat = event.message.chat if isinstance(event, CallbackQuery) else event.chat
    if chat.type == "private": return True
    try:
        m = await event.bot.get_chat_member(chat.id, uid)
        return m.status in [ChatMemberStatus.ADMINISTRATOR, ChatMemberStatus.OWNER, ChatMemberStatus.CREATOR]
    except: return False

def init_user(uid: int, name: str) -> Dict[str, Any]:
    """تهيئة بيانات المستخدم الملكية"""
    if uid not in user_db:
        user_db[uid] = {
            "name": name, 
            "tasbih": 0, 
            "level": 1,
            "join_date": datetime.now().strftime("%Y/%m/%d %I:%M %p"),
            "achievements": [],
            "points": 0
        }
    return user_db[uid]

def get_spiritual_rank(total: int) -> tuple:
    """نظام المتطور بناءً على الذكر"""
    ranks = [
        (2500, "ذاكر مخلص 🕊️", "🛡️"),
        (1000, "ذاكر مستمر 🌟", "🌟"),
        (500, "مُحب للخير 🌱", "🌿"),
        (100, "ساعٍ للبر 🐚", "🐚"),
        (0, "مجاهد مبتدئ 🕊️", "🕊️")
    ]
    for limit, title, icon in ranks:
        if total >= limit: return title, icon
    return ranks[-1][1], ranks[-1][2]

def ai_spiritual_analysis(total: int) -> str:
    """ تحليل  للحالة """
    if total == 0: return " اللَّهُمَّ تَقَبَّلْ مِنْكَ ."
    if total < 100: return "بَارَكَ اللهُ فِيكَ وَنَفَعَ بِكَ."
    if total < 1000: return "فِي مِيزَانِ حَسَنَاتِكَ."
    if total < 10000: return "رَبِّي يَكْتُبُ لَكَ الأَجْر."
    return "اللَّهُ يَرْضَى عَلَيْكَ وَيُيَسِّرُ أَمْرَكَ."

# --- [ واجهات المستخدم - التصميم الملكي ] ---
def text_welcome() -> str:
    """نص الترحيب الرسمي المتكامل"""

    return (
        f" ❮ {html.bold('نُورِفَاي | NOORIFY')} ❯ \n\n"

        "طبت وطاب ممشاك وتبوأت من الجنة منزلاً 🤍\n"
        "نسأل الله أن يجعل هذا العمل خالصاً لوجهه الكريم، "
        "وأن يملأ قلبك طمأنينةً بذكره.\n\n"

        f"🕊️ {html.italic('﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾')}\n"
        "📍 سورة الرعد - آية 28\n\n"

        "🌱 شارك الخير:\n"
        "الدال على الخير كفاعله، اجعل البوت صدقة جارية لك ولأهلك.\n\n"

        "📲 للتواصل مع المطور: @vx_rq\n"
        " جعلنا الله وإياكم من الذاكرين🤍."
    )
def text_help() -> str:
    """نص قائمة المساعدة والدعم الفني"""
    return (
        f"🆘 {html.bold('قـائـمـة الـمـسـاعـدة والـبـلاغـات')}\n"
        f"💠 {html.bold('الدعم الفني:')}\n"
        "في حال واجهت أي مشكلة تقنية أو توقف في البوت، يرجى مراسلة المبرمج فوراً.\n\n"
        f"👨‍💻 {html.bold('رابط المطور:')} @vx_rq\n"
        f"📡 {html.bold('قناة التحديثات:')} {TECH_CHANNEL}\n\n"
        f"🛡️ {html.bold('ملاحظة:')} البوت يعمل على مدار الساعة لخدمتكم.\n"
    )

def kb_main(bot_username: str) -> InlineKeyboardMarkup:
    """لوحة التحكم الرئيسية المطابقة لصورك"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="تفعيل بالمجموعة 👥", url=f"t.me/{bot_username}?startgroup=true"),
            InlineKeyboardButton(text="تفعيل بالقناة 📢", url=f"t.me/{bot_username}?startchannel=true")
        ],
        [
            InlineKeyboardButton(text="ذكر عشوائي ✨", callback_data="btn_random"),
            InlineKeyboardButton(text="الضبط الدوري ⚙️", callback_data="btn_settings")
        ],
        [
            InlineKeyboardButton(text="إحصائياتي 📊", callback_data="btn_stats"),
            InlineKeyboardButton(text="المسبحة 📿", callback_data="btn_tasbih_menu")
        ],
        [
            InlineKeyboardButton(text="مشاركة البوت 🚀", url=f"https://t.me/share/url?url=t.me/{bot_username}"),
            InlineKeyboardButton(text="المبرمج 👨‍💻", url=DEVELOPER_URL)
        ],
        [InlineKeyboardButton(text="تابع قناتي للتقنية والذكاء الاصطناعي 🚀💻", url=TECH_CHANNEL)]
    ])

# --- [ معالجات الأوامر - إصلاح شامل وذكي للمجموعات ] ---

# استخدام ignore_mention=True يضمن استجابة البوت للأوامر حتى لو احتوت على اسمه (مثل /help@Noorify_bot)
@dp.message(Command("start", "help", "guide", "stats", "tasbih", "settings", ignore_case=True, ignore_mention=True))
async def master_command_router(message: Message):
    """المعالج الشامل الذي يضمن عمل كافة الأوامر في المجموعات والخاص"""
    uid = message.from_user.id
    u = init_user(uid, message.from_user.full_name)
    bot_info = await message.bot.get_me()
    
    # استخراج الأمر بدقة وتجاهل المعرف
    raw_text = message.text.split()[0].lower()
    cmd = raw_text.split("@")[0].replace("/", "")

    if cmd == "start":
        await message.answer(text_welcome(), reply_markup=kb_main(bot_info.username))
    
    elif cmd == "help":
        await message.answer(text_help(), reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="🔙 العودة للرئيسية", callback_data="btn_home")]]))

    elif cmd == "guide":
        guide_text = (
            f"📑 {html.bold('دليل التشغيل')}\n"
            f"1️⃣ {html.bold('في المجموعات:')} أضف البوت مشرفاً مع صلاحية حذف الرسائل.\n"
            f"2️⃣ {html.bold('الضبط الدوري:')} متاح للمشرفين فقط من خلال زر الضبط لتحديد موعد التذكير.\n"
            f"3️⃣ {html.bold('نظام الرتب:')} ارفع رتبتك بكثرة التسبيح.\n"
            f"4️⃣ {html.bold('الأوامر المتاحة:')} {html.code('/stats, /tasbih, /guide, /help, /settings')}\n"
        )
        await message.answer(guide_text, reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="🔙 العودة للرئيسية", callback_data="btn_home")]]))
    
    elif cmd in ["stats", "tasbih"]:
        rank_n, rank_i = get_spiritual_rank(u['tasbih'])
        txt = (
            f"📊 {html.bold('لوحة الإحصائيات')} {rank_i}\n"
            f"👤 الاسم: {u['name']}\n"
            f"🏅  الرتبه: {rank_n}\n"
            f"📿 إجمالي الأذكار: {html.bold(str(u['tasbih']))}\n"
            f"📅 تاريخ الانتساب: {u['join_date']}\n\n"
            f"🧠 {html.bold('تحليل لحالتك:')}\n"
            f"✨ {ai_spiritual_analysis(u['tasbih'])}\n"
        )
        await message.answer(txt, reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="🔙 العودة", callback_data="btn_home")]]))
    
    elif cmd == "settings":
        if await is_admin(message):
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="30 دقيقة ⏱️", callback_data="set_0.5"), InlineKeyboardButton(text="ساعة ⏱️", callback_data="set_1")],
                [InlineKeyboardButton(text="3 ساعات ⏱️", callback_data="set_3"), InlineKeyboardButton(text="6 ساعات ⏱️", callback_data="set_6")],
                [InlineKeyboardButton(text="12 ساعة ⏱️", callback_data="set_12"), InlineKeyboardButton(text="يومي ⏱️", callback_data="set_24")],
                [InlineKeyboardButton(text="إيقاف ❌", callback_data="set_off")],
                [InlineKeyboardButton(text="🔙 عودة", callback_data="btn_home")]
            ])
            await message.answer(f"⚙️ {html.bold('إعدادات الدوري للدردشة')}", reply_markup=kb)
        else:
            await message.answer("❌ عذراً، هذا الأمر متاح للمشرفين فقط.")

# --- [ محرك المسبحة التفاعلي ] ---

@dp.callback_query(F.data.startswith("btn_tasbih_menu"))
async def btn_tasbih_menu(call: CallbackQuery):
    # تحديد الصفحة الحالية
    page = 1
    if call.data == "btn_tasbih_menu_2":
        page = 2
        
    btns = []
    # تحديد بداية ونهاية المؤشر بناءً على الصفحة
    start_idx = 0 if page == 1 else 14
    end_idx = 14 if page == 1 else len(TASBIH_TYPES)
    
    for i in range(start_idx, end_idx, 2):
        row = [InlineKeyboardButton(text=TASBIH_TYPES[i], callback_data=f"go_{i}")]
        if i+1 < end_idx: 
            row.append(InlineKeyboardButton(text=TASBIH_TYPES[i+1], callback_data=f"go_{i+1}"))
        btns.append(row)
    
    # إضافة أزرار التنقل بين الصفحات
    if page == 1:
        btns.append([InlineKeyboardButton(text="الأذكار التالية ➡️", callback_data="btn_tasbih_menu_2")])
    else:
        btns.append([InlineKeyboardButton(text="⬅️ الأذكار السابقة", callback_data="btn_tasbih_menu")])
        
    btns.append([InlineKeyboardButton(text="🔙 عودة للرئيسية", callback_data="btn_home")])
    await call.message.edit_text(f"📿 {html.bold('اختر نوع الذكر المفضل لفتح المسبحة التفاعلية:')}", reply_markup=InlineKeyboardMarkup(inline_keyboard=btns))
    
@dp.callback_query(F.data.startswith(("go_", "hit_")))
async def engine_tasbih(call: CallbackQuery):
    try:
        idx = int(call.data.split("_")[1])
    except (IndexError, ValueError):
        await call.answer("خطأ في البيانات", show_alert=True)
        return

    u = init_user(call.from_user.id, call.from_user.full_name)
    u.setdefault("tasbih", 0)

    if call.data.startswith("hit_"):
        u["tasbih"] += 1
        # لازم هنا حفظ البيانات إذا عندك DB

    rank_n, rank_i = get_spiritual_rank(u["tasbih"])
    progress = get_unique_progress(u["tasbih"] % 34)

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="إضغط ", callback_data=f"hit_{idx}")],
        [
            InlineKeyboardButton(text="🔄 تغيير النوع", callback_data="btn_tasbih_menu"),
            InlineKeyboardButton(text="🔙 عودة", callback_data="btn_home")
        ]
    ])

    txt = (
        f"{html.bold('المسبحة')} {rank_i}\n"
        f"🕊️ {html.italic(TASBIH_TYPES[idx])}\n\n"
        f"📊 التقدم في الدورة:\n{html.code(progress)}\n"
        f"🏅 الرتبة: {rank_n}\n"
        f"📿 إجمالي تسبيحاتك: {u['tasbih']}\n"
    )

    try:
        await call.message.edit_text(txt, reply_markup=kb, parse_mode="HTML")
    except Exception:
        pass

# --- [ لوحة الإحصائيات الفائقة ] ---

@dp.callback_query(F.data == "btn_stats")
async def btn_stats_call(call: CallbackQuery):
    u = init_user(call.from_user.id, call.from_user.full_name)
    rank_n, rank_i = get_spiritual_rank(u['tasbih'])
    txt = (
        f"📊 {html.bold('لوحة الإحصائيات')} {rank_i}\n"
        f"👤 الاسم: {u['name']}\n"
        f"🏅 الرتبة: {rank_n}\n"
        f"📿 رصيد الأذكار: {html.bold(str(u['tasbih']))}\n"
        f"📅 تاريخ الانتساب: {u['join_date']}\n\n"
        f"🧠 {html.bold('تحليل لحالتك:')}\n"
        f"✨ {ai_spiritual_analysis(u['tasbih'])}\n"
    )
    await call.message.edit_text(txt, reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="🔙 العودة للرئيسية", callback_data="btn_home")]]))

# --- [ إعدادات الضبط الدوري والحماية ] ---

@dp.callback_query(F.data == "btn_settings")
async def btn_settings_callback(call: CallbackQuery):
    if not await is_admin(call):
        return await call.answer("❌ عذراً! هذا الزر مخصص لمشرفي المجموعة فقط لضبط الأذكار التلقائية.", show_alert=True)
    
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="30 دقيقة ⏱️", callback_data="set_0.5"), InlineKeyboardButton(text="ساعة ⏱️", callback_data="set_1")],
        [InlineKeyboardButton(text="3 ساعات ⏱️", callback_data="set_3"), InlineKeyboardButton(text="6 ساعات ⏱️", callback_data="set_6")],
        [InlineKeyboardButton(text="12 ساعة ⏱️", callback_data="set_12"), InlineKeyboardButton(text="يومي ⏱️", callback_data="set_24")],
        [InlineKeyboardButton(text="إيقاف  ❌", callback_data="set_off")],
        [InlineKeyboardButton(text="🔙 العودة", callback_data="btn_home")]
    ])
    await call.message.edit_text(f"⚙️ {html.bold('إعدادات التذكير الدوري للدردشة')}\n\nاختر التكرار الزمني لإرسال الأذكار التلقائية:", reply_markup=kb)

@dp.callback_query(F.data.startswith("set_"))
async def handle_save_settings(call: CallbackQuery):
    if not await is_admin(call): return
    val = call.data.split("_")[1]
    cid = call.message.chat.id
    if val == "off":
        active_chats.pop(cid, None)
        await call.answer("🔇 تم إيقاف التذكيرات التلقائية بنجاح.", show_alert=True)
    else:
        active_chats[cid] = {"interval": float(val), "last": time.time()}
        await call.answer(f"✅ تم تفعيل التذكير الدوري كل {val} ساعة.", show_alert=True)
    await back_home(call)

# --- [ الوظائف العامة والعودة ] ---

@dp.callback_query(F.data == "btn_home")
async def back_home(call: CallbackQuery):
    bot_info = await call.bot.get_me()
    await call.message.edit_text(text_welcome(), reply_markup=kb_main(bot_info.username))

@dp.callback_query(F.data == "btn_random")
async def btn_random_dhikr(call: CallbackQuery):
    dk = random.choice(ADHKAR_LIST)
    await call.message.edit_text(
        f"✨ {html.bold('رَبِّي يَكْتُبُ لَكَ الأَجْرَ وَيُضَاعِفُهُ   :')}\n\n{html.code(dk)}", 
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔄 ذكر آخر", callback_data="btn_random")],
            [InlineKeyboardButton(text="🔙 عودة للرئيسية", callback_data="btn_home")]
        ])
    )

# --- [ نظام الترحيب والمجدول الذكي ] ---

@dp.my_chat_member(ChatMemberUpdatedFilter(member_status_changed=F.NEW_STATUS.IN_({ChatMemberStatus.ADMINISTRATOR, ChatMemberStatus.MEMBER})))
async def on_bot_join(event: ChatMemberUpdated):
    """الترحيب عند إضافة البوت لمجموعة أو قناة"""
    if event.new_chat_member.status in [ChatMemberStatus.MEMBER, ChatMemberStatus.ADMINISTRATOR]:
        welcome = (
            f"🎊 {html.bold('تم تفعيل  نُورِفَاي  في هذا المكان!')}\n\n"
            "سأقوم بنشر الأذكار والأدعية لتعطير هذه الدردشة.\n"
            "💡 يمكن للمشرفين التحكم في وقت الإرسال من خلال زر 'الضبط الدوري' في القائمة الرئيسية."
        )
        try:
            await event.bot.send_message(event.chat.id, welcome)
        except Exception:
            pass

async def background_broadcaster(bot: Bot):
    """نظام البث الدوري الذكي في الخلفية للمجموعات والقنوات"""
    while True:
        now = time.time()
        for cid, config in list(active_chats.items()):
            if now - config["last"] >= (config["interval"] * 3600):
                try:
                    dhikr = random.choice(ADHKAR_LIST)
                    await bot.send_message(cid, f"💠 {html.bold('نفحات نُورِفَاي الملكية:')}\n\n{html.code(dhikr)}")
                    active_chats[cid]["last"] = now
                except Exception as e:
                    # في حال تم حظر البوت أو إزالته
                    if "forbidden" in str(e).lower() or "not found" in str(e).lower():
                        active_chats.pop(cid, None)
        await asyncio.sleep(60)

async def main():
    """نقطة انطلاق النظام الملكي"""
    bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    
    # تشغيل المجدول في الخلفية
    asyncio.create_task(background_broadcaster(bot))
    
    # تسجيل الأوامر في قائمة التليجرام الرسمية لتظهر كـ Menu
    await bot.set_my_commands([
        BotCommand(command="start", description="💠 تشغيل البوت وفتح القائمة الرئيسية"),
        BotCommand(command="help", description="🆘 المساعدة ورابط التواصل مع المبرمج"),
        BotCommand(command="guide", description="📑 دليل استخدام البوت في الخاص والمجموعات"),
        BotCommand(command="stats", description="📊 عرض إحصائياتك ورتبتك "),
        BotCommand(command="tasbih", description="📿 فتح المسبحة الإلكترونية ")
    ])
    
    # تنظيف التحديثات القديمة والبدء
    await bot.delete_webhook(drop_pending_updates=True)
    print("💎 NOORIFY ROYAL MEGA-SYSTEM IS NOW ONLINE")
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        pass
