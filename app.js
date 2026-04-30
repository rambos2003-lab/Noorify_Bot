require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

process.noDeprecation = true;
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) { 
    console.error('TELEGRAM_BOT_TOKEN missing'); 
    process.exit(1); 
}

const bot = new TelegramBot(token, { polling: true });

// ==================== 1. DATA PERSISTENCE ====================
const DATA_FILE       = path.join(__dirname, 'reminders_data.json');
const STATS_FILE      = path.join(__dirname, 'bot_stats.json');
const USER_PREFS_FILE = path.join(__dirname, 'user_preferences.json');
const TASBIH_FILE     = path.join(__dirname, 'tasbih_data.json');

let activeChats     = [];
let botStats        = { totalUsers: 0, totalReminders: 0, commandsUsed: {} };
let userPreferences = {};
let tasbihData      = {};

const loadData = () => {
    const load = (file, def) => { try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : def; } catch { return def; } };
    activeChats     = load(DATA_FILE, []);
    botStats        = load(STATS_FILE, { totalUsers: 0, totalReminders: 0, commandsUsed: {} });
    userPreferences = load(USER_PREFS_FILE, {});
    tasbihData      = load(TASBIH_FILE, {});
};

const saveData = () => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(activeChats, null, 2));
    fs.writeFileSync(STATS_FILE, JSON.stringify(botStats, null, 2));
    fs.writeFileSync(USER_PREFS_FILE, JSON.stringify(userPreferences, null, 2));
    fs.writeFileSync(TASBIH_FILE, JSON.stringify(tasbihData, null, 2));
};

loadData();

// ==================== 2. SMART DHIKR ALGORITHM DATA ====================
const dhikrPool = [
    // أذكار نبوية مشهورة
    "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ",
    "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    "اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
    "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ نَبِيِّنَا مُحَمَّدٍ",
    "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    // آيات قرآنية (من القائمة المرفقة)
    "﴿رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ﴾",
    "﴿رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ﴾",
    "﴿رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا﴾",
    "﴿إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾",
    "﴿رَبِّ زِدْنِي عِلْمًا﴾",
    "﴿رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنْكَ رَحْمَةً﴾",
    "﴿رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي﴾",
    "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ﴾",
    "﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾",
    // أدعية جامعة
    "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ",
    "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    "اللَّهُمَّ طَهِّرْ قَلْبِي مِنَ النِّفَاقِ، وَعَمَلِي مِنَ الرِّيَاءِ، وَلِسَانِي مِنَ الْكَذِبِ",
    "اللَّهُمَّ اجْعَلْ خَيْرَ عُمْرِي آخِرَهُ، وَخَيْرَ عَمَلِي خَوَاتِيمَهُ، وَخَيْرَ أَيَّامِي يَوْمَ أَلْقَاكَ فِيهِ"
];

const acceptMessages = [
    "اللهم تقبل منا ومنكم صالح الأعمال ✨",
    "تقبل الله طاعتك وزادك نوراً 🌟",
    "بارك الله في ذكرك، اللهم آمين 🤲",
    "اللهم اجعلنا من الذاكرين الشاكرين 🕊️",
    "جزاك الله خيراً، ضاعف الله أجرك 💎"
];

const filesMap = {
    'hisn':     { name: 'حصن المسلم', file: 'حصن المسلم.pdf' },
    'quran':    { name: 'القرآن الكريم', file: 'القرآن الكريم.pdf' },
    'morning':  { name: 'أذكار الصباح والمساء', file: 'أذكار الصباح و المساء.pdf' },
    'sleep':    { name: 'أذكار النوم', file: 'اذكار النوم.pdf' },
    'wake':     { name: 'أذكار الاستيقاظ', file: 'اذكار الإستيقاظ.pdf' },
    'reward':   { name: 'أسهل طرق لكسب الثواب', file: 'اسهل طرق لكسب الثواب.pdf' },
    'jawami':   { name: 'جوامع دعاء النبي', file: 'جوامع دعاء النبي.pdf' },
    'salihin':  { name: 'رياض الصالحين', file: 'رياض الصالحين.pdf' },
    'medicine': { name: 'كتاب الداء والدواء', file: 'كتاب الداء والدواء.pdf' }
};

const reminderIntervals = {
    'every_30min':  30 * 60 * 1000,
    'every_hour':   60 * 60 * 1000,
    'every_2hours': 2 * 60 * 60 * 1000,
    'every_3hours': 3 * 60 * 60 * 1000,
    'every_6hours': 6 * 60 * 60 * 1000
};

