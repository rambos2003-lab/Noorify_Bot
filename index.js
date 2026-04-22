require('dotenv').config(); 
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = process.env.TELEGRAM_BOT_TOKEN; 

if (!token) {
    console.error("خطأ: لم يتم العثور على TELEGRAM_BOT_TOKEN في ملف .env");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const REMINDERS_FILE = 'reminders_data.json';

let activeChats = [];
if (fs.existsSync(REMINDERS_FILE)) {
    try {
        const data = fs.readFileSync(REMINDERS_FILE);
        activeChats = JSON.parse(data);
    } catch (e) {
        console.error("خطأ في قراءة ملف التذكيرات:", e);
        activeChats = [];
    }
}

const activeIntervals = {};

const saveChats = () => {
    try {
        fs.writeFileSync(REMINDERS_FILE, JSON.stringify(activeChats));
    } catch (e) {
        console.error("خطأ في حفظ ملف التذكيرات:", e);
    }
};

const filesMap = {
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
    "اللهم إني أعوذ بك من الكفر والفقر",
    "يا رب لك الحمد كما ينبغي لجلال وجهك وعظيم سلطانك",
    "اللهم ارزقني حبك وحب من يحبك",
    "سبحان الله عدد ما خلق، سبحان الله ملء ما خلق",
    "الحمد لله الذي بنعمته تتم الصالحات",
    "اللهم اجعلني من التوابين واجعلني من المتطهرين",
    "يا غفور يا رحيم اغفر لي ذنوبي",
    "اللهم اهدني وسددني",
    "رب اشرح لي صدري ويسر لي أمري",
    "اللهم إني أسألك الجنة وما قرب إليها من قول أو عمل",
    "أعوذ بك من النار وما قرب إليها من قول أو عمل",
    "اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
    "يا رب ارزقني الفردوس الأعلى",
    "اللهم إني أسألك العفو والعافية في ديني ودنياي وأهلي ومالي",
    "اللهم استر عوراتي وآمن روعاتي",
    "يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين",
    "اللهم صل على سيدنا محمد وعلى آله وصحبه وسلم",
    "سبحان الله العظيم وبحمده",
    "اللهم اجعل القرآن ربيع قلبي ونور صدري",
    "يا واسع المغفرة اغفر لي",
    "اللهم ثبتني على الصراط المستقيم",
    "اللهم ارزقني الأخلاص في القول والعمل",
    "الحمد لله حمدا كثيرا طيبا مباركا فيه",
    "لا إله إلا الله الملك الحق المبين"
];

const getRandomDhikr = () => athkarList[Math.floor(Math.random() * athkarList.length)];

const startReminder = (chatId) => {
    if (activeIntervals[chatId]) return;
    activeIntervals[chatId] = setInterval(() => {
        bot.sendMessage(chatId, "✨ *تذكيرك الدوري:* \n\n" + getRandomDhikr(), { parse_mode: 'Markdown' })
            .catch(err => {
                console.log(`فشل إرسال التذكير لـ ${chatId}: قد يكون البوت غادر المجموعة.`);
                stopReminder(chatId);
            });
    }, 3600000); 
};

const stopReminder = (chatId) => {
    if (activeIntervals[chatId]) {
        clearInterval(activeIntervals[chatId]);
        delete activeIntervals[chatId];
    }
    activeChats = activeChats.filter(id => id !== chatId);
    saveChats();
};

activeChats.forEach(chatId => startReminder(chatId));

bot.onText(/\/start/, (msg) => {
    const welcomeText = `
*السلام عليكم ورحمة الله وبركاته* 🌿
أهلاً بك في بوت *Noorify*، رفيقك في رحلة المداومة على ذكر الله.

📌 *القائمة الرئيسية:*
/dhikr - الحصول على ذكر عشوائي الآن
/library - فتح المكتبة الرقمية (ملفات PDF)
/reminder_on - تفعيل التذكير الآلي (كل ساعة)
/reminder_off - إيقاف التذكير الآلي

💡 *نصيحة:* يمكنك إضافة البوت إلى مجموعاتك لنشر الخير والذكر بين أصدقائك.

*نسأل الله أن يجعل هذا البوت في ميزان حسناتنا جميعاً.*
للتواصل مع المطور: @vxrq1
`;
    bot.sendMessage(msg.chat.id, welcomeText, { parse_mode: 'Markdown' });
});

bot.onText(/\/dhikr/, (msg) => {
    bot.sendMessage(msg.chat.id, getRandomDhikr());
});

bot.onText(/\/reminder_on/, (msg) => {
    const chatId = msg.chat.id;
    if (activeChats.includes(chatId)) return bot.sendMessage(chatId, "⚠️ التذكيرات مفعلة بالفعل.");
    activeChats.push(chatId);
    saveChats();
    startReminder(chatId);
    bot.sendMessage(chatId, "✅ تم تفعيل التذكيرات.");
});

bot.onText(/\/reminder_off/, (msg) => {
    stopReminder(msg.chat.id);
    bot.sendMessage(msg.chat.id, "🔕 تم إيقاف التذكيرات.");
});

bot.onText(/\/library/, (msg) => {
    bot.sendMessage(msg.chat.id, "📚 اختر الكتاب:", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "📖 أذكار النوم", callback_data: 'athkar_sleep' }],
                [{ text: "🌅 أذكار الاستيقاظ", callback_data: 'athkar_wake' }],
                [{ text: "💎 طرق كسب الثواب", callback_data: 'easy_thawab' }],
                [{ text: "📗 القرآن الكريم", callback_data: 'quran' }],
                [{ text: "🛡️ حصن المسلم", callback_data: 'hisn_muslim' }]
            ]
        }
    });
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const fileName = filesMap[query.data];
    if (fileName && fs.existsSync(`./${fileName}`)) {
        bot.sendChatAction(chatId, 'upload_document'); // التعديل هنا
        bot.sendDocument(chatId, `./${fileName}`);
    }
    bot.answerCallbackQuery(query.id);
});

bot.on("polling_error", (err) => console.log("Polling Error:", err.message));

console.log("Noorify Bot is running...");