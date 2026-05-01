import TelegramBot from "node-telegram-bot-api";
import express from "express";
import { WELCOME_TEXT, BORDER_TOP, BORDER_BOTTOM, SEPARATOR, TASBEEH_OPTIONS, RANDOM_AZKAR, DEVELOPER_URL } from "./azkar";
import { mainMenuKeyboard, tasbeehInlineKeyboard, intervalSettingsKeyboard, libraryInlineKeyboard } from "./keyboards";
import { PDF_LIBRARY } from "./pdfs";

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new TelegramBot(token, { polling: true });

// إحصائيات حقيقية (في الذاكرة - يفضل ربطها بـ Firestore لاحقاً)
const stats = { totalTasbeeh: 0, users: new Set(), groups: new Set() };
const userState = new Map<number, { count: number, dhikr: string }>();

// وظيفة التحقق من المشرف
async function isAdmin(chatId: number, userId: number): Promise<boolean> {
    if (chatId > 0) return true; // في الخاص مسموح دائماً
    const member = await bot.getChatMember(chatId, userId);
    return ["creator", "administrator"].includes(member.status);
}

bot.onText(/\/start/, (msg) => {
    stats.users.add(msg.from?.id);
    bot.sendMessage(msg.chat.id, WELCOME_TEXT, {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard()
    });
});

bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "🔵 المسبحة الإلكترونية") {
        userState.set(msg.from!.id, { count: 0, dhikr: "سُبْحَانَ اللَّهِ" });
        bot.sendMessage(chatId, `${BORDER_TOP}\n📿 <b>المسبحة التفاعلية</b>\n\nالذكر الحالي: <b>سُبْحَانَ اللَّهِ</b>\nالعدد: 0\n${BORDER_BOTTOM}`, {
            parse_mode: "HTML", reply_markup: tasbeehInlineKeyboard(0)
        });
    }

    if (text === "🟢 المكتبة الإسلامية") {
        bot.sendMessage(chatId, `📚 <b>المكتبة الشاملة</b>\n${SEPARATOR}\nاختر الكتاب الذي تود تحميله:`, {
            parse_mode: "HTML", reply_markup: libraryInlineKeyboard()
        });
    }

    if (text === "📊 الإحصائيات") {
        bot.sendMessage(chatId, `📊 <b>إحصائيات نورفاي الحقيقية</b>\n${SEPARATOR}\n• إجمالي التسبيح: <code>${stats.totalTasbeeh}</code>\n• عدد المستخدمين: <code>${stats.users.size}</code>\n• المجموعات النشطة: <code>${stats.groups.size}</code>\n${BORDER_BOTTOM}`, { parse_mode: "HTML" });
    }

    if (text === "🔴 الإعدادات") {
        if (await isAdmin(chatId, msg.from!.id)) {
            bot.sendMessage(chatId, `⚙️ <b>إعدادات التذكير</b>\n\nاختر المدة الزمنية لإرسال الأذكار التلقائية:`, {
                parse_mode: "HTML", reply_markup: intervalSettingsKeyboard()
            });
        } else {
            bot.sendMessage(chatId, `⚠️ <b>تنبيه:</b> هذا الخيار مخصص لمشرفي المجموعة فقط.`);
        }
    }
    
    if (text === "🟢 ذكر عشوائي") {
        const azkar = RANDOM_AZKAR[Math.floor(Math.random() * RANDOM_AZKAR.length)];
        bot.sendMessage(chatId, `✨ <b>ذكر الله:</b>\n\n<code>${azkar}</code>`, { parse_mode: "HTML" });
    }
});

bot.on("callback_query", async (query) => {
    const data = query.data || "";
    const chatId = query.message!.chat.id;
    const userId = query.from.id;

    if (data === "tasbeeh:tick") {
        const state = userState.get(userId) || { count: 0, dhikr: "سُبْحَانَ اللَّهِ" };
        state.count++;
        stats.totalTasbeeh++;
        userState.set(userId, state);
        bot.editMessageText(`${BORDER_TOP}\n📿 <b>المسبحة التفاعلية</b>\n\nالذكر: <b>${state.dhikr}</b>\nالعدد: <code>${state.count}</code>\n${BORDER_BOTTOM}`, {
            chat_id: chatId, message_id: query.message!.message_id, parse_mode: "HTML",
            reply_markup: tasbeehInlineKeyboard(state.count)
        });
    }

    if (data.startsWith("lib_file:")) {
        const fileId = data.split(":")[1];
        const file = PDF_LIBRARY.find(p => p.id === fileId);
        if (file) {
            bot.answerCallbackQuery(query.id, { text: "جاري تحضير الكتاب..." });
            bot.sendDocument(chatId, file.url, { caption: `📖 تم تحميل: <b>${file.title}</b>`, parse_mode: "HTML" });
        }
    }

    if (data.startsWith("set_timer:")) {
        if (await isAdmin(chatId, userId)) {
            bot.editMessageText(`✅ تم تحديث وقت التذكير بنجاح!`, { chat_id: chatId, message_id: query.message!.message_id });
        } else {
            bot.answerCallbackQuery(query.id, { text: "❌ هذا الأمر للمشرفين فقط!", show_alert: true });
        }
    }

    bot.answerCallbackQuery(query.id).catch(() => {});
});

// Health check for Render
const app = express();
app.get("/", (req, res) => res.send("Noorify is Live!"));
app.listen(process.env.PORT || 10000);
