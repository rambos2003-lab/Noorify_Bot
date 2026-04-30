/**
 * 🕌 NOORIFY ENGINE v6.1 - PRO STABLE EDITION
 * Fully safe Telegram bot (NO Markdown = NO crashes)
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// ---------------- CONFIG ----------------
const CONFIG = {
    TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    DB_PATH: path.join(__dirname, 'noorify_database.json'),
    DEFAULT_INTERVAL: 2 * 60 * 60 * 1000,
    DEVELOPER_TAG: "@vx_rq"
};

if (!CONFIG.TOKEN) {
    console.error("❌ Missing TELEGRAM_BOT_TOKEN");
    process.exit(1);
}

const bot = new TelegramBot(CONFIG.TOKEN, { polling: true });

// ---------------- LOGGER ----------------
const logger = {
    error: (err, ctx = '', data = null) => {
        console.error("❌ ERROR:", {
            context: ctx,
            message: err?.message,
            data
        });
    }
};

// ---------------- SAFE MESSAGE ENGINE ----------------
const safeSend = async (chatId, text, options = {}) => {
    try {
        return await bot.sendMessage(chatId, text, {
            parse_mode: undefined,
            ...options
        });
    } catch (err) {
        logger.error(err, "sendMessage");
    }
};

const safeEdit = async (text, params) => {
    try {
        return await bot.editMessageText(text, {
            parse_mode: undefined,
            ...params
        });
    } catch (err) {
        logger.error(err, "editMessage", params);
    }
};

// ---------------- DATABASE ----------------
let db = {
    chats: {},
    users: {},
    stats: { total_reminders: 0 }
};

if (fs.existsSync(CONFIG.DB_PATH)) {
    try {
        db = JSON.parse(fs.readFileSync(CONFIG.DB_PATH));
    } catch (e) {
        logger.error(e, "DB_LOAD");
    }
}

const saveDB = () => {
    try {
        fs.writeFileSync(CONFIG.DB_PATH, JSON.stringify(db, null, 2));
    } catch (e) {
        logger.error(e, "DB_SAVE");
    }
};

// ---------------- CONTENT ----------------
const DHIKR = [
    "سبحان الله والحمد لله ولا إله إلا الله والله أكبر",
    "أستغفر الله وأتوب إليه",
    "لا حول ولا قوة إلا بالله",
    "اللهم صل وسلم على نبينا محمد",
    "حسبي الله ونعم الوكيل",
    "رب اغفر لي ولوالدي"
];

const MOTIVATION = [
    "تقبل الله منك 🤍",
    "استمر في الذكر 🌿",
    "نور الله قلبك ✨",
    "بارك الله فيك 🌙"
];

// ---------------- UTILS ----------------
const utils = {
    rand: (arr) => arr[Math.floor(Math.random() * arr.length)],

    isAdmin: async (chat, user) => {
        try {
            const m = await bot.getChatMember(chat, user);
            return ['creator', 'administrator'].includes(m.status);
        } catch {
            return false;
        }
    }
};

// ---------------- UI ----------------
const ui = {
    main: {
        reply_markup: {
            inline_keyboard: [
                [{ text: "📿 ذكر", callback_data: "dhikr" }],
                [{ text: "🕋 مسبحة", callback_data: "tasbih" }],
                [{ text: "📚 مكتبة", callback_data: "lib" }],
                [{ text: "📊 إحصائيات", callback_data: "stats" }],
                [{ text: "🔔 تفعيل", callback_data: "on" }, { text: "🔕 إيقاف", callback_data: "off" }]
            ]
        }
    }
};

// ---------------- START ----------------
bot.onText(/\/start/, async (msg) => {
    const uid = msg.from.id;

    if (!db.users[uid]) {
        db.users[uid] = { tasbih: 0, joined: Date.now() };
        saveDB();
    }

    await safeSend(msg.chat.id,
`🕌 مرحباً بك في نورِفاي

بوت الأذكار والمسبحة الذكية

👨‍💻 المطور: ${CONFIG.DEVELOPER_TAG}`,
        ui.main
    );
});

// ---------------- CALLBACK ----------------
bot.on('callback_query', async (q) => {
    const cid = q.message.chat.id;
    const uid = q.from.id;
    const act = q.data;

    const reply = (t) =>
        bot.answerCallbackQuery(q.id, { text: t }).catch(() => {});

    try {

        // ---------------- DHIKR ----------------
        if (act === "dhikr") {
            return safeSend(cid,
                `${utils.rand(DHIKR)}\n\n${utils.rand(MOTIVATION)}`
            );
        }

        // ---------------- TASBIH ----------------
        if (act === "tasbih") {
            const c = db.users[uid].tasbih;

            return safeEdit(
`🕋 المسبحة

العدد: ${c}
الدورة: ${c % 33}`,
            {
                chat_id: cid,
                message_id: q.message.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "➕ تسبيح", callback_data: "add" }],
                        [{ text: "🔄 تصفير", callback_data: "reset" }],
                        [{ text: "🔙 رجوع", callback_data: "start" }]
                    ]
                }
            });
        }

        if (act === "add") {
            db.users[uid].tasbih++;
            saveDB();
            reply("تم التسبيح");

            return safeEdit(
`🕋 المسبحة

العدد: ${db.users[uid].tasbih}
الدورة: ${db.users[uid].tasbih % 33}`,
            {
                chat_id: cid,
                message_id: q.message.message_id
            });
        }

        if (act === "reset") {
            db.users[uid].tasbih = 0;
            saveDB();
            reply("تم التصفير");
        }

        // ---------------- STATS ----------------
        if (act === "stats") {
            return safeSend(cid,
`📊 إحصائياتك

📿 التسبيح: ${db.users[uid].tasbih || 0}
👥 المستخدمين: ${Object.keys(db.users).length}`);
        }

        // ---------------- TOGGLE REMINDERS ----------------
        if (act === "on") {
            db.chats[cid] = { active: true, last: Date.now() };
            saveDB();
            return safeSend(cid, "🔔 تم التفعيل");
        }

        if (act === "off") {
            if (db.chats[cid]) db.chats[cid].active = false;
            saveDB();
            return safeSend(cid, "🔕 تم الإيقاف");
        }

        if (act === "start") {
            return safeEdit("القائمة الرئيسية", {
                chat_id: cid,
                message_id: q.message.message_id,
                ...ui.main
            });
        }

        reply();

    } catch (err) {
        logger.error(err, "CALLBACK");
    }
});

// ---------------- AUTO REMINDER ----------------
setInterval(() => {
    const now = Date.now();

    Object.keys(db.chats).forEach(async (id) => {
        const c = db.chats[id];

        if (c.active && now - c.last > CONFIG.DEFAULT_INTERVAL) {
            try {
                await safeSend(id,
                    `${utils.rand(DHIKR)}`
                );

                db.chats[id].last = now;
                db.stats.total_reminders++;
                saveDB();

            } catch (e) {
                logger.error(e, "AUTO");
            }
        }
    });

}, 60000);

// ---------------- GROUP ADD ----------------
bot.on('my_chat_member', async (msg) => {
    try {
        if (msg.new_chat_member.status === "member") {
            await safeSend(msg.chat.id,
                "🕌 تم إضافة البوت بنجاح"
            );
        }
    } catch (e) {
        logger.error(e, "JOIN");
    }
});

console.log("🚀 NOORIFY ENGINE v6.1 ONLINE (STABLE)");
