import { DIVIDER, FANCY_TOP, FANCY_BOTTOM, RANDOM_AZKAR } from "./azkar";

export function buildMainMenuMessage(firstName: string = "أخي الغالي"): string {
  return `${FANCY_TOP}\n   🌙 <b>بُــوت نُـــورِفَـــاي</b> 🌙\n${FANCY_BOTTOM}\n\n` +
         `أهلاً بك يا <b>${firstName}</b> في بيتك الإيماني.\n\n` +
         `اختر من القائمة أدناه ما يعينك على ذكر الله.`;
}

export function buildRandomDhikrMessage(): string {
  const dhikr = RANDOM_AZKAR[Math.floor(Math.random() * RANDOM_AZKAR.length)];
  return `${FANCY_TOP}\n   ✨ <b>ذِكْــرٌ نَــافِــع</b> ✨\n${FANCY_BOTTOM}\n\n` +
         `<pre>${dhikr}</pre>\n\n${DIVIDER}\n` +
         `<i>"ألا بذكر الله تطمئن القلوب"</i>`;
}

export function buildTasbeehMessage(data: any): string {
  return `${FANCY_TOP}\n   📿 <b>الـمـسـبـحـة</b>\n${FANCY_BOTTOM}\n\n` +
         `الذكر: <b>${data.dhikr}</b>\n` +
         `العدد الحالي: <code>[ ${data.count} ]</code>\n` +
         `الإجمالي: <code>[ ${data.totalCount} ]</code>\n\n${DIVIDER}\n` +
         `<i>تقبل الله طاعتك يا ${data.firstName}</i>`;
}

export function buildLibraryMessage(): string {
  return `📚 <b>المكتبة الإسلامية الشاملة</b>\n${DIVIDER}\n\n` +
         `تحتوي المكتبة على أمهات الكتب والكتيبات بصيغة PDF.\n` +
         `اختر الكتاب الذي تود تحميله:`;
}

export function buildAboutMessage(): string {
  return `🌙 <b>عن نُــورِفَـــاي</b>\n${DIVIDER}\n\n` +
         `بوت صدقة جارية يهدف لنشر ذكر الله وتسهيل الوصول للكتب الإسلامية.\n\n` +
         `نسألكم الدعاء لمن صممه وساهم في نشره.`;
}

export function buildStatsMessage(s: any): string {
  return `📊 <b>إحصائياتك الإيمانية</b>\n${DIVIDER}\n\n` +
         `• تسبيحاتك الإجمالية: <code>${s.totalTasbeeh}</code>\n` +
         `• عدد المستخدمين: <code>${s.totalUsers}</code>\n\n` +
         `<i>"وما تقدموا لأنفسكم من خير تجدوه عند الله"</i>`;
}

export function buildSettingsMessage(isPrivate: boolean): string {
  return `⚙️ <b>إعدادات التذكير</b>\n${DIVIDER}\n\n` +
         `يمكنك ضبط وقت إرسال الأذكار التلقائية للمجموعة أو الخاص هنا.`;
}

export function buildIntervalChooserMessage(current: number): string {
  return `⏳ <b>ضبط وقت التذكير</b>\n\nالوقت الحالي: كل ${current} دقيقة.\nاختر مدة جديدة:`;
}
