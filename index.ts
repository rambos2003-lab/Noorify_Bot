import TelegramBot from "node-telegram-bot-api";
import express from "express";
import { 
  WELCOME_MESSAGE, 
  TASBEEH_OPTIONS, 
  EMOTIONAL_PHRASES, 
  DIVIDER,
  escapeHtml 
} from "./data/azkar";
import { 
  mainMenuKeyboard, 
  tasbeehChooserKeyboard, 
  tasbeehActiveKeyboard, 
  libraryKeyboard,
  settingsKeyboard 
} from "./lib/keyboards";
import { PDF_LIBRARY, getPdfUrl } from "./data/pdfs";
import { buildTasbeehDisplay, buildFastingMessage } from "./lib/format";

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new TelegramBot(token, { polling: true });

/**
 * التحقق من رتبة المستخدم في المجموعات
 */
async function isAdmin(chatId: number, userId: number): Promise<boolean> {
  if (chatId > 0) return true; // في الخاص المستخدم دائماً آدمن
  try {
    const member = await bot.getChatMember(chatId, userId);
    return ["creator", "administrator"].includes(member.status);
  } catch { return false; }
}

/**
 * معالجة الأوامر
 */
bot.onText(/\/start/, async (msg) => {
  const me = await bot.getMe();
  const isAdm = await isAdmin(msg.chat.id, msg.from!.id);
  bot.sendMessage(msg.chat.id, WELCOME_MESSAGE(me.username!), {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: mainMenuKeyboard(isAdm, me.username!)
  });
});

/**
 * معالجة ضغطات الأزرار (Callbacks)
 */
bot.on("callback_query", async (query) => {
  const chatId = query.message!.chat.id;
  const messageId = query.message!.message_id;
  const userId = query.from.id;
  const data = query.data || "";

  // حماية الصلاحيات
  if (data.startsWith("settings") && data !== "settings:locked") {
    const isAdm = await isAdmin(chatId, userId);
    if (!isAdm) {
      return bot.answerCallbackQuery(query.id, { 
        text: "⚠️ هذه الصلاحية للمشرفين فقط في المجموعات.", 
        show_alert: true 
      });
    }
  }

  // القائمة الرئيسية والرجوع
  if (data === "menu:main") {
    const me = await bot.getMe();
    const isAdm = await isAdmin(chatId, userId);
    bot.editMessageText(WELCOME_MESSAGE(me.username!), {
      chat_id: chatId, message_id: messageId,
      parse_mode: "HTML", disable_web_page_preview: true,
      reply_markup: mainMenuKeyboard(isAdm, me.username!)
    });
  }

  // منطق المسبحة
  if (data === "tasbeeh:open") {
    bot.editMessageText("📿 <b>المسبحة الإلكترونية</b>\nاختر الذكر الذي تود البدء به:", {
      chat_id: chatId, message_id: messageId,
      parse_mode: "HTML", reply_markup: tasbeehChooserKeyboard()
    });
  }

  if (data.startsWith("tasbeeh:set:")) {
    const id = data.split(":")[2];
    bot.editMessageText(buildTasbeehDisplay(id, 0), {
      chat_id: chatId, message_id: messageId,
      parse_mode: "HTML", reply_markup: tasbeehActiveKeyboard(id, 0)
    });
  }

  if (data.startsWith("tasbeeh:tick:")) {
    const [_, __, id, countStr] = data.split(":");
    const count = parseInt(countStr) + 1;
    bot.editMessageText(buildTasbeehDisplay(id, count), {
      chat_id: chatId, message_id: messageId,
      parse_mode: "HTML", reply_markup: tasbeehActiveKeyboard(id, count)
    }).catch(() => {}); // نتفادى أخطاء التعديل السريع
    bot.answerCallbackQuery(query.id);
  }

  if (data.startsWith("tasbeeh:reset:")) {
    const id = data.split(":")[2];
    bot.editMessageText(buildTasbeehDisplay(id, 0), {
      chat_id: chatId, message_id: messageId,
      parse_mode: "HTML", reply_markup: tasbeehActiveKeyboard(id, 0)
    });
    bot.answerCallbackQuery(query.id, { text: "تم تصفير العداد" });
  }

  // منطق المكتبة
  if (data === "lib:open") {
    bot.editMessageText("📚 <b>المكتبة الإسلامية</b>\nاختر الكتاب لقراءته أو تحميله بصيغة PDF:", {
      chat_id: chatId, message_id: messageId,
      parse_mode: "HTML", reply_markup: libraryKeyboard()
    });
  }

  if (data.startsWith("lib:view:")) {
    const id = data.split(":")[2];
    const book = PDF_LIBRARY.find(b => b.id === id);
    if (book) {
      bot.sendMessage(chatId, `📖 <b>${book.title}</b>\n\nرابط التحميل المباشر:\n${getPdfUrl(book.filename)}`, {
        parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "« رجوع للمكتبة", callback_data: "lib:open" }]] }
      });
    }
    bot.answerCallbackQuery(query.id);
  }

  // تنبيه الصلاحيات المقفلة
  if (data === "settings:locked") {
    bot.answerCallbackQuery(query.id, { text: "⚠️ عذراً! هذه الإعدادات مخصصة للمشرفين فقط.", show_alert: true });
  }

  bot.answerCallbackQuery(query.id).catch(() => {});
});

/**
 * نظام التذكير بالصيام والجدولة
 */
setInterval(() => {
  const now = new Date();
  const day = now.getDay(); // 0: Sunday, 3: Wednesday
  const hour = now.getHours();

  if (hour === 20) { // التذكير الساعة 8 مساءً
    if (day === 0) {
      // إرسال تذكير الاثنين (تحتاج لقائمة المشتركين من داتابيس)
    } else if (day === 3) {
      // إرسال تذكير الخميس
    }
  }
}, 3600000);

// ترحيب المجموعات
bot.on("my_chat_member", (update) => {
  if (update.new_chat_member.status === "member") {
    bot.sendMessage(update.chat.id, "✅ <b>تم التحقق والتأكد من الإضافة بنجاح!</b>\nسأقوم الآن بإرسال تذكيرات دورية تلقائية لتعطير مجموعتكم بذكر الله كل فترة.", { parse_mode: "HTML" });
  }
});

// تشغيل سيرفر الويب للبقاء حياً
const app = express();
app.get("/", (req, res) => res.send("Norify Bot is Online!"));
app.listen(process.env.PORT || 3000);
