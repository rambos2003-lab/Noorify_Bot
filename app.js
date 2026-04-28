require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

process.noDeprecation = true;

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.error("❌ خطأ: لم يتم العثور على TELEGRAM_BOT_TOKEN.");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// ==================== ملفات البيانات ====================
const DATA_FILE       = path.join(__dirname, 'reminders_data.json');
const STATS_FILE      = path.join(__dirname, 'bot_stats.json');
const USER_PREFS_FILE = path.join(__dirname, 'user_preferences.json');

let activeChats     = [];
let botStats        = { totalUsers: 0, totalReminders: 0, commandsUsed: {} };
let userPreferences = {};

const loadData = () => {
    if (fs.existsSync(DATA_FILE))       try { activeChats      = JSON.parse(fs.readFileSync(DATA_FILE));       } catch(e) { activeChats = []; }
    if (fs.existsSync(STATS_FILE))      try { botStats          = JSON.parse(fs.readFileSync(STATS_FILE));      } catch(e) { botStats = { totalUsers:0, totalReminders:0, commandsUsed:{} }; }
    if (fs.existsSync(USER_PREFS_FILE)) try { userPreferences   = JSON.parse(fs.readFileSync(USER_PREFS_FILE)); } catch(e) { userPreferences = {}; }
};
loadData();

const activeIntervals = {};

const saveData = () => {
    try {
        fs.writeFileSync(DATA_FILE,       JSON.stringify(activeChats,     null, 2));
        fs.writeFileSync(STATS_FILE,      JSON.stringify(botStats,        null, 2));
        fs.writeFileSync(USER_PREFS_FILE, JSON.stringify(userPreferences, null, 2));
    } catch(e) { console.error("خطأ في حفظ البيانات:", e); }
};

const trackCommand = (cmd) => {
    botStats.commandsUsed[cmd] = (botStats.commandsUsed[cmd] || 0) + 1;
    saveData();
};

// ==================== الأذكار ====================
const athkarList = [
    "سبحان الله وبحمده",
    "الحمد لله",
    "لا إله إلا الله",
    "الله أكبر",
    "أستغفر الله",
    "لا حول ولا قوة إلا بالله",
    "سبحان الله وبحمده سبحان الله العظيم",
    "اللهم صل على محمد وعلى آل محمد",
    "أستغفر الله العظيم وأتوب إليه",
    "لا إله إلا أنت سبحانك إني كنت من الظالمين",
    "يا حي يا قيوم برحمتك أستغيث",
    "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم",
    "سبحان الله والحمد لله ولا إله إلا الله والله أكبر",
    "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير",
    "اللهم أعني على ذكرك وشكرك وحسن عبادتك",
    "يا مقلب القلوب ثبت قلبي على دينك",
    "يا مصرف القلوب صرف قلوبنا على طاعتك",
    "اللهم إني أسألك علماً نافعاً ورزقاً طيباً وعملاً متقبلاً",
    "اللهم اغفر لي ولوالدي وللمؤمنين والمؤمنات",
    "رب اغفر لي وتب علي إنك أنت التواب الرحيم",
    "اللهم صل وسلم على نبينا محمد",
    "رضيت بالله ربا وبالإسلام دينا وبمحمد نبيا",
    "اللهم إنك عفو تحب العفو فاعف عني",
    "أعوذ بكلمات الله التامات من شر ما خلق",
    "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم",
    "اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري",
    "يا رب لك الحمد كما ينبغي لجلال وجهك وعظيم سلطانك",
    "اللهم ارزقني حبك وحب من يحبك",
    "سبحان الله عدد ما خلق، سبحان الله ملء ما خلق",
    "الحمد لله الذي بنعمته تتم الصالحات",
    "لا إله إلا الله الملك الحق المبين"
];

const dhikrEmojis = ["☀️","🌿","💚","✨","🌙","🕌","📿","🌸","💫","🤲"];
const getRandomEmoji = () => dhikrEmojis[Math.floor(Math.random() * dhikrEmojis.length)];
const getRandomDhikr = () => athkarList[Math.floor(Math.random() * athkarList.length)];

// ==================== المكتبة ====================
const filesMap = {
    'athkar_morning_evening': 'أذكار الصباح و المساء.pdf',
    'athkar_sleep':           'اذكار النوم.pdf',
    'athkar_wake':            'اذكار الإستيقاظ.pdf',
    'easy_thawab':            'اسهل طرق لكسب الثواب.pdf',
    'quran':                  'القرآن الكريم.pdf',
    'hisn_muslim':            'حصن المسلم.pdf'
};

