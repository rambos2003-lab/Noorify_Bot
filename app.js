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

// ==================== 1. DATA FILES & PERSISTENCE ====================
const DATA_FILE       = path.join(__dirname, 'reminders_data.json');
const STATS_FILE      = path.join(__dirname, 'bot_stats.json');
const USER_PREFS_FILE = path.join(__dirname, 'user_preferences.json');
const TASBIH_FILE     = path.join(__dirname, 'tasbih_data.json');

let activeChats     = [];
let botStats        = { totalUsers: 0, totalReminders: 0, commandsUsed: {} };
let userPreferences = {};
let tasbihData      = {};

const loadData = () => {
    const load = (file, def) => { 
        try { 
            return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : def; 
        } catch { 
            return def; 
        } 
    };
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

// ==================== 2. LANGUAGES & TRANSLATIONS ====================
const translations = {
    ar: { 
        welcome: "أهلاً بك في بوت نورِفاي 🕌\nرفيقك في رحلة المداومة على ذكر الله",
        dhikr_btn: "ذكر عشوائي", tasbih_btn: "المسبحة", lib_btn: "المكتبة الإسلامية", 
        jawami_btn: "جوامع الدعاء", rem_on_btn: "تفعيل التذكيرات", rem_off_btn: "إيقاف التذكيرات",
        settings_btn: "إعدادات التذكير", stats_btn: "إحصائياتي", help_btn: "المساعدة",
        back_btn: "رجوع للقائمة", select_lang: "اختر لغتك المفضلة / Select your language:",
        lang_changed: "تم تغيير اللغة إلى العربية.", reminder_active: "التذكيرات مفعّلة بالفعل.",
        reminder_on_msg: "تم تفعيل التذكيرات بنجاح", reminder_off_msg: "تم إيقاف التذكيرات.",
        lang_menu: "تغيير اللغة"
    },
    en: { 
        welcome: "Welcome to Nourify Bot 🕌\nYour companion in the journey of remembering Allah",
        dhikr_btn: "Random Dhikr", tasbih_btn: "Tasbih", lib_btn: "Islamic Library", 
        jawami_btn: "Prophetic Duas", rem_on_btn: "Enable Reminders", rem_off_btn: "Disable Reminders",
        settings_btn: "Reminder Settings", stats_btn: "My Stats", help_btn: "Help",
        back_btn: "Back to Menu", select_lang: "Select your language:",
        lang_changed: "Language changed to English.", reminder_active: "Reminders are already enabled.",
        reminder_on_msg: "Reminders enabled successfully", reminder_off_msg: "Reminders disabled.",
        lang_menu: "Change Language"
    },
    tr: { 
        welcome: "Nourify Bot'a Hoş Geldiniz 🕌\nAllah'ı anma yolculuğunda arkadaşınız",
        dhikr_btn: "Rastgele Zikir", tasbih_btn: "Tesbih", lib_btn: "İslami Kütüphane", 
        jawami_btn: "Peygamber Duaları", rem_on_btn: "Hatırlatıcıها Aç", rem_off_btn: "Hatırlatıcıları Kapat",
        settings_btn: "Hatırlatıcı Ayarları", stats_btn: "İstatistiklerim", help_btn: "Yardım",
        back_btn: "Menüye Dön", select_lang: "Dilinizi seçين:",
        lang_changed: "Dil Türkçe yapıldı.", reminder_active: "Hatırlatıcılar zaten açık.",
        reminder_on_msg: "Hatırlatıcılar başarıyla açıldı", reminder_off_msg: "Hatırlatıcılar kapatıldı.",
        lang_menu: "Dili Değiştir"
    }
};

const t = (userId, key) => {
    const lang = (userPreferences[userId] && userPreferences[userId].lang) ? userPreferences[userId].lang : 'ar';
    return translations[lang][key] || translations['ar'][key];
};

// ==================== 3. DATA CONSTANTS (Dhikr, Library, etc.) ====================
const dhikrList = [
    { text: "سبحان الله وبحمده، سبحان الله العظيم", count: 100 },
    { text: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير", count: 100 },
    { text: "أستغفر الله وأتوب إليه", count: 100 },
    { text: "اللهم صلِ وسلم على نبينا محمد", count: 10 },
    { text: "لا حول ولا قوة إلا بالله العلي العظيم", count: 100 },
    { text: "سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر", count: 100 },
    { text: "رضيت بالله رباً، وبالإسلام ديناً، وبمحمد صلى الله عليه وسلم نبياً", count: 3 },
    { text: "حسبنا الله ونعم الوكيل", count: 100 },
    { text: "يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين", count: 1 },
    { text: "اللهم إني أسألك علماً نافعاً، ورزقاً طيباً، وعملاً متقبلاً", count: 1 }
];

const jawamiList = [
    { num: 1,  text: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار", source: "رواه البخاري (6389)" },
    { num: 2,  text: "اللهم إني أعوذ بك من الفقر والقلة والذلة وأعوذ بك من أن أظلم أو أُظلم", source: "صحيح الجامع (1285)" },
    { num: 3,  text: "اللهم اغفر لي وارحمني وعافني وارزقني", source: "رواه مسلم (2697)" },
    { num: 4,  text: "اللهم أعني على ذكرك وشكرك وحسن عبادتك", source: "السلسلة الصحيحة (844)" },
    { num: 5,  text: "اللهم إني أسألك المعافاة في الدنيا والآخرة", source: "صحيح الجامع (5703)" },
    { num: 6,  text: "اللهم أصلح لي ديني الذي هو عصمة أمري وأصلح لي دنياي التي فيها معاشي وأصلح لي آخرتي التي فيها معادي واجعل الحياة زيادة لي في كل خير واجعل الموت راحة لي من كل شر", source: "رواه مسلم (2720)" },
    { num: 7,  text: "اللهم إني أسألك الهدى والتقى والعفاف والغنى", source: "رواه مسلم (2721)" },
    { num: 8,  text: "يا مقلب القلوب ثبت قلبي على دينك", source: "السلسلة الصحيحة (2091)" },
    { num: 9,  text: "اللهم مصرف القلوب صرف قلوبنا على طاعتك", source: "رواه مسلم (2654)" },
    { num: 10, text: "اللهم اهدني وسددني", source: "رواه مسلم (2725)" },
    { num: 11, text: "اللهم إنك عفو تحب العفو فاعف عني", source: "صحيح ابن ماجة (3119)" },
    { num: 12, text: "اللهم إني أسألك من فضلك ورحمتك فإنه لا يملكها إلا أنت", source: "السلسلة الصحيحة (1543)" },
    { num: 13, text: "اللهم اكفني بحلالك عن حرامك وأغنني بفضلك عمن سواك", source: "صحيح الجامع (2625)" },
    { num: 14, text: "اللهم إني أعوذ بك من منكرات الأخلاق والأعمال والأهواء", source: "صحيح الترمذي (3591)" },
    { num: 15, text: "اللهم إني أعوذ بك من البرص والجنون والجذام ومن سيء الأسقام", source: "صحيح الجامع (1281)" },
    { num: 16, text: "اللهم إني أعوذ بك من جار السوء في دار المقامة فإن جار البادية يتحول", source: "صحيح الجامع (1290)" },
    { num: 17, text: "اللهم إني أعوذ بك من القلة والفقر والذلة وأعوذ بك أن أظلم أو أُظلم", source: "صحيح النسائي (5477)" },
    { num: 18, text: "اللهم إني أسألك من الخير كله عاجله وآجله ما علمت منه وما لم أعلم وأعوذ بك من الشر كله عاجله وآجله ما علمت منه وما لم أعلم", source: "السلسلة الصحيحة (1542)" },
    { num: 19, text: "اللهم إني أسألك الثبات في الأمر والعزيمة على الرشد وأسألك موجبات رحمتك وعزائم مغفرتك وأسألك شكر نعمتك وحسن عبادتك وأسألك قلباً سليماً ولساناً صادقاً", source: "السلسلة الصحيحة (3228)" },
    { num: 20, text: "اللهم اقسم لنا من خشيتك ما يحول بيننا وبين معاصيك ومن طاعتك ما تبلغنا به جنتك ومن اليقين ما تهون به علينا مصيبات الدنيا", source: "صحيح الترمذي (3502)" },
    { num: 21, text: "اللهم احفظني بالإسلام قائماً واحفظني بالإسلام قاعداً واحفظني بالإسلام راقداً ولا تشمت بي عدواً ولا حاسداً", source: "صحيح الجامع (1260)" },
    { num: 22, text: "اللهم بعلمك الغيب وقدرتك على الخلق أحيني ما علمت الحياة خيراً لي وتوفني إذا علمت الوفاة خيراً لي", source: "صحيح الكلم الطيب (106)" },
    { num: 23, text: "رب أعني ولا تعن علي وانصرني ولا تنصر علي وامكر لي ولا تمكر علي واهدني ويسر الهدى لي وانصرني على من بغى علي", source: "صحيح الترمذي (3551)" },
    { num: 24, text: "اللهم حاسبني حساباً يسيراً", source: "تخريج مشكاة المصابيح (5495)" },
    { num: 25, text: "اللهم إني أسألك فعل الخيرات وترك المنكرات وحب المساكين وإذا أردت بعبادك فتنة فاقبضني إليك غير مفتون", source: "صحيح الترمذي (3233)" },
    { num: 26, text: "اللهم إني عبدك وابن عبدك وابن أمتك ناصيتي بيدك ماضٍ فيّ حكمك عدل فيّ قضاؤك أسألك بكل اسم هو لك سميت به نفسك أو علمته أحداً من خلقك أو أنزلته في كتابك أن تجعل القرآن ربيع قلبي ونور صدري وجلاء حزني وذهاب همي", source: "السلسلة الصحيحة (199)" },
    { num: 27, text: "اللهم مالك الملك تؤتي الملك من تشاء وتنزع الملك ممن تشاء وتعز من تشاء وتذل من تشاء بيدك الخير إنك على كل شيء قدير ارحمني رحمة تغنيني بها عن رحمة من سواك", source: "صحيح الترغيب (1821)" },
    { num: 28, text: "اللهم رب السموات السبع ورب العرش العظيم ربنا ورب كل شيء منزل التوراة والإنجيل والقرآن فالق الحب والنوى أعوذ بك من شر كل شيء أنت آخذ بناصيته اقض عني الدين وأغنني من الفقر", source: "صحيح الترمذي (3481)" },
    { num: 29, text: "اللهم إني أسألك إيماناً لا يرتد ونعيماً لا ينفد ومرافقة محمد في أعلى جنة الخلد", source: "السلسلة الصحيحة (5/379)" },
    { num: 30, text: "اللهم انفعني بما علمتني وعلمني ما ينفعني وارزقني علماً تنفعني به", source: "السلسلة الصحيحة (3151)" },
    { num: 31, text: "اللهم اجعل في قلبي نوراً وفي بصري نوراً وفي سمعي نوراً وعن يميني نوراً وعن يساري نوراً وفوقي نوراً وتحتي نوراً وأمامي نوراً وخلفي نوراً واجعل لي نوراً", source: "رواه البخاري (6316) ومسلم (763)" },
    { num: 32, text: "اللهم أحيني مسكيناً وأمتني مسكيناً واحشرني في زمرة المساكين يوم القيامة", source: "صحيح الترمذي (2352)" },
    { num: 33, text: "اللهم استر عورتي وآمن روعتي واقض عني ديني", source: "صحيح الجامع (1262)" }
];

const filesMap = {
    'hisn':     { name: 'حصن المسلم', file: 'hisn_almuslim.pdf' },
    'salah':    { name: 'تعليم الصلاة', file: 'learn_salah.pdf' },
    'quran':    { name: 'القرآن الكريم', file: 'quran.pdf' },
    'forty':    { name: 'الأربعون النووية', file: 'nawawi_40.pdf' },
    'morning':  { name: 'أذكار الصباح', file: 'morning_dhikr.pdf' },
    'evening':  { name: 'أذكار المساء', file: 'evening_dhikr.pdf' }
};

const autoSendKeywords = {
    'حصن المسلم': 'hisn',
    'تعليم الصلاة': 'salah',
    'القرآن الكريم': 'quran',
    'الأربعون النووية': 'forty',
    'أذكار الصباح': 'morning',
    'أذكار المساء': 'evening'
};

const reminderIntervals = {
    'every_30min':  30 * 60 * 1000,
    'every_hour':   60 * 60 * 1000,
    'every_2hours': 2 * 60 * 60 * 1000,
    'every_3hours': 3 * 60 * 60 * 1000,
    'every_6hours': 6 * 60 * 60 * 1000
};

const GITHUB_RAW = 'https://raw.githubusercontent.com/vx-rq/Noorify-Assets/main';
const activeIntervals = {};

// ==================== 4. HELPER FUNCTIONS ====================
const getRandomDhikr = () => dhikrList[Math.floor(Math.random() * dhikrList.length)];

const sendRandomJawami = (chatId) => {
    const j = jawamiList[Math.floor(Math.random() * jawamiList.length)];
    bot.sendMessage(chatId, `*من جوامع دعاء النبي ﷺ (${j.num}):*\n\n${j.text}\n\n*المصدر:* ${j.source}`, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: 'دعاء آخر', callback_data: 'jawami_random' }], [{ text: 'رجوع', callback_data: 'menu_back' }]] }
    }).catch(console.error);
};

