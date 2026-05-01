import TelegramBot from "node-telegram-bot-api";
import express from "express";
import { WELCOME_TEXT, BORDER_TOP, BORDER_BOTTOM, SEPARATOR, TASBEEH_OPTIONS, RANDOM_AZKAR } from "./azkar";
import { 
  mainMenuKeyboard, 
  tasbeehKeyboard, 
  tasbeehSelectionKeyboard, 
  libraryKeyboard, 
  settingsKeyboard, 
  helpKeyboard 
} from "./keyboards";
import { PDF_LIBRARY } from "./pdfs";

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new TelegramBot(token, { polling: true });

// مخزن بيانات المستخدمين (يمكنك لاحقاً ترقيته لقاعدة بيانات)
const userState = new Map<number, { count: number, total: number, dhikr: string, sound: boolean }>();

const getSession = (id: number) => {
    if (!userState.has(id)) {
        userState.set(id, { count: 0, total: 0, dhikr: "سُبْحَانَ اللَّهِ", sound: true });
    }
    return userState.get(id)!;
};

// وظيفة فحص الصلاحيات (الخاص مفتوح / المجموعات للمشرفين)
async function hasSettingsAccess(msg: TelegramBot.Message): Promise<boolean> {
    if (msg.chat.type === 'private') return true;
    if (!msg.from) return false;
    try {
        const member = await bot.getChatMember(msg.chat.id, msg.from.id);
        return ["creator", "administrator"].includes(member.status);
    } catch {
        return false;
    }
}

// معالجة الأوامر المباشرة (Commands)
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, WELCOME_TEXT, { parse_mode: "HTML", reply_markup: mainMenuKeyboard() });
});

bot.onText(/\/tasbeeh/, (msg) => {
    const s = getSession(msg.from!.id);
    bot.sendMessage(msg.chat.id, `${BORDER_TOP}\n📿 <b>المسبحة الإلكترونية</b>\n${SEPARATOR}\nالعدد الحالي: <code>${s.count}</code>\nإجمالي تسبيحاتك: <code>${s.total}</code>\n${BORDER_BOTTOM}`, {
        parse_mode: "HTML", reply_markup: tasbeehKeyboard(s.count, s.dhikr, s.sound)
    });
});

bot.onText(/\/library/, (msg) => {
    bot.sendMessage(msg.chat.id, `📚 <b>المكتبة الإسلامية</b>\n${SEPARATOR}\nاختر الكتاب للتحميل المباشر:`, {
        parse_mode: "HTML", reply_markup: libraryKeyboard()
    });
});

bot.onText(/\/azkar/, (msg) => {
    const d = RANDOM_AZKAR[Math.floor(Math.random() * RANDOM_AZKAR.length)];
    bot.sendMessage(msg.chat.id, `${BORDER_TOP}\n✨ <b>ذكر الله:</b>\n\n<code>${d}</code>\n\n${BORDER_BOTTOM}`, { parse_mode: "HTML" });
});

bot.onText(/\/stats/, (msg) => {
    const s = getSession(msg.from!.id);
    bot.sendMessage(msg.chat.id, `📊 <b>إحصائياتك الشخصية</b>\n${SEPARATOR}\n• تسبيحك اليوم: <code>${s.count}</code>\n• إجمالي الحسنات: <code>${s.total * 10}</code>\n${BORDER_BOTTOM}`, { parse_mode: "HTML" });
});

bot.onText(/\/settings/, async (msg) => {
    if (await hasSettingsAccess(msg)) {
        bot.sendMessage(msg.chat.id, `⚙️ <b>إعدادات التذكير</b>\n${SEPARATOR}\nاختر المدة المطلوبة للتذكير:`, {
            parse_mode: "HTML", reply_markup: settingsKeyboard()
        });
    } else {
        bot.sendMessage(msg.chat.id, `⚠️ <b>تنبيه:</b> الإعدادات في المجموعات متاحة للمشرفين فقط.`);
    }
});

bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, `❓ <b>مركز المساعدة</b>\n${SEPARATOR}\nتواصل مع المطور لأي استفسار:`, {
        parse_mode: "HTML", reply_markup: helpKeyboard()
    });
});

// معالجة الضغط على أزرار القائمة السفلية (Text Buttons)
bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;
    const text = msg.text;
    const userId = msg.from!.id;

    if (text.includes("المسبحة")) bot.emit("text_command", msg, "/tasbeeh");
    else if (text.includes("المكتبة")) bot.emit("text_command", msg, "/library");
    else if (text.includes("ذكر عشوائي")) bot.emit("text_command", msg, "/azkar");
    else if (text.includes("إحصائياتي")) bot.emit("text_command", msg, "/stats");
    else if (text.includes("الإعدادات")) bot.emit("text_command", msg, "/settings");
    else if (text.includes("المساعدة")) bot.emit("text_command", msg, "/help");
});

