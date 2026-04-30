require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true
});

require('./handlers/commands')(bot);
require('./handlers/callbacks')(bot);
require('./handlers/messages')(bot);

console.log("🚀 Noorify Bot is running...");

module.exports = {
    reminderIntervals: {
        '30min': 30 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '2h': 2 * 60 * 60 * 1000,
        '3h': 3 * 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000
    }
};

const athkar = [
    "سبحان الله وبحمده",
    "الحمد لله",
    "الله أكبر",
    "لا إله إلا الله",
    "أستغفر الله العظيم",
    "لا حول ولا قوة إلا بالله"
];

const getRandomDhikr = () => {
    return athkar[Math.floor(Math.random() * athkar.length)];
};

module.exports = { getRandomDhikr };

const users = {};

const init = (userId, type) => {
    if (!users[userId]) {
        users[userId] = { type, count: 0, target: 33 };
    }
};

const add = (userId, value = 1) => {
    if (!users[userId]) return null;
    users[userId].count += value;
    return users[userId];
};

const reset = (userId) => {
    if (users[userId]) users[userId].count = 0;
};

const get = (userId) => users[userId];

module.exports = { init, add, reset, get };

const intervals = {};
const { getRandomDhikr } = require('./dhikr.service');

const startReminder = (bot, chatId, ms) => {
    if (intervals[chatId]) return;

    intervals[chatId] = setInterval(() => {
        bot.sendMessage(chatId, `📿 ${getRandomDhikr()}`);
    }, ms);
};

const stopReminder = (chatId) => {
    if (intervals[chatId]) {
        clearInterval(intervals[chatId]);
        delete intervals[chatId];
    }
};

module.exports = { startReminder, stopReminder };

const intervals = {};
const { getRandomDhikr } = require('./dhikr.service');

const startReminder = (bot, chatId, ms) => {
    if (intervals[chatId]) return;

    intervals[chatId] = setInterval(() => {
        bot.sendMessage(chatId, `📿 ${getRandomDhikr()}`);
    }, ms);
};

const stopReminder = (chatId) => {
    if (intervals[chatId]) {
        clearInterval(intervals[chatId]);
        delete intervals[chatId];
    }
};

module.exports = { startReminder, stopReminder };

const fs = require('fs');
const path = require('path');

const sendFile = async (bot, chatId, file) => {
    const filePath = path.join(__dirname, `../files/${file}`);

    if (fs.existsSync(filePath)) {
        await bot.sendDocument(chatId, filePath);
    } else {
        await bot.sendMessage(chatId, "⚠️ الملف غير موجود حالياً");
    }
};

module.exports = { sendFile };
const fs = require('fs');
const path = require('path');

const sendFile = async (bot, chatId, file) => {
    const filePath = path.join(__dirname, `../files/${file}`);

    if (fs.existsSync(filePath)) {
        await bot.sendDocument(chatId, filePath);
    } else {
        await bot.sendMessage(chatId, "⚠️ الملف غير موجود حالياً");
    }
};

module.exports = { sendFile };


const mainMenu = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "📿 ذكر", callback_data: "dhikr" }],
            [{ text: "🧮 مسبحة", callback_data: "tasbih" }],
            [{ text: "📚 مكتبة", callback_data: "library" }],
            [{ text: "⏰ تذكير", callback_data: "reminder" }]
        ]
    }
};

module.exports = { mainMenu };
const { mainMenu } = require('../ui/keyboards');
const { getRandomDhikr } = require('../services/dhikr.service');
const { startReminder, stopReminder } = require('../services/reminder.service');
const config = require('../config');

const activeChats = [];

module.exports = (bot) => {

    bot.onText(/\/start/, (msg) => {
        bot.sendMessage(msg.chat.id,
            "🌿 مرحباً بك في بوت نورفاي",
            mainMenu
        );
    });

    bot.onText(/\/dhikr/, (msg) => {
        bot.sendMessage(msg.chat.id, getRandomDhikr());
    });

    bot.onText(/\/reminder_on/, (msg) => {
        const chatId = msg.chat.id;

        if (!activeChats.includes(chatId)) {
            activeChats.push(chatId);
            startReminder(bot, chatId, config.reminderIntervals['2h']);
        }

        bot.sendMessage(chatId, "✅ تم تفعيل التذكير");
    });

    bot.onText(/\/reminder_off/, (msg) => {
        const chatId = msg.chat.id;
        stopReminder(chatId);

        bot.sendMessage(chatId, "⛔ تم إيقاف التذكير");
    });
};
const { getRandomDhikr } = require('../services/dhikr.service');
const { sendFile } = require('../services/library.service');

module.exports = (bot) => {

    bot.on('callback_query', async (q) => {
        const chatId = q.message.chat.id;
        const data = q.data;

        if (data === 'dhikr') {
            bot.sendMessage(chatId, getRandomDhikr());
        }

        if (data === 'library') {
            await sendFile(bot, chatId, "hisn_muslim.pdf");
        }
    });
};const { getRandomDhikr } = require('../services/dhikr.service');
const { sendFile } = require('../services/library.service');

module.exports = (bot) => {

    bot.on('callback_query', async (q) => {
        const chatId = q.message.chat.id;
        const data = q.data;

        if (data === 'dhikr') {
            bot.sendMessage(chatId, getRandomDhikr());
        }

        if (data === 'library') {
            await sendFile(bot, chatId, "hisn_muslim.pdf");
        }
    });
};

module.exports = (bot) => {

    bot.on('message', (msg) => {
        if (!msg.text || msg.text.startsWith('/')) return;

        const text = msg.text.toLowerCase();

        if (text.includes("الحمد لله")) {
            bot.sendMessage(msg.chat.id, "🤍 الحمد لله دائماً وأبداً");
        }

        if (text.includes("سبحان الله")) {
            bot.sendMessage(msg.chat.id, "🌿 سبحان الله العظيم");
        }
    });
};
{
  "name": "noorify-bot",
  "version": "1.0.0",
  "main": "bot.js",
  "dependencies": {
    "dotenv": "^16.0.0",
    "node-telegram-bot-api": "^0.66.0"
  }
}