const trackCommand = (cmd) => {
    botStats.commandsUsed[cmd] = (botStats.commandsUsed[cmd] || 0) + 1;
    saveData();
};

const isGroupChat = (type) => ['group', 'supergroup'].includes(type);

const isGroupAdmin = async (chatId, userId) => {
    try {
        const admins = await bot.getChatAdministrators(chatId);
        return admins.some(a => a.user.id === userId);
    } catch { return false; }
};

const initUser = (userId, chatId) => {
    if (!userPreferences[userId]) {
        userPreferences[userId] = {
            lang: 'ar',
            joinDate: new Date().toISOString(),
            reminderInterval: 'every_2hours',
            chatId, 
            dailyCount: 0,
            lastReset: new Date().toDateString(),
            totalDhikr: 0
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
            caption: `*${info.name}*\n\nبوت نورِفاي`,
            parse_mode: 'Markdown'
        });
    } else {
        const url = `${GITHUB_RAW}/${encodeURIComponent(info.file)}`;
        await bot.sendDocument(chatId, url, {
            caption: `*${info.name}*\n\nبوت نورِفاي`,
            parse_mode: 'Markdown'
        }).catch(() => {
            bot.sendMessage(chatId, `الملف *${info.name}* غير متوفر حالياً.\nسيتم إضافته قريباً.`, { parse_mode: 'Markdown' });
        });
    }
};

