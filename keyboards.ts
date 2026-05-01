import { InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup } from "node-telegram-bot-api";
import { DEVELOPER_URL } from "./azkar";
import { PDF_LIBRARY } from "./pdfs";

// لوحة المينو الرئيسية (المربعات بجانب الرسالة)
export function mainMenuKeyboard(): ReplyKeyboardMarkup {
  return {
    keyboard: [
      [{ text: "🔵 المسبحة الإلكترونية" }, { text: "🟢 المكتبة الإسلامية" }],
      [{ text: "🟢 ذكر عشوائي" }, { text: "🟢 مشاركة البوت" }],
      [{ text: "📊 الإحصائيات" }, { text: "🔴 الإعدادات" }],
      [{ text: "🔴 عن البوت" }, { text: "🔴 تواصل مع المطور" }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };
}

export function tasbeehInlineKeyboard(count: number): InlineKeyboardMarkup {
  // محاكاة شريط التقدم التفاعلي
  const progress = "▓".repeat(Math.min(count % 10, 10)) + "░".repeat(10 - (count % 10));
  return {
    inline_keyboard: [
      [{ text: `[ ${progress} ]`, callback_data: "none" }],
      [{ text: "✨ سـبـّح ✨", callback_data: "tasbeeh:tick" }],
      [{ text: "🔄 تغيير الذكر", callback_data: "tasbeeh:change" }, { text: "🗑️ تصفير", callback_data: "tasbeeh:reset" }]
    ]
  };
}

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

export function libraryInlineKeyboard(): InlineKeyboardMarkup {
  const rows: InlineKeyboardButton[][] = [];
  for (let i = 0; i < PDF_LIBRARY.length; i += 2) {
    const row = [{ text: `📖 ${PDF_LIBRARY[i].title}`, callback_data: `lib_file:${PDF_LIBRARY[i].id}` }];
    if (PDF_LIBRARY[i+1]) row.push({ text: `📖 ${PDF_LIBRARY[i+1].title}`, callback_data: `lib_file:${PDF_LIBRARY[i+1].id}` });
    rows.push(row);
  }
  return { inline_keyboard: rows };
}
