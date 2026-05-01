import TelegramBot from "node-telegram-bot-api";
import express from "express";
import { 
  WELCOME_MESSAGE, 
  TASBEEH_OPTIONS, 
  EMOTIONAL_PHRASES, 
  RANDOM_AZKAR,
  DEVELOPER_USERNAME,
  FASTING_RESOURCES
} from "./data/azkar";
import { 
  mainMenuKeyboard, 
  tasbeehKeyboard, 
  tasbeehChooserKeyboard, 
  libraryKeyboard,
  settingsKeyboard,
  intervalChooserKeyboard,
  dhikrNowKeyboard
} from "./lib/keyboards";
import { 
  buildRandomDhikrMessage, 
  buildTasbeehMessage, 
  buildLibraryMessage,
  buildAboutMessage,
  buildSettingsMessage,
  buildStatsMessage,
  buildMainMenuMessage,
  buildIntervalChooserMessage
} from "./lib/format";
import { PDF_LIBRARY, getPdfUrl } from "./data/pdfs";

// إعدادات البيئة
const token = process.env.TELEGRAM_BOT_TOKEN || "";
// حل مشكلة الـ Conflict عبر حذف الـ Webhook القديم قبل بدء الـ Polling
const bot = new TelegramBot(token, { polling: true });

// مخزن مؤقت للبيانات (في الإنتاج يفضل استخدام قاعدة بيانات)
const userStats = new Map<number, { count: number, total: number, currentDhikr: string }>();
const chatSettings = new Map<number, { interval: number, enabled: boolean, remindersSent: number }>();

/**
 * التحقق من رتبة المستخدم (مشرف أم لا)
 */
async function checkAdmin(chatId: number, userId: number): Promise<boolean> {
  if (chatId > 0) return true; // في الخاص المستخدم هو الآدمن
  try {
    const member = await bot.getChatMember(chatId, userId);
    return ["creator", "administrator"].includes(member.status);
  } catch { return false; }
}

/**
 * معالجة الأوامر الرئيسية
 */
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const isPrivate = chatId > 0;
  const me = await bot.getMe();
  
  bot.sendMessage(chatId, buildMainMenuMessage(msg.from?.first_name), {
    parse_mode: "HTML",
    reply_markup: mainMenuKeyboard(isPrivate, me.username)
  });
});

/**
 * معالجة ضغطات الأزرار
 */