const activeIntervals = {};

// ==================== 3. HELPER FUNCTIONS ====================
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const trackCommand = (cmd) => {
    botStats.commandsUsed[cmd] = (botStats.commandsUsed[cmd] || 0) + 1;
    saveData();
};

const initUser = (userId, chatId) => {
    if (!userPreferences[userId]) {
        userPreferences[userId] = {
            joinDate: new Date().toISOString(),
            reminderInterval: 'every_2hours',
            chatId, totalDhikr: 0
        };
        botStats.totalUsers++;
        saveData();
    }
};

const sendFile = async (chatId, fileKey) => {
    const info = filesMap[fileKey];
    if (!info) return;
    const localPath = path.join(__dirname, info.file);
    await bot.sendChatAction(chatId, 'upload_document');
    if (fs.existsSync(localPath)) {
        await bot.sendDocument(chatId, localPath, {
            caption: `*${info.name}*\n\nتم الإرسال بواسطة بوت نورِفاي 🕌`,
            parse_mode: 'Markdown'
        });
    } else {
        bot.sendMessage(chatId, `❌ عذراً، الملف *${info.name}* غير موجود حالياً.\nتأكد من وجود الملف باسم: \`${info.file}\` في مستودع GitHub.`, { parse_mode: 'Markdown' });
    }
};

// ==================== 4. KEYBOARDS ====================
const getMainKeyboard = () => ({
    reply_markup: {
        inline_keyboard: [
            [{ text: "📿 ذكر عشوائي", callback_data: 'menu_dhikr' }, { text: "🕋 المسبحة الإلكترونية", callback_data: 'menu_tasbih' }],
            [{ text: "📚 المكتبة الإسلامية", callback_data: 'menu_library' }, { text: "🤲 جوامع الدعاء", callback_data: 'menu_jawami' }],
            [{ text: "🔔 تفعيل التذكيرات", callback_data: 'menu_reminder_on' }, { text: "🔕 إيقاف التذكيرات", callback_data: 'menu_reminder_off' }],
            [{ text: "⚙️ إعدادات الفترة", callback_data: 'menu_settings' }, { text: "📊 إحصائياتي", callback_data: 'menu_stats' }],
            [{ text: "❓ المساعدة", callback_data: 'menu_help' }]
        ]
    }
});

const getTasbihSelectKeyboard = () => ({
    reply_markup: {
        inline_keyboard: [
            [{ text: 'سبحان الله (33)',        callback_data: 'tasbih_subhanallah'  }],
            [{ text: 'الحمد لله (33)',         callback_data: 'tasbih_alhamdulillah' }],
            [{ text: 'الله أكبر (33)',         callback_data: 'tasbih_allahu_akbar'   }],
            [{ text: 'لا إله إلا الله (100)',    callback_data: 'tasbih_la_ilaha'       }],
            [{ text: 'أستغفر الله (100)',        callback_data: 'tasbih_astaghfirullah' }],
            [{ text: 'اللهم صل على محمد (100)', callback_data: 'tasbih_salawat'        }],
            [{ text: '🔙 رجوع للقائمة',            callback_data: 'menu_back'             }]
        ]
    }
});

const getTasbihCounterKeyboard = (userId, tasbihId) => {
    const tData = tasbihData[userId] || {};
    const count = tData.count || 0;
    const target = tData.target || 33;
    const pct   = Math.min(Math.floor((count / target) * 10), 10);
    const bar   = '■'.repeat(pct) + '□'.repeat(10 - pct);
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: `${bar}  ${count}/${target}`, callback_data: 'tasbih_noop' }],
                [{ text: '➕ تسبيح (+1)', callback_data: `tasbih_add_${tasbihId}` }],
                [
                    { text: '➕ (+10)', callback_data: `tasbih_add10_${tasbihId}` },
                    { text: '🔄 إعادة', callback_data: `tasbih_reset_${tasbihId}` }
                ],
                [{ text: '🔙 رجوع', callback_data: 'menu_tasbih' }]
            ]
        }
    };
};