// ==================== 5. KEYBOARDS ====================
const getMainKeyboard = (userId) => ({
    reply_markup: {
        inline_keyboard: [
            [{ text: t(userId, 'dhikr_btn'), callback_data: 'menu_dhikr' }, { text: t(userId, 'tasbih_btn'), callback_data: 'menu_tasbih' }],
            [{ text: t(userId, 'lib_btn'), callback_data: 'menu_library' }, { text: t(userId, 'jawami_btn'), callback_data: 'menu_jawami' }],
            [{ text: t(userId, 'rem_on_btn'), callback_data: 'menu_reminder_on' }, { text: t(userId, 'rem_off_btn'), callback_data: 'menu_reminder_off' }],
            [{ text: t(userId, 'settings_btn'), callback_data: 'menu_settings' }, { text: t(userId, 'lang_menu'), callback_data: 'menu_lang' }],
            [{ text: t(userId, 'stats_btn'), callback_data: 'menu_stats' }, { text: t(userId, 'help_btn'), callback_data: 'menu_help' }]
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
            [{ text: 'لا حول ولا قوة إلا بالله (33)', callback_data: 'tasbih_la_hawla'}],
            [{ text: 'رجوع للقائمة',            callback_data: 'menu_back'             }]
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
                [{ text: '+1  تسبيح', callback_data: `tasbih_add_${tasbihId}` }],
                [
                    { text: '+10', callback_data: `tasbih_add10_${tasbihId}` },
                    { text: 'إعادة', callback_data: `tasbih_reset_${tasbihId}` }
                ],
                [{ text: 'رجوع', callback_data: 'menu_tasbih' }]
            ]
        }
    };
};

