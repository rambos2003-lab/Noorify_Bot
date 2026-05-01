import type { InlineKeyboardMarkup } from "node-telegram-bot-api";
import { PDF_LIBRARY } from "../data/pdfs";
import { TASBEEH_OPTIONS, DEVELOPER_URL } from "../data/azkar";

export const BACK_BUTTON = { text: "« رجوع للقائمة", callback_data: "menu:main" };

export function mainMenuKeyboard(
  isPrivate: boolean,
  botUsername?: string,
): InlineKeyboardMarkup {
  const rows: InlineKeyboardMarkup["inline_keyboard"] = [
    [
      { text: "📿 المسبحة", callback_data: "tasbeeh:open" },
      { text: "📚 المكتبة", callback_data: "lib:open" },
    ],
    [
      { text: "🌟 ذكر الآن", callback_data: "menu:dhikr_now" },
      { text: "📊 الإحصائيات", callback_data: "stats:open" },
    ],
  ];
  if (isPrivate) {
    rows.push([{ text: "⚙️ إعداداتي", callback_data: "settings:open" }]);
    if (botUsername) {
      rows.push([
        {
          text: "➕ إضافة البوت لمجموعة",
          url: `https://t.me/${botUsername}?startgroup=true`,
        },
        {
          text: "💚 شارك البوت",
          switch_inline_query: `📿 بوت نورِفاي للأذكار والمسبحة الإلكترونية`,
        },
      ]);
    }
    rows.push([
      { text: "ℹ️ عن البوت", callback_data: "menu:about" },
      { text: "📞 تواصل مع المطور", url: DEVELOPER_URL },
    ]);
  } else {
    rows.push([
      { text: "⚙️ الإعدادات (للمشرفين)", callback_data: "settings:open" },
    ]);
    rows.push([
      { text: "ℹ️ عن البوت", callback_data: "menu:about" },
      { text: "📞 المطور", url: DEVELOPER_URL },
    ]);
  }
  return { inline_keyboard: rows };
}

export function aboutKeyboard(botUsername?: string): InlineKeyboardMarkup {
  const rows: InlineKeyboardMarkup["inline_keyboard"] = [];
  rows.push([{ text: "📞 تواصل مع المطور", url: DEVELOPER_URL }]);
  if (botUsername) {
    rows.push([
      {
        text: "➕ إضافة لمجموعة",
        url: `https://t.me/${botUsername}?startgroup=true`,
      },
      {
        text: "💚 مشاركة البوت",
        switch_inline_query: `📿 بوت نورِفاي للأذكار والمسبحة الإلكترونية`,
      },
    ]);
  }
  rows.push([BACK_BUTTON]);
  return { inline_keyboard: rows };
}

export function contactKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "📨 مراسلة المطور مباشرةً", url: DEVELOPER_URL }],
      [BACK_BUTTON],
    ],
  };
}

export function shareKeyboard(botUsername: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: "📤 شارك البوت الآن",
          switch_inline_query: `📿 بوت نورِفاي للأذكار والمسبحة الإلكترونية - https://t.me/${botUsername}`,
        },
      ],
      [
        {
          text: "➕ أضِفه لمجموعتك",
          url: `https://t.me/${botUsername}?startgroup=true`,
        },
      ],
      [BACK_BUTTON],
    ],
  };
}

export function tasbeehKeyboard(_currentDhikr: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "✨ ━━ سبّح ━━ ✨", callback_data: "tasbeeh:tick" }],
      [
        { text: "🔄 تصفير", callback_data: "tasbeeh:reset" },
        { text: "📜 تغيير الذكر", callback_data: "tasbeeh:change" },
      ],
      [BACK_BUTTON],
    ],
  };
}

export function tasbeehChooserKeyboard(): InlineKeyboardMarkup {
  const rows = TASBEEH_OPTIONS.map((opt) => [
    { text: opt.text, callback_data: `tasbeeh:set:${opt.id}` },
  ]);
  rows.push([{ text: "« رجوع للمسبحة", callback_data: "tasbeeh:open" }]);
  return { inline_keyboard: rows };
}

export function libraryKeyboard(): InlineKeyboardMarkup {
  const rows: InlineKeyboardMarkup["inline_keyboard"] = [];
  for (let i = 0; i < PDF_LIBRARY.length; i += 2) {
    const a = PDF_LIBRARY[i];
    const b = PDF_LIBRARY[i + 1];
    const row = [
      { text: `${a.emoji} ${a.title}`, callback_data: `lib:get:${a.id}` },
    ];
    if (b) {
      row.push({
        text: `${b.emoji} ${b.title}`,
        callback_data: `lib:get:${b.id}`,
      });
    }
    rows.push(row);
  }
  rows.push([BACK_BUTTON]);
  return { inline_keyboard: rows };
}

export function settingsKeyboard(opts: {
  remindersEnabled: boolean;
  fastingEnabled: boolean;
  intervalMinutes: number;
}): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: opts.remindersEnabled
            ? "🔔 التذكيرات: مفعّلة"
            : "🔕 التذكيرات: معطّلة",
          callback_data: "settings:toggle_reminders",
        },
      ],
      [
        {
          text: opts.fastingEnabled
            ? "🌅 تذكير الصيام: مفعّل"
            : "🌅 تذكير الصيام: معطّل",
          callback_data: "settings:toggle_fasting",
        },
      ],
      [
        {
          text: `⏱️ فترة التذكير: ${formatInterval(opts.intervalMinutes)}`,
          callback_data: "settings:interval",
        },
      ],
      [BACK_BUTTON],
    ],
  };
}

export function intervalChooserKeyboard(): InlineKeyboardMarkup {
  const intervals: { label: string; minutes: number }[] = [
    { label: "كل 30 دقيقة", minutes: 30 },
    { label: "كل ساعة", minutes: 60 },
    { label: "كل ساعتين (افتراضي)", minutes: 120 },
    { label: "كل 3 ساعات", minutes: 180 },
    { label: "كل 4 ساعات", minutes: 240 },
    { label: "كل 6 ساعات", minutes: 360 },
    { label: "كل 12 ساعة", minutes: 720 },
    { label: "مرة في اليوم", minutes: 1440 },
  ];
  const rows = intervals.map((i) => [
    { text: i.label, callback_data: `settings:set_interval:${i.minutes}` },
  ]);
  rows.push([{ text: "« رجوع للإعدادات", callback_data: "settings:open" }]);
  return { inline_keyboard: rows };
}

export function backOnlyKeyboard(): InlineKeyboardMarkup {
  return { inline_keyboard: [[BACK_BUTTON]] };
}

export function dhikrNowKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "🔁 ذكر آخر", callback_data: "menu:dhikr_now_edit" }],
      [BACK_BUTTON],
    ],
  };
}

export function formatInterval(minutes: number): string {
  if (minutes < 60) return `${minutes} دقيقة`;
  if (minutes === 60) return "ساعة";
  if (minutes === 120) return "ساعتان";
  if (minutes < 1440) {
    const h = Math.floor(minutes / 60);
    return `${h} ساعات`;
  }
  if (minutes === 1440) return "يوم";
  return `${Math.floor(minutes / 60)} ساعة`;
}
