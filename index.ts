import TelegramBot from "node-telegram-bot-api";
import { 
  WELCOME_MESSAGE, 
  HELP_MESSAGE, 
  CONTACT_MESSAGE, 
  SHARE_MESSAGE, 
  TASBEEH_OPTIONS,
  GROUP_WELCOME_MESSAGE,
  escapeHtml 
} from "./azkar";

/**
 * ==========================================
 * 1. إعدادات النظام المساعدة (Helper Services)
 * ==========================================
 */

const logger = {
  info: (msg: string, details?: any) => console.log(`[INFO] ${msg}`, details || ""),
  error: (msg: string, details?: any) => console.error(`[ERROR] ${msg}`, details || ""),
  warn: (msg: string, details?: any) => console.warn(`[WARN] ${msg}`, details || ""),
};

// تخزين البيانات في الذاكرة (In-Memory Storage) لضمان العمل بدون قاعدة بيانات معقدة حالياً
const storage = {
  users: new Map<number, any>(),
  chats: new Map<number, any>(),
};

/**
 * ==========================================
 * 2. تهيئة البوت (Bot Initialization)
 * ==========================================
 */

const token = process.env["TELEGRAM_BOT_TOKEN"] || "";
if (!token) {
  logger.error("خطأ: لم يتم العثور على TELEGRAM_BOT_TOKEN في المتغيرات البيئية!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
let botUsername = "bot";

bot.getMe().then((me) => {
  botUsername = me.username || "bot";
  logger.info(`تم تشغيل البوت بنجاح باسم: @${botUsername}`);
});

/**
 * ==========================================
 * 3. معالجة الأوامر النصية (Commands)
 * ==========================================
 */

// أمر البدء /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || "عزيزي";

  bot.sendMessage(chatId, WELCOME_MESSAGE(botUsername), {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "📿 المسبحة الإلكترونية", callback_data: "tasbeeh_menu" }],
        [{ text: "📚 المكتبة الإسلامية", callback_data: "library_menu" }],
        [{ text: "⚙️ الإعدادات", callback_data: "settings_main" }],
        [{ text: "📞 تواصل مع المطور", callback_data: "contact_dev" }]
      ]
    }
  });
});

// أمر المساعدة /help
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, HELP_MESSAGE, { parse_mode: "HTML" });
});

// أمر المسبحة /tasbeeh
bot.onText(/\/tasbeeh/, (msg) => {
  sendTasbeehMenu(msg.chat.id);
});

// أمر المطور /contact
bot.onText(/\/contact/, (msg) => {
  bot.sendMessage(msg.chat.id, CONTACT_MESSAGE, { parse_mode: "HTML", disable_web_page_preview: true });
});

/**
 * ==========================================
 * 4. معالجة الأزرار (Callback Queries)
 * ==========================================
 */

bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat.id;
  const messageId = query.message?.message_id;
  const data = query.data;

  if (!chatId || !data) return;

  try {
    // قائمة المسبحة
    if (data === "tasbeeh_menu") {
      await bot.editMessageText("📿 <b>المسبحة الإلكترونية</b>\nاختر الذكر الذي تود التسبيح به:", {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            ...TASBEEH_OPTIONS.map(opt => [{ text: opt.text, callback_data: `set_dhikr_${opt.id}` }]),
            [{ text: "🔙 عودة", callback_data: "main_menu" }]
          ]
        }
      });
    }

    // اختيار ذكر محدد
    if (data.startsWith("set_dhikr_")) {
      const dhikrId = data.replace("set_dhikr_", "");
      const selected = TASBEEH_OPTIONS.find(o => o.id === dhikrId);
      if (selected) {
        await bot.editMessageText(`📿 <b>المسبحة:</b> ${selected.text}\n\nالعدد الحالي: 0`, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "➕ سبّح", callback_data: `tick_${dhikrId}_1` }],
              [{ text: "🔄 تصفير", callback_data: `reset_${dhikrId}` }],
              [{ text: "🔙 تغيير الذكر", callback_data: "tasbeeh_menu" }]
            ]
          }
        });
      }
    }

    // زيادة العداد
    if (data.startsWith("tick_")) {
      const parts = data.split("_");
      const dhikrId = parts[1];
      const currentCount = parseInt(parts[2]);
      const nextCount = currentCount + 1;
      const selected = TASBEEH_OPTIONS.find(o => o.id === dhikrId);

      await bot.editMessageText(`📿 <b>المسبحة:</b> ${selected?.text}\n\nالعدد الحالي: ${currentCount}`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "➕ سبّح", callback_data: `tick_${dhikrId}_${nextCount}` }],
            [{ text: "🔄 تصفير", callback_data: `reset_${dhikrId}` }],
            [{ text: "🔙 عودة", callback_data: "tasbeeh_menu" }]
          ]
        }
      });
      await bot.answerCallbackQuery(query.id, { text: `تم التسبيح: ${currentCount}` });
    }

    // العودة للقائمة الرئيسية
    if (data === "main_menu") {
      await bot.editMessageText(WELCOME_MESSAGE(botUsername), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📿 المسبحة الإلكترونية", callback_data: "tasbeeh_menu" }],
            [{ text: "📚 المكتبة الإسلامية", callback_data: "library_menu" }],
            [{ text: "⚙️ الإعدادات", callback_data: "settings_main" }],
            [{ text: "📞 تواصل مع المطور", callback_data: "contact_dev" }]
          ]
        }
      });
    }

    // المكتبة
    if (data === "library_menu") {
      await bot.editMessageText("📚 <b>المكتبة الإسلامية</b>\nقريباً سيتم إضافة الكتب والمراجع هنا.", {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "🔙 عودة", callback_data: "main_menu" }]]
        }
      });
    }

    // تواصل مع المطور
    if (data === "contact_dev") {
      await bot.editMessageText(CONTACT_MESSAGE, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[{ text: "🔙 عودة", callback_data: "main_menu" }]]
        }
      });
    }

  } catch (err) {
    logger.error("خطأ في معالجة الزر:", err);
  }

  bot.answerCallbackQuery(query.id);
});

/**
 * ==========================================
 * 5. الوظائف الإضافية (Helper Functions)
 * ==========================================
 */

function sendTasbeehMenu(chatId: number) {
  bot.sendMessage(chatId, "📿 اختر الذكر لبدء التسبيح:", {
    reply_markup: {
      inline_keyboard: TASBEEH_OPTIONS.map(opt => [{ text: opt.text, callback_data: `set_dhikr_${opt.id}` }])
    }
  });
}

// معالجة إضافة البوت لمجموعة
bot.on("my_chat_member", (update) => {
  const chat = update.chat;
  if (update.new_chat_member.status === "member" || update.new_chat_member.status === "administrator") {
    bot.sendMessage(chat.id, GROUP_WELCOME_MESSAGE(chat.title || "المجموعة"), { parse_mode: "HTML" });
    logger.info(`تم إضافة البوت لمجموعة: ${chat.title} (${chat.id})`);
  }
});

/**
 * ==========================================
 * 6. تشغيل السيرفر (Keep Alive)
 * ==========================================
 */

import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("البوت يعمل بنجاح! ✅"));

app.listen(PORT, () => {
  logger.info(`سيرفر الويب يعمل على المنفذ: ${PORT}`);
});

// التعامل مع أخطاء Polling لمنع توقف البوت
bot.on("polling_error", (err) => logger.warn("خطأ في Polling:", err.message));

logger.info("تم تحميل جميع الوظائف بنجاح.");