const getLibraryKeyboard = () => ({
    reply_markup: {
        inline_keyboard: [
            [{ text: '📖 حصن المسلم', callback_data: 'lib_hisn' }, { text: '🧎 تعليم الصلاة', callback_data: 'lib_salah' }],
            [{ text: '🕌 القرآن الكريم', callback_data: 'lib_quran' }, { text: '📜 الأربعون النووية', callback_data: 'lib_forty' }],
            [{ text: '☀️ أذكار الصباح', callback_data: 'lib_morning' }, { text: '🌙 أذكار المساء', callback_data: 'lib_evening' }],
            [{ text: 'رجوع', callback_data: 'menu_back' }]
        ]
    }
});

const getSettingsKeyboard = () => ({
    reply_markup: {
        inline_keyboard: [
            [{ text: 'كل 30 دقيقة', callback_data: 'interval_30min' }, { text: 'كل ساعة', callback_data: 'interval_1hour' }],
            [{ text: 'كل ساعتين', callback_data: 'interval_2hours' }, { text: 'كل 3 ساعات', callback_data: 'interval_3hours' }],
            [{ text: 'كل 6 ساعات', callback_data: 'interval_6hours' }],
            [{ text: 'رجوع', callback_data: 'menu_back' }]
        ]
    }
});

// ==================== 6. REMINDER ENGINE ====================
const startReminder = (chatId, interval = 'every_2hours') => {
    if (activeIntervals[chatId]) clearInterval(activeIntervals[chatId]);
    const ms = reminderIntervals[interval] || reminderIntervals['every_2hours'];
    activeIntervals[chatId] = setInterval(() => {
        const d = getRandomDhikr();
        bot.sendMessage(chatId, `تذكير:\n\n${d.text}`, { parse_mode: 'Markdown' })
        .catch(err => {
            if (['kicked','not found','Forbidden','blocked'].some(s => err.message?.includes(s)))
                stopReminder(chatId);
        });
    }, ms);
};

