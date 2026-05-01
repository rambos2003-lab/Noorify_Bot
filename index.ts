import TelegramBot from "node-telegram-bot-api";
import express from "express";
import { WELCOME_TEXT, BORDER_TOP, BORDER_BOTTOM, SEPARATOR, TASBEEH_OPTIONS, RANDOM_AZKAR } from "./azkar";
import { mainMenuKeyboard, tasbeehInlineKeyboard, intervalSettingsKeyboard, libraryInlineKeyboard } from "./keyboards";
import { PDF_LIBRARY } from "./pdfs";
import { buildTasbeehMessage } from "./format";

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new TelegramBot(token, { polling: true });

// مخازن البيانات الحقيقية
const globalStats = { totalTasbeeh: 0, totalUsers: new Set(), totalGroups: new Set() };
const userSession = new Map<number, { count: number, total: number, dhikr: string }>();

// وظيفة التحقق من المشرفين
async function canChangeSettings(chatId: number, userId: number): Promise<boolean> {
  if (chatId > 0) return true; // في الخاص مسموح دائماً
  try {
    const member = await bot.getChatMember(chatId, userId);
    return ["creator", "administrator"].includes(member.status);
  } catch { return false; }
}

bot.onText(/\/start/, (msg) => {
  globalStats.totalUsers.add(msg.from?.id);
  bot.sendMessage(msg.chat.id, WELCOME_TEXT, {
    parse_mode: "HTML",
    reply_markup: mainMenuKeyboard()
  });
});

bot.on("message", async (msg) => {
  if (!msg.text) return;
  const text = msg.text;
  const chatId = msg.chat.id;
  const userId = msg.from!.id;

  if (chatId < 0) globalStats.totalGroups.add(chatId);
  else globalStats.totalUsers.add(userId);

  // منطق المربعات الرئيسية
  if (text.includes("المسبحة")) {
    const session = userSession.get(userId) || { count: 0, total: 0, dhikr: "سُبْحَانَ اللَّهِ" };
    bot.sendMessage(chatId, buildTasbeehMessage(session), {
      parse_mode: "HTML", reply_markup: tasbeehInlineKeyboard(session.count)
    });
  }

  else if (text.includes("المكتبة")) {
    bot.sendMessage(chatId, `📚 <b>المكتبة الإسلامية الشاملة</b>\n${SEPARATOR}\nاختر الكتاب الذي تود تحميله مباشرة:`, {
      parse_mode: "HTML", reply_markup: libraryInlineKeyboard()
    });
  }

  else if (text.includes("الإحصائيات")) {
    const user = userSession.get(userId);
    const statsMsg = `📊 <b>لوحة الإحصائيات التفاعلية</b>\n${SEPARATOR}\n` +
      `👤 <b>نشاطك الشخصي:</b>\n` +
      `• إجمالي تسبيحاتك: <code>${user?.total || 0}</code>\n` +
      `• جلستك الحالية: <code>${user?.count || 0}</code>\n\n` +
      `🌍 <b>نشاط مجتمع نورفاي:</b>\n` +
      `• إجمالي التسبيح العالمي: <code>${globalStats.totalTasbeeh}</code>\n` +
      `• عدد المستفيدين: <code>${globalStats.totalUsers.size}</code>\n` +
      `• المجموعات النشطة: <code>${globalStats.totalGroups.size}</code>\n${BORDER_BOTTOM}`;
    bot.sendMessage(chatId, statsMsg, { parse_mode: "HTML" });
  }

  else if (text.includes("الإعدادات")) {
    const admin = await canChangeSettings(chatId, userId);
    if (!admin) {
      return bot.sendMessage(chatId, `⚠️ <b>تنبيه أمني:</b>\nعذراً، هذا القسم مخصص لـ <b>مشرفي المجموعة</b> فقط لإدارة أوقات التذكير.`);
    }
    bot.sendMessage(chatId, `⚙️ <b>إعدادات التذكير الآلي</b>\n${SEPARATOR}\nاختر الفترة الزمنية التي تود أن يرسل فيها البوت الأذكار للمجموعة:`, {
      parse_mode: "HTML", reply_markup: intervalSettingsKeyboard()
    });
  }

  else if (text.includes("ذكر عشوائي")) {
    const dhikr = RANDOM_AZKAR[Math.floor(Math.random() * RANDOM_AZKAR.length)];
    bot.sendMessage(chatId, `✨ <b>ذكر الله:</b>\n\n<code>${dhikr}</code>\n\n${SEPARATOR}`, { parse_mode: "HTML" });
  }

  else if (text.includes("تواصل")) {
    bot.sendMessage(chatId, `👤 <b>المطور:</b> @vx_rq\nيسعدنا تواصلكم لأي اقتراح أو بلاغ عن مشكلة.`);
  }
});

bot.on("callback_query", async (query) => {
  const data = query.data || "";
  const chatId = query.message!.chat.id;
  const userId = query.from.id;

  // معالجة المسبحة
  if (data === "tasbeeh:tick") {
    const session = userSession.get(userId) || { count: 0, total: 0, dhikr: "سُبْحَانَ اللَّهِ" };
    session.count++;
    session.total++;
    globalStats.totalTasbeeh++;
    userSession.set(userId, session);
    bot.editMessageText(buildTasbeehMessage(session), {
      chat_id: chatId, message_id: query.message!.message_id, parse_mode: "HTML",
      reply_markup: tasbeehInlineKeyboard(session.count)
    }).catch(() => {});
  }

  // معالجة المكتبة
  else if (data.startsWith("lib_file:")) {
    const bookId = data.split(":")[1];
    const book = PDF_LIBRARY.find(b => b.id === bookId);
    if (book) {
      bot.answerCallbackQuery(query.id, { text: "⏳ جاري جلب الكتاب من المكتبة..." });
      bot.sendDocument(chatId, book.url, { 
        caption: `📖 <b>تم تحميل: ${book.title}</b>\n${SEPARATOR}\nنسأل الله أن ينفعكم بها.`,
        parse_mode: "HTML" 
      }).catch(err => {
        bot.sendMessage(chatId, `❌ عذراً، حدث خطأ أثناء تحميل الملف. تأكد من وجوده في GitHub.`);
      });
    }
  }

  // معالجة الإعدادات
  else if (data.startsWith("set_timer:")) {
    if (await canChangeSettings(chatId, userId)) {
      const time = data.split(":")[1];
      bot.editMessageText(`✅ <b>تم التحديث:</b>\nسيقوم البوت الآن بإرسال الأذكار كل <code>${time === 'off' ? 'تعطيل' : time + ' دقيقة'}</code> لهذه المجموعة.`, {
        chat_id: chatId, message_id: query.message!.message_id, parse_mode: "HTML"
      });
    } else {
      bot.answerCallbackQuery(query.id, { text: "⚠️ هذا الخيار للمشرفين فقط!", show_alert: true });
    }
  }

  bot.answerCallbackQuery(query.id).catch(() => {});
});

const app = express();
app.get("/", (req, res) => res.send("Noorify is Live 🌙"));
app.listen(process.env.PORT || 10000);
