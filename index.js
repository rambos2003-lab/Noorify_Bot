require('dotenv').config(); 
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// تعطيل تحذير deprecation
process.noDeprecation = true;

const token = process.env.TELEGRAM_BOT_TOKEN; 

if (!token) {
    console.error("خطأ: لم يتم العثور على TELEGRAM_BOT_TOKEN.");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const DATA_FILE = path.join(__dirname, 'reminders_data.json');
const STATS_FILE = path.join(__dirname, 'bot_stats.json');
const USER_PREFS_FILE = path.join(__dirname, 'user_preferences.json');

let activeChats = [];
let botStats = { totalUsers: 0, totalReminders: 0, commandsUsed: {} };
let userPreferences = {};

// تحميل البيانات
const loadData = () => {
    if (fs.existsSync(DATA_FILE)) {
        try {
            activeChats = JSON.parse(fs.readFileSync(DATA_FILE));
        } catch (e) {
            activeChats = [];
        }
    }
    
    if (fs.existsSync(STATS_FILE)) {
        try {
            botStats = JSON.parse(fs.readFileSync(STATS_FILE));
        } catch (e) {
            botStats = { totalUsers: 0, totalReminders: 0, commandsUsed: {} };
        }
    }
    
    if (fs.existsSync(USER_PREFS_FILE)) {
        try {
            userPreferences = JSON.parse(fs.readFileSync(USER_PREFS_FILE));
        } catch (e) {
            userPreferences = {};
        }
    }
};

loadData();

const activeIntervals = {};

const saveData = () => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(activeChats));
        fs.writeFileSync(STATS_FILE, JSON.stringify(botStats));
        fs.writeFileSync(USER_PREFS_FILE, JSON.stringify(userPreferences));
    } catch (e) {
        console.error("خطأ في حفظ البيانات:", e);
    }
};

// تسجيل استخدام الأوامر
const trackCommand = (command) => {
    botStats.commandsUsed[command] = (botStats.commandsUsed[command] || 0) + 1;
    saveData();
};

const filesMap = {
    'athkar_morning_evening': 'أذكار الصباح و المساء.pdf',
    'athkar_sleep': 'اذكار النوم.pdf',
    'athkar_wake': 'اذكار الإستيقاظ.pdf',
    'easy_thawab': 'اسهل طرق لكسب الثواب.pdf',
    'quran': 'القرآن الكريم.pdf',
    'hisn_muslim': 'حصن المسلم.pdf'
};

