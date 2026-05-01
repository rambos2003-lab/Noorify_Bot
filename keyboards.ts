import { InlineKeyboardButton, InlineKeyboardMarkup } from "node-telegram-bot-api";
import { TASBEEH_OPTIONS, DEVELOPER_URL } from "./azkar";

/**
 * زر الرجوع الافتراضي للقائمة الرئيسية
 */
export const BACK_BUTTON: InlineKeyboardButton = { text: "« رجوع للقائمة", callback_data: "main_menu" };

/**
 * لوحة القائمة الرئيسية
 * @param botUsername اسم مستخدم البوت لإضافة رابط الإضافة للمجموعات
 */
export const mainMenuKeyboard = (botUsername: string): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [
      { text: "📿 المسبحة الإلكترونية", callback_data: "tasbeeh_chooser" },
      { text: "📚 المكتبة الإسلامية", callback_data: "library_main" }
    ],
    [
      { text: "📊 الإحصائيات", callback_data: "stats_main" },
      { text: "⚙️ الإعدادات", callback_data: "settings_main" }
    ],
    [
      { text: "📞 المطور", callback_data: "contact_main" },
      { text: "💚 مشاركة", callback_data: "share_main" }
    ],
    [{ text: "➕ إضافة البوت لمجموعة", url: `https://t.me/${botUsername}?startgroup=true` }]
  ]
});

/**
 * لوحة اختيار الذكر لبدء التسبيح
 */
export const tasbeehChooserKeyboard = (): InlineKeyboardMarkup => ({
  inline_keyboard: [
    ...TASBEEH_OPTIONS.map(opt => [{ text: opt.text, callback_data: `set_dhikr_${opt.id}` }]),
    [BACK_BUTTON]
  ]
});

/**
 * لوحة المسبحة النشطة (أثناء التسبيح)
 * @param dhikrId معرف الذكر
 * @param count العدد الحالي
 */
export const tasbeehKeyboard = (dhikrId: string, count: number): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [{ text: `➕ سبّح (العدد: ${count})`, callback_data: `tick_${dhikrId}_${count}` }],
    [
      { text: "🔄 تصفير العداد", callback_data: `reset_confirm_${dhikrId}` },
      { text: "🔙 تغيير الذكر", callback_data: "tasbeeh_chooser" }
    ],
    [BACK_BUTTON]
  ]
});

/**
 * لوحة الإعدادات لتخصيص التنبيهات والفترات
 */
export const settingsKeyboard = (config: { 
  remindersEnabled: boolean; 
  fastingEnabled: boolean; 
  intervalMinutes: number 
}): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [{ 
      text: `${config.remindersEnabled ? "🟢" : "🔴"} التذكيرات التلقائية: ${config.remindersEnabled ? "مفعلة" : "معطلة"}`, 
      callback_data: "toggle_reminders" 
    }],
    [{ 
      text: `⏱️ التذكير: كل ${formatInterval(config.intervalMinutes)}`, 
      callback_data: "choose_interval" 
    }],
    [{ 
      text: `${config.fastingEnabled ? "🟢" : "🔴"} تذكير الصيام: ${config.fastingEnabled ? "مفعل" : "معطل"}`, 
      callback_data: "toggle_fasting" 
    }],
    [BACK_BUTTON]
  ]
});

/**
 * لوحة اختيار الفترة الزمنية للتذكيرات
 */
export const intervalChooserKeyboard = (): InlineKeyboardMarkup => {
  const intervals = [
    { label: "30 دقيقة", val: 30 },
    { label: "ساعة واحدة", val: 60 },
    { label: "ساعتين", val: 120 },
    { label: "3 ساعات", val: 180 },
    { label: "6 ساعات", val: 360 },
    { label: "12 ساعة", val: 720 },
    { label: "يوم كامل", val: 1440 }
  ];
  
  return {
    inline_keyboard: [
      ...intervals.map(i => [{ text: i.label, callback_data: `set_interval_${i.val}` }]),
      [{ text: "« رجوع للإعدادات", callback_data: "settings_main" }]
    ]
  };
};

/**
 * لوحة المكتبة الإسلامية والكتب
 */
export const libraryKeyboard = (): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [{ text: "📖 القرآن الكريم", callback_data: "book_quran" }],
    [{ text: "🛡️ حصن المسلم", callback_data: "book_hisn" }],
    [{ text: "🌅 أذكار الصباح والمساء", callback_data: "book_morning_evening" }],
    [{ text: "🌙 أذكار النوم", callback_data: "book_sleep" }],
    [BACK_BUTTON]
  ]
});

/**
 * لوحة التواصل مع المطور
 */
export const contactKeyboard = (): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [{ text: "👤 مراسلة المطور مباشرة", url: DEVELOPER_URL }],
    [BACK_BUTTON]
  ]
});

/**
 * لوحة بسيطة تحتوي على زر رجوع فقط
 */
export const backOnlyKeyboard = (target: string = "main_menu"): InlineKeyboardMarkup => ({
  inline_keyboard: [[{ text: "« رجوع", callback_data: target }]]
});

/**
 * مساعد لتنسيق عرض الوقت
 */
function formatInterval(min: number): string {
  if (min < 60) return `${min} دقيقة`;
  if (min === 60) return "ساعة";
  if (min === 120) return "ساعتين";
  return `${min / 60} ساعات`;
}
