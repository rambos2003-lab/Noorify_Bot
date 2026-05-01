import { InlineKeyboardMarkup } from "node-telegram-bot-api";
import { TASBEEH_OPTIONS, DEVELOPER_URL } from "../data/azkar";
import { PDF_LIBRARY } from "../data/pdfs";

export const BACK_BUTTON = { text: "« رجوع للقائمة", callback_data: "menu:main" };

export function mainMenuKeyboard(isAdmin: boolean, botUsername: string): InlineKeyboardMarkup {
  const rows = [
    [{ text: "📿 المسبحة الإلكترونية التفاعلية", callback_data: "tasbeeh:open" }],
    [
      { text: "📚 المكتبة الشاملة", callback_data: "lib:open" },
      { text: "📊 الإحصائيات", callback_data: "stats:open" }
    ]
  ];

  if (isAdmin) {
    rows.push([{ text: "⚙️ إعدادات التذكير (للمشرفين)", callback_data: "settings:open" }]);
  } else {
    rows.push([{ text: "🔒 الإعدادات (مخصصة للمشرفين)", callback_data: "settings:locked" }]);
  }

  rows.push([
    { text: "📞 المطور", url: DEVELOPER_URL },
    { text: "➕ أضفني لمجموعتك", url: `https://t.me/${botUsername}?startgroup=true` }
  ]);

  return { inline_keyboard: rows };
}

export function tasbeehChooserKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      ...TASBEEH_OPTIONS.map(opt => [{ text: `• ${opt.text} •`, callback_data: `tasbeeh:set:${opt.id}` }]),
      [BACK_BUTTON]
    ]
  };
}

export function tasbeehActiveKeyboard(dhikrId: string, count: number): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: `✨ نُـورِفَـاي: [ ${count} ] ✨`, callback_data: `tasbeeh:tick:${dhikrId}:${count}` }],
      [
        { text: "🔄 إعادة العداد", callback_data: `tasbeeh:reset:${dhikrId}` },
        { text: "🔙 تغيير الذكر", callback_data: "tasbeeh:open" }
      ],
      [BACK_BUTTON]
    ]
  };
}

export function libraryKeyboard(): InlineKeyboardMarkup {
  const rows = [];
  for (let i = 0; i < PDF_LIBRARY.length; i += 2) {
    const row = [];
    row.push({ text: `📖 ${PDF_LIBRARY[i].title}`, callback_data: `lib:view:${PDF_LIBRARY[i].id}` });
    if (PDF_LIBRARY[i + 1]) {
      row.push({ text: `📖 ${PDF_LIBRARY[i + 1].title}`, callback_data: `lib:view:${PDF_LIBRARY[i + 1].id}` });
    }
    rows.push(row);
  }
  rows.push([BACK_BUTTON]);
  return { inline_keyboard: rows };
}

export function settingsKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "⏰ تغيير فترة التذكير", callback_data: "settings:interval" }],
      [{ text: "🔔 تفعيل/تعطيل التنبيهات", callback_data: "settings:toggle" }],
      [BACK_BUTTON]
    ]
  };
}
