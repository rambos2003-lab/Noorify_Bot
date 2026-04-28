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

const DATA_FILE = path.join(__dirname, 'reminders_data.json');
const STATS_FILE = path.join(__dirname, 'bot_stats.json');
const USER_PREFS_FILE = path.join(__dirname, 'user_preferences.json');

let activeChats = [];
let botStats = { totalUsers: 0, totalReminders: 0, commandsUsed: {} };
let userPreferences = {};

const loadData = () => {
    if (fs.existsSync(DATA_FILE)) {
        try { activeChats = JSON.parse(fs.readFileSync(DATA_FILE)); }
        catch (e) { activeChats = []; }
    }
    if (fs.existsSync(STATS_FILE)) {
        try { botStats = JSON.parse(fs.readFileSync(STATS_FILE)); }
        catch (e) { botStats = { totalUsers: 0, totalReminders: 0, commandsUsed: {} }; }
    }
    if (fs.existsSync(USER_PREFS_FILE)) {
        try { userPreferences = JSON.parse(fs.readFileSync(USER_PREFS_FILE)); }
        catch (e) { userPreferences = {}; }
    }
};

loadData();

const activeIntervals = {};

const saveData = () => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(activeChats, null, 2));
        fs.writeFileSync(STATS_FILE, JSON.stringify(botStats, null, 2));
        fs.writeFileSync(USER_PREFS_FILE, JSON.stringify(userPreferences, null, 2));
    } catch (e) {
        console.error("خطأ في حفظ البيانات:", e);
    }
};

const trackCommand = (command) => {
    botStats.commandsUsed[command] = (botStats.commandsUsed[command] || 0) + 1;
    saveData();
};

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

const dhikrEmojis = ["☀️", "🌿", "💚", "✨", "🌙", "🕌", "📿", "🌸", "💫", "🤲"];
const getRandomEmoji = () => dhikrEmojis[Math.floor(Math.random() * dhikrEmojis.length)];
const getRandomDhikr = () => athkarList[Math.floor(Math.random() * athkarList.length)];

const filesMap = {
    'athkar_morning_evening': 'أذكار الصباح و المساء.pdf',
    'athkar_sleep': 'اذكار النوم.pdf',
    'athkar_wake': 'اذكار الإستيقاظ.pdf',
    'easy_thawab': 'اسهل طرق لكسب الثواب.pdf',
    'quran': 'القرآن الكريم.pdf',
    'hisn_muslim': 'حصن المسلم.pdf'
};

const reminderIntervals = {
    'every_30min': 1800000,
    'every_hour': 3600000,
    'every_3hours': 10800000,
    'every_6hours': 21600000
};

const intervalLabels = {
    'every_30min': '⏱ كل 30 دقيقة',
    'every_hour': '🕐 كل ساعة',
    'every_3hours': '🕒 كل 3 ساعات',
    'every_6hours': '🕕 كل 6 ساعات'
};

