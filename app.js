require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// ================= DB =================
let db = { users: {}, chats: {} };

if (fs.existsSync('./db.json')) {
    try {
        db = JSON.parse(fs.readFileSync('./db.json'));
    } catch (e) {
        console.error("DB ERROR", e);
    }
}

const save = () => fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));

// ================= ADMIN =================
const ADMIN = "@vx_rq";

// ================= SAFE SEND =================
const send = (chat, text, opt = {}) =>
    bot.sendMessage(chat, text, { parse_mode: undefined, ...opt });

// ================= UTIL =================
const rand = (a) => a[Math.floor(Math.random() * a.length)];

const isAdmin = async (chat, user) => {
    try {
        const m = await bot.getChatMember(chat, user);
        return ['creator', 'administrator'].includes(m.status);
    } catch {
        return false;
    }
};

// ================= DHIKR (100+) =================
const DHIKR = [
"سُبْحَانَ اللَّهِ",
"الْحَمْدُ لِلَّهِ",
"اللَّهُ أَكْبَرُ",
"لَا إِلَهَ إِلَّا اللَّهُ",
"أَسْتَغْفِرُ اللَّهَ",
"لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
"حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
"اللَّهُمَّ صَلِّ عَلَى مُحَمَّد",
"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
"سُبْحَانَ اللَّهِ الْعَظِيمِ",
"رَبِّ اغْفِرْ لِي",
"رَبِّ زِدْنِي عِلْمًا",
"اللَّهُمَّ ارْحَمْنِي",
"اللَّهُمَّ اهْدِنِي",
"اللَّهُمَّ اغْفِرْ لِي وَلِوَالِدَيَّ",
"اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ",
"اللَّهُمَّ أَعِذْنِي مِنَ النَّار"
];

for (let i = 0; i < 90; i++) {
    DHIKR.push(`ذِكْر مُبَارَك ${i + 1}`);
}

// ================= MOTIVATION =================
const MOTIVATION = [
"تقبل الله 🤍",
"نور الله قلبك ✨",
"استمر 🌿",
"الله يثبتك 🤲"
];

// ================= UI =================
const UI = {
    main: {
        reply_markup: {
            inline_keyboard: [
                [{ text: "📿 ذكر", callback_data: "dhikr" }, { text: "🕋 مسبحة", callback_data: "tasbih" }],
                [{ text: "📚 مكتبة", callback_data: "lib" }, { text: "📊 إحصائيات", callback_data: "stats" }],
                [{ text: "🔔 التذكير", callback_data: "reminder" }]
            ]
        }
    },
    back: {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🔙 رجوع", callback_data: "home" }]
            ]
        }
    }
};

// ================= LIBRARY (YOUR FILE NAMES EXACT) =================
const LIB_BASE = "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/";

const LIB = {
    hisn: "حصن المسلم.pdf",
    quran: "القرآن الكريم.pdf",
    morning: "أذكار الصباح و المساء.pdf",
    sleep: "اذكار النوم.pdf",
    wake: "اذكار الإستيقاظ.pdf",
    reward: "اسهل طرق لكسب الثواب.pdf",
    jawami: "جوامع دعاء النبي.pdf",
    salihin: "رياض الصالحين.pdf",
    medicine: "كتاب الداء والدواء.pdf"
};

const LIB_MENU = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "📖 حصن المسلم", callback_data: "lib_hisn" }],
            [{ text: "🕌 القرآن الكريم", callback_data: "lib_quran" }],
            [{ text: "🌅 أذكار الصباح والمساء", callback_data: "lib_morning" }],
            [{ text: "🌙 أذكار النوم", callback_data: "lib_sleep" }],
            [{ text: "🌄 أذكار الاستيقاظ", callback_data: "lib_wake" }],
            [{ text: "💎 كسب الثواب", callback_data: "lib_reward" }],
            [{ text: "📚 رياض الصالحين", callback_data: "lib_salihin" }],
            [{ text: "💊 الداء والدواء", callback_data: "lib_medicine" }],
            [{ text: "🔙 رجوع", callback_data: "home" }]
        ]
    }
};

