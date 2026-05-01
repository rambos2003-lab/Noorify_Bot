   // أضف اسم المتغير هنا (FASTING_HADITHS أو أي اسم تفضله)
export const FASTING_HADITHS = [
  `🌿 صيام يوم في سبيل الله يُباعد الله به وجهه عن النار سبعين خريفًا.`,
];

export const DEVELOPER_USERNAME = "vx_rq";
// ... باقي الكود
export const DEVELOPER_URL = `https://t.me/${DEVELOPER_USERNAME}`;

const DIVIDER = "─────────────────────";
const FANCY_TOP = "╭─❀──────────❀─╮";
const FANCY_BOTTOM = "╰─❀──────────❀─╯";

export const WELCOME_MESSAGE = (botUsername: string): string =>
  `${FANCY_TOP}\n` +
  `   🌙 <b>بوت نورِفاي</b> 🌙\n` +
  `${FANCY_BOTTOM}\n\n` +
  `<b>السلام عليكم ورحمة الله وبركاته</b> ✨\n` +
  `<i>أهلًا بكم في رفيقكم اليومي للذكر والعبادة</i>\n\n` +
  `${DIVIDER}\n` +
  `📌 <b>ماذا يقدّم لك البوت؟</b>\n` +
  `${DIVIDER}\n\n` +
  `📿 <b>المسبحة الإلكترونية</b>\n` +
  `   ┗ عدّاد ذكي، اختر ذكرك المفضل، وتابع تقدمك.\n\n` +
  `📚 <b>المكتبة الإسلامية</b>\n` +
  `   ┗ حصن المسلم، رياض الصالحين، القرآن الكريم،\n` +
  `      أذكار الصباح والمساء والنوم، وغيرها.\n\n` +
  `🔔 <b>تذكيرات تلقائية</b>\n` +
  `   ┗ ذكر عشوائي يصلك كل ساعتين (قابل للتعديل).\n\n` +
  `🌅 <b>تذكير صيام الإثنين والخميس</b>\n` +
  `   ┗ نُذكّرك قبل يوم بفضل الصيام وأدلته.\n\n` +
  `📊 <b>الإحصائيات</b>\n` +
  `   ┗ تابع عدد تسبيحاتك ومدى ثباتك.\n\n` +
  `${DIVIDER}\n` +
  `🤝 <b>للإضافة إلى مجموعة أو قناة:</b>\n` +
  `${DIVIDER}\n\n` +
  `1️⃣ اضغط زر «➕ إضافة للمجموعة» أدناه.\n` +
  `2️⃣ اختر المجموعة أو القناة.\n` +
  `3️⃣ امنح البوت صلاحية المشرف.\n` +
  `4️⃣ سيبدأ البوت تلقائيًا بإرسال الأذكار.\n\n` +
  `${DIVIDER}\n` +
  `💚 <b>كن سببًا في نشر الخير</b>\n` +
  `${DIVIDER}\n\n` +
  `شارك البوت لتكون صدقةً جاريةً لك ولوالديك\n` +
  `<i>«مَنْ دلَّ على خيرٍ فلَه مثلُ أجرِ فاعلِه»</i>\n\n` +
  `${DIVIDER}\n` +
  `🌹 اضغط على أحد الأزرار أدناه للبدء 👇\n` +
  `<a href="https://t.me/${botUsername}?startgroup=true">·</a>`;

