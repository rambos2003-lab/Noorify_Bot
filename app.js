/**
 * 🕌 NOORIFY ENGINE v6.0 - SAFE PATCH EDITION
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
    console.error('CRITICAL ERROR: TELEGRAM_BOT_TOKEN NOT FOUND');
    process.exit(1);
}

const bot = new TelegramBot(CONFIG.TOKEN, { polling: true });

// ---------------- LOGGER ----------------
const logger = {
    error: (err, context = '', extra = null) => {
        console.error('BOT ERROR:', {
            context,
            message: err?.message,
            stack: err?.stack,
            extra
        });
    }
};

// ---------------- ESCAPE SYSTEM ----------------
const escapeMarkdown = (text = '') => {
    return String(text)
        .replace(/_/g, '\\_')
        .replace(/\*/g, '\\*')
        .replace(/\[/g, '\\[')
        .replace(/]/g, '\\]')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/~/g, '\\~')
        .replace(/`/g, '\\`')
        .replace(/>/g, '\\>')
        .replace(/#/g, '\\#')
        .replace(/\+/g, '\\+')
        .replace(/-/g, '\\-')
        .replace(/=/g, '\\=')
        .replace(/\|/g, '\\|')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/\./g, '\\.')
        .replace(/!/g, '\\!');
};

// ---------------- SAFE WRAPPERS ----------------
const safeSendMessage = async (chatId, text, options = {}) => {
    try {
        return await bot.sendMessage(chatId, escapeMarkdown(text), {
            parse_mode: 'MarkdownV2',
            ...options
        });
    } catch (err) {
        logger.error(err, 'sendMessage', { chatId, text });
        return bot.sendMessage(chatId, text).catch(e =>
            logger.error(e, 'fallback sendMessage')
        );
    }
};

const safeEditMessage = async (text, params) => {
    try {
        return await bot.editMessageText(escapeMarkdown(text), {
            parse_mode: 'MarkdownV2',
            ...params
        });
    } catch (err) {
        logger.error(err, 'editMessage', params);
        return bot.editMessageText(text, {
            ...params,
            parse_mode: undefined
        }).catch(e => logger.error(e, 'fallback editMessage'));
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
        logger.error(e, 'DB LOAD');
    }
}

const persist = () => {
    try {
        fs.writeFileSync(CONFIG.DB_PATH, JSON.stringify(db, null, 2));
    } catch (e) {
        logger.error(e, 'DB SAVE');
    }
};

// ---------------- CONTENT ----------------
const DHIKR_POOL = [
    "سبحان الله والحمد لله ولا إله إلا الله والله أكبر",
    "أستغفر الله وأتوب إليه",
    "لا حول ولا قوة إلا بالله",
    "اللهم صل وسلم على نبينا محمد"
];

const MOTIVATION = [
    "تقبل الله منك",
    "استمر في الذكر",
    "نور الله قلبك"
];

// ---------------- UTILS ----------------
const utils = {
    rand: (a) => a[Math.floor(Math.random() * a.length)],
    isAdmin: async (c, u) => {
        try {
            const m = await bot.getChatMember(c, u);
            return ['creator', 'administrator'].includes(m.status);
        } catch {
            return false;
        }
    }
};

// ---------------- UI ----------------
const ui = {
    main: () => ({
        reply_markup: {
            inline_keyboard: [
                [{ text: "ذكر", callback_data: 'cmd_dhikr' }],
                [{ text: "مسبحة", callback_data: 'cmd_tasbih_ui' }],
                [{ text: "مكتبة", callback_data: 'cmd_lib' }],
                [{ text: "إحصائيات", callback_data: 'cmd_stats' }]
            ]
        }
    }),

    tasbih: (u) => {
        const c = db.users[u]?.tasbih || 0;

        return {
            text: `المسبحة\nالعدد: ${c}\nالدورة: ${c % 33}`,
            markup: {
                inline_keyboard: [
                    [{ text: "تسبيح", callback_data: 'act_tasbih' }],
                    [{ text: "رجوع", callback_data: 'cmd_start' }]
                ]
            }
        };
    }
};

// ---------------- COMMANDS ----------------
bot.onText(/\/start/, async (msg) => {
    const uid = msg.from.id;

    if (!db.users[uid]) {
        db.users[uid] = { tasbih: 0, joined: Date.now() };
        persist();
    }

    await safeSendMessage(msg.chat.id,
        `مرحبا بك في البوت`,
        ui.main()
    );
});

// ---------------- CALLBACKS ----------------
bot.on('callback_query', async (q) => {
    const cid = q.message.chat.id;
    const uid = q.from.id;
    const mid = q.message.message_id;
    const act = q.data;

    const notify = (t) => bot.answerCallbackQuery(q.id, { text: t }).catch(()=>{});

    try {

        if (act === 'cmd_start') {
            return safeEditMessage("القائمة", {
                chat_id: cid,
                message_id: mid,
                ...ui.main()
            });
        }

        if (act === 'cmd_dhikr') {
            return safeSendMessage(cid,
                `${utils.rand(DHIKR_POOL)}\n${utils.rand(MOTIVATION)}`
            );
        }

        if (act === 'cmd_tasbih_ui') {
            const t = ui.tasbih(uid);
            return safeEditMessage(t.text, {
                chat_id: cid,
                message_id: mid,
                reply_markup: t.markup
            });
        }

        if (act === 'act_tasbih') {
            db.users[uid].tasbih++;
            persist();

            const t = ui.tasbih(uid);
            await safeEditMessage(t.text, {
                chat_id: cid,
                message_id: mid,
                reply_markup: t.markup
            });

            return notify("تم");
        }

        if (act === 'cmd_stats') {
            return safeSendMessage(cid,
                `إحصائيات\n${db.users[uid]?.tasbih || 0}`
            );
        }

        notify();

    } catch (err) {
        logger.error(err, 'CALLBACK_HANDLER', { act });
    }
});

// ---------------- AUTO ENGINE ----------------
setInterval(() => {
    const now = Date.now();

    Object.keys(db.chats).forEach(async (chatId) => {
        const c = db.chats[chatId];

        if (c.active && now - c.lastSent > c.interval) {
            try {
                await safeSendMessage(chatId,
                    `${utils.rand(DHIKR_POOL)}`
                );

                db.chats[chatId].lastSent = now;
                db.stats.total_reminders++;
                persist();

            } catch (e) {
                logger.error(e, 'AUTO_SEND');
            }
        }
    });

}, 60000);

// ---------------- GROUP JOIN ----------------
bot.on('my_chat_member', async (msg) => {
    try {
        if (msg.new_chat_member.status === 'member') {
            await safeSendMessage(msg.chat.id,
                "تم إضافة البوت"
            );
        }
    } catch (e) {
        logger.error(e, 'GROUP_JOIN');
    }
});

console.log("NOORIFY ENGINE SAFE VERSION ONLINE");