// ==================== فترات التذكير ====================
const reminderIntervals = {
    'every_30min':  1800000,
    'every_hour':   3600000,
    'every_2hours': 7200000,
    'every_3hours': 10800000,
    'every_6hours': 21600000
};

const intervalLabels = {
    'every_30min':  '⏱ كل 30 دقيقة',
    'every_hour':   '🕐 كل ساعة',
    'every_2hours': '🕑 كل ساعتين',
    'every_3hours': '🕒 كل 3 ساعات',
    'every_6hours': '🕕 كل 6 ساعات'
};

// ==================== القائمة الرئيسية — دالة (لا متغير) ====================
// استخدام دالة بدلاً من const يضمن إنشاء كائن جديد في كل مرة وتجنب أي مشكلة مرجعية
const getMainKeyboard = () => ({
    reply_markup: {
        inline_keyboard: [
            [
                { text: "📿 ذكر عشوائي",     callback_data: 'menu_dhikr'        },
                { text: "📊 عداد أذكاري",     callback_data: 'menu_count'        }
            ],
            [
                { text: "📚 المكتبة الرقمية", callback_data: 'menu_library'      },
                { text: "⚙️ إعدادات التذكير", callback_data: 'menu_settings'     }
            ],
            [
                { text: "✅ تفعيل التذكيرات", callback_data: 'menu_reminder_on'  },
                { text: "❌ إيقاف التذكيرات", callback_data: 'menu_reminder_off' }
            ],
            [
                { text: "📈 إحصائياتي",       callback_data: 'menu_stats'        },
                { text: "❓ مساعدة",           callback_data: 'menu_help'         }
            ]
        ]
    }
});

// ==================== التذكيرات ====================
const startReminder = (chatId, interval = 'every_2hours') => {
    if (activeIntervals[chatId]) return;
    const intervalTime = reminderIntervals[interval] || reminderIntervals['every_2hours'];

    activeIntervals[chatId] = setInterval(() => {
        const dhikr = getRandomDhikr();
        const emoji  = getRandomEmoji();
        bot.sendMessage(chatId,
            `${emoji} *تذكير الذكر*\n\n✨ _${dhikr}_\n\n🤲 تقبّل الله منّا ومنكم`,
            { parse_mode: 'Markdown' }
        ).catch(err => {
            console.error("خطأ في إرسال التذكير:", err.message);
            if (['bot was kicked','chat not found','Forbidden','bot was blocked']
                    .some(s => err.message?.includes(s))) {
                stopReminder(chatId);
            }
        });
    }, intervalTime);
};

const stopReminder = (chatId) => {
    if (activeIntervals[chatId]) {
        clearInterval(activeIntervals[chatId]);
        delete activeIntervals[chatId];
    }
    activeChats = activeChats.filter(id => id !== chatId);
    saveData();
};

// استعادة التذكيرات عند إعادة تشغيل البوت
activeChats.forEach(chatId => {
    let interval = 'every_2hours';
    for (const uid in userPreferences) {
        if (userPreferences[uid].chatId === chatId) {
            interval = userPreferences[uid].reminderInterval || 'every_2hours';
            break;
        }
    }
    startReminder(chatId, interval);
});

// ==================== نص الترحيب ====================
const getWelcomeText = () => {
    const dhikr = getRandomDhikr();
    const emoji  = getRandomEmoji();
    return (
`🌿 *السلام عليكم ورحمة الله وبركاته*

يسعدني ويشرفني تجربتك لـ *بوت نورِفاي* 🌙
رفيقك في رحلة المداومة على ذكر الله

━━━━━━━━━━━━━━━━━
${emoji} *ذكر اليوم:*
_${dhikr}_
━━━━━━━━━━━━━━━━━

📖 *طريقة الاستخدام:*

🔹 اضغط *"ذكر عشوائي"* للحصول على ذكر جديد
🔹 اضغط *"تفعيل التذكيرات"* لاستقبال أذكار تلقائية
🔹 اضغط *"إعدادات التذكير"* لاختيار الفترة المناسبة
🔹 اضغط *"المكتبة الرقمية"* لتحميل الكتب الإسلامية
🔹 اضغط *"عداد أذكاري"* لمتابعة تقدّمك اليومي

━━━━━━━━━━━━━━━━━
🌸 *لا تنسى مشاركة البوت مع من تحب لعلها صدقة جارية لنا ولكم*

🤲 وفّقنا الله لما يحبّ ويرضى

━━━━━━━━━━━━━━━━━
💬 *للتواصل وطرح الأفكار:* @vx\\_rq
👨‍💻 *المطوِّر:* @vx\\_rq`
    );
};