const startReminder = (chatId, interval = 'every_hour') => {
    if (activeIntervals[chatId]) return;

    const intervalTime = reminderIntervals[interval] || reminderIntervals['every_hour'];

    activeIntervals[chatId] = setInterval(() => {
        const dhikr = getRandomDhikr();
        const emoji = getRandomEmoji();
        const message = `${emoji} *تذكير الذكر*\n\n✨ _${dhikr}_\n\n🤲 تقبّل الله منّا ومنكم`;
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
            .catch(err => {
                console.error("خطأ في إرسال التذكير:", err.message);
                if (err.message && (
                    err.message.includes('bot was kicked') ||
                    err.message.includes('chat not found') ||
                    err.message.includes('Forbidden') ||
                    err.message.includes('bot was blocked')
                )) {
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

// استعادة التذكيرات عند تشغيل البوت
activeChats.forEach(chatId => {
    const chatIdStr = String(chatId);
    // محاولة استرداد الإعداد المناسب
    let interval = 'every_hour';
    // إيجاد المستخدم المرتبط بهذه المحادثة (مجموعة أو خاص)
    for (const uid in userPreferences) {
        if (userPreferences[uid].chatId === chatId) {
            interval = userPreferences[uid].reminderInterval || 'every_hour';
            break;
        }
    }
    startReminder(chatId, interval);
});

const getWelcomeText = (firstName) => {
    const dhikr = getRandomDhikr();
    const emoji = getRandomEmoji();
    return `🌿 *السلام عليكم ورحمة الله وبركاته*

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
👨‍💻 *المطوِّر:* @vx\\_rq`;
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const firstName = msg.from?.first_name || 'أخي';

    trackCommand('start');

    if (userId && !userPreferences[userId]) {
        userPreferences[userId] = {
            joinDate: new Date().toISOString(),
            reminderInterval: 'every_hour',
            chatId: chatId,
            language: 'ar',
            dailyCount: 0,
            lastReset: new Date().toDateString()
        };
        botStats.totalUsers++;
        saveData();
    }

    const welcomeText = getWelcomeText(firstName);

    bot.sendMessage(chatId, welcomeText, {
        parse_mode: 'Markdown',
        ...mainMenu
    }).catch(err => {
        console.error("خطأ في رسالة start:", err);
    });
});

bot.onText(/\/menu/, (msg) => {
    trackCommand('menu');
    bot.sendMessage(msg.chat.id, "🌿 *القائمة الرئيسية* — اختر ما تريد:", {
        parse_mode: 'Markdown',
        ...mainMenu
    }).catch(err => console.error("خطأ:", err));
});

bot.onText(/\/dhikr/, (msg) => {
    trackCommand('dhikr');
    const dhikr = getRandomDhikr();
    const emoji = getRandomEmoji();
    const message = `${emoji} *ذكرك الآن:*\n\n✨ _${dhikr}_\n\n🤲 اللهم تقبّل منّا`;
    bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' }).catch(err => {
        console.error("خطأ:", err);
    });
});

bot.onText(/\/daily_count/, (msg) => {
    handleDailyCount(msg.chat.id, msg.from?.id);
});

const handleDailyCount = (chatId, userId) => {
    trackCommand('daily_count');

    if (!userId) return;

    if (!userPreferences[userId]) {
        userPreferences[userId] = { dailyCount: 0, lastReset: new Date().toDateString() };
    }

    const today = new Date().toDateString();
    if (userPreferences[userId].lastReset !== today) {
        userPreferences[userId].dailyCount = 0;
        userPreferences[userId].lastReset = today;
    }

    userPreferences[userId].dailyCount = (userPreferences[userId].dailyCount || 0) + 1;
    saveData();

    const count = userPreferences[userId].dailyCount;
    let badge = '🌱';
    if (count >= 100) badge = '🏆';
    else if (count >= 50) badge = '⭐';
    else if (count >= 20) badge = '💚';
    else if (count >= 10) badge = '🌿';

    const countText = `📿 *عداد أذكارك اليوم*\n\n${badge} *${count}* ذكر\n\n🌟 استمر على المداومة، فـ\n_"أحبُّ الأعمال إلى الله أدومها وإن قلّ"_`;
    bot.sendMessage(chatId, countText, { parse_mode: 'Markdown' }).catch(err => {
        console.error("خطأ:", err);
    });
};

bot.onText(/\/reminder_settings/, (msg) => {
    showReminderSettings(msg.chat.id);
});

const showReminderSettings = (chatId) => {
    trackCommand('reminder_settings');
    bot.sendMessage(chatId, "⚙️ *إعدادات التذكير*\n\nاختر الفترة المناسبة لك:", {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: "⏱ كل 30 دقيقة", callback_data: 'interval_30min' }],
                [{ text: "🕐 كل ساعة (موصى به)", callback_data: 'interval_1hour' }],
                [{ text: "🕒 كل 3 ساعات", callback_data: 'interval_3hours' }],
                [{ text: "🕕 كل 6 ساعات", callback_data: 'interval_6hours' }],
                [{ text: "🔙 رجوع للقائمة", callback_data: 'menu_back' }]
            ]
        }
    }).catch(err => console.error("خطأ:", err));
};

