import { InlineKeyboardMarkup } from "node-telegram-bot-api";
import { TASBEEH_OPTIONS, DEVELOPER_URL } from "./azkar";
import { PDF_LIBRARY } from "./pdfs";

export const BACK_BUTTON = { text: "« رجوع للقائمة", callback_data: "menu:main" };

export function mainMenuKeyboard(isAdmin: boolean, botUsername: string): InlineKeyboardMarkup {
  const rows = [
    [{ text: "📿 المسبحة الإلكترونية التفاعلية", callback_data: "tasbeeh:open" }],
    [
      { text: "📚 المكتبة الشاملة", callback_data: "lib:open" },
      { text: "📊 الإحصائيات", callback_data: "stats:open" }
    ],
    [{ text: "🌙 ذكر الآن", callback_data: "menu:dhikr_now" }]
  ];

  rows.push(isAdmin 
    ? [{ text: "⚙️ إعدادات التذكير", callback_data: "settings:open" }]
    : [{ text: "🔒 الإعدادات (للمشرفين)", callback_data: "settings:locked" }]
  );

  rows.push([
    { text: "📞 المطور", url: DEVELOPER_URL },
    { text: "➕ أضفني لمجموعتك", url: `https://t.me/${botUsername}?startgroup=true` }
  ]);

  return { inline_keyboard: rows };
}

export function tasbeehKeyboard(dhikrId: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "✨ سـبـّح الآن ✨", callback_data: "tasbeeh:tick" }],
      [{ text: "🔄 تغيير الذكر", callback_data: "tasbeeh:change" }],
      [BACK_BUTTON]
    ]
  };
}

export function tasbeehChooserKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      ...TASBEEH_OPTIONS.map(opt => [{ text: `• ${opt.text} •`, callback_data: `tasbeeh:set:${opt.id}` }]),
      [BACK_BUTTON]
    ]
  };
}

export function dhikrNowKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "🔄 ذكر آخر", callback_data: "menu:dhikr_now" }],
      [BACK_BUTTON]
    ]
  };
}

export function libraryKeyboard(): InlineKeyboardMarkup {
  const rows = [];
  for (let i = 0; i < PDF_LIBRARY.length; i += 2) {
    const row = [{ text: `${PDF_LIBRARY[i].emoji} ${PDF_LIBRARY[i].title}`, callback_data: `lib:get:${PDF_LIBRARY[i].id}` }];
    if (PDF_LIBRARY[i + 1]) row.push({ text: `${PDF_LIBRARY[i + 1].emoji} ${PDF_LIBRARY[i + 1].title}`, callback_data: `lib:get:${PDF_LIBRARY[i + 1].id}` });
    rows.push(row);
  }
  rows.push([BACK_BUTTON]);
  return { inline_keyboard: rows };
}

export function settingsKeyboard(config: any): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: `تذكير تلقائي: ${config.remindersEnabled ? "✅" : "❌"}`, callback_data: "settings:toggle" }],
      [{ text: `الفترة: كل ${config.intervalMinutes} دقيقة`, callback_data: "settings:interval" }],
      [BACK_BUTTON]
    ]
  };
}

export function intervalChooserKeyboard(): InlineKeyboardMarkup {
  const intervals = [30, 60, 120, 180, 360];
  const rows = intervals.map(m => [{ text: `كل ${m >= 60 ? m/60 + " ساعة" : m + " دقيقة"}`, callback_data: `settings:set_interval:${m}` }]);
  rows.push([BACK_BUTTON]);
  return { inline_keyboard: rows };
}