// ==================== /start ====================
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    trackCommand('start');

    if (userId && !userPreferences[userId]) {
        userPreferences[userId] = {
            joinDate:         new Date().toISOString(),
            reminderInterval: 'every_2hours',
            chatId:           chatId,
            dailyCount:       0,
            lastReset:        new Date().toDateString()
        };
        botStats.totalUsers++;
        saveData();
    }

    bot.sendMessage(chatId, getWelcomeText(), {
        parse_mode: 'Markdown',
        ...getMainKeyboard()
    }).catch(err => console.error("خطأ في /start:", err));
});

// ==================== /menu ====================
bot.onText(/\/menu/, (msg) => {
    trackCommand('menu');
    bot.sendMessage(msg.chat.id, getWelcomeText(), {
        parse_mode: 'Markdown',
        ...getMainKeyboard()
    }).catch(err => console.error("خطأ:", err));
});

// ==================== /dhikr ====================
bot.onText(/\/dhikr/, (msg) => {
    trackCommand('dhikr');
    const dhikr = getRandomDhikr();
    const emoji  = getRandomEmoji();
    bot.sendMessage(msg.chat.id,
        `${emoji} *ذكرك الآن:*\n\n✨ _${dhikr}_\n\n🤲 اللهم تقبّل منّا`,
        { parse_mode: 'Markdown' }
    ).catch(err => console.error("خطأ:", err));
});

// ==================== /daily_count ====================
bot.onText(/\/daily_count/, (msg) => { handleDailyCount(msg.chat.id, msg.from?.id); });

const handleDailyCount = (chatId, userId) => {
    trackCommand('daily_count');
    if (!userId) return;
    if (!userPreferences[userId]) userPreferences[userId] = { dailyCount: 0, lastReset: new Date().toDateString() };

    const today = new Date().toDateString();
    if (userPreferences[userId].lastReset !== today) {
        userPreferences[userId].dailyCount = 0;
        userPreferences[userId].lastReset  = today;
    }
    userPreferences[userId].dailyCount = (userPreferences[userId].dailyCount || 0) + 1;
    saveData();

    const count = userPreferences[userId].dailyCount;
    const badge  = count >= 100 ? '🏆' : count >= 50 ? '⭐' : count >= 20 ? '💚' : count >= 10 ? '🌿' : '🌱';

    bot.sendMessage(chatId,
        `📿 *عداد أذكارك اليوم*\n\n${badge} *${count}* ذكر\n\n🌟 استمر على المداومة\n_"أحبُّ الأعمال إلى الله أدومها وإن قلّ"_`,
        { parse_mode: 'Markdown' }
    ).catch(err => console.error("خطأ:", err));
};

// ==================== /reminder_settings ====================
bot.onText(/\/reminder_settings/, (msg) => { showReminderSettings(msg.chat.id); });

const showReminderSettings = (chatId) => {
    trackCommand('reminder_settings');
    bot.sendMessage(chatId, "⚙️ *إعدادات التذكير*\n\nاختر الفترة المناسبة لك:", {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: "⏱ كل 30 دقيقة",         callback_data: 'interval_30min'  }],
                [{ text: "🕐 كل ساعة",              callback_data: 'interval_1hour'  }],
                [{ text: "🕑 كل ساعتين (افتراضي)",  callback_data: 'interval_2hours' }],
                [{ text: "🕒 كل 3 ساعات",           callback_data: 'interval_3hours' }],
                [{ text: "🕕 كل 6 ساعات",           callback_data: 'interval_6hours' }],
                [{ text: "🔙 رجوع للقائمة",          callback_data: 'menu_back'       }]
            ]
        }
    }).catch(err => console.error("خطأ:", err));
};

// ==================== /stats ====================
bot.onText(/\/stats/, (msg) => { showStats(msg.chat.id, msg.from?.id); });