const athkarList = [
    "سبحان الله وبحمده", "الحمد لله", "لا إله إلا الله", "الله أكبر", "أستغفر الله",
    "لا حول ولا قوة إلا بالله", "سبحان الله وبحمده سبحان الله العظيم",
    "اللهم صل على محمد وعلى آل محمد", "أستغفر الله العظيم وأتوب إليه",
    "لا إله إلا أنت سبحانك إني كنت من الظالمين",
    "يا حي يا قيوم برحمتك أستغيث", "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم",
    "سبحان الله والحمد لله ولا إله إلا الله والله أكبر",
    "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير",
    "اللهم أعني على ذكرك وشكرك وحسن عبادتك",
    "يا مقلب القلوب ثبت قلبي على دينك", "يا مصرف القلوب صرف قلوبنا على طاعتك",
    "اللهم إني أسألك علما نافعا ورزقا طيبا وعملا متقبلا",
    "اللهم اغفر لي ولوالدي وللمؤمنين والمؤمنات",
    "رب اغفر لي وتب علي إنك أنت التواب الرحيم",
    "اللهم صل وسلم على نبينا محمد", "رضيت بالله ربا وبالإسلام دينا وبمحمد نبيا",
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

const getRandomDhikr = () => athkarList[Math.floor(Math.random() * athkarList.length)];

// اختيار فترة التذكير
const reminderIntervals = {
    'every_hour': 3600000,      // كل ساعة
    'every_30min': 1800000,     // كل 30 دقيقة
    'every_3hours': 10800000,   // كل 3 ساعات
    'every_6hours': 21600000    // كل 6 ساعات
};

const startReminder = (chatId, interval = 'every_hour') => {
    if (activeIntervals[chatId]) return;
    
    const intervalTime = reminderIntervals[interval] || reminderIntervals['every_hour'];
    
    activeIntervals[chatId] = setInterval(() => {
        const dhikr = getRandomDhikr();
        const message = `تذكيرك الدوري:\n\n${dhikr}`;
        bot.sendMessage(chatId, message)
            .catch(err => {
                console.error("خطأ في الإرسال:", err);
                stopReminder(chatId);
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

activeChats.forEach(chatId => startReminder(chatId));

// ==================== الأوامر ====================

// /start - الترحيب
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    trackCommand('start');
    
    // تسجيل المستخدم الجديد
    if (!userPreferences[userId]) {
        userPreferences[userId] = {
            joinDate: new Date().toISOString(),
            reminderInterval: 'every_hour',
            language: 'ar'
        };
        botStats.totalUsers++;
        saveData();
    }
    
    const welcomeText = "السلام عليكم ورحمة الله وبركاته\n\nأهلاً بك في بوت Noorify\nرفيقك في رحلة المداومة على ذكر الله";
    
    bot.sendMessage(chatId, welcomeText).then(() => {
        const menuText = "القائمة الرئيسية:\n\n/dhikr - ذكر عشوائي الآن\n/daily_count - عدد الأذكار اليومية\n/library - المكتبة الرقمية\n/reminder_on - تفعيل التذكيرات\n/reminder_off - إيقاف التذكيرات\n/reminder_settings - إعدادات التذكير\n/stats - إحصائياتك\n/help - مساعدة";
        return bot.sendMessage(chatId, menuText);
    }).then(() => {
        const infoText = "نصيحة: أضف البوت لمجموعاتك لنشر الخير\n\nنسأل الله أن يجعل هذا العمل خالصاً لوجهه الكريم\n\nللتواصل: @vx_rq";
        return bot.sendMessage(chatId, infoText);
    }).catch(err => {
        console.error("خطأ في رسائل start:", err);
    });
});

// /dhikr - ذكر عشوائي
bot.onText(/\/dhikr/, (msg) => {
    trackCommand('dhikr');
    const dhikr = getRandomDhikr();
    const message = `ذكرك اليوم:\n\n${dhikr}`;
    bot.sendMessage(msg.chat.id, message).catch(err => {
        console.error("خطأ في رسالة dhikr:", err);
    });
});

// /daily_count - عداد الأذكار اليومية
bot.onText(/\/daily_count/, (msg) => {
    trackCommand('daily_count');
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    if (!userPreferences[userId]) {
        userPreferences[userId] = { dailyCount: 0, lastReset: new Date().toDateString() };
    }
    
    const today = new Date().toDateString();
    if (userPreferences[userId].lastReset !== today) {
        userPreferences[userId].dailyCount = 0;
        userPreferences[userId].lastReset = today;
    }
    
    userPreferences[userId].dailyCount++;
    saveData();
    
    const countText = `عدد أذكارك اليوم: ${userPreferences[userId].dailyCount}\n\nاستمر على المداومة!`;
    bot.sendMessage(chatId, countText).catch(err => {
        console.error("خطأ:", err);
    });
});

// /reminder_settings - إعدادات التذكير
bot.onText(/\/reminder_settings/, (msg) => {
    trackCommand('reminder_settings');
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, "اختر فترة التذكير:", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "كل 30 دقيقة", callback_data: 'interval_30min' }],
                [{ text: "كل ساعة", callback_data: 'interval_1hour' }],
                [{ text: "كل 3 ساعات", callback_data: 'interval_3hours' }],
                [{ text: "كل 6 ساعات", callback_data: 'interval_6hours' }]
            ]
        }
    }).catch(err => {
        console.error("خطأ:", err);
    });
});

// /stats - إحصائيات
bot.onText(/\/stats/, (msg) => {
    trackCommand('stats');
    const userId = msg.from.id;
    const userPref = userPreferences[userId] || {};
    
    const statsText = `إحصائياتك:\n\nعدد الأذكار اليوم: ${userPref.dailyCount || 0}\nتاريخ الانضمام: ${userPref.joinDate ? new Date(userPref.joinDate).toLocaleDateString('ar') : 'غير محدد'}\nفترة التذكير: ${userPref.reminderInterval === 'every_hour' ? 'كل ساعة' : userPref.reminderInterval || 'افتراضي'}`;
    
    bot.sendMessage(msg.chat.id, statsText).catch(err => {
        console.error("خطأ:", err);
    });
});

// /help - مساعدة
bot.onText(/\/help/, (msg) => {
    trackCommand('help');
    const helpText = `مساعدة البوت:\n\n/dhikr - احصل على ذكر عشوائي\n/daily_count - احسب أذكارك اليوم\n/library - تحميل الملفات\n/reminder_on - فعل التذكيرات\n/reminder_off - أوقف التذكيرات\n/reminder_settings - اختر فترة التذكير\n/stats - شوف إحصائياتك\n/help - هذه الرسالة`;
    
    bot.sendMessage(msg.chat.id, helpText).catch(err => {
        console.error("خطأ:", err);
    });
});