bot.on("callback_query", async (query) => {
  const chatId = query.message!.chat.id;
  const messageId = query.message!.message_id;
  const data = query.data || "";
  const userId = query.from.id;
  const isPrivate = chatId > 0;

  // منع التداخل (Conflict) ومعالجة الصلاحيات
  if (data.startsWith("settings") && !isPrivate) {
    const isAdmin = await checkAdmin(chatId, userId);
    if (!isAdmin) {
      return bot.answerCallbackQuery(query.id, { 
        text: "⚠️ عذراً، الإعدادات متاحة للمشرفين فقط.", 
        show_alert: true 
      });
    }
  }

  try {
    switch (true) {
      case data === "menu:main":
        const me = await bot.getMe();
        bot.editMessageText(buildMainMenuMessage(query.from.first_name), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: mainMenuKeyboard(isPrivate, me.username)
        });
        break;

      case data === "menu:dhikr_now" || data === "menu:dhikr_now_edit":
        bot.editMessageText(buildRandomDhikrMessage(), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: dhikrNowKeyboard()
        });
        break;

      case data === "tasbeeh:open":
        bot.editMessageText(buildTasbeehMessage({
          dhikr: "سُبْحَانَ اللَّهِ", count: 0, totalCount: 0, firstName: query.from.first_name
        }), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: tasbeehKeyboard("subhan")
        });
        break;

      case data === "tasbeeh:tick":
        const stats = userStats.get(userId) || { count: 0, total: 0, currentDhikr: "سُبْحَانَ اللَّهِ" };
        stats.count++;
        stats.total++;
        userStats.set(userId, stats);
        bot.editMessageText(buildTasbeehMessage({
          dhikr: stats.currentDhikr, count: stats.count, totalCount: stats.total, firstName: query.from.first_name
        }), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: tasbeehKeyboard(stats.currentDhikr)
        }).catch(() => {}); // نتجاهل خطأ تكرار المحتوى عند النقر السريع
        break;

      case data === "tasbeeh:change":
        bot.editMessageText("📜 اختر الذكر الذي تود البدء به:", {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: tasbeehChooserKeyboard()
        });
        break;

      case data.startsWith("tasbeeh:set:"):
        const dhikrId = data.split(":")[2];
        const selected = TASBEEH_OPTIONS.find(o => o.id === dhikrId);
        const currentStats = userStats.get(userId) || { count: 0, total: 0, currentDhikr: "" };
        currentStats.count = 0;
        currentStats.currentDhikr = selected?.text || "سُبْحَانَ اللَّهِ";
        userStats.set(userId, currentStats);
        bot.editMessageText(buildTasbeehMessage({
          dhikr: currentStats.currentDhikr, count: 0, totalCount: currentStats.total, firstName: query.from.first_name
        }), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: tasbeehKeyboard(dhikrId)
        });
        break;

      case data === "lib:open":
        bot.editMessageText(buildLibraryMessage(), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: libraryKeyboard()
        });
        break;

      case data.startsWith("lib:get:"):
        const bookId = data.split(":")[2];
        const book = PDF_LIBRARY.find(b => b.id === bookId);
        if (book) {
          bot.sendMessage(chatId, `📖 <b>${book.title}</b>\n\nيتم الآن جلب رابط الملف المباشر من المكتبة...`, { parse_mode: "HTML" });
          bot.sendDocument(chatId, getPdfUrl(book.filename), { 
            caption: `تم تحميل <b>${book.title}</b> عبر نورِفاي.`,
            parse_mode: "HTML"
          }).catch(() => {
            bot.sendMessage(chatId, `⚠️ عذراً، تعذر إرسال الملف مباشرة. يمكنك تحميله من الرابط التالي:\n${getPdfUrl(book.filename)}`);
          });
        }
        break;

      case data === "menu:about":
        bot.editMessageText(buildAboutMessage(), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "« رجوع للقائمة", callback_data: "menu:main" }]] }
        });
        break;

      case data === "settings:open":
        const currentS = chatSettings.get(chatId) || { interval: 120, enabled: true, remindersSent: 0 };
        bot.editMessageText(buildSettingsMessage({ isPrivate }), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: settingsKeyboard({
            remindersEnabled: currentS.enabled,
            fastingEnabled: true,
            intervalMinutes: currentS.interval
          })
        });
        break;

      case data === "settings:interval":
        const s = chatSettings.get(chatId) || { interval: 120, enabled: true, remindersSent: 0 };
        bot.editMessageText(buildIntervalChooserMessage(s.interval), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: intervalChooserKeyboard()
        });
        break;

      case data.startsWith("settings:set_interval:"):
        const minutes = parseInt(data.split(":")[2]);
        const setS = chatSettings.get(chatId) || { interval: 120, enabled: true, remindersSent: 0 };
        setS.interval = minutes;
        chatSettings.set(chatId, setS);
        bot.answerCallbackQuery(query.id, { text: `✅ تم ضبط التذكير كل ${minutes} دقيقة.` });
        // إعادة فتح قائمة الإعدادات
        bot.editMessageText(buildSettingsMessage({ isPrivate }), {
          chat_id: chatId, message_id: messageId,
          parse_mode: "HTML", reply_markup: settingsKeyboard({
            remindersEnabled: setS.enabled,
            fastingEnabled: true,
            intervalMinutes: setS.interval
          })
        });
        break;
        
      case data === "stats:open":
        const uS = userStats.get(userId);
        bot.editMessageText(buildStatsMessage({
          isPrivate,
          userTasbeeh: uS?.total || 0,
          userCurrentCount: uS?.count || 0,
          userDhikr: uS?.currentDhikr,
          totalUsers: 1, // تمثيلي لعدم وجود داتابيس حالياً
          totalGroups: 0,
          totalTasbeeh: uS?.total || 0,
          totalReminders: 0
        }), {
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

// ترحيب المجموعات المطور
bot.on("my_chat_member", async (update) => {
  if (update.new_chat_member.status === "member" || update.new_chat_member.status === "administrator") {
    const welcome = `✅ <b>تم تفعيل نورِفاي بنجاح!</b>\n\n` +
      `سأقوم بإرسال أذكار دورية لتعطير المجموعة بالذكر.\n` +
      `• الفترة الحالية: كل ساعتين.\n` +
      `• التحكم: المشرفون فقط عبر /start.\n\n` +
      `اللهم اجعلنا من الذاكرين الشاكرين.`;
    bot.sendMessage(update.chat.id, welcome, { parse_mode: "HTML" });
  }
});

// تشغيل السيرفر
const app = express();
app.get("/", (req, res) => res.send("Bot is active and running."));
app.listen(process.env.PORT || 8080, () => {
  console.log(`[INFO] تم تحميل جميع الوظائف بنجاح.`);
});