bot.onText(/\/stats/, (msg) => {
    showStats(msg.chat.id, msg.from?.id);
});

const showStats = (chatId, userId) => {
    trackCommand('stats');
    const userPref = userPreferences[userId] || {};
    const intervalLabel = intervalLabels[userPref.reminderInterval] || '🕐 كل ساعة';
    const isActive = activeChats.includes(chatId);

    const statsText = `📊 *إحصائياتك*\n\n` +
        `📿 أذكارك اليوم: *${userPref.dailyCount || 0}*\n` +
        `📅 تاريخ الانضمام: *${userPref.joinDate ? new Date(userPref.joinDate).toLocaleDateString('ar-SA') : 'غير محدد'}*\n` +
        `⏰ فترة التذكير: *${intervalLabel}*\n` +
        `🔔 التذكيرات: *${isActive ? '✅ مفعّلة' : '❌ موقوفة'}*`;

    bot.sendMessage(chatId, statsText, { parse_mode: 'Markdown' }).catch(err => {
        console.error("خطأ:", err);
    });
};

bot.onText(/\/help/, (msg) => {
    showHelp(msg.chat.id);
});

const showHelp = (chatId) => {
    trackCommand('help');
    const helpText = `❓ *مساعدة بوت نورِفاي*\n\n` +
        `📿 /dhikr — ذكر عشوائي\n` +
        `📊 /daily\\_count — عداد أذكارك اليوم\n` +
        `📚 /library — المكتبة الرقمية\n` +
        `✅ /reminder\\_on — تفعيل التذكيرات\n` +
        `❌ /reminder\\_off — إيقاف التذكيرات\n` +
        `⚙️ /reminder\\_settings — إعدادات التذكير\n` +
        `📈 /stats — إحصائياتك\n` +
        `🏠 /menu — القائمة الرئيسية\n` +
        `❓ /help — هذه الرسالة\n\n` +
        `💬 *للتواصل:* @vx\\_rq`;

    bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' }).catch(err => {
        console.error("خطأ:", err);
    });
};

bot.onText(/\/reminder_on/, (msg) => {
    handleReminderOn(msg.chat.id, msg.from?.id, msg.chat.type);
});

const handleReminderOn = (chatId, userId, chatType) => {
    trackCommand('reminder_on');

    if (activeChats.includes(chatId)) {
        return bot.sendMessage(chatId, "🔔 التذكيرات مفعّلة بالفعل في هذه المحادثة.", { parse_mode: 'Markdown' })
            .catch(err => console.error("خطأ:", err));
    }

    activeChats.push(chatId);
    botStats.totalReminders++;

    let interval = 'every_hour';
    if (userId && userPreferences[userId]) {
        interval = userPreferences[userId].reminderInterval || 'every_hour';
    }

    startReminder(chatId, interval);
    saveData();

    const isGroup = chatType === 'group' || chatType === 'supergroup' || chatType === 'channel';
    const successMsg = isGroup
        ? `✅ *تم تفعيل تذكيرات الأذكار في هذه المجموعة بنجاح!* 🎉\n\n📿 سيتم إرسال ذكر تلقائي *${intervalLabels[interval]}*\n\n🤲 اللهم تقبّل منّا`
        : `✅ *تم تفعيل التذكيرات بنجاح!* 🎉\n\n📿 ستصلك أذكار تلقائية *${intervalLabels[interval]}*\n\n🤲 اللهم تقبّل منّا`;

    bot.sendMessage(chatId, successMsg, { parse_mode: 'Markdown' }).catch(err => {
        console.error("خطأ:", err);
    });
};

bot.onText(/\/reminder_off/, (msg) => {
    handleReminderOff(msg.chat.id);
});