const stopReminder = (chatId) => {
    if (activeIntervals[chatId]) { 
        clearInterval(activeIntervals[chatId]); 
        delete activeIntervals[chatId]; 
    }
    activeChats = activeChats.filter(id => id !== chatId);
    saveData();
};

const handleReminderOn = (chatId, userId, chatType) => {
    if (!activeChats.includes(chatId)) {
        activeChats.push(chatId);
        botStats.totalReminders++;
        let interval = 'every_2hours';
        if (userPreferences[userId]) interval = userPreferences[userId].reminderInterval || interval;
        startReminder(chatId, interval);
        saveData();
        bot.sendMessage(chatId, t(userId, 'reminder_on_msg'), { parse_mode: 'Markdown' });
    } else {
        bot.sendMessage(chatId, t(userId, 'reminder_active'), { parse_mode: 'Markdown' });
    }
};

const handleReminderOff = (chatId) => {
    stopReminder(chatId);
    bot.sendMessage(chatId, "تم إيقاف التذكيرات.", { parse_mode: 'Markdown' });
};

// Initialize reminders on startup
activeChats.forEach(chatId => {
    let interval = 'every_2hours';
    for (const uid in userPreferences) {
        if (userPreferences[uid].chatId === chatId) {
            interval = userPreferences[uid].reminderInterval || interval;
            break;
        }
    }
    startReminder(chatId, interval);
});

// ==================== 7. TEXT CONTENT ====================
const getWelcomeText = (userId) => {
    const d = getRandomDhikr();
    const welcome = t(userId, 'welcome');
    return (
`*السلام عليكم ورحمة الله وبركاته*
${welcome}
─────────────────────
*ذكر اليوم:*
_${d.text}_
─────────────────────
*طريقة الاستخدام:*
اضغط "ذكر عشوائي" للحصول على ذكر جديد
اضغط "المسبحة" لعدّ أذكارك بشكل تفاعلي
اضغط "تفعيل التذكيرات" لاستقبال أذكار تلقائية
اضغط "المكتبة الإسلامية" لتحميل الكتب
اضغط "جوامع الدعاء" لأفضل أدعية النبي
─────────────────────
لا تنسى مشاركة البوت مع من تحب — لعلها صدقة جارية
🤲 وفّقنا الله لما يحب ويرضى
─────────────────────
*للتواصل:*
*المطوّر:* @vx\_rq`
    );
};

const showStats = (chatId, userId) => {
    const pref = userPreferences[userId] || {};
    const statsText = 
`*إحصائياتك في نورِفاي:*
─────────────────────
👤 الاسم: ${pref.chatId ? 'مستخدم مسجل' : 'غير معروف'}
📅 تاريخ الانضمام: ${pref.joinDate ? new Date(pref.joinDate).toLocaleDateString('ar-EG') : 'اليوم'}
📿 إجمالي الأذكار: ${pref.totalDhikr || 0}
📊 عدد أذكار اليوم: ${pref.dailyCount || 0}
─────────────────────
*إحصائيات البوت العامة:*
👥 عدد المستخدمين: ${botStats.totalUsers}
🔔 التذكيرات النشطة: ${activeChats.length}
─────────────────────`;
    bot.sendMessage(chatId, statsText, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: 'رجوع', callback_data: 'menu_back' }]] } });
};

// ==================== 8. HANDLERS ====================

// --- COMMANDS ---
bot.onText(/\/start/, (msg) => {
    const { id: chatId } = msg.chat;
    const userId = msg.from?.id;
    trackCommand('start');
    if (userId) initUser(userId, chatId);
    bot.sendMessage(chatId, getWelcomeText(userId), { parse_mode: 'Markdown', ...getMainKeyboard(userId) });
});

bot.onText(/\/menu/, (msg) => {
    const userId = msg.from?.id;
    trackCommand('menu');
    bot.sendMessage(msg.chat.id, t(userId, 'welcome'), { parse_mode: 'Markdown', ...getMainKeyboard(userId) });
});

bot.onText(/\/dhikr/, (msg) => {
    const d = getRandomDhikr();
    bot.sendMessage(msg.chat.id, `*ذكرك الآن:*\n\n_${d.text}_\n\nالعدد الموصى به: *${d.count}*`, { parse_mode: 'Markdown' });
});

