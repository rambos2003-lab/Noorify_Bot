import { InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup } from "node-telegram-bot-api";
import { DEVELOPER_URL } from "./azkar";
import { PDF_LIBRARY } from "./pdfs";

// اللوحة الرئيسية المربعة (Reply Keyboard)
export function mainMenuKeyboard(): ReplyKeyboardMarkup {
  return {
    keyboard: [
      [{ text: "🔵 المسبحة الإلكترونية" }, { text: "🟢 المكتبة الإسلامية" }],
      [{ text: "🟢 ذكر عشوائي" }, { text: "🟢 مشاركة البوت" }],
      [{ text: "📊 الإحصائيات" }, { text: "🔴 الإعدادات" }],
      [{ text: "🔴 تواصل مع المطور" }, { text: "❓ مساعدة" }]
    ],
    resize_keyboard: true,
    is_persistent: true // تظل موجودة بجانب حقل النص
  };
}

// مسبحة تفاعلية مع شريط تقدم
export function tasbeehInlineKeyboard(count: number): InlineKeyboardMarkup {
  const segment = count % 33;
  const progress = "🟢".repeat(Math.floor(segment / 3)) + "⚪".repeat(11 - Math.floor(segment / 3));
  
  return {
    inline_keyboard: [
      [{ text: `⚡ التقدم: [ ${progress} ]`, callback_data: "none" }],
      [{ text: "✨ سـبـّح الآن ✨", callback_data: "tasbeeh:tick" }],
      [
        { text: "🔄 تغيير الذكر", callback_data: "tasbeeh:change" },
        { text: "🗑️ تصفير", callback_data: "tasbeeh:reset" }
      ],
      [{ text: "🔊 صوت: (مفعل ✅)", callback_data: "settings:sound_toggle" }]
    ]
  };
}

// إعدادات التذكير (للمشرفين)
export function intervalSettingsKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "⏳ 30 دقيقة", callback_data: "set_timer:30" },
        { text: "⏳ 1 ساعة", callback_data: "set_timer:60" }
      ],
      [
        { text: "⏳ 2 ساعة", callback_data: "set_timer:120" },
        { text: "⏳ 4 ساعات", callback_data: "set_timer:240" }
      ],
      [{ text: "⏳ 6 ساعات", callback_data: "set_timer:360" }],
      [{ text: "❌ تعطيل التذكير", callback_data: "set_timer:off" }]
    ]
  };
}

// أزرار المكتبة
export function libraryInlineKeyboard(): InlineKeyboardMarkup {
  const rows: InlineKeyboardButton[][] = [];
  for (let i = 0; i < PDF_LIBRARY.length; i += 2) {
    const row = [{ text: `${PDF_LIBRARY[i].emoji} ${PDF_LIBRARY[i].title}`, callback_data: `lib_file:${PDF_LIBRARY[i].id}` }];
    if (PDF_LIBRARY[i+1]) row.push({ text: `${PDF_LIBRARY[i+1].emoji} ${PDF_LIBRARY[i+1].title}`, callback_data: `lib_file:${PDF_LIBRARY[i+1].id}` });
    rows.push(row);
  }
  return { inline_keyboard: rows };
}