const handleReminderOff = (chatId) => {
    trackCommand('reminder_off');
    stopReminder(chatId);
    bot.sendMessage(chatId, "❌ *تم إيقاف التذكيرات.*\n\nيمكنك إعادة تفعيلها في أي وقت بالضغط على /reminder\\_on", {
        parse_mode: 'Markdown'
    }).catch(err => console.error("خطأ:", err));
};

bot.onText(/\/library/, (msg) => {
    showLibrary(msg.chat.id);
});

const showLibrary = (chatId) => {
    trackCommand('library');
    const libraryText = `📚 *مكتبة نورِفاي الرقمية*\n\nاختر الكتاب الذي تريد تحميله:`;
    bot.sendMessage(chatId, libraryText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: "🌅 أذكار الصباح والمساء", callback_data: 'athkar_morning_evening' }],
                [{ text: "🌙 أذكار النوم", callback_data: 'athkar_sleep' }],
                [{ text: "☀️ أذكار الاستيقاظ", callback_data: 'athkar_wake' }],
                [{ text: "💰 طرق كسب الثواب", callback_data: 'easy_thawab' }],
                [{ text: "📖 القرآن الكريم", callback_data: 'quran' }],
                [{ text: "🛡️ حصن المسلم", callback_data: 'hisn_muslim' }],
                [{ text: "🔙 رجوع للقائمة", callback_data: 'menu_back' }]
            ]
        }
    }).catch(err => console.error("خطأ:", err));
};