bot.onText(/\/tasbih/, (msg) => {
    bot.sendMessage(msg.chat.id, '*المسبحة الإلكترونية*\n\nاختر الذكر:', { parse_mode: 'Markdown', ...getTasbihSelectKeyboard() });
});

bot.onText(/\/stats/, (msg) => {
    showStats(msg.chat.id, msg.from.id);
});

bot.onText(/\/reminder_on/, async (msg) => {
    const { id: chatId, type } = msg.chat;
    const userId = msg.from.id;
    if (isGroupChat(type) && !(await isGroupAdmin(chatId, userId))) return;
    handleReminderOn(chatId, userId, type);
});

bot.onText(/\/reminder_off/, async (msg) => {
    const { id: chatId, type } = msg.chat;
    const userId = msg.from.id;
    if (isGroupChat(type) && !(await isGroupAdmin(chatId, userId))) return;
    handleReminderOff(chatId);
});

// --- CALLBACK QUERIES ---
bot.on('callback_query', async (query) => {
    const { id: queryId, message, from, data } = query;
    const chatId   = message.chat.id;
    const chatType = message.chat.type;
    const userId   = from.id;
    const answer = (text) => bot.answerCallbackQuery(queryId, text ? { text } : {}).catch(() => {});

    if (!userPreferences[userId]) initUser(userId, chatId);

    // Language handling
    if (data.startsWith('lang_')) {
        const langCode = data.split('_')[1];
        userPreferences[userId].lang = langCode;
        saveData();
        answer(t(userId, 'lang_changed'));
        bot.editMessageText(getWelcomeText(userId), { chat_id: chatId, message_id: message.message_id, parse_mode: 'Markdown', ...getMainKeyboard(userId) });
        return;
    }
    if (data === 'menu_lang') {
        answer();
        bot.editMessageText(t(userId, 'select_lang'), {
            chat_id: chatId, message_id: message.message_id,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "العربية 🇸🇦", callback_data: 'lang_ar' }, { text: "English 🇺🇸", callback_data: 'lang_en' }, { text: "Türkçe 🇹🇷", callback_data: 'lang_tr' }],
                    [{ text: 'رجوع', callback_data: 'menu_back' }]
                ]
            }
        });
        return;
    }

    // Main menu navigation
    if (data === 'menu_back') {
        answer();
        bot.editMessageText(getWelcomeText(userId), { chat_id: chatId, message_id: message.message_id, parse_mode: 'Markdown', ...getMainKeyboard(userId) });
        return;
    }
    if (data === 'menu_dhikr') {
        answer();
        const d = getRandomDhikr();
        bot.sendMessage(chatId, `*ذكرك الآن:*\n\n_${d.text}_\n\nالعدد الموصى به: *${d.count}*`, { parse_mode: 'Markdown' });
        return;
    }
    if (data === 'menu_tasbih') {
        answer();
        bot.editMessageText('*المسبحة الإلكترونية*\n\nاختر الذكر:', { chat_id: chatId, message_id: message.message_id, parse_mode: 'Markdown', ...getTasbihSelectKeyboard() });
        return;
    }
    if (data === 'menu_library') {
        answer();
        bot.editMessageText('*المكتبة الإسلامية*\n\nاختر الكتاب:', { chat_id: chatId, message_id: message.message_id, parse_mode: 'Markdown', ...getLibraryKeyboard() });
        return;
    }
    if (data === 'menu_jawami' || data === 'jawami_random') {
        answer();
        sendRandomJawami(chatId);
        return;
    }
    if (data === 'menu_reminder_on') {
        if (isGroupChat(chatType) && !(await isGroupAdmin(chatId, userId))) { answer('هذا الخيار للمشرفين فقط'); return; }
        answer();
        handleReminderOn(chatId, userId, chatType);
        return;
    }
    if (data === 'menu_reminder_off') {
        if (isGroupChat(chatType) && !(await isGroupAdmin(chatId, userId))) { answer('هذا الخيار للمشرفين فقط'); return; }
        answer();
        handleReminderOff(chatId);
        return;
    }
    if (data === 'menu_settings') {
        if (isGroupChat(chatType) && !(await isGroupAdmin(chatId, userId))) { answer('هذا الخيار للمشرفين فقط'); return; }
        answer();
        bot.editMessageText('*إعدادات التذكير*\n\nاختر الفترة:', { chat_id: chatId, message_id: message.message_id, parse_mode: 'Markdown', ...getSettingsKeyboard() });
        return;
    }
    if (data === 'menu_stats') {
        answer();
        showStats(chatId, userId);
        return;
    }
    if (data === 'menu_help') {
        answer();
        const helpText = `/dhikr — ذكر عشوائي\n/tasbih — المسبحة\n/library — المكتبة\n/jawami — جوامع الدعاء\n/stats — الإحصائيات\n/reminder_on — تفعيل التذكيرات\n/reminder_off — إيقاف التذكيرات\n/reminder_settings — الإعدادات\n/menu — القائمة الرئيسية\n\n*للتواصل:* @vx\_rq`;
        bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
        return;
    }

    // Library file sending
    if (data.startsWith('lib_')) {
        answer('جاري إرسال الملف...');
        const key = data.replace('lib_', '');
        sendFile(chatId, key);
        return;
    }

    // Interval settings
    if (data.startsWith('interval_')) {
        if (isGroupChat(chatType) && !(await isGroupAdmin(chatId, userId))) { answer('هذا الخيار للمشرفين فقط'); return; }
        const intervalKey = data.replace('interval_', 'every_');
        userPreferences[userId].reminderInterval = intervalKey;
        saveData();
        if (activeChats.includes(chatId)) startReminder(chatId, intervalKey);
        answer('تم حفظ الإعدادات');
        bot.sendMessage(chatId, `تم تغيير فترة التذكير إلى: *${data.replace('interval_', '').replace('min', ' دقيقة').replace('hour', ' ساعة').replace('hours', ' ساعات')}*`, { parse_mode: 'Markdown' });
        return;
    }

    // Tasbih logic
    const tasbihMap = {
        'tasbih_subhanallah':  { text: 'سبحان الله', target: 33 },
        'tasbih_alhamdulillah': { text: 'الحمد لله', target: 33 },
        'tasbih_allahu_akbar':   { text: 'الله أكبر', target: 33 },
        'tasbih_la_ilaha':       { text: 'لا إله إلا الله', target: 100 },
        'tasbih_astaghfirullah': { text: 'أستغفر الله', target: 100 },
        'tasbih_salawat':        { text: 'اللهم صل على محمد', target: 100 },
        'tasbih_la_hawla':       { text: 'لا حول ولا قوة إلا بالله', target: 33 }
    };

    if (tasbihMap[data]) {
        answer();
        tasbihData[userId] = { ...tasbihMap[data], count: 0 };
        saveData();
        bot.editMessageText(`*المسبحة:* ${tasbihMap[data].text}`, { chat_id: chatId, message_id: message.message_id, parse_mode: 'Markdown', ...getTasbihCounterKeyboard(userId, data) });
        return;
    }

    if (data.startsWith('tasbih_add_')) {
        const tasbihId = data.replace('tasbih_add_', '');
        if (!tasbihData[userId]) { answer(); return; }
        tasbihData[userId].count++;
        userPreferences[userId].totalDhikr = (userPreferences[userId].totalDhikr || 0) + 1;
        userPreferences[userId].dailyCount = (userPreferences[userId].dailyCount || 0) + 1;
        saveData();
        if (tasbihData[userId].count >= tasbihData[userId].target) {
            answer('اكتمل الذكر! تقبّل الله منك');
            bot.sendMessage(chatId, `تم اكتمال *${tasbihData[userId].text}* — ${tasbihData[userId].target} مرة\n\nتقبّل الله منك`, { parse_mode: 'Markdown' });
            tasbihData[userId].count = 0; // Reset after completion or keep it? Original kept it.
        } else {
            answer();
        }
        bot.editMessageReplyMarkup(getTasbihCounterKeyboard(userId, tasbihId).reply_markup, { chat_id: chatId, message_id: message.message_id }).catch(() => {});
        return;
    }

    if (data.startsWith('tasbih_add10_')) {
        const tasbihId = data.replace('tasbih_add10_', '');
        if (!tasbihData[userId]) { answer(); return; }
        tasbihData[userId].count = Math.min(tasbihData[userId].count + 10, tasbihData[userId].target);
        userPreferences[userId].totalDhikr = (userPreferences[userId].totalDhikr || 0) + 10;
        userPreferences[userId].dailyCount = (userPreferences[userId].dailyCount || 0) + 10;
        saveData();
        answer();
        bot.editMessageReplyMarkup(getTasbihCounterKeyboard(userId, tasbihId).reply_markup, { chat_id: chatId, message_id: message.message_id }).catch(() => {});
        return;
    }

    if (data.startsWith('tasbih_reset_')) {
        const tasbihId = data.replace('tasbih_reset_', '');
        if (tasbihData[userId]) { tasbihData[userId].count = 0; saveData(); }
        answer('تم إعادة العداد');
        bot.editMessageReplyMarkup(getTasbihCounterKeyboard(userId, tasbihId).reply_markup, { chat_id: chatId, message_id: message.message_id }).catch(() => {});
        return;
    }

    answer();
});