const showStats = (chatId, userId) => {
    trackCommand('stats');
    const p        = userPreferences[userId] || {};
    const label    = intervalLabels[p.reminderInterval] || '🕑 كل ساعتين';
    const isActive = activeChats.includes(chatId);

    bot.sendMessage(chatId,
        `📊 *إحصائياتك*\n\n` +
        `📿 أذكارك اليوم: *${p.dailyCount || 0}*\n` +
        `📅 تاريخ الانضمام: *${p.joinDate ? new Date(p.joinDate).toLocaleDateString('ar-SA') : 'غير محدد'}*\n` +
        `⏰ فترة التذكير: *${label}*\n` +
        `🔔 التذكيرات: *${isActive ? '✅ مفعّلة' : '❌ موقوفة'}*`,
        { parse_mode: 'Markdown' }
    ).catch(err => console.error("خطأ:", err));
};

// ==================== /help ====================
bot.onText(/\/help/, (msg) => { showHelp(msg.chat.id); });

const showHelp = (chatId) => {
    trackCommand('help');
    bot.sendMessage(chatId,
        `❓ *مساعدة بوت نورِفاي*\n\n` +
        `📿 /dhikr — ذكر عشوائي\n` +
        `📊 /daily\\_count — عداد أذكارك اليوم\n` +
        `📚 /library — المكتبة الرقمية\n` +
        `✅ /reminder\\_on — تفعيل التذكيرات\n` +
        `❌ /reminder\\_off — إيقاف التذكيرات\n` +
        `⚙️ /reminder\\_settings — إعدادات التذكير\n` +
        `📈 /stats — إحصائياتك\n` +
        `🏠 /menu — القائمة الرئيسية\n\n` +
        `💬 *للتواصل:* @vx\\_rq`,
        { parse_mode: 'Markdown' }
    ).catch(err => console.error("خطأ:", err));
};

// ==================== /reminder_on ====================
bot.onText(/\/reminder_on/, (msg) => {
    handleReminderOn(msg.chat.id, msg.from?.id, msg.chat.type);
});

const handleReminderOn = (chatId, userId, chatType) => {
    trackCommand('reminder_on');
    if (activeChats.includes(chatId)) {
        return bot.sendMessage(chatId, "🔔 التذكيرات *مفعّلة بالفعل* في هذه المحادثة.", { parse_mode: 'Markdown' })
                  .catch(err => console.error("خطأ:", err));
    }
    activeChats.push(chatId);
    botStats.totalReminders++;
    const interval = (userId && userPreferences[userId]?.reminderInterval) || 'every_2hours';
    startReminder(chatId, interval);
    saveData();

    const isChannel = chatType === 'channel';
    const txt = isChannel
        ? `✅ *تم تفعيل التذكيرات في القناة!* 🎉\n\n📿 سيُرسَل ذكر *${intervalLabels[interval]}*\n\n🤲 اللهم تقبّل منّا`
        : `✅ *تم تفعيل التذكيرات بنجاح!* 🎉\n\n📿 ستصلك أذكار *${intervalLabels[interval]}*\n\n🤲 اللهم تقبّل منّا`;

    bot.sendMessage(chatId, txt, { parse_mode: 'Markdown' }).catch(err => console.error("خطأ:", err));
};

// ==================== /reminder_off ====================
bot.onText(/\/reminder_off/, (msg) => { handleReminderOff(msg.chat.id); });

const handleReminderOff = (chatId) => {
    trackCommand('reminder_off');
    stopReminder(chatId);
    bot.sendMessage(chatId,
        "❌ *تم إيقاف التذكيرات.*\n\nيمكنك إعادة تفعيلها بالضغط على /reminder\\_on",
        { parse_mode: 'Markdown' }
    ).catch(err => console.error("خطأ:", err));
};

// ==================== /library ====================
bot.onText(/\/library/, (msg) => { showLibrary(msg.chat.id); });

