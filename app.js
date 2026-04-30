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

// ==================== 2. SMART DHIKR POOL ====================
const dhikrPool = [
    "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ",
    "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    "اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
    "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ نَبِيِّنَا مُحَمَّدٍ",
    "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    "﴿رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ﴾",
    "﴿رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ﴾",
    "﴿رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا﴾",
    "﴿إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾",
    "﴿رَبِّ زِدْنِي عِلْمًا﴾",
    "﴿رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنْكَ رَحْمَةً﴾",
    "﴿رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي﴾",
    "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ﴾",
    "﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾",
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

// مصفوفة الملفات الصحيحة v5.3
const filesConfig = [
    { id: 'hisn',     name: 'حصن المسلم', keywords: ['حصن', 'المسلم'] },
    { id: 'quran',    name: 'القرآن الكريم', keywords: ['القرآن', 'الكريم'] },
    { id: 'morning',  name: 'أذكار الصباح والمساء', keywords: ['الصباح', 'المساء'] },
    { id: 'sleep',    name: 'أذكار النوم', keywords: ['النوم'] },
    { id: 'wake',     name: 'أذكار الاستيقاظ', keywords: ['الاستيقاظ'] },
    { id: 'reward',   name: 'أسهل طرق لكسب الثواب', keywords: ['الثواب'] },
    { id: 'jawami',   name: 'جوامع دعاء النبي', keywords: ['جوامع', 'دعاء'] },
    { id: 'salihin',  name: 'رياض الصالحين', keywords: ['رياض', 'الصالحين'] },
    { id: 'medicine', { name: 'كتاب الداء والدواء', keywords: ['الداء', 'الدواء'] } }
];

// تصحيح المصفوفة لتجنب خطأ التعريف
const filesData = [
    { id: 'hisn',     name: 'حصن المسلم', keywords: ['حصن', 'المسلم'] },
    { id: 'quran',    name: 'القرآن الكريم', keywords: ['القرآن', 'الكريم'] },
    { id: 'morning',  name: 'أذكار الصباح والمساء', keywords: ['الصباح', 'المساء'] },
    { id: 'sleep',    name: 'أذكار النوم', keywords: ['النوم'] },
    { id: 'wake',     name: 'أذكار الاستيقاظ', keywords: ['الاستيقاظ'] },
    { id: 'reward',   name: 'أسهل طرق لكسب الثواب', keywords: ['الثواب'] },
    { id: 'jawami',   name: 'جوامع دعاء النبي', keywords: ['جوامع', 'دعاء'] },
    { id: 'salihin',  name: 'رياض الصالحين', keywords: ['رياض', 'الصالحين'] },
    { id: 'medicine', name: 'كتاب الداء والدواء', keywords: ['الداء', 'الدواء'] }
];

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

const isAdmin = async (chatId, userId) => {
    try {
        const chat = await bot.getChat(chatId);
        if (chat.type === 'private') return true;
        const member = await bot.getChatMember(chatId, userId);
        return ['creator', 'administrator'].includes(member.status);
    } catch { return false; }
};

const findFileSmartly = (keywords) => {
    try {
        const files = fs.readdirSync(__dirname);
        return files.find(file => {
            const fileName = file.toLowerCase();
            return keywords.every(kw => fileName.includes(kw.toLowerCase()));
        });
    } catch { return null; }
};

const sendFile = async (chatId, fileId) => {
    const config = filesData.find(f => f.id === fileId);
    if (!config) return;
    
    await bot.sendChatAction(chatId, 'upload_document');
    const foundFile = findFileSmartly(config.keywords);
    
    if (foundFile) {
        const localPath = path.join(__dirname, foundFile);
        await bot.sendDocument(chatId, localPath, {
            caption: `*${config.name}*\n\nتم الإرسال بواسطة بوت نورِفاي 🕌`,
            parse_mode: 'Markdown'
        });
    } else {
        bot.sendMessage(chatId, `❌ عذراً، لم أتمكن من العثور على ملف *${config.name}*.\nيرجى التأكد من رفعه على GitHub باسم واضح.`, { parse_mode: 'Markdown' });
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

// ==================== 5. HANDLERS ====================
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `*السلام عليكم ورحمة الله وبركاته* 🌹\n\nيسعدنا تجربتكم لبوت *نورِفاي* 🕌\nرفيقك المؤمن للمداومة على ذكر الله.\n\nاستخدم الأزرار أدناه للتنقل 👇`, { parse_mode: 'Markdown', ...getMainKeyboard() });
});

bot.on('callback_query', async (query) => {
    const { id: queryId, message, from, data } = query;
    const chatId = message.chat.id;
    const userId = from.id;
    const answer = (text) => bot.answerCallbackQuery(queryId, text ? { text } : {}).catch(() => {});

    if (['menu_reminder_on', 'menu_reminder_off', 'menu_settings'].some(c => data.startsWith(c))) {
        if (!(await isAdmin(chatId, userId))) return answer('عذراً، هذه الخاصية للمشرفين فقط ⚠️');
    }

    if (data === 'menu_back') {
        answer();
        bot.editMessageText(`*القائمة الرئيسية* 🕌`, { chat_id: chatId, message_id: message.message_id, parse_mode: 'Markdown', ...getMainKeyboard() });
        return;
    }

    if (data === 'menu_dhikr') {
        answer();
        bot.sendMessage(chatId, `✨ *ذكرك الآن:*\n\n${getRandom(dhikrPool)}\n\n💎 _${getRandom(acceptMessages)}_`, { parse_mode: 'Markdown' });
        return;
    }

    if (data === 'menu_library') {
        answer();
        bot.editMessageText('📚 *المكتبة الإسلامية*', { chat_id: chatId, message_id: message.message_id, parse_mode: 'Markdown', ...getLibraryKeyboard() });
        return;
    }

    if (data.startsWith('lib_')) {
        answer('⏳ جاري جلب الملف...');
        sendFile(chatId, data.replace('lib_', ''));
        return;
    }

    answer();
});

console.log("Noorify Bot v5.3 — Final Fixed Version ✅");