// --- MESSAGE LISTENER (Keywords & Reactions) ---
const dhikrResponses = [
    'تقبّل الله منك وزادك ذكراً وطاعة.', 'اللهم تقبّل منا ومنك.', 'جزاك الله خيراً، الذكر نور القلوب.',
    'اللهم ارزقنا المداومة على ذكرك.', 'بارك الله فيك.', 'اللهم آمين، لا تنسَ أن تداوم على الذكر.',
    'اللهم اجعلنا من الذاكرين.', 'حفظك الله ورزقك الثبات.', 'اللهم زدنا علماً ونوراً وذكراً.', 'اللهم تقبّل وأعِن على المداومة.'
];

const dhikrKeywords = [
    'الحمد لله','سبحان الله','استغفر الله','أستغفر الله', 'الله أكبر','لا إله إلا الله','لا حول ولا قوة إلا بالله',
    'اللهم صل','يا الله','بسم الله','ماشاء الله','ما شاء الله', 'تبارك الله','حسبنا الله','توكلت على الله','لا إله إلا أنت',
    'يا رب','رب اغفر','اللهم اغفر','اللهم ارحم','صلى الله عليه'
];

bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    const text = msg.text.trim();
    const chatId = msg.chat.id;

    // Auto-send library files by keyword
    for (const [keyword, fileKey] of Object.entries(autoSendKeywords)) {
        if (text.includes(keyword)) {
            await sendFile(chatId, fileKey).catch(() => {});
            return;
        }
    }

    // Dhikr reactions
    if (dhikrKeywords.some(k => text.includes(k))) {
        const resp = dhikrResponses[Math.floor(Math.random() * dhikrResponses.length)];
        bot.sendMessage(chatId, resp, { reply_to_message_id: msg.message_id }).catch(console.error);
    }
});

