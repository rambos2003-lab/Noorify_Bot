import TelegramBot, { InlineKeyboardMarkup } from "node-telegram-bot-api";

// --- 1. AZKAR DATA & CONSTANTS ---
export const DEVELOPER_USERNAME = "vx_rq";
export const DEVELOPER_URL = `https://t.me/${DEVELOPER_USERNAME}`;
export const BORDER_TOP = "◈━━━━━━━━━━━━━━━━◈";
export const BORDER_BOTTOM = "◈━━━━━━━━━━━━━━━━◈";
export const DIVIDER = "─────────────────────";

export const TASBEEH_OPTIONS = [
  { id: "subhan", text: "سُبْحَانَ اللَّهِ" },
  { id: "hamd", text: "الْحَمْدُ لِلَّهِ" },
  { id: "lailaha", text: "لَا إِلَهَ إِلَّا اللَّهُ" },
  { id: "akbar", text: "اللَّهُ أَكْبَرُ" },
  { id: "astaghfir", text: "أَسْتَغْفِرُ اللَّهَ" },
  { id: "hawqala", text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ" },
  { id: "salawat", text: "صَلَّى اللَّهُ عَلَى مُحَمَّد" }
];

export const PDF_LIBRARY = [
  { id: "quran", title: "القرآن الكريم", emoji: "📖" },
  { id: "hisn", title: "حصن المسلم", emoji: "🏰" },
  { id: "salihin", title: "رياض الصالحين", emoji: "🌸" }
];

export const WELCOME_MESSAGE = (botUsername: string) => 
  `${BORDER_TOP}\n🌙 <b>بوت نُورِفاي</b>\n${BORDER_BOTTOM}\n\nأهلاً بكم في رفيقكم الإيماني.\nاستخدم الأزرار لتصفح الأذكار والمكتبة.`;

// --- 2. FORMATTERS ---
export function buildTasbeehDisplay(dhikrId: string, count: number): string {
  const dhikr = TASBEEH_OPTIONS.find(o => o.id === dhikrId);
  return `${BORDER_TOP}\n📿 <b>المسبحة التفاعلية</b>\n${BORDER_BOTTOM}\n\nالذكر: <b>${dhikr?.text || "ذكر الله"}</b>\nالعدد: <code>${count}</code>\n\n${DIVIDER}`;
}

export function buildStatsMessage(total: number): string {
  return `📊 <b>إحصائياتك</b>\n${DIVIDER}\nإجمالي التسبيحات: <b>${total}</b>`;
}

// --- 3. KEYBOARDS ---
const BACK_BTN = { text: "« رجوع", callback_data: "menu:main" };

export function mainMenuKeyboard(botUsername: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "📿 المسبحة", callback_data: "tasbeeh:open" }, { text: "📚 المكتبة", callback_data: "lib:open" }],
      [{ text: "📊 الإحصائيات", callback_data: "stats:open" }],
      [{ text: "➕ أضف للمجموعة", url: `https://t.me/${botUsername}?startgroup=true` }]
    ]
  };
}

export function tasbeehChooserKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      ...TASBEEH_OPTIONS.map(opt => [{ text: opt.text, callback_data: `tasbeeh:set:${opt.id}` }]),
      [BACK_BTN]
    ]
  };
}

export function tasbeehActiveKeyboard(dhikrId: string, count: number): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: `✨ إضغط للتسبيح [ ${count} ] ✨`, callback_data: `tasbeeh:tick:${dhikrId}:${count}` }],
      [{ text: "🔄 إعادة", callback_data: `tasbeeh:reset:${dhikrId}` }, { text: "🔙 تغيير", callback_data: "tasbeeh:open" }],
      [BACK_BTN]
    ]
  };
}

// --- 4. BOT LOGIC ---
const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new TelegramBot(token, { polling: true });
const userStats = new Map<number, number>();

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, WELCOME_MESSAGE("NoorifyBot"), {
    parse_mode: "HTML",
    reply_markup: mainMenuKeyboard("NoorifyBot")
  });
});

bot.on("callback_query", async (query) => {
  const data = query.data || "";
  const chatId = query.message?.chat.id || 0;
  const messageId = query.message?.message_id || 0;
  const userId = query.from.id;

  if (data === "menu:main") {
    bot.editMessageText(WELCOME_MESSAGE("NoorifyBot"), {
      chat_id: chatId, message_id: messageId, parse_mode: "HTML",
      reply_markup: mainMenuKeyboard("NoorifyBot")
    });
  } else if (data === "tasbeeh:open") {
    bot.editMessageText("📿 اختر الذكر:", {
      chat_id: chatId, message_id: messageId, parse_mode: "HTML",
      reply_markup: tasbeehChooserKeyboard()
    });
  } else if (data.startsWith("tasbeeh:set:") || data.startsWith("tasbeeh:reset:")) {
    const id = data.split(":")[2];
    bot.editMessageText(buildTasbeehDisplay(id, 0), {
      chat_id: chatId, message_id: messageId, parse_mode: "HTML",
      reply_markup: tasbeehActiveKeyboard(id, 0)
    });
  } else if (data.startsWith("tasbeeh:tick:")) {
    const [_, __, id, count] = data.split(":");
    const newCount = parseInt(count) + 1;
    const total = (userStats.get(userId) || 0) + 1;
    userStats.set(userId, total);

    bot.editMessageText(buildTasbeehDisplay(id, newCount), {
      chat_id: chatId, message_id: messageId, parse_mode: "HTML",
      reply_markup: tasbeehActiveKeyboard(id, newCount)
    });
  } else if (data === "stats:open") {
    bot.editMessageText(buildStatsMessage(userStats.get(userId) || 0), {
      chat_id: chatId, message_id: messageId, parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[BACK_BTN]] }
    });
  }

  bot.answerCallbackQuery(query.id).catch(() => {});
});

console.log("Noorify Bot is running...");
