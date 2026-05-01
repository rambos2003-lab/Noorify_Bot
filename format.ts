import { DIVIDER, FANCY_TOP, FANCY_BOTTOM, RANDOM_AZKAR } from "./azkar";

export function buildMainMenuMessage(firstName: string = "مستخدمنا العزيز"): string {
  return `${FANCY_TOP}\n   🌙 <b>نُـــورِفَـــاي</b> 🌙\n${FANCY_BOTTOM}\n\n` +
         `أهلاً بك <b>${firstName}</b>.\n\n` +
         `بوابتك اليومية للذكر والطاعة.`;
}

export function buildRandomDhikrMessage(): string {
  const dhikr = RANDOM_AZKAR[Math.floor(Math.random() * RANDOM_AZKAR.length)];
  return `${FANCY_TOP}\n   ✨ <b>ذكر الله</b> ✨\n${FANCY_BOTTOM}\n\n` +
         `<code>${dhikr}</code>\n\n${DIVIDER}`;
}

export function buildTasbeehMessage(data: any): string {
  return `${FANCY_TOP}\n   📿 <b>المسبحة</b>\n${FANCY_BOTTOM}\n\n` +
         `الذكر: <b>${data.dhikr}</b>\n` +
         `العدد: <code>[ ${data.count} ]</code>\n` +
         `الإجمالي: <code>[ ${data.totalCount} ]</code>`;
}

export function buildLibraryMessage(): string {
  return `📚 <b>المكتبة الإسلامية</b>\n${DIVIDER}\n` +
         `اختر الكتاب الذي تود تحميله:`;
}

export function buildAboutMessage(): string {
  return `🌙 <b>عن البوت</b>\n${DIVIDER}\n` +
         `نورفاي هو صدقة جارية لنشر ذكر الله.`;
}

export function buildStatsMessage(s: any): string {
  return `📊 <b>الإحصائيات</b>\n${DIVIDER}\n` +
         `تسبيحاتك: ${s.totalTasbeeh}`;
}

export function buildSettingsMessage(): string {
  return `⚙️ <b>الإعدادات</b>\n${DIVIDER}\nتحكم في التذكيرات التلقائية.`;
}

export function buildIntervalChooserMessage(current: number): string {
  return `⏳ اختيار مدة التذكير (الحالية: ${current} د)`;
}
