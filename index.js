require('dotenv').config(); 
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');


const token = process.env.TELEGRAM_BOT_TOKEN; 

if (!token) {
    console.error("خطأ: لم يتم العثور على TELEGRAM_BOT_TOKEN. تأكد من إضافته في إعدادات Railway.");
    process.exit(1);
}


const bot = new TelegramBot(token, { polling: true });


const DATA_FILE = path.join(__dirname, 'reminders_data.json');

let activeChats = [];
if (fs.existsSync(DATA_FILE)) {
    try {
        const data = fs.readFileSync(DATA_FILE);
        activeChats = JSON.parse(data);
    } catch (e) {
        activeChats = [];
    }
}

const activeIntervals = {};

const saveChats = () => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(activeChats));
    } catch (e) {
        console.error("خطأ في حفظ البيانات:", e);
    }
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

// ✅ تصحيح الدالة - إزالة الأيقونات والرموز المعقدة
const startReminder = (chatId) => {
    if (activeIntervals[chatId]) return;
    activeIntervals[chatId] = setInterval(() => {
        const dhikr = getRandomDhikr();
        const message = `تذكيرك الدوري:\n\n${dhikr}`;
        bot.sendMessage(chatId, message)
            .catch(err => {
                console.error("خطأ في الإرسال:", err);
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
    const chatId = msg.chat.id;
    
    // الرسالة الأولى - الترحيب الأساسي
    const welcomeText = "السلام عليكم ورحمة الله وبركاته 🌿\n\nأهلاً بك في بوت Noorify\nرفيقك في رحلة المداومة على ذكر الله";
    
    bot.sendMessage(chatId, welcomeText).then(() => {
        // الرسالة الثانية - القائمة
        const menuText = "📌 القائمة الرئيسية:\n\n/dhikr - ذكر عشوائي الآن\n/library - المكتبة الرقمية\n/reminder_on - تفعيل التذكيرات\n/reminder_off - إيقاف التذكيرات";
        return bot.sendMessage(chatId, menuText);
    }).then(() => {
        // الرسالة الثالثة - النصيحة والتواصل
        const infoText = "💡 نصيحة: أضف البوت لمجموعاتك لنشر الخير\n\nنسأل الله أن يجعل هذا العمل خالصاً لوجهه الكريم\n\nللتواصل: @vx_rq";
        return bot.sendMessage(chatId, infoText);
    }).catch(err => {
        console.error("خطأ في رسائل start:", err);
    });
});

bot.onText(/\/dhikr/, (msg) => {
    const dhikr = getRandomDhikr();
    const message = `ذكرك اليوم:\n\n${dhikr}`;
    bot.sendMessage(msg.chat.id, message).catch(err => {
        console.error("خطأ في رسالة dhikr:", err);
    });
});

bot.onText(/\/reminder_on/, (msg) => {
    const chatId = msg.chat.id;
    if (activeChats.includes(chatId)) {
        return bot.sendMessage(chatId, "التذكيرات مفعلة بالفعل.");
    }
    activeChats.push(chatId);
    saveChats();
    startReminder(chatId);
    bot.sendMessage(chatId, "تم تفعيل التذكير الآلي بنجاح (ذكر كل ساعة).").catch(err => {
        console.error("خطأ في رسالة reminder_on:", err);
    });
});

bot.onText(/\/reminder_off/, (msg) => {
    stopReminder(msg.chat.id);
    bot.sendMessage(msg.chat.id, "تم إيقاف التذكير الآلي.").catch(err => {
        console.error("خطأ في رسالة reminder_off:", err);
    });
});

bot.onText(/\/library/, (msg) => {
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
        console.error("خطأ في رسالة library:", err);
    });
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const fileKey = query.data;
    const fileName = filesMap[fileKey];

    if (fileName) {
        const filePath = path.join(__dirname, fileName);
        if (fs.existsSync(filePath)) {
            bot.sendChatAction(chatId, 'upload_document');
            // تحديد content-type لتجنب deprecation warning
            bot.sendDocument(chatId, filePath, {}, { contentType: 'application/pdf' }).catch(err => {
                console.error("خطأ في إرسال الملف:", err);
                bot.sendMessage(chatId, "حدث خطأ في إرسال الملف. حاول لاحقاً.").catch(e => {
                    console.error("خطأ في رسالة الخطأ:", e);
                });
            });
        } else {
            bot.sendMessage(chatId, "الملف غير موجود حالياً على السيرفر.").catch(err => {
                console.error("خطأ في رسالة الملف المفقود:", err);
            });
        }
    }
    bot.answerCallbackQuery(query.id).catch(err => {
        console.error("خطأ في answerCallbackQuery:", err);
    });
});

bot.on('message', (msg) => {
    if (msg.text) {
        const text = msg.text;
        if (text.includes('الحمد لله') || text.includes('سبحان الله') || text.includes('استغفر الله')) {
            bot.sendMessage(msg.chat.id, "تقبل الله منك وزادك ذكراً وطاعة.", { reply_to_message_id: msg.message_id }).catch(err => {
                console.error("خطأ في رسالة الرد:", err);
            });
        }
    }
});

bot.on("polling_error", (err) => console.log("Polling Error:", err.message));

console.log("Noorify Bot is alive and running...");