const showLibrary = (chatId) => {
    trackCommand('library');
    bot.sendMessage(chatId, "📚 *مكتبة نورِفاي الرقمية*\n\nاختر الكتاب الذي تريد تحميله:", {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: "🌅 أذكار الصباح والمساء", callback_data: 'athkar_morning_evening' }],
                [{ text: "🌙 أذكار النوم",           callback_data: 'athkar_sleep'           }],
                [{ text: "☀️ أذكار الاستيقاظ",      callback_data: 'athkar_wake'            }],
                [{ text: "💰 طرق كسب الثواب",        callback_data: 'easy_thawab'            }],
                [{ text: "📖 القرآن الكريم",          callback_data: 'quran'                  }],
                [{ text: "🛡️ حصن المسلم",            callback_data: 'hisn_muslim'            }],
                [{ text: "🔙 رجوع للقائمة",           callback_data: 'menu_back'              }]
            ]
        }
    }).catch(err => console.error("خطأ:", err));
};

// ==================== إضافة البوت لقناة أو مجموعة ====================
bot.on('my_chat_member', (update) => {
    const chat      = update.chat;
    const newStatus = update.new_chat_member?.status;
    const chatId    = chat.id;
    const chatType  = chat.type;
    const chatTitle = chat.title || '';

    if (newStatus === 'member' || newStatus === 'administrator') {
        const isChannel = chatType === 'channel';

        // تفعيل تلقائي فور إضافة البوت للقناة
        if (isChannel && !activeChats.includes(chatId)) {
            activeChats.push(chatId);
            botStats.totalReminders++;
            startReminder(chatId, 'every_2hours');
            saveData();
        }

        const welcomeMsg = isChannel
            ? `🌿 *السلام عليكم ورحمة الله وبركاته*\n\n` +
              `تم إضافة *بوت نورِفاي* لهذه القناة بنجاح! 🎉\n\n` +
              `✅ *تم تفعيل التذكيرات تلقائياً* 🕑\n` +
              `سيُرسَل ذكر تلقائي *كل ساعتين*\n\n` +
              `⚙️ لتغيير الفترة: /reminder\\_settings\n` +
              `❌ لإيقاف التذكيرات: /reminder\\_off\n\n` +
              `🤲 اللهم اجعل هذه القناة مباركة ونافعة`
            : `🌿 *السلام عليكم ورحمة الله وبركاته*\n\n` +
              `تم إضافة *بوت نورِفاي* لمجموعة *${chatTitle}* بنجاح! 🎉\n\n` +
              `📿 أنا هنا لأذكّركم بذكر الله بشكل دوري\n\n` +
              `✅ لتفعيل التذكيرات: /reminder\\_on\n` +
              `❌ لإيقاف التذكيرات: /reminder\\_off\n` +
              `⚙️ للإعدادات: /reminder\\_settings\n\n` +
              `🤲 اللهم اجعل هذه المجموعة مباركة ونافعة`;

        bot.sendMessage(chatId, welcomeMsg, { parse_mode: 'Markdown' })
           .catch(err => console.error("خطأ في رسالة الترحيب:", err));
    }

    if (newStatus === 'kicked' || newStatus === 'left') {
        stopReminder(chatId);
    }
});