bot.on('my_chat_member', (update) => {
    const chat = update.chat;
    const newStatus = update.new_chat_member?.status;
    const chatId = chat.id;
    const chatType = chat.type;
    const chatTitle = chat.title || 'المجموعة';

    if (newStatus === 'member' || newStatus === 'administrator') {
        const isChannel = chatType === 'channel';
        const welcomeMsg = isChannel
            ? `🌿 *السلام عليكم ورحمة الله وبركاته*\n\n` +
              `تم إضافة *بوت نورِفاي* لهذه القناة بنجاح! 🎉\n\n` +
              `📿 يمكنكم الآن تفعيل التذكيرات الدورية بالأذكار عبر أمر:\n/reminder\\_on\n\n` +
              `🤲 اللهم اجعل هذا القناة مباركة ونافعة`
            : `🌿 *السلام عليكم ورحمة الله وبركاته*\n\n` +
              `تم إضافة *بوت نورِفاي* لمجموعة *${chatTitle}* بنجاح! 🎉\n\n` +
              `📿 أنا هنا لأذكّركم بذكر الله بشكل دوري\n\n` +
              `✅ لتفعيل التذكيرات: /reminder\\_on\n` +
              `❌ لإيقاف التذكيرات: /reminder\\_off\n` +
              `⚙️ للإعدادات: /reminder\\_settings\n\n` +
              `🤲 اللهم اجعل هذه المجموعة مباركة ونافعة`;

        bot.sendMessage(chatId, welcomeMsg, { parse_mode: 'Markdown' }).catch(err => {
            console.error("خطأ في رسالة الترحيب بالمجموعة:", err);
        });
    }

    if (newStatus === 'kicked' || newStatus === 'left') {
        stopReminder(chatId);
    }
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;
    const chatType = query.message.chat.type;

    if (data === 'menu_back') {
        bot.answerCallbackQuery(query.id).catch(() => {});
        bot.sendMessage(chatId, "🌿 *القائمة الرئيسية:*", {
            parse_mode: 'Markdown',
            ...mainMenu
        }).catch(err => console.error("خطأ:", err));
        return;
    }

    if (data === 'menu_dhikr') {
        bot.answerCallbackQuery(query.id).catch(() => {});
        const dhikr = getRandomDhikr();
        const emoji = getRandomEmoji();
        bot.sendMessage(chatId, `${emoji} *ذكرك الآن:*\n\n✨ _${dhikr}_\n\n🤲 اللهم تقبّل منّا`, {
            parse_mode: 'Markdown'
        }).catch(err => console.error("خطأ:", err));
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

    if (data.startsWith('interval_')) {
        const intervalMap = {
            'interval_30min': 'every_30min',
            'interval_1hour': 'every_hour',
            'interval_3hours': 'every_3hours',
            'interval_6hours': 'every_6hours'
        };

        const selectedInterval = intervalMap[data];

        if (!userPreferences[userId]) {
            userPreferences[userId] = { reminderInterval: selectedInterval, dailyCount: 0, lastReset: new Date().toDateString() };
        } else {
            userPreferences[userId].reminderInterval = selectedInterval;
        }

        if (activeIntervals[chatId]) {
            clearInterval(activeIntervals[chatId]);
            delete activeIntervals[chatId];
            startReminder(chatId, selectedInterval);
        }

        saveData();

        bot.answerCallbackQuery(query.id, { text: '✅ تم تحديث إعدادات التذكير!' }).catch(() => {});
        bot.sendMessage(chatId, `✅ *تم تحديث فترة التذكير إلى: ${intervalLabels[selectedInterval]}*\n\n🤲 اللهم وفّقنا لذكرك`, {
            parse_mode: 'Markdown'
        }).catch(err => console.error("خطأ:", err));
        return;
    }

    const fileName = filesMap[data];
    if (fileName) {
        const filePath = path.join(__dirname, fileName);
        bot.answerCallbackQuery(query.id, { text: '📤 جاري إرسال الملف...' }).catch(() => {});
        if (fs.existsSync(filePath)) {
            bot.sendChatAction(chatId, 'upload_document').catch(() => {});
            bot.sendDocument(chatId, filePath, {
                caption: `📚 *${fileName.replace('.pdf', '')}*\n\n🌿 بوت نورِفاي — رفيقك في رحلة الذكر`,
                parse_mode: 'Markdown'
            }).catch(err => {
                console.error("خطأ في إرسال الملف:", err);
                bot.sendMessage(chatId, "⚠️ حدث خطأ في إرسال الملف. حاول مرة أخرى لاحقاً.").catch(() => {});
            });
        } else {
            bot.sendMessage(chatId, "⚠️ الملف غير موجود حالياً على السيرفر.\n\nسيتم إضافته قريباً إن شاء الله.").catch(() => {});
        }
        return;
    }

    bot.answerCallbackQuery(query.id).catch(() => {});
});

bot.on('message', (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;

    const text = msg.text;
    const dhikrKeywords = [
        'الحمد لله', 'سبحان الله', 'استغفر الله', 'أستغفر الله',
        'الله أكبر', 'لا إله إلا الله', 'لا حول ولا قوة إلا بالله',
        'اللهم صل', 'يا الله', 'بسم الله', 'ماشاء الله', 'ما شاء الله',
        'تبارك الله', 'حسبنا الله', 'توكلت على الله'
    ];

    const containsDhikr = dhikrKeywords.some(kw => text.includes(kw));

    if (containsDhikr) {
        const responses = [
            "🤲 تقبّل الله منك وزادك ذكراً وطاعة.",
            "💚 اللهم تقبّل منّا ومنك يا أخي الكريم.",
            "✨ جزاك الله خيراً، استمر على الذكر فهو نور القلوب.",
            "🌿 اللهم ارزقنا المداومة على ذكرك.",
            "📿 بارك الله فيك، المداومة على الذكر من أحب الأعمال."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        bot.sendMessage(msg.chat.id, randomResponse, {
            reply_to_message_id: msg.message_id,
            parse_mode: 'Markdown'
        }).catch(err => console.error("خطأ:", err));
    }
});

bot.on("polling_error", (err) => {
    console.error("❌ Polling Error:", err.message);
});

console.log("✅ Noorify Bot is alive and running... [v2.0 — Enhanced Edition]");