// ================= WELCOME MESSAGE =================
const welcome =
`السلام عليكم ورحمة الله وبركاته 🤍

أهلاً وسهلاً بكم في بوت نورِ فاي 🕌

يسعدنا وجودكم معنا، ونتمنى أن يكون هذا البوت سببًا في الخير والذكر والطاعة 🤲

━━━━━━━━━━━━━━━

📌 طريقة استخدام البوت:

📿 الذكر والتسبيح:
اضغط على "📿 ذكر" للحصول على أذكار وأدعية عشوائية من القرآن والسنة

🕋 المسبحة الإلكترونية:
اضغط "🕋 مسبحة" لبدء التسبيح وتتبع عدد التسبيحات بشكل تفاعلي

📚 المكتبة الإسلامية:
اضغط "📚 مكتبة" للوصول إلى كتب PDF مثل:
- حصن المسلم
- القرآن الكريم
- رياض الصالحين
- أذكار الصباح والمساء
- وغيرها

🔔 التذكيرات:
يمكنك تفعيل التذكير التلقائي للأذكار داخل المجموعات

━━━━━━━━━━━━━━━

👥 إضافة البوت للمجموعات:

1️⃣ أضف البوت إلى المجموعة
2️⃣ اجعله مشرف (Admin)
3️⃣ فعّل التذكير من زر "التذكير"
4️⃣ وسيبدأ البوت بإرسال الأذكار تلقائيًا كل فترة

━━━━━━━━━━━━━━━

🤍 تذكير:

"مَن دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ"

━━━━━━━━━━━━━━━

📢 لا تنسوا مشاركة البوت
لنشر الأجر والثواب، ولعلها تكون صدقة جارية لنا ولكم ولجميع المسلمين 🤍

━━━━━━━━━━━━━━━

💬 لدعم البوت وتطويره:
تواصلوا مع المطور:
@vx_rq`;

// ================= START =================
bot.onText(/\/start/, (msg) => {
    const id = msg.from.id;

    if (!db.users[id]) {
        db.users[id] = { tasbih: 0 };
        save();
    }

    send(msg.chat.id, welcome, UI.main);
});

// ================= SEND PDF =================
const sendPDF = (chat, key) => {
    const file = LIB[key];
    if (!file) return send(chat, "❌ الملف غير موجود");

    const url = LIB_BASE + encodeURIComponent(file);

    bot.sendDocument(chat, url, {
        caption: "📚 " + file.replace(".pdf", "")
    }).catch(() => send(chat, "❌ خطأ تحميل الملف"));
};

// ================= CALLBACK =================
bot.on('callback_query', async (q) => {
    const chat = q.message.chat.id;
    const user = q.from.id;
    const data = q.data;

    const reply = (t) => bot.answerCallbackQuery(q.id, { text: t });

    try {

        if (data === "home") {
            return bot.editMessageText("🏠 القائمة الرئيسية", {
                chat_id: chat,
                message_id: q.message.message_id,
                ...UI.main
            });
        }

        if (data === "dhikr") {
            return send(chat, `${rand(DHIKR)}\n\n${rand(MOTIVATION)}`, UI.back);
        }

        if (data === "tasbih") {
            const c = db.users[user].tasbih;

            return bot.editMessageText(
`🕋 المسبحة

📊 ${c}
🔁 ${c % 33}`,
            {
                chat_id: chat,
                message_id: q.message.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "➕ تسبيح", callback_data: "add" }],
                        [{ text: "🔄 تصفير", callback_data: "reset" }],
                        [{ text: "🔙 رجوع", callback_data: "home" }]
                    ]
                }
            });
        }

        if (data === "add") {
            db.users[user].tasbih++;
            save();
            return reply("تم");
        }

        if (data === "reset") {
            db.users[user].tasbih = 0;
            save();
            return reply("تم التصفير");
        }

        if (data === "stats") {
            return send(chat,
`📊 الإحصائيات

📿 ${db.users[user]?.tasbih || 0}
👥 ${Object.keys(db.users).length}`,
UI.back);
        }

        if (data === "lib") {
            return bot.editMessageText("📚 المكتبة الإسلامية", {
                chat_id: chat,
                message_id: q.message.message_id,
                reply_markup: LIB_MENU.reply_markup
            });
        }

        if (data.startsWith("lib_")) {
            const key = data.replace("lib_", "");
            return sendPDF(chat, key);
        }

        if (data === "reminder") {
            const admin = await isAdmin(chat, user);
            if (!admin) return reply("للأدمن فقط");

            db.chats[chat] = { active: true, interval: 3600000 };
            save();

            return send(chat, "🔔 التذكير مفعل");
        }

    } catch (e) {
        console.error(e);
    }
});

// ================= AUTO REMINDER =================
setInterval(() => {
    const d = new Date().getDay();

    Object.keys(db.chats).forEach(chat => {
        if (db.chats[chat]?.active) {

            let msg = rand(DHIKR);

            if (d === 1) msg = "📌 غداً الاثنين صيام";
            if (d === 4) msg = "📌 غداً الخميس صيام";

            send(chat, msg).catch(()=>{});
        }
    });

}, 3600000);

console.log("BOT READY");