// --- GROUP/CHANNEL UPDATES ---
bot.on('my_chat_member', (update) => {
    const { chat, new_chat_member } = update;
    const newStatus = new_chat_member?.status;
    const { id: chatId, type: chatType, title } = chat;
    if (newStatus === 'member' || newStatus === 'administrator') {
        if (chatType === 'channel' && !activeChats.includes(chatId)) {
            activeChats.push(chatId);
            botStats.totalReminders++;
            startReminder(chatId, 'every_2hours');
            saveData();
        }
        const isChannel = chatType === 'channel';
        const msg = isChannel
            ? `*السلام عليكم ورحمة الله وبركاته*\n\nتم إضافة *بوت نورِفاي* لهذه القناة.\n\nتم تفعيل التذكيرات تلقائياً — ذكر كل ساعتين\n\nلتغيير الفترة: /reminder_settings\nلإيقاف التذكير: /reminder_off`
            : `*السلام عليكم ورحمة الله وبركاته*\n\nتم إضافة *بوت نورِفاي* لمجموعة *${title || ''}*\n\nالأوامر المتاحة للجميع:\n/dhikr — ذكر عشوائي\n/tasbih — المسبحة\n/library — المكتبة\n/jawami — جوامع الدعاء\n/stats — الإحصائيات\n\nالأوامر للمشرفين فقط:\n/reminder_on — تفعيل التذكيرات\n/reminder_off — إيقاف التذكيرات\n/reminder_settings — إعدادات التذكير`;
        bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' }).catch(console.error);
    }
    if (newStatus === 'kicked' || newStatus === 'left') stopReminder(chatId);
});

// --- COMMANDS MENU ---
bot.setMyCommands([
    { command: 'start',             description: 'بدء البوت والقائمة الرئيسية' },
    { command: 'menu',              description: 'القائمة الرئيسية' },
    { command: 'dhikr',             description: 'ذكر عشوائي' },
    { command: 'tasbih',            description: 'المسبحة الإلكترونية' },
    { command: 'library',           description: 'المكتبة الإسلامية' },
    { command: 'jawami',            description: 'جوامع دعاء النبي' },
    { command: 'stats',             description: 'إحصائياتك' },
    { command: 'reminder_on',       description: 'تفعيل التذكيرات' },
    { command: 'reminder_off',      description: 'إيقاف التذكيرات' },
    { command: 'help',              description: 'المساعدة' }
]).catch(() => {});

bot.on('polling_error', (err) => console.error('Polling error:', err.message));

console.log('Noorify Bot v3.0 — Reorganized & Complete');
console.log("Bot Nourify is running successfully... ✅");
