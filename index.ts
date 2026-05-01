import TelegramBot from "node-telegram-bot-api";
import express from "express";

// استيراد البيانات والوظائف من الملفات الأخرى (تأكد أنها في المجلد الرئيسي)
import { 
  WELCOME_MESSAGE, 
  TASBEEH_OPTIONS, 
  EMOTIONAL_PHRASES, 
  RANDOM_AZKAR,
  DEVELOPER_USERNAME,
  FASTING_RESOURCES
} from "./azkar";

import { 
  mainMenuKeyboard, 
  tasbeehKeyboard, 
  tasbeehChooserKeyboard, 
  libraryKeyboard,
  settingsKeyboard,
  intervalChooserKeyboard,
  dhikrNowKeyboard
} from "./keyboards";

import { 
  buildRandomDhikrMessage, 
  buildTasbeehMessage, 
  buildLibraryMessage,
  buildAboutMessage,
  buildSettingsMessage,
  buildStatsMessage,
  buildMainMenuMessage,
  buildIntervalChooserMessage
} from "./format";

import { PDF_LIBRARY, getPdfUrl } from "./pdfs";

// --- 1. إعداد السيرفر (Health Check) لـ Render ---
const app = express();
const PORT = process.env.PORT || 10000;
app.get("/", (req, res) => res.send("Noorify Bot is Online! 🌙"));
app.listen(PORT, () => console.log(`📡 Server is running on port ${PORT}`));

// --- 2. إعدادات البوت ---
const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new TelegramBot(token, { polling: true });

// مخازن مؤقتة (سيتم تصفيرها عند إعادة تشغيل السيرفر لأنها ليست قاعدة بيانات)
const userStats = new Map<number, { count: number, total: number, currentDhikr: string }>();
const chatSettings = new Map<number, { interval: number, enabled: boolean, remindersSent: number }>();

console.log("🌙 Noorify Bot has started successfully...");

// وظيفة التحقق من رتبة المشرف
async function checkAdmin(chatId: number, userId: number): Promise<boolean> {
  if (chatId > 0) return true; // في الخاص المستخدم هو المشرف
  try {
    const member = await bot.getChatMember(chatId, userId);
    return ["creator", "administrator"].includes(member.status);
  } catch { return false; }
}

// --- 3. معالجة الأوامر ---

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
    switch (true) {
      // القائمة الرئيسية
      case data === "menu:main":
        const me = await bot.getMe();
        bot.editMessageText(buildMainMenuMessage(query.from.first_name), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: mainMenuKeyboard(isPrivate, me.username)
        });
        break;

      // ذكر الآن
      case data === "menu:dhikr_now":
        bot.editMessageText(buildRandomDhikrMessage(), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: dhikrNowKeyboard()
        });
        break;

      // فتح المسبحة
      case data === "tasbeeh:open":
        bot.editMessageText(buildTasbeehMessage({
          dhikr: "سُبْحَانَ اللَّهِ", count: 0, totalCount: 0, firstName: query.from.first_name
        }), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: tasbeehKeyboard("subhan")
        });
        break;

      // النقر على المسبحة
      case data === "tasbeeh:tick":
        const stats = userStats.get(userId) || { count: 0, total: 0, currentDhikr: "سُبْحَانَ اللَّهِ" };
        stats.count++;
        stats.total++;
        userStats.set(userId, stats);
        bot.editMessageText(buildTasbeehMessage({
          dhikr: stats.currentDhikr, count: stats.count, totalCount: stats.total, firstName: query.from.first_name
        }), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: tasbeehKeyboard(stats.currentDhikr)
        }).catch(() => {});
        break;

      // تغيير الذكر في المسبحة
      case data === "tasbeeh:change":
        bot.editMessageText("📜 اختر الذكر الذي تود البدء به:", {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: tasbeehChooserKeyboard()
        });
        break;

      // ضبط الذكر المختار
      case data.startsWith("tasbeeh:set:"):
        const dhikrId = data.split(":")[2];
        const selected = TASBEEH_OPTIONS.find(o => o.id === dhikrId);
        const currentStats = userStats.get(userId) || { count: 0, total: 0, currentDhikr: "" };
        currentStats.count = 0;
        currentStats.currentDhikr = selected?.text || "سُبْحَانَ اللَّهِ";
        userStats.set(userId, currentStats);
        bot.editMessageText(buildTasbeehMessage({
          dhikr: currentStats.currentDhikr, count: 0, totalCount: currentStats.total, firstName: query.from.first_name
        }), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: tasbeehKeyboard(dhikrId)
        });
        break;

      // المكتبة
      case data === "lib:open":
        bot.editMessageText(buildLibraryMessage(), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: libraryKeyboard()
        });
        break;

      // عرض الإحصائيات
      case data === "stats:open":
        const uS = userStats.get(userId);
        bot.editMessageText(buildStatsMessage({
          isPrivate,
          userTasbeeh: uS?.total || 0,
          userCurrentCount: uS?.count || 0,
          userDhikr: uS?.currentDhikr,
          totalUsers: 1,
          totalGroups: 0,
          totalTasbeeh: uS?.total || 0,
          totalReminders: 0
        }), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "« رجوع للقائمة", callback_data: "menu:main" }]] }
        });
        break;

      // حول البوت
      case data === "menu:about":
        bot.editMessageText(buildAboutMessage(), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "« رجوع للقائمة", callback_data: "menu:main" }]] }
        });
        break;
    }
  } catch (err) {
    console.error("Callback Error:", err);
  }
  bot.answerCallbackQuery(query.id).catch(() => {});
});

// ترحيب المجموعات
bot.on("my_chat_member", async (update) => {
  if (update.new_chat_member.status === "member" || update.new_chat_member.status === "administrator") {
    const welcome = `✅ <b>تم تفعيل نورِفاي بنجاح!</b>\n\n` +
      `سأقوم بإرسال أذكار دورية لتعطير المجموعة بالذكر.\n` +
      `اللهم اجعلنا من الذاكرين الشاكرين.`;
    bot.sendMessage(update.chat.id, welcome, { parse_mode: "HTML" });
  }
});