export const GROUP_WELCOME_MESSAGE = (chatTitle: string): string =>
  `${FANCY_TOP}\n` +
  `   🌙 <b>بوت نورِفاي</b> 🌙\n` +
  `${FANCY_BOTTOM}\n\n` +
  `<b>السلام عليكم ورحمة الله وبركاته</b> ✨\n\n` +
  `${DIVIDER}\n` +
  `✅ <b>تم التحقق والتأكد من الإضافة</b>\n` +
  `${DIVIDER}\n\n` +
  `📍 إلى: <b>${escapeHtml(chatTitle)}</b>\n\n` +
  `${DIVIDER}\n` +
  `🔔 <b>الإعدادات الافتراضية</b>\n` +
  `${DIVIDER}\n\n` +
  `⏱️ التذكيرات: <b>كل ساعتين</b> (مفعّلة)\n` +
  `🌅 تذكير الصيام: <b>مفعّل</b>\n\n` +
  `${DIVIDER}\n` +
  `⚙️ <b>للمشرفين فقط</b>\n` +
  `${DIVIDER}\n\n` +
  `┃ 🔔 تفعيل/تعطيل التذكيرات\n` +
  `┃ ⏱️ تغيير فترة التذكير\n` +
  `┃ 🌅 تفعيل/تعطيل تذكير الصيام\n\n` +
  `${DIVIDER}\n` +
  `👥 <b>متاح للجميع</b>\n` +
  `${DIVIDER}\n\n` +
  `┃ 📿 المسبحة الإلكترونية\n` +
  `┃ 📚 المكتبة الإسلامية\n` +
  `┃ 📊 الإحصائيات\n` +
  `┃ 🌟 طلب ذكر فوري\n\n` +
  `${DIVIDER}\n` +
  `💡 استخدم /menu لعرض القائمة في أي وقت.\n` +
  `📞 للدعم: <a href="${DEVELOPER_URL}">@${DEVELOPER_USERNAME}</a>`;

export const CONTACT_MESSAGE: string =
  `${FANCY_TOP}\n` +
  `   📞 <b>التواصل مع المطور</b>\n` +
  `${FANCY_BOTTOM}\n\n` +
  `${DIVIDER}\n\n` +
  `للدعم الفني، اقتراح ميزات جديدة، أو الإبلاغ عن مشكلة،\n` +
  `يسعدنا تواصلك مع المطور:\n\n` +
  `👤 <b>المطور:</b> <a href="${DEVELOPER_URL}">@${DEVELOPER_USERNAME}</a>\n\n` +
  `${DIVIDER}\n` +
  `🌹 <i>دعواتكم الصالحة هي خير مكافأة.</i>\n` +
  `${DIVIDER}`;

export const SHARE_MESSAGE = (botUsername: string): string =>
  `${FANCY_TOP}\n` +
  `   💚 <b>شارك الأجر</b>\n` +
  `${FANCY_BOTTOM}\n\n` +
  `<i>«مَنْ دلَّ على خيرٍ فلَه مثلُ أجرِ فاعلِه»</i>\n` +
  `<i>رواه مسلم</i>\n\n` +
  `${DIVIDER}\n\n` +
  `🔗 <b>رابط البوت:</b>\n` +
  `<code>https://t.me/${botUsername}</code>\n\n` +
  `${DIVIDER}\n\n` +
  `شارك البوت مع أحبابك ليكون\n` +
  `صدقةً جاريةً لك ولوالديك 🤍\n\n` +
  `${DIVIDER}`;

export const HELP_MESSAGE: string =
  `${FANCY_TOP}\n` +
  `   ℹ️ <b>دليل الاستخدام</b>\n` +
  `${FANCY_BOTTOM}\n\n` +
  `${DIVIDER}\n` +
  `📋 <b>الأوامر المتاحة</b>\n` +
  `${DIVIDER}\n\n` +
  `🌙 /start — بدء استخدام البوت\n` +
  `📿 /menu — القائمة الرئيسية\n` +
  `📿 /tasbeeh — فتح المسبحة\n` +
  `📚 /library — المكتبة الإسلامية\n` +
  `🌟 /dhikr — إرسال ذكر فوري\n` +
  `📖 /quran — القرآن الكريم\n` +
  `🛡️ /hisn — حصن المسلم\n` +
  `🌅 /morning — أذكار الصباح والمساء\n` +
  `🌙 /sleep — أذكار النوم\n` +
  `📊 /stats — الإحصائيات\n` +
  `⚙️ /settings — الإعدادات\n` +
  `📞 /contact — تواصل مع المطور\n` +
  `💚 /share — شارك البوت\n` +
  `ℹ️ /about — عن البوت\n` +
  `❓ /help — هذه الرسالة\n\n` +
  `${DIVIDER}\n` +
  `💡 <i>للمجموعات: التذكيرات تعمل تلقائيًا.</i>\n` +
  `${DIVIDER}`;

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