// /reminder_on - تفعيل التذكيرات
bot.onText(/\/reminder_on/, (msg) => {
    trackCommand('reminder_on');
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    if (activeChats.includes(chatId)) {
        return bot.sendMessage(chatId, "التذكيرات مفعلة بالفعل.").catch(err => {
            console.error("خطأ:", err);
        });
    }
    
    activeChats.push(chatId);
    botStats.totalReminders++;
    
    const interval = userPreferences[userId]?.reminderInterval || 'every_hour';
    startReminder(chatId, interval);
    saveData();
    
    bot.sendMessage(chatId, "تم تفعيل التذكير الآلي بنجاح!").catch(err => {
        console.error("خطأ:", err);
    });
});

// /reminder_off - إيقاف التذكيرات
bot.onText(/\/reminder_off/, (msg) => {
    trackCommand('reminder_off');
    stopReminder(msg.chat.id);
    bot.sendMessage(msg.chat.id, "تم إيقاف التذكير الآلي.").catch(err => {
        console.error("خطأ:", err);
    });
});

// /library - المكتبة
bot.onText(/\/library/, (msg) => {
    trackCommand('library');
    const libraryText = "مكتبة Noorify الرقمية\n\nاختر الكتاب:";
    bot.sendMessage(msg.chat.id, libraryText, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "أذكار الصباح والمساء", callback_data: 'athkar_morning_evening' }],
                [{ text: "أذكار النوم", callback_data: 'athkar_sleep' }],
                [{ text: "أذكار الاستيقاظ", callback_data: 'athkar_wake' }],
                [{ text: "طرق كسب الثواب", callback_data: 'easy_thawab' }],
                [{ text: "القرآن الكريم", callback_data: 'quran' }],
                [{ text: "حصن المسلم", callback_data: 'hisn_muslim' }]
            ]
        }
    }).catch(err => {
        console.error("خطأ:", err);
    });
});

// معالجة الأزرار
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;

    // معالجة فترات التذكير
    if (data.startsWith('interval_')) {
        const intervalMap = {
            'interval_30min': 'every_30min',
            'interval_1hour': 'every_hour',
            'interval_3hours': 'every_3hours',
            'interval_6hours': 'every_6hours'
        };
        
        if (userPreferences[userId]) {
            userPreferences[userId].reminderInterval = intervalMap[data];
        }
        
        if (activeIntervals[chatId]) {
            stopReminder(chatId);
            startReminder(chatId, intervalMap[data]);
        }
        
        saveData();
        bot.answerCallbackQuery(query.id, { text: 'تم تحديث الإعدادات!' }).catch(err => {
            console.error("خطأ:", err);
        });
        return;
    }

    // معالجة الملفات
    const fileKey = data;
    const fileName = filesMap[fileKey];

    if (fileName) {
        const filePath = path.join(__dirname, fileName);
        if (fs.existsSync(filePath)) {
            bot.sendChatAction(chatId, 'upload_document');
            bot.sendDocument(chatId, filePath).catch(err => {
                console.error("خطأ في إرسال الملف:", err);
                bot.sendMessage(chatId, "حدث خطأ في إرسال الملف. حاول لاحقاً.").catch(e => {
                    console.error("خطأ:", e);
                });
            });
        } else {
            bot.sendMessage(chatId, "الملف غير موجود حالياً على السيرفر.").catch(err => {
                console.error("خطأ:", err);
            });
        }
    }
    
    bot.answerCallbackQuery(query.id).catch(err => {
        console.error("خطأ:", err);
    });
});

// الرد على الأذكار التي يكتبها المستخدم
bot.on('message', (msg) => {
    if (msg.text && !msg.text.startsWith('/')) {
        const text = msg.text;
        if (text.includes('الحمد لله') || text.includes('سبحان الله') || text.includes('استغفر الله')) {
            bot.sendMessage(msg.chat.id, "تقبل الله منك وزادك ذكراً وطاعة.", { reply_to_message_id: msg.message_id }).catch(err => {
                console.error("خطأ:", err);
            });
        }
    }
});

bot.on("polling_error", (err) => console.log("Polling Error:", err.message));

console.log("Noorify Bot is alive and running... [Professional Version]");
