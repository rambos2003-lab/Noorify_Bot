/**
 * 🕌 NOORIFY ENGINE v6.0 - THE LEGENDARY EDITION
 * --------------------------------------------------
 * A high-performance, feature-rich Islamic Telegram Bot.
 * Engineered with precision for: rambos2003-lab
 * --------------------------------------------------
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// --- SYSTEM CONFIGURATION ---
const CONFIG = {
    TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    DB_PATH: path.join(__dirname, 'noorify_database.json'),
    DEFAULT_INTERVAL: 2 * 60 * 60 * 1000, // 2 Hours
    DEVELOPER_TAG: "@vx_rq"
};

if (!CONFIG.TOKEN) {
    console.error('CRITICAL ERROR: TELEGRAM_BOT_TOKEN NOT FOUND');
    process.exit(1);
}

const bot = new TelegramBot(CONFIG.TOKEN, { polling: true });

// --- DATA ENGINE ---
let db = {
    chats: {}, // { chatId: { active: bool, interval: ms, lastSent: ts } }
    users: {}, // { userId: { tasbih: int, joined: ts } }
    stats: { total_reminders: 0 }
};

const persist = () => fs.writeFileSync(CONFIG.DB_PATH, JSON.stringify(db, null, 2));
if (fs.existsSync(CONFIG.DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(CONFIG.DB_PATH)); } catch (e) { console.error("DB Load Error"); }
}

// --- CONTENT ARCHIVE ---
const DHIKR_POOL = [
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
    "﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾"
];

const MOTIVATION = [
    "تقبل الله منك طاعتك ✨", "زادك الله نوراً وهدى 🌟", "اللهم آمين، استمر 🤲", "هنيئاً لك الأجر 💎", "اللهم اجعلنا من الذاكرين 🕊️"
];

const LIBRARY = [
    { id: 'hisn', name: 'حصن المسلم', keys: ['حصن', 'المسلم'] },
    { id: 'quran', name: 'القرآن الكريم', keys: ['القرآن', 'الكريم'] },
    { id: 'morning', name: 'أذكار الصباح والمساء', keys: ['الصباح', 'المساء'] },
    { id: 'sleep', name: 'أذكار النوم', keys: ['النوم'] },
    { id: 'wake', name: 'أذكار الاستيقاظ', keys: ['الاستيقاظ'] },
    { id: 'reward', name: 'أسهل طرق لكسب الثواب', keys: ['الثواب'] },
    { id: 'jawami', name: 'جوامع دعاء النبي', keys: ['جوامع', 'دعاء'] },
    { id: 'salihin', name: 'رياض الصالحين', keys: ['رياض', 'الصالحين'] },
    { id: 'medicine', name: 'كتاب الداء والدواء', keys: ['الداء', 'الدواء'] }
];

// --- CORE LOGIC ---
const utils = {
    rand: (a) => a[Math.floor(Math.random() * a.length)],
    isAdmin: async (c, u) => {
        try {
            const chat = await bot.getChat(c);
            if (chat.type === 'private') return true;
            const m = await bot.getChatMember(c, u);
            return ['creator', 'administrator'].includes(m.status);
        } catch { return false; }
    },
    findFile: (keys) => {
        try {
            const files = fs.readdirSync(__dirname);
            return files.find(f => keys.every(k => f.toLowerCase().includes(k.toLowerCase())));
        } catch { return null; }
    },
    getTasbihVisual: (count) => {
        const cycle = count % 33;
        const progress = Math.floor((cycle / 33) * 10);
        let bar = "▢".repeat(10).split("");
        for(let i=0; i<progress; i++) bar[i] = "▣";
        return `\n📊 [${bar.join("")}] ${Math.floor((cycle/33)*100)}%\n`;
    }
};

// --- INTERFACE BUILDERS ---
const ui = {
    main: () => ({
        reply_markup: {
            inline_keyboard: [
                [{ text: "📿 ذكر عشوائي", callback_data: 'cmd_dhikr' }, { text: "🕋 المسبحة الذكية", callback_data: 'cmd_tasbih_ui' }],
                [{ text: "📚 المكتبة الشاملة", callback_data: 'cmd_lib' }, { text: "📊 إحصائياتي", callback_data: 'cmd_stats' }],
                [{ text: "🔔 تفعيل التذكير", callback_data: 'adm_on' }, { text: "🔕 إيقاف التذكير", callback_data: 'adm_off' }],
                [{ text: "⚙️ ضبط الفترة", callback_data: 'adm_set' }, { text: "❓ مساعدة", callback_data: 'cmd_help' }]
            ]
        }
    }),
    lib: () => ({
        reply_markup: {
            inline_keyboard: [
                [{ text: '📖 حصن المسلم', callback_data: 'get_hisn' }, { text: '🕌 القرآن الكريم', callback_data: 'get_quran' }],
                [{ text: '☀️ أذكار الصباح والمساء', callback_data: 'get_morning' }],
                [{ text: '🌙 أذكار النوم', callback_data: 'get_sleep' }, { text: '🌅 أذكار الاستيقاظ', callback_data: 'get_wake' }],
                [{ text: '📚 رياض الصالحين', callback_data: 'get_salihin' }, { text: '💊 الداء والدواء', callback_data: 'get_medicine' }],
                [{ text: '🔙 العودة للقائمة', callback_data: 'cmd_start' }]
            ]
        }
    }),
    tasbih: (u) => {
        const c = db.users[u]?.tasbih || 0;
        return {
            text: `🕋 *المسبحة الإلكترونية المتطورة*\n\nالعدد الإجمالي: \`${c}\`\nالدورة الحالية (33): \`${c % 33}\`\n${utils.getTasbihVisual(c)}\n_اضغط على الزر أدناه للتسبيح_ 👇`,
            markup: {
                inline_keyboard: [
                    [{ text: "📿 سُبْحَانَ اللَّه", callback_data: 'act_tasbih' }],
                    [{ text: "🔄 تصفير الدورة", callback_data: 'act_reset' }, { text: "🔙 رجوع", callback_data: 'cmd_start' }]
                ]
            }
        };
    }
};

// --- COMMAND HANDLERS ---
bot.onText(/\/start/, (msg) => {
    const uid = msg.from.id;
    if (!db.users[uid]) {
        db.users[uid] = { tasbih: 0, joined: Date.now() };
        persist();
    }
    bot.sendMessage(msg.chat.id, 
        `*السلام عليكم ورحمة الله وبركاته* 🌹\n\nمرحباً بك في بوت *نورِفاي v6.0* 🕌\nالنظام الأكثر تطوراً للمداومة على ذكر الله.\n\n💡 *كيفية الاستخدام:*\n• للمجموعات: أضف البوت وارفع صلاحياته لمشرف.\n• للتفعيل: استخدم زر "تفعيل التذكير" (للمشرفين فقط).\n• للتفاعل: استكشف الأزرار أدناه للوصول للمكتبة والمسبحة.\n\n_ساهم معنا في نشر الخير والأجر والثواب_ 💎\n\n👨‍💻 *للدعم والتطوير:* ${CONFIG.DEVELOPER_TAG}`, 
        { parse_mode: 'Markdown', ...ui.main() }
    );
});

bot.on('callback_query', async (q) => {
    const cid = q.message.chat.id;
    const uid = q.from.id;
    const mid = q.message.message_id;
    const act = q.data;

    const notify = (t) => bot.answerCallbackQuery(q.id, { text: t }).catch(()=>{});

    // Permission Guard
    if (act.startsWith('adm_') && !(await utils.isAdmin(cid, uid))) {
        return notify('⚠️ عذراً، هذه الصلاحية للمشرفين فقط');
    }

    try {
        if (act === 'cmd_start') {
            bot.editMessageText(`*القائمة الرئيسية للنظام* 🕌`, { chat_id: cid, message_id: mid, parse_mode: 'Markdown', ...ui.main() });
        }
        else if (act === 'cmd_dhikr') {
            bot.sendMessage(cid, `✨ *الذكر الحكيم:*\n\n${utils.rand(DHIKR_POOL)}\n\n💎 _${utils.rand(MOTIVATION)}_`, { parse_mode: 'Markdown' });
        }
        else if (act === 'cmd_tasbih_ui') {
            const t = ui.tasbih(uid);
            bot.editMessageText(t.text, { chat_id: cid, message_id: mid, parse_mode: 'Markdown', reply_markup: t.markup });
        }
        else if (act === 'act_tasbih') {
            db.users[uid].tasbih++;
            persist();
            const t = ui.tasbih(uid);
            bot.editMessageText(t.text, { chat_id: cid, message_id: mid, parse_mode: 'Markdown', reply_markup: t.markup });
            notify('✅ تم التسبيح');
        }
        else if (act === 'act_reset') {
            const current = db.users[uid].tasbih;
            db.users[uid].tasbih = current - (current % 33);
            persist();
            const t = ui.tasbih(uid);
            bot.editMessageText(t.text, { chat_id: cid, message_id: mid, parse_mode: 'Markdown', reply_markup: t.markup });
            notify('🔄 تم تصفير الدورة');
        }
        else if (act === 'cmd_lib') {
            bot.editMessageText('📚 *المكتبة الإسلامية الشاملة*\nاختر الكتاب الذي ترغب في تحميله:', { chat_id: cid, message_id: mid, parse_mode: 'Markdown', ...ui.lib() });
        }
        else if (act.startsWith('get_')) {
            const fileKey = act.split('_')[1];
            const meta = LIBRARY.find(l => l.id === fileKey);
            notify('⏳ جاري جلب الملف...');
            const pathFile = utils.findFile(meta.keys);
            if (pathFile) {
                bot.sendDocument(cid, path.join(__dirname, pathFile), { caption: `📖 *${meta.name}*\nتم الإرسال عبر نورِفاي 🕌`, parse_mode: 'Markdown' });
            } else {
                bot.sendMessage(cid, `❌ الملف *${meta.name}* غير متاح حالياً في السيرفر.`, { parse_mode: 'Markdown' });
            }
        }
        else if (act === 'adm_on') {
            db.chats[cid] = { active: true, interval: CONFIG.DEFAULT_INTERVAL, lastSent: Date.now() };
            persist();
            bot.sendMessage(cid, `✅ *تم تفعيل التذكير التلقائي*\nسيقوم البوت بنشر الأذكار دورياً في هذه المجموعة.`, { parse_mode: 'Markdown' });
        }
        else if (act === 'adm_off') {
            if (db.chats[cid]) db.chats[cid].active = false;
            persist();
            bot.sendMessage(cid, `🔕 *تم إيقاف التذكير التلقائي*`, { parse_mode: 'Markdown' });
        }
        else if (act === 'cmd_stats') {
            const count = db.users[uid]?.tasbih || 0;
            bot.sendMessage(cid, `📊 *إحصائياتك الشخصية*\n\n📿 إجمالي التسبيح: \`${count}\`\n🕌 إجمالي الذاكرين: \`${Object.keys(db.users).length}\`\n\n_بارك الله فيك وزادك حرصاً_ ✨`, { parse_mode: 'Markdown' });
        }
        else if (act === 'cmd_help') {
            bot.sendMessage(cid, `❓ *دليل الاستخدام السريع*\n\n1️⃣ أضف البوت للمجموعة.\n2️⃣ ارفعه لرتبة مشرف.\n3️⃣ اضغط "تفعيل التذكير" لبدء النشر.\n\nلأي استفسار أو بلاغ عن عطل: ${CONFIG.DEVELOPER_TAG}`, { parse_mode: 'Markdown' });
        }
    } catch (e) { console.error(e); }
    notify();
});

// --- AUTOMATION ENGINE ---
setInterval(() => {
    const now = Date.now();
    Object.keys(db.chats).forEach(chatId => {
        const conf = db.chats[chatId];
        if (conf.active && (now - conf.lastSent) >= conf.interval) {
            bot.sendMessage(chatId, `🌟 *تذكير إيماني:*\n\n${utils.rand(DHIKR_POOL)}\n\n_لا تنسَ ذكر الله_ ✨`, { parse_mode: 'Markdown' })
               .then(() => {
                   db.chats[chatId].lastSent = now;
                   db.stats.total_reminders++;
                   persist();
               })
               .catch(() => { /* Silent fail for blocked/removed chats */ });
        }
    });
}, 60000); // Check every minute

// Handle Group Add
bot.on('my_chat_member', (msg) => {
    if (msg.new_chat_member.status === 'member') {
        bot.sendMessage(msg.chat.id, `🕌 *أهلاً بكم في رحاب نورِفاي*\n\nتمت إضافتي للمجموعة بنجاح. يرجى من أحد المشرفين تفعيل التذكيرات التلقائية عبر القائمة الرئيسية.\n\nاستخدم /start للبدء.`, { parse_mode: 'Markdown' });
    }
});

console.log("🚀 NOORIFY ENGINE v6.0 - ONLINE & SECURED");
