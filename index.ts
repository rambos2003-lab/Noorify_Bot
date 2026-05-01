import TelegramBot from "node-telegram-bot-api";
import { 
  WELCOME_MESSAGE, 
  TASBEEH_OPTIONS,
  DEVELOPER_USERNAME
} from "./data/azkar";
import { 
  mainMenuKeyboard, 
  tasbeehChooserKeyboard, 
  tasbeehActiveKeyboard,
  libraryKeyboard,
  intervalChooserKeyboard
} from "./lib/keyboards";
import { 
  buildTasbeehDisplay,
  buildStatsMessage,
  buildLibraryMessage
} from "./lib/format";
import { PDF_LIBRARY } from "./data/pdfs";

// إعداد البوت
const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new TelegramBot(token, { polling: true });

// قواعد بيانات مؤقتة (للتطوير - يفضل الربط بـ MongoDB لاحقاً)
const userStats = new Map<number, { count: number, total: number }>();
const chatSettings = new Map<number, { interval: number }>();

/**
 * حارس الصلاحيات (Admin Middleware)
 */
async function isAdminOrPrivate(ctx: any): Promise<boolean> {
    if (ctx.chat.type === 'private') return true;
    try {
        const member = await bot.getChatMember(ctx.chat.id, ctx.from.id);
        const hasAccess = ["creator", "administrator"].includes(member.status);
        if (!hasAccess) {
            bot.answerCallbackQuery(ctx.id, { 
                text: "⚠️ عذراً، هذا الأمر مخصص للمشرفين فقط.", 
                show_alert: true 
            });
        }
        return hasAccess;
    } catch (e) { return false; }
}

// 1. أمر البداية
bot.onText(/\/start/, (msg) => {
    const isAdmin = msg.chat.type === 'private' || true; // للتبسيط
    bot.sendMessage(msg.chat.id, WELCOME_MESSAGE(DEVELOPER_USERNAME), {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard(isAdmin, "bot_username_here")
    });
});

// 2. معالجة التفاعلات
bot.on("callback_query", async (query) => {
    const data = query.data || "";
    const chatId = query.message?.chat.id || 0;
    const messageId = query.message?.message_id || 0;

    // حماية الأوامر الحساسة
    if (data.startsWith("settings:") && !(await isAdminOrPrivate(query))) return;

    try {
        if (data === "menu:main") {
            bot.editMessageText("📌 <b>القائمة الرئيسية</b>", {
                chat_id: chatId, message_id: messageId,
                parse_mode: "HTML", reply_markup: mainMenuKeyboard(true, "bot_username")
            });
        } 
        
        // --- المسبحة ---
        else if (data === "tasbeeh:open") {
            bot.editMessageText("📿 <b>اختر الذكر للتسبيح:</b>", {
                chat_id: chatId, message_id: messageId,
                parse_mode: "HTML", reply_markup: tasbeehChooserKeyboard()
            });
        }
        else if (data.startsWith("tasbeeh:set:")) {
            const dhikrId = data.split(":")[2];
            bot.editMessageText(buildTasbeehDisplay(dhikrId, 0), {
                chat_id: chatId, message_id: messageId,
                parse_mode: "HTML", reply_markup: tasbeehActiveKeyboard(dhikrId, 0)
            });
        }
        else if (data.startsWith("tasbeeh:tick:")) {
            const [_, __, dhikrId, countStr] = data.split(":");
            const newCount = parseInt(countStr) + 1;
            // تحديث الإحصائيات
            const stats = userStats.get(query.from.id) || { count: 0, total: 0 };
            userStats.set(query.from.id, { count: newCount, total: stats.total + 1 });
            
            bot.editMessageText(buildTasbeehDisplay(dhikrId, newCount), {
                chat_id: chatId, message_id: messageId,
                parse_mode: "HTML", reply_markup: tasbeehActiveKeyboard(dhikrId, newCount)
            });
        }

        // --- المكتبة ---
        else if (data === "lib:open") {
            bot.editMessageText("📚 <b>مكتبة نورِفاي الإسلامية:</b>", {
                chat_id: chatId, message_id: messageId,
                parse_mode: "HTML", reply_markup: libraryKeyboard()
            });
        }
        else if (data.startsWith("lib:view:")) {
            const bookId = data.split(":")[2];
            const book = PDF_LIBRARY.find(b => b.id === bookId);
            if (book) {
                bot.editMessageText(`📖 <b>كتاب:</b> ${book.title}\n\nيتم الآن فتح الكتاب..`, {
                    chat_id: chatId, message_id: messageId,
                    parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "« عودة", callback_data: "lib:open" }]] }
                });
            }
        }

        // --- الإعدادات (التذكير) ---
        else if (data === "settings:open") {
            bot.editMessageText("⚙️ <b>إعدادات التذكير (للمشرفين):</b>\nاختر فترة التذكير التلقائي:", {
                chat_id: chatId, message_id: messageId,
                parse_mode: "HTML", reply_markup: intervalChooserKeyboard()
            });
        }
        else if (data.startsWith("settings:set:")) {
            const interval = data.split(":")[2];
            chatSettings.set(chatId, { interval: parseInt(interval) });
            bot.answerCallbackQuery(query.id, { text: `✅ تم ضبط التذكير كل ${interval} دقيقة` });
        }

        // --- الإحصائيات ---
        else if (data === "stats:open") {
            const stats = userStats.get(query.from.id) || { total: 0 };
            bot.editMessageText(buildStatsMessage(stats.total), {
                chat_id: chatId, message_id: messageId,
                parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "« عودة", callback_data: "menu:main" }]] }
            });
        }

    } catch (err) {
        console.error("Error processing callback:", err);
    }
    bot.answerCallbackQuery(query.id).catch(() => {});
});
