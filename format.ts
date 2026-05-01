import { TASBEEH_OPTIONS } from "./azkar";

const DIVIDER = "─────────────────────";

export const buildMainMenuMessage = (): string => {
  return `<b>قائمة التحكم الرئيسية</b> ✨\n\nاختر من الأقسام أدناه لبدء الاستخدام:`;
};

export const buildTasbeehChooserMessage = (): string => {
  return `📿 <b>المسبحة الإلكترونية</b>\n\nالرجاء اختيار الذكر الذي تود التسبيح به من القائمة أدناه:`;
};

export const buildTasbeehMessage = (dhikrId: string, count: number): string => {
  const dhikr = TASBEEH_OPTIONS.find(o => o.id === dhikrId);
  return `📿 <b>المسبحة الإلكترونية</b>\n\n` +
         `${DIVIDER}\n` +
         `الذكر: <b>${dhikr?.text}</b>\n` +
         `العدد الحالي: <code>${count}</code>\n` +
         `${DIVIDER}\n` +
         `<i>استمر في الضغط على زر "سبّح" لزيادة العداد.</i>`;
};

export const buildSettingsMessage = (options: { isPrivate: boolean }): string => {
  return `⚙️ <b>إعدادات البوت</b>\n\n` +
         `يمكنك من هنا تخصيص التذكيرات الدورية وتنبيهات الصيام.\n` +
         `${!options.isPrivate ? "⚠️ <i>هذه الإعدادات متاحة للمشرفين فقط في المجموعات.</i>" : ""}`;
};

export const buildLibraryMessage = (): string => {
  return `📚 <b>المكتبة الإسلامية</b>\n\nاختر الكتاب أو الذكر الذي تود قراءته:`;
};

export const buildStatsMessage = (stats: { total: number, daily: number }): string => {
  return `📊 <b>إحصائياتك</b>\n\n` +
         `📿 إجمالي التسبيحات: <code>${stats.total}</code>\n` +
         `📅 تسبيحات اليوم: <code>${stats.daily}</code>\n\n` +
         `<i>«أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»</i>`;
};

export const buildAboutMessage = (botUsername: string): string => {
  return `ℹ️ <b>عن بوت نورِفاي</b>\n\n` +
         `صدقة جارية تهدف لتسهيل الذكر والعبادة في يومك.\n\n` +
         `نسخة البوت: <code>1.0.0</code>\n` +
         `المطور: @vx_rq`;
};