// وسيط لتوجيه نصوص القائمة إلى الأوامر
bot.on("text_command", (msg, cmd) => {
    if (cmd === "/tasbeeh") bot.processUpdate({ message: { ...msg, text: "/tasbeeh" } } as any);
    if (cmd === "/library") bot.processUpdate({ message: { ...msg, text: "/library" } } as any);
    if (cmd === "/azkar") bot.processUpdate({ message: { ...msg, text: "/azkar" } } as any);
    if (cmd === "/stats") bot.processUpdate({ message: { ...msg, text: "/stats" } } as any);
    if (cmd === "/settings") bot.processUpdate({ message: { ...msg, text: "/settings" } } as any);
    if (cmd === "/help") bot.processUpdate({ message: { ...msg, text: "/help" } } as any);
});

// معالجة الأزرار الداخلية (Inline Buttons)
bot.on("callback_query", async (query) => {
    const data = query.data || "";
    const chatId = query.message!.chat.id;
    const msgId = query.message!.message_id;
    const userId = query.from.id;
    const s = getSession(userId);

    if (data === "tasbeeh:tick") {
        s.count++; s.total++;
        if (s.sound) bot.answerCallbackQuery(query.id, { text: "💎 تِك 💎" });
        bot.editMessageText(`${BORDER_TOP}\n📿 <b>المسبحة الإلكترونية</b>\n${SEPARATOR}\nالعدد الحالي: <code>${s.count}</code>\nإجمالي تسبيحاتك: <code>${s.total}</code>\n${BORDER_BOTTOM}`, {
            chat_id: chatId, message_id: msgId, parse_mode: "HTML",
            reply_markup: tasbeehKeyboard(s.count, s.dhikr, s.sound)
        }).catch(() => {});
    }
    else if (data === "tasbeeh:reset") {
        s.count = 0;
        bot.editMessageText(`${BORDER_TOP}\n📿 <b>المسبحة الإلكترونية</b>\n${SEPARATOR}\n(تم التصفير ✅)\nالعدد: 0\n${BORDER_BOTTOM}`, {
            chat_id: chatId, message_id: msgId, parse_mode: "HTML",
            reply_markup: tasbeehKeyboard(0, s.dhikr, s.sound)
        });
    }
    else if (data === "tasbeeh:change") {
        bot.editMessageText(`📜 <b>اختر الذكر المطلوب للمسبحة:</b>`, {
            chat_id: chatId, message_id: msgId, parse_mode: "HTML", reply_markup: tasbeehSelectionKeyboard()
        });
    }
    else if (data.startsWith("tasbeeh:set:")) {
        const id = data.split(":")[2];
        const opt = TASBEEH_OPTIONS.find(o => o.id === id);
        s.dhikr = opt?.text || s.dhikr;
        s.count = 0;
        bot.editMessageText(`✅ تم تغيير الذكر إلى: <b>${s.dhikr}</b>\nسيتم البدء من الصفر.`, {
            chat_id: chatId, message_id: msgId, parse_mode: "HTML",
            reply_markup: tasbeehKeyboard(0, s.dhikr, s.sound)
        });
    }
    else if (data === "tasbeeh:toggle_sound") {
        s.sound = !s.sound;
        bot.editMessageReplyMarkup(tasbeehKeyboard(s.count, s.dhikr, s.sound), { chat_id: chatId, message_id: msgId });
        bot.answerCallbackQuery(query.id, { text: s.sound ? "🔔 تم تفعيل الصوت" : "🔕 تم إيقاف الصوت" });
    }
    else if (data === "menu:main") {
        bot.editMessageText(WELCOME_TEXT, { chat_id: chatId, message_id: msgId, parse_mode: "HTML" });
    }
    else if (data.startsWith("lib_file:")) {
        const book = PDF_LIBRARY.find(b => b.id === data.split(":")[1]);
        if (book) bot.sendDocument(chatId, book.url, { caption: `📖 تم تحميل: <b>${book.title}</b>`, parse_mode: "HTML" });
    }

    bot.answerCallbackQuery(query.id).catch(() => {});
});

const app = express();
app.get("/", (req, res) => res.send("Noorify Running 🌙"));
app.listen(process.env.PORT || 10000);