// ==================== معالجة الأزرار ====================
bot.on('callback_query', (query) => {
    const chatId   = query.message.chat.id;
    const userId   = query.from.id;
    const data     = query.data;
    const chatType = query.message.chat.type;

    // ── رجوع للقائمة ──
    if (data === 'menu_back') {
        bot.answerCallbackQuery(query.id).catch(() => {});
        bot.sendMessage(chatId, getWelcomeText(), {
            parse_mode: 'Markdown',
            ...getMainKeyboard()
        }).catch(err => console.error("خطأ:", err));
        return;
    }

    if (data === 'menu_dhikr') {
        bot.answerCallbackQuery(query.id).catch(() => {});
        const dhikr = getRandomDhikr();
        const emoji  = getRandomEmoji();
        bot.sendMessage(chatId,
            `${emoji} *ذكرك الآن:*\n\n✨ _${dhikr}_\n\n🤲 اللهم تقبّل منّا`,
            { parse_mode: 'Markdown' }
        ).catch(err => console.error("خطأ:", err));
        return;
    }

    if (data === 'menu_count') {
        bot.answerCallbackQuery(query.id).catch(() => {});
        handleDailyCount(chatId, userId);
        return;
    }

    if (data === 'menu_library') {
        bot.answerCallbackQuery(query.id).catch(() => {});
        showLibrary(chatId);
        return;
    }

    if (data === 'menu_settings') {
        bot.answerCallbackQuery(query.id).catch(() => {});
        showReminderSettings(chatId);
        return;
    }

    if (data === 'menu_reminder_on') {
        bot.answerCallbackQuery(query.id).catch(() => {});
        handleReminderOn(chatId, userId, chatType);
        return;
    }

    if (data === 'menu_reminder_off') {
        bot.answerCallbackQuery(query.id).catch(() => {});
        handleReminderOff(chatId);
        return;
    }

    if (data === 'menu_stats') {
        bot.answerCallbackQuery(query.id).catch(() => {});
        showStats(chatId, userId);
        return;
    }

    if (data === 'menu_help') {
        bot.answerCallbackQuery(query.id).catch(() => {});
        showHelp(chatId);
        return;
    }

    // ── فترات التذكير ──
    if (data.startsWith('interval_')) {
        const intervalMap = {
            'interval_30min':  'every_30min',
            'interval_1hour':  'every_hour',
            'interval_2hours': 'every_2hours',
            'interval_3hours': 'every_3hours',
            'interval_6hours': 'every_6hours'
        };
        const selected = intervalMap[data] || 'every_2hours';

        if (!userPreferences[userId]) {
            userPreferences[userId] = { reminderInterval: selected, dailyCount: 0, lastReset: new Date().toDateString() };
        } else {
            userPreferences[userId].reminderInterval = selected;
        }

        if (activeIntervals[chatId]) {
            clearInterval(activeIntervals[chatId]);
            delete activeIntervals[chatId];
            startReminder(chatId, selected);
        }
        saveData();

        bot.answerCallbackQuery(query.id, { text: '✅ تم تحديث إعدادات التذكير!' }).catch(() => {});
        bot.sendMessage(chatId,
            `✅ *تم تحديث فترة التذكير إلى: ${intervalLabels[selected]}*\n\n🤲 اللهم وفّقنا لذكرك`,
            { parse_mode: 'Markdown' }
        ).catch(err => console.error("خطأ:", err));
        return;
    }

    // ── ملفات المكتبة ──
    const fileName = filesMap[data];
    if (fileName) {
        const filePath = path.join(__dirname, fileName);
        bot.answerCallbackQuery(query.id, { text: '📤 جاري إرسال الملف...' }).catch(() => {});
        if (fs.existsSync(filePath)) {
            bot.sendChatAction(chatId, 'upload_document').catch(() => {});
            bot.sendDocument(chatId, filePath, {
                caption:    `📚 *${fileName.replace('.pdf', '')}*\n\n🌿 بوت نورِفاي — رفيقك في رحلة الذكر`,
                parse_mode: 'Markdown'
            }).catch(err => {
                console.error("خطأ في إرسال الملف:", err);
                bot.sendMessage(chatId, "⚠️ حدث خطأ في إرسال الملف. حاول مرة أخرى لاحقاً.").catch(() => {});
            });
        } else {
            bot.sendMessage(chatId, "⚠️ الملف غير موجود حالياً.\n\nسيتم إضافته قريباً إن شاء الله.").catch(() => {});
        }
        return;
    }

    bot.answerCallbackQuery(query.id).catch(() => {});
});

// ==================== الرد على الأذكار المكتوبة ====================
bot.on('message', (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;

    const dhikrKeywords = [
        'الحمد لله','سبحان الله','استغفر الله','أستغفر الله',
        'الله أكبر','لا إله إلا الله','لا حول ولا قوة إلا بالله',
        'اللهم صل','يا الله','بسم الله','ماشاء الله','ما شاء الله',
        'تبارك الله','حسبنا الله','توكلت على الله'
    ];

    if (dhikrKeywords.some(kw => msg.text.includes(kw))) {
        const responses = [
            "🤲 تقبّل الله منك وزادك ذكراً وطاعة.",
            "💚 اللهم تقبّل منّا ومنك يا أخي الكريم.",
            "✨ جزاك الله خيراً، الذكر نور القلوب.",
            "🌿 اللهم ارزقنا المداومة على ذكرك.",
            "📿 بارك الله فيك، المداومة على الذكر من أحب الأعمال."
        ];
        bot.sendMessage(msg.chat.id,
            responses[Math.floor(Math.random() * responses.length)],
            { reply_to_message_id: msg.message_id }
        ).catch(err => console.error("خطأ:", err));
    }
});

// ==================== أخطاء الـ polling ====================
bot.on("polling_error", (err) => console.error("❌ Polling Error:", err.message));

console.log("✅ Noorify Bot — v2.1 Running...");
