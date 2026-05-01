import TelegramBot from "node-telegram-bot-api";
import express from "express";

// استيراد البيانات والوظائف من الملفات الأخرى
import { 
  TASBEEH_OPTIONS, 
  RANDOM_AZKAR,
  DEVELOPER_USERNAME,
} from "./azkar";

import { 
  mainMenuKeyboard, 
  tasbeehKeyboard, 
  tasbeehChooserKeyboard, 
  libraryKeyboard,
  dhikrNowKeyboard
} from "./keyboards";

import { 
  buildRandomDhikrMessage, 
  buildTasbeehMessage, 
  buildLibraryMessage,
  buildAboutMessage,
  buildStatsMessage,
  buildMainMenuMessage,
} from "./format";

// --- 1. إعداد السيرفر لضمان بقاء البوت حياً على Render ---
const app = express();
const PORT = process.env.PORT || 10000;
app.get("/", (req, res) => res.send("Noorify Bot is Online! 🌙"));
app.listen(PORT, () => console.log(`📡 Server is running on port ${PORT}`));

// --- 2. إعدادات البوت ---
const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new TelegramBot(token, { polling: true });

// مخازن مؤقتة للبيانات
const userStats = new Map<number, { count: number, total: number, currentDhikr: string }>();

console.log("🌙 Noorify Bot has started successfully...");

// وظيفة التحقق من رتبة المشرف
async function checkAdmin(chatId: number, userId: number): Promise<boolean> {
  if (chatId > 0) return true; // في الخاص المستخدم هو المشرف دائماً
  try {
    const member = await bot.getChatMember(chatId, userId);
    return ["creator", "administrator"].includes(member.status);
  } catch { return false; }
}

// --- 3. معالجة الأوامر الرئيسية ---

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const isPrivate = chatId > 0;
  const me = await bot.getMe();
  
  bot.sendMessage(chatId, buildMainMenuMessage(msg.from?.first_name), {
    parse_mode: "HTML",
    reply_markup: mainMenuKeyboard(isPrivate, me.username)
  });
});

// --- 4. معالجة ضغطات الأزرار (Callback Queries) ---

bot.on("callback_query", async (query) => {
  const chatId = query.message!.chat.id;
  const messageId = query.message!.message_id;
  const data = query.data || "";
  const userId = query.from.id;
  const isPrivate = chatId > 0;

  try {
    if (data === "menu:main") {
      const me = await bot.getMe();
      bot.editMessageText(buildMainMenuMessage(query.from.first_name), {
        chat_id: chatId, message_id: messageId,
        parse_mode: "HTML", reply_markup: mainMenuKeyboard(isPrivate, me.username)
      });
    } 
    
    else if (data === "menu:dhikr_now") {
      bot.editMessageText(buildRandomDhikrMessage(), {
        chat_id: chatId, message_id: messageId,
        parse_mode: "HTML", reply_markup: dhikrNowKeyboard()
      });
    }

    else if (data === "tasbeeh:open") {
      bot.editMessageText(buildTasbeehMessage({
        dhikr: "سُبْحَانَ اللَّهِ", count: 0, totalCount: 0, firstName: query.from.first_name
      }), {
        chat_id: chatId, message_id: messageId,
        parse_mode: "HTML", reply_markup: tasbeehKeyboard()
      });
    }

    else if (data === "tasbeeh:tick") {
      const stats = userStats.get(userId) || { count: 0, total: 0, currentDhikr: "سُبْحَانَ اللَّهِ" };
      stats.count++;
      stats.total++;
      userStats.set(userId, stats);
      bot.editMessageText(buildTasbeehMessage({
        dhikr: stats.currentDhikr, count: stats.count, totalCount: stats.total, firstName: query.from.first_name
      }), {
        chat_id: chatId, message_id: messageId,
        parse_mode: "HTML", reply_markup: tasbeehKeyboard()
      }).catch(() => {});
    }

    else if (data === "tasbeeh:change") {
      bot.editMessageText("📜 اختر الذكر الذي تود البدء به:", {
        chat_id: chatId, message_id: messageId,
        parse_mode: "HTML", reply_markup: tasbeehChooserKeyboard()
      });
    }

    else if (data.startsWith("tasbeeh:set:")) {
      const dhikrId = data.split(":")[2];
      const selected = TASBEEH_OPTIONS.find(o => o.id === dhikrId);
      const stats = userStats.get(userId) || { count: 0, total: 0, currentDhikr: "" };
      stats.count = 0;
      stats.currentDhikr = selected?.text || "سُبْحَانَ اللَّهِ";
      userStats.set(userId, stats);
      bot.editMessageText(buildTasbeehMessage({
        dhikr: stats.currentDhikr, count: 0, totalCount: stats.total, firstName: query.from.first_name
      }), {
        chat_id: chatId, message_id: messageId,
        parse_mode: "HTML", reply_markup: tasbeehKeyboard()
      });
    }

    else if (data === "lib:open") {
      bot.editMessageText(buildLibraryMessage(), {
        chat_id: chatId, message_id: messageId,
        parse_mode: "HTML", reply_markup: libraryKeyboard()
      });
    }

    else if (data === "stats:open") {
      const uS = userStats.get(userId);
      bot.editMessageText(buildStatsMessage({
        totalTasbeeh: uS?.total || 0,
      }), {
        chat_id: chatId, message_id: messageId,
        parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "« رجوع للقائمة", callback_data: "menu:main" }]] }
      });
    }

    else if (data === "menu:about") {
      bot.editMessageText(buildAboutMessage(), {
        chat_id: chatId, message_id: messageId,
        parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "« رجوع للقائمة", callback_data: "menu:main" }]] }
      });
    }
  } catch (err) {
    console.error("Callback Error:", err);
  }
  bot.answerCallbackQuery(query.id).catch(() => {});
});

// ترحيب المجموعات عند إضافة البوت
bot.on("my_chat_member", async (update) => {
  if (update.new_chat_member.status === "member" || update.new_chat_member.status === "administrator") {
    const welcome = `✅ <b>تم تفعيل نورِفاي بنجاح!</b>\n\n` +
      `سأقوم بإرسال أذكار دورية لتعطير المجموعة بالذكر.\n` +
      `اللهم اجعلنا من الذاكرين الشاكرين.`;
    bot.sendMessage(update.chat.id, welcome, { parse_mode: "HTML" });
  }
});