const getLibraryKeyboard = () => ({
    reply_markup: {
        inline_keyboard: [
            [{ text: '📖 حصن المسلم', callback_data: 'lib_hisn' }, { text: '🕌 القرآن الكريم', callback_data: 'lib_quran' }],
            [{ text: '☀️ أذكار الصباح والمساء', callback_data: 'lib_morning' }],
            [{ text: '🌙 أذكار النوم', callback_data: 'lib_sleep' }, { text: '🌅 أذكار الاستيقاظ', callback_data: 'lib_wake' }],
            [{ text: '📚 رياض الصالحين', callback_data: 'lib_salihin' }, { text: '💊 الداء والدواء', callback_data: 'lib_medicine' }],
            [{ text: '🔙 رجوع', callback_data: 'menu_back' }]
        ]
    }
});

const getSettingsKeyboard = () => ({
    reply_markup: {
        inline_keyboard: [
            [{ text: '⏱️ كل 30 دقيقة', callback_data: 'interval_30min' }, { text: '⏱️ كل ساعة', callback_data: 'interval_1hour' }],
            [{ text: '⏱️ كل ساعتين', callback_data: 'interval_2hours' }, { text: '⏱️ كل 3 ساعات', callback_data: 'interval_3hours' }],
            [{ text: '⏱️ كل 6 ساعات', callback_data: 'interval_6hours' }],
            [{ text: '🔙 رجوع', callback_data: 'menu_back' }]
        ]
    }
});

// ==================== 5. REMINDER ENGINE ====================
const startReminder = (chatId, interval = 'every_2hours') => {
    if (activeIntervals[chatId]) clearInterval(activeIntervals[chatId]);
    const ms = reminderIntervals[interval] || reminderIntervals['every_2hours'];
    activeIntervals[chatId] = setInterval(() => {
        const d = getRandom(dhikrPool);
        bot.sendMessage(chatId, `🔔 *تذكير دوري:*\n\n${d}`, { parse_mode: 'Markdown' })
        .catch(err => {
            if (['kicked','not found','Forbidden','blocked'].some(s => err.message?.includes(s)))
                stopReminder(chatId);
        });
    }, ms);
};

const stopReminder = (chatId) => {
    if (activeIntervals[chatId]) { clearInterval(activeIntervals[chatId]); delete activeIntervals[chatId]; }
    activeChats = activeChats.filter(id => id !== chatId);
    saveData();
};

const handleReminderOn = (chatId, userId) => {
    if (!activeChats.includes(chatId)) {
        activeChats.push(chatId);
        botStats.totalReminders++;
        let interval = (userPreferences[userId] && userPreferences[userId].reminderInterval) || 'every_2hours';
        startReminder(chatId, interval);
        saveData();
        bot.sendMessage(chatId, "✅ *تم تفعيل التذكيرات بنجاح!*\nسيقوم البوت بإرسال أذكار دورية لك.", { parse_mode: 'Markdown' });
    } else {
        bot.sendMessage(chatId, "⚠️ *التذكيرات مفعّلة بالفعل.*", { parse_mode: 'Markdown' });
    }
};

// ==================== 6. TEXT CONTENT ====================
const getWelcomeText = () => {
    return (
`*السلام عليكم ورحمة الله وبركاته* 🌹

يسعدنا تجربتكم لبوت *نورِفاي* 🕌
رفيقك المؤمن للمداومة على ذكر الله عز وجل.

─────────────────────
🛠 *كيفية الاستخدام:*
1️⃣ *ذكر عشوائي:* للحصول على ذكر أو دعاء فوري.
2️⃣ *المسبحة:* عداد تفاعلي لأذكارك اليومية.
3️⃣ *المكتبة:* تحميل أهم الكتب الإسلامية والأذكار بصيغة PDF.
4️⃣ *التذكيرات:* تفعيل خاصية التذكير التلقائي كل فترة زمنية.

📢 *في المجموعات والقنوات:*
بمجرد إضافة البوت ورفعه مشرفاً، سيقوم تلقائياً بتفعيل التذكيرات (كل ساعتين افتراضياً). يمكنك تغيير الفترة من الإعدادات ⚙️.
─────────────────────

💡 *لا تنسوا مشاركة البوت دعماً لنا وانتشاراً للخير والأجر والثواب، لعلها تكون صدقة جارية لنا ولكم. وفقنا الله وإياكم.* 🤲

👨‍💻 *للتواصل مع المطور لتقديم المساعدة وتطوير البوت:*
[اضغط هنا للتواصل](https://t.me/vx_rq)`
    );
};

// ==================== 7. HANDLERS ====================

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    trackCommand('start');
    if (userId) initUser(userId, chatId);
    bot.sendMessage(chatId, getWelcomeText(), { parse_mode: 'Markdown', ...getMainKeyboard(), disable_web_page_preview: true });
});

