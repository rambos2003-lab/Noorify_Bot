import { InlineKeyboardMarkup } from "node-telegram-bot-api";
import { TASBEEH_OPTIONS, DEVELOPER_URL } from "../data/azkar";
import { PDF_LIBRARY } from "../data/pdfs";

export const BACK_BUTTON = { text: "« العودة للرئيسية", callback_data: "menu:main" };

export function mainMenuKeyboard(points: number, level: number, isAdmin: boolean, botUsername: string): InlineKeyboardMarkup {
  const rows: InlineKeyboardMarkup["inline_keyboard"] = [
    [{ text: `🏆 المستوى: ${level} | ✨ النقاط: ${points}`, callback_data: "stats:open" }],
    [
      { text: "📖 القرآن الكريم", callback_data: "quran:random" },
      { text: "📜 حديث نبوي", callback_data: "hadith:random" }
    ],
    [
      { text: "📿 المسبحة والأذكار", callback_data: "tasbeeh:open" },
      { text: "🕌 مواقيت الصلاة", callback_data: "prayer:ask_loc" }
    ],
    [
      { text: "📚 المكتبة الإسلامية", callback_data: "lib:open" },
      { text: "⭐ مفضلتي", callback_data: "fav:list" }
    ],
    [{ text: "📊 إحصائياتي وتقدمي", callback_data: "stats:open" }]
  ];

  if (isAdmin) {
    rows.push([{ text: "👨‍💻 لوحة تحكم الإدارة", callback_data: "admin:dashboard" }]);
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
      [{ text: `✨ سَبِّح ( ${count} ) ✨`, callback_data: `tasbeeh:tick:${dhikrId}:${count}` }],
      [
        { text: "🔄 تصفير العداد", callback_data: `tasbeeh:reset:${dhikrId}` },
        { text: "🔙 تغيير الذكر", callback_data: "tasbeeh:open" }
      ],
      [BACK_BUTTON]
    ]
  };
}

export function quranKeyboard(ayahNumber: number): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "🔄 آية أخرى", callback_data: "quran:random" }],
      [{ text: "⭐ حفظ في المفضلة", callback_data: `fav:add:ayah:${ayahNumber}` }],
      [BACK_BUTTON]
    ]
  };
}

export function hadithKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "🔄 حديث آخر", callback_data: "hadith:random" }],
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

export function adminKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "📢 إرسال إشعار جماعي للكل", callback_data: "admin:broadcast" }],
      [BACK_BUTTON]
    ]
  };
}