bot.onText(/\/menu/, (msg) => {
    trackCommand('menu');
    bot.sendMessage(msg.chat.id, "📋 *القائمة الرئيسية:*", { parse_mode: 'Markdown', ...getMainKeyboard() });
});

bot.on('callback_query', async (query) => {
    const { id: queryId, message, from, data } = query;
    const chatId   = message.chat.id;
    const userId   = from.id;
    const answer = (text) => bot.answerCallbackQuery(queryId, text ? { text } : {}).catch(() => {});

    if (!userPreferences[userId]) initUser(userId, chatId);

    if (data === 'menu_back') {
        answer();
        bot.editMessageText(getWelcomeText(), { chat_id: chatId, message_id: message.message_id, parse_mode: 'Markdown', ...getMainKeyboard(), disable_web_page_preview: true });
        return;
    }

    if (data === 'menu_dhikr') {
        answer();
        const d = getRandom(dhikrPool);
        const a = getRandom(acceptMessages);
        bot.sendMessage(chatId, `✨ *ذكرك الآن:*\n\n${d}\n\n💎 _${a}_`, { parse_mode: 'Markdown' });
        return;
    }

    if (data === 'menu_tasbih') {
        answer();
        bot.editMessageText('🕋 *المسبحة الإلكترونية*\n\nاختر الذكر الذي تود البدء به:', { chat_id: chatId, message_id: message.message_id, parse_mode: 'Markdown', ...getTasbihSelectKeyboard() });
        return;
    }

    if (data === 'menu_library') {
        answer();
        bot.editMessageText('📚 *المكتبة الإسلامية*\n\nاختر الكتاب أو الأذكار للتحميل:', { chat_id: chatId, message_id: message.message_id, parse_mode: 'Markdown', ...getLibraryKeyboard() });
        return;
    }

    if (data === 'menu_jawami' || data === 'jawami_random') {
        answer();
        const d = getRandom(dhikrPool);
        bot.sendMessage(chatId, `🤲 *من جوامع الدعاء:*\n\n${d}\n\n✨ _تقبل الله طاعتك_`, { 
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: '🤲 دعاء آخر', callback_data: 'jawami_random' }], [{ text: '🔙 رجوع', callback_data: 'menu_back' }]] }
        });
        return;
    }

    if (data === 'menu_reminder_on') {
        answer();
        handleReminderOn(chatId, userId);
        return;
    }

    if (data === 'menu_reminder_off') {
        answer();
        stopReminder(chatId);
        bot.sendMessage(chatId, "🔕 *تم إيقاف التذكيرات التلقائية.*", { parse_mode: 'Markdown' });
        return;
    }

    if (data === 'menu_settings') {
        answer();
        bot.editMessageText('⚙️ *إعدادات فترة التذكير*\n\nاختر الفترة الزمنية المناسبة لك:', { chat_id: chatId, message_id: message.message_id, parse_mode: 'Markdown', ...getSettingsKeyboard() });
        return;
    }

    if (data === 'menu_stats') {
        answer();
        const pref = userPreferences[userId] || {};
        const stats = `📊 *إحصائياتك في نورِفاي:*\n\n📿 إجمالي الأذكار: *${pref.totalDhikr || 0}*\n📅 تاريخ الانضمام: *${pref.joinDate ? new Date(pref.joinDate).toLocaleDateString('ar-EG') : 'اليوم'}*\n\n👥 مستخدمي البوت: *${botStats.totalUsers}*`;
        bot.sendMessage(chatId, stats, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '🔙 رجوع', callback_data: 'menu_back' }]] } });
        return;
    }

    if (data === 'menu_help') {
        answer();
        const help = `❓ *كيفية استخدام البوت:*\n\n• استخدم الأزرار للتنقل بين الأذكار والمكتبة.\n• لتفعيل البوت في القنوات: أضف البوت كمسؤول.\n• لتغيير وقت التذكير: اذهب للإعدادات.\n\n💬 للتواصل: @vx_rq`;
        bot.sendMessage(chatId, help, { parse_mode: 'Markdown' });
        return;
    }

    if (data.startsWith('lib_')) {
        answer('⏳ جاري جلب الملف...');
        sendFile(chatId, data.replace('lib_', ''));
        return;
    }

    if (data.startsWith('interval_')) {
        const intervalKey = data.replace('interval_', 'every_');
        userPreferences[userId].reminderInterval = intervalKey;
        saveData();
        if (activeChats.includes(chatId)) startReminder(chatId, intervalKey);
        answer('✅ تم حفظ الإعدادات');
        bot.sendMessage(chatId, `✨ تم تحديث فترة التذكير بنجاح.`, { parse_mode: 'Markdown' });
        return;
    }

    // Tasbih Logic
    const tasbihMap = {
        'tasbih_subhanallah':  { text: 'سبحان الله', target: 33 },
        'tasbih_alhamdulillah': { text: 'الحمد لله', target: 33 },
        'tasbih_allahu_akbar':   { text: 'الله أكبر', target: 33 },
        'tasbih_la_ilaha':       { text: 'لا إله إلا الله', target: 100 },
        'tasbih_astaghfirullah': { text: 'أستغفر الله', target: 100 },
        'tasbih_salawat':        { text: 'اللهم صل على محمد', target: 100 }
    };

    if (tasbihMap[data]) {
        answer();
        tasbihData[userId] = { ...tasbihMap[data], count: 0 };
        saveData();
        bot.editMessageText(`🕋 *المسبحة:* ${tasbihMap[data].text}`, { chat_id: chatId, message_id: message.message_id, parse_mode: 'Markdown', ...getTasbihCounterKeyboard(userId, data) });
        return;
    }

    if (data.startsWith('tasbih_add_')) {
        const tId = data.replace('tasbih_add_', '');
        if (!tasbihData[userId]) return answer();
        tasbihData[userId].count++;
        userPreferences[userId].totalDhikr = (userPreferences[userId].totalDhikr || 0) + 1;
        saveData();
        if (tasbihData[userId].count >= tasbihData[userId].target) {
            answer('✅ اكتمل الذكر!');
            bot.sendMessage(chatId, `🎊 *تم اكتمال الذكر:* ${tasbihData[userId].text}\n\n${getRandom(acceptMessages)}`, { parse_mode: 'Markdown' });
            tasbihData[userId].count = 0;
        } else { answer(); }
        bot.editMessageReplyMarkup(getTasbihCounterKeyboard(userId, tId).reply_markup, { chat_id: chatId, message_id: message.message_id }).catch(() => {});
        return;
    }

    if (data.startsWith('tasbih_add10_')) {
        const tId = data.replace('tasbih_add10_', '');
        if (!tasbihData[userId]) return answer();
        tasbihData[userId].count = Math.min(tasbihData[userId].count + 10, tasbihData[userId].target);
        userPreferences[userId].totalDhikr = (userPreferences[userId].totalDhikr || 0) + 10;
        saveData();
        answer();
        bot.editMessageReplyMarkup(getTasbihCounterKeyboard(userId, tId).reply_markup, { chat_id: chatId, message_id: message.message_id }).catch(() => {});
        return;
    }

    if (data.startsWith('tasbih_reset_')) {
        const tId = data.replace('tasbih_reset_', '');
        if (tasbihData[userId]) { tasbihData[userId].count = 0; saveData(); }
        answer('🔄 تم التصفير');
        bot.editMessageReplyMarkup(getTasbihCounterKeyboard(userId, tId).reply_markup, { chat_id: chatId, message_id: message.message_id }).catch(() => {});
        return;
    }

    answer();
});

// --- GROUP/CHANNEL EVENTS ---
bot.on('my_chat_member', (update) => {
    const { chat, new_chat_member } = update;
    const status = new_chat_member?.status;
    if (status === 'member' || status === 'administrator') {
        const welcome = `*السلام عليكم ورحمة الله وبركاته* 🌹\n\nتم إضافة بوت *نورِفاي* لـ ${chat.type === 'channel' ? 'القناة' : 'المجموعة'}.\n\n✅ تم تفعيل التذكيرات التلقائية كل *ساعتين*.\n⚙️ لتغيير الإعدادات استخدم أمر /menu`;
        bot.sendMessage(chat.id, welcome, { parse_mode: 'Markdown' }).catch(() => {});
        if (!activeChats.includes(chat.id)) {
            activeChats.push(chat.id);
            startReminder(chat.id, 'every_2hours');
            saveData();
        }
    }
});

bot.on('polling_error', (err) => console.error('Polling error:', err.message));

console.log('Noorify Bot v5.0 — Final Smart Version');
console.log("Bot is running successfully... ✅");
