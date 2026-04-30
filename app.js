require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

process.noDeprecation = true;

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) { console.error('TELEGRAM_BOT_TOKEN missing'); process.exit(1); }

const bot = new TelegramBot(token, { polling: true });

// ==================== DATA FILES ====================
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
loadData();

const activeIntervals = {};

const saveData = () => {
    try {
        fs.writeFileSync(DATA_FILE,       JSON.stringify(activeChats,     null, 2));
        fs.writeFileSync(STATS_FILE,      JSON.stringify(botStats,        null, 2));
        fs.writeFileSync(USER_PREFS_FILE, JSON.stringify(userPreferences, null, 2));
        fs.writeFileSync(TASBIH_FILE,     JSON.stringify(tasbihData,      null, 2));
    } catch(e) { console.error('Save error:', e.message); }
};

const trackCommand = (cmd) => {
    botStats.commandsUsed[cmd] = (botStats.commandsUsed[cmd] || 0) + 1;
    saveData();
};

// ==================== ADMIN CHECK ====================
const isGroupAdmin = async (chatId, userId) => {
    try {
        const member = await bot.getChatMember(chatId, userId);
        return ['creator', 'administrator'].includes(member.status);
    } catch { return false; }
};

const isPrivateChat = (type) => type === 'private';
const isGroupChat   = (type) => ['group', 'supergroup'].includes(type);

// ==================== ATHKAR ====================
const athkarList = [
    { text: "سبحان الله وبحمده",                              count: 33 },
    { text: "الحمد لله",                                      count: 33 },
    { text: "الله أكبر",                                      count: 33 },
    { text: "لا إله إلا الله",                                count: 100 },
    { text: "أستغفر الله العظيم وأتوب إليه",                  count: 100 },
    { text: "لا حول ولا قوة إلا بالله",                       count: 33 },
    { text: "سبحان الله وبحمده سبحان الله العظيم",            count: 100 },
    { text: "اللهم صل على محمد وعلى آل محمد",                  count: 100 },
    { text: "لا إله إلا أنت سبحانك إني كنت من الظالمين",       count: 40 },
    { text: "يا حي يا قيوم برحمتك أستغيث",                    count: 40 },
    { text: "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم", count: 7 },
    { text: "سبحان الله والحمد لله ولا إله إلا الله والله أكبر", count: 33 },
    { text: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير", count: 10 },
    { text: "اللهم أعني على ذكرك وشكرك وحسن عبادتك",           count: 3 },
    { text: "يا مقلب القلوب ثبت قلبي على دينك",               count: 40 },
    { text: "اللهم إني أسألك علماً نافعاً ورزقاً طيباً وعملاً متقبلاً", count: 3 },
    { text: "اللهم اغفر لي ولوالدي وللمؤمنين والمؤمنات",       count: 3 },
    { text: "رب اغفر لي وتب علي إنك أنت التواب الرحيم",        count: 100 },
    { text: "رضيت بالله رباً وبالإسلام ديناً وبمحمد نبياً",     count: 3 },
    { text: "اللهم إنك عفو تحب العفو فاعف عني",               count: 100 },
    { text: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم", count: 3 },
    { text: "اللهم ارزقني حبك وحب من يحبك",                   count: 3 },
    { text: "الحمد لله الذي بنعمته تتم الصالحات",              count: 3 },
    { text: "لا إله إلا الله الملك الحق المبين",               count: 100 },
    { text: "سبحان الله عدد ما خلق",                           count: 33 },
    { text: "اللهم صل وسلم على نبينا محمد",                    count: 100 },
    { text: "اللهم إني أسألك المعافاة في الدنيا والآخرة",       count: 3 },
    { text: "اللهم اهدني وسددني",                              count: 3 },
    { text: "اللهم اجعل في قلبي نوراً وفي لساني نوراً وفي بصري نوراً", count: 3 }
];

const getRandomDhikr = () => athkarList[Math.floor(Math.random() * athkarList.length)];

// ==================== JAWAMI DUAS (from PDF) ====================
const jawamiDuas = [
    { num: 1,  text: "اللهم ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",                  source: "رواه البخاري (6389) ومسلم (2690)" },
    { num: 2,  text: "لا إله إلا أنت سبحانك إني كنت من الظالمين",                                         source: "صحيح الترغيب (1644)" },
    { num: 3,  text: "اللهم اغفر لي وارحمني وعافني وارزقني",                                               source: "رواه مسلم (2697)" },
    { num: 4,  text: "اللهم أعني على ذكرك وشكرك وحسن عبادتك",                                             source: "السلسلة الصحيحة (844)" },
    { num: 5,  text: "اللهم إني أسألك المعافاة في الدنيا والآخرة",                                         source: "صحيح الجامع (5703)" },
    { num: 6,  text: "اللهم أصلح لي ديني الذي هو عصمة أمري وأصلح لي دنياي التي فيها معاشي وأصلح لي آخرتي التي فيها معادي واجعل الحياة زيادة لي في كل خير واجعل الموت راحة لي من كل شر", source: "رواه مسلم (2720)" },
    { num: 7,  text: "اللهم إني أسألك الهدى والتقى والعفاف والغنى",                                        source: "رواه مسلم (2721)" },
    { num: 8,  text: "يا مقلب القلوب ثبت قلبي على دينك",                                                   source: "السلسلة الصحيحة (2091)" },
    { num: 9,  text: "اللهم مصرف القلوب صرف قلوبنا على طاعتك",                                            source: "رواه مسلم (2654)" },
    { num: 10, text: "اللهم اهدني وسددني",                                                                  source: "رواه مسلم (2725)" },
    { num: 11, text: "اللهم إنك عفو تحب العفو فاعف عني",                                                   source: "صحيح ابن ماجة (3119)" },
    { num: 12, text: "اللهم إني أسألك من فضلك ورحمتك فإنه لا يملكها إلا أنت",                              source: "السلسلة الصحيحة (1543)" },
    { num: 13, text: "اللهم اكفني بحلالك عن حرامك وأغنني بفضلك عمن سواك",                                  source: "صحيح الجامع (2625)" },
    { num: 14, text: "اللهم إني أعوذ بك من منكرات الأخلاق والأعمال والأهواء",                               source: "صحيح الترمذي (3591)" },
    { num: 15, text: "اللهم إني أعوذ بك من البرص والجنون والجذام ومن سيء الأسقام",                         source: "صحيح الجامع (1281)" },
    { num: 16, text: "اللهم إني أعوذ بك من جار السوء في دار المقامة فإن جار البادية يتحول",               source: "صحيح الجامع (1290)" },
    { num: 17, text: "اللهم إني أعوذ بك من القلة والفقر والذلة وأعوذ بك أن أظلم أو أُظلم",               source: "صحيح النسائي (5477)" },
    { num: 18, text: "اللهم إني أسألك من الخير كله عاجله وآجله ما علمت منه وما لم أعلم وأعوذ بك من الشر كله عاجله وآجله ما علمت منه وما لم أعلم", source: "السلسلة الصحيحة (1542)" },
    { num: 19, text: "اللهم إني أسألك الثبات في الأمر والعزيمة على الرشد وأسألك موجبات رحمتك وعزائم مغفرتك وأسألك شكر نعمتك وحسن عبادتك وأسألك قلباً سليماً ولساناً صادقاً", source: "السلسلة الصحيحة (3228)" },
    { num: 20, text: "اللهم اقسم لنا من خشيتك ما يحول بيننا وبين معاصيك ومن طاعتك ما تبلغنا به جنتك ومن اليقين ما تهون به علينا مصيبات الدنيا", source: "صحيح الترمذي (3502)" },
    { num: 21, text: "اللهم احفظني بالإسلام قائماً واحفظني بالإسلام قاعداً واحفظني بالإسلام راقداً ولا تشمت بي عدواً ولا حاسداً", source: "صحيح الجامع (1260)" },
    { num: 22, text: "اللهم بعلمك الغيب وقدرتك على الخلق أحيني ما علمت الحياة خيراً لي وتوفني إذا علمت الوفاة خيراً لي", source: "صحيح الكلم الطيب (106)" },
    { num: 23, text: "رب أعني ولا تعن علي وانصرني ولا تنصر علي وامكر لي ولا تمكر علي واهدني ويسر الهدى لي وانصرني على من بغى علي", source: "صحيح الترمذي (3551)" },
    { num: 24, text: "اللهم حاسبني حساباً يسيراً",                                                          source: "تخريج مشكاة المصابيح (5495)" },
    { num: 25, text: "اللهم إني أسألك فعل الخيرات وترك المنكرات وحب المساكين وإذا أردت بعبادك فتنة فاقبضني إليك غير مفتون", source: "صحيح الترمذي (3233)" },
    { num: 26, text: "اللهم إني عبدك وابن عبدك وابن أمتك ناصيتي بيدك ماضٍ فيّ حكمك عدل فيّ قضاؤك أسألك بكل اسم هو لك سميت به نفسك أو علمته أحداً من خلقك أو أنزلته في كتابك أن تجعل القرآن ربيع قلبي ونور صدري وجلاء حزني وذهاب همي", source: "السلسلة الصحيحة (199)" },
    { num: 27, text: "اللهم مالك الملك تؤتي الملك من تشاء وتنزع الملك ممن تشاء وتعز من تشاء وتذل من تشاء بيدك الخير إنك على كل شيء قدير ارحمني رحمة تغنيني بها عن رحمة من سواك", source: "صحيح الترغيب (1821)" },
    { num: 28, text: "اللهم رب السموات السبع ورب العرش العظيم ربنا ورب كل شيء منزل التوراة والإنجيل والقرآن فالق الحب والنوى أعوذ بك من شر كل شيء أنت آخذ بناصيته اقض عني الدين وأغنني من الفقر", source: "صحيح الترمذي (3481)" },
    { num: 29, text: "اللهم إني أسألك إيماناً لا يرتد ونعيماً لا ينفد ومرافقة محمد في أعلى جنة الخلد",      source: "السلسلة الصحيحة (5/379)" },
    { num: 30, text: "اللهم انفعني بما علمتني وعلمني ما ينفعني وارزقني علماً تنفعني به",                    source: "السلسلة الصحيحة (3151)" },
    { num: 31, text: "اللهم اجعل في قلبي نوراً وفي بصري نوراً وفي سمعي نوراً وعن يميني نوراً وعن يساري نوراً وفوقي نوراً وتحتي نوراً وأمامي نوراً وخلفي نوراً واجعل لي نوراً", source: "رواه البخاري (6316) ومسلم (763)" },
    { num: 32, text: "اللهم أحيني مسكيناً وأمتني مسكيناً واحشرني في زمرة المساكين يوم القيامة",               source: "صحيح الترمذي (2352)" },
    { num: 33, text: "اللهم استر عورتي وآمن روعتي واقض عني ديني",                                          source: "صحيح الجامع (1262)" },
    { num: 34, text: "اللهم إني ظلمت نفسي ظلماً كثيراً ولا يغفر الذنوب إلا أنت فاغفر لي مغفرة من عندك وارحمني إنك أنت الغفور الرحيم", source: "رواه البخاري (834)" },
    { num: 35, text: "اللهم أنت ربي لا إله إلا أنت خلقتني وأنا عبدك وأنا على عهدك ووعدك ما استطعت أعوذ بك من شر ما صنعت أبوء لك بنعمتك علي وأبوء لك بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت", source: "رواه البخاري (6306) — سيد الاستغفار" },
    { num: 36, text: "أستغفر الله الذي لا إله إلا هو الحي القيوم وأتوب إليه",                              source: "صحيح الترغيب (1623)" },
    { num: 37, text: "رب اغفر لي خطيئتي وجهلي وإسرافي في أمري كله وما أنت أعلم به مني اللهم اغفر لي خطاياي وعمدي وجهلي وهزلي وكل ذلك عندي اللهم اغفر لي ما قدمت وما أخرت وما أسررت وما أعلنت أنت المقدم وأنت المؤخر وأنت على كل شيء قدير", source: "رواه البخاري (6398) ومسلم (2719)" },
    { num: 38, text: "اللهم اغفر لي ذنوبي وخطاياي كلها اللهم أنعشني واجبرني واهدني لصالح الأعمال والأخلاق فإنه لا يهدي لصالحها ولا يصرف سيئها إلا أنت", source: "صحيح الجامع (1266)" },
    { num: 39, text: "اللهم لك أسلمت وبك آمنت وعليك توكلت وإليك أنبت وبك خاصمت اللهم إني أعوذ بعزتك لا إله إلا أنت ألا تضلني أنت الحي الذي لا يموت والجن والإنس يموتون", source: "صحيح الجامع (1309)" },
    { num: 40, text: "اللهم إني أعوذ بك من جهد البلاء ودرك الشقاء وسوء القضاء وشماتة الأعداء",               source: "صحيح البخاري (6347)" },
    { num: 41, text: "اللهم إني أعوذ بك من الهم والحزن والعجز والكسل والبخل والجبن وضلع الدين وغلبة الرجال", source: "صحيح البخاري (2893)" },
    { num: 42, text: "اللهم إني أعوذ بك من شر ما عملت ومن شر ما لم أعمل",                                  source: "صحيح مسلم (2716)" },
    { num: 43, text: "اللهم أعوذ برضاك من سخطك وبمعافاتك من عقوبتك وأعوذ بك منك لا أحصي ثناء عليك أنت كما أثنيت على نفسك", source: "رواه مسلم (486)" },
    { num: 44, text: "اللهم إني أعوذ بك من زوال نعمتك وتحول عافيتك وفجاءة نقمتك وجميع سخطك",               source: "رواه مسلم (2739)" },
    { num: 45, text: "اللهم إني أعوذ بك من البخل والجبن وأعوذ بك من أن نُرد إلى أرذل العمر وأعوذ بك من فتنة الدنيا وعذاب القبر", source: "رواه البخاري (6390)" },
    { num: 46, text: "اللهم إني أعوذ بك من العجز والكسل والجبن والبخل والهرم وعذاب القبر اللهم آت نفسي تقواها وزكها أنت خير من زكاها أنت وليها ومولاها اللهم إني أعوذ بك من علم لا ينفع ومن قلب لا يخشع ومن نفس لا تشبع ومن دعوة لا يستجاب لها", source: "رواه مسلم (2722)" },
    { num: 47, text: "اللهم إني أعوذ بك من شر سمعي ومن شر بصري ومن شر لساني ومن شر قلبي ومن شر منيّي",     source: "صحيح الجامع (4399)" },
    { num: 48, text: "اللهم إني أعوذ بك من الهدم والتردي وأعوذ بك من الغرق والحرق والهرم وأعوذ بك أن يتخبطني الشيطان عند الموت وأعوذ بك أن أموت في سبيلك مدبراً وأعوذ بك أن أموت لديغاً", source: "صحيح أبي داود (1552)" },
    { num: 49, text: "اللهم إني أعوذ بك من فتنة النار وعذاب النار وفتنة القبر وعذاب القبر وشر فتنة الغنى وشر فتنة الفقر اللهم إني أعوذ بك من شر فتنة المسيح الدجال اللهم اغسل قلبي بماء الثلج والبرد ونق قلبي من الخطايا", source: "رواه البخاري (6377)" },
    { num: 50, text: "اللهم رب جبرائيل وميكائيل وإسرافيل أعوذ بك من حر النار ومن عذاب القبر",                source: "صحيح النسائي (5534)" }
];

// ==================== LIBRARY FILES ====================
// GitHub raw base URL — update GITHUB_RAW_URL in .env or hardcode here
const GITHUB_RAW = process.env.GITHUB_RAW_URL || 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/books';

const filesMap = {
    'athkar_morning_evening': { name: 'أذكار الصباح و المساء',    file: 'أذكار الصباح و المساء.pdf'     },
    'athkar_sleep':           { name: 'أذكار النوم',              file: 'اذكار النوم.pdf'                },
    'athkar_wake':            { name: 'أذكار الاستيقاظ',          file: 'اذكار الإستيقاظ.pdf'           },
    'easy_thawab':            { name: 'أسهل طرق كسب الثواب',      file: 'اسهل طرق لكسب الثواب.pdf'     },
    'quran':                  { name: 'القرآن الكريم',            file: 'القرآن الكريم.pdf'             },
    'hisn_muslim':            { name: 'حصن المسلم',               file: 'حصن المسلم.pdf'                },
    'jawami_duas':            { name: 'جوامع دعاء النبي',         file: 'جوامع دعاء النبي.pdf'          },
    'ahadith_nabawiyya':      { name: 'أحاديث نبوية مختارة',      file: 'أحاديث نبوية مختارة.pdf'      },
    'riyad_salihin':          { name: 'رياض الصالحين',            file: 'رياض الصالحين.pdf'             }
};

// Keywords that trigger auto-send of library files
const autoSendKeywords = {
    'حصن المسلم':             'hisn_muslim',
    'حصن':                    'hisn_muslim',
    'القرآن الكريم':          'quran',
    'القران الكريم':          'quran',
    'القران':                 'quran',
    'القرآن':                 'quran',
    'أذكار الصباح':           'athkar_morning_evening',
    'اذكار الصباح':           'athkar_morning_evening',
    'أذكار المساء':           'athkar_morning_evening',
    'اذكار المساء':           'athkar_morning_evening',
    'أذكار النوم':            'athkar_sleep',
    'اذكار النوم':            'athkar_sleep',
    'أذكار الاستيقاظ':        'athkar_wake',
    'اذكار الاستيقاظ':        'athkar_wake',
    'جوامع الدعاء':           'jawami_duas',
    'جوامع دعاء':             'jawami_duas',
    'دعاء النبي':             'jawami_duas',
    'أسهل طرق':              'easy_thawab',
    'كسب الثواب':             'easy_thawab',
    'رياض الصالحين':          'riyad_salihin',
    'رياض':                   'riyad_salihin',
    'أحاديث نبوية':           'ahadith_nabawiyya',
    'احاديث نبوية':           'ahadith_nabawiyya'
};

// ==================== REMINDER INTERVALS ====================
const reminderIntervals = {
    'every_30min':  1800000,
    'every_hour':   3600000,
    'every_2hours': 7200000,
    'every_3hours': 10800000,
    'every_6hours': 21600000
};

const intervalLabels = {
    'every_30min':  'كل 30 دقيقة',
    'every_hour':   'كل ساعة',
    'every_2hours': 'كل ساعتين',
    'every_3hours': 'كل 3 ساعات',
    'every_6hours': 'كل 6 ساعات'
};

// ==================== TASBIH CONFIG ====================
const tasbihTypes = [
    { id: 'subhanallah',   text: 'سبحان الله',                  target: 33  },
    { id: 'alhamdulillah', text: 'الحمد لله',                   target: 33  },
    { id: 'allahu_akbar',  text: 'الله أكبر',                   target: 33  },
    { id: 'la_ilaha',      text: 'لا إله إلا الله',              target: 100 },
    { id: 'astaghfirullah',text: 'أستغفر الله',                 target: 100 },
    { id: 'salawat',       text: 'اللهم صل على محمد',            target: 100 },
    { id: 'la_hawla',      text: 'لا حول ولا قوة إلا بالله',    target: 33  },
    { id: 'custom',        text: 'ذكر مخصص',                    target: 100 }
];

// ==================== KEYBOARDS ====================
const getMainKeyboard = () => ({
    reply_markup: {
        inline_keyboard: [
            [
                { text: 'ذكر عشوائي',        callback_data: 'menu_dhikr'       },
                { text: 'المسبحة',            callback_data: 'menu_tasbih'      }
            ],
            [
                { text: 'المكتبة الإسلامية',  callback_data: 'menu_library'     },
                { text: 'جوامع الدعاء',       callback_data: 'menu_jawami'      }
            ],
            [
                { text: 'تفعيل التذكيرات',    callback_data: 'menu_reminder_on' },
                { text: 'إيقاف التذكيرات',    callback_data: 'menu_reminder_off'}
            ],
            [
                { text: 'إعدادات التذكير',    callback_data: 'menu_settings'    },
                { text: 'إحصائياتي',          callback_data: 'menu_stats'       }
            ],
            [
                { text: 'المساعدة',           callback_data: 'menu_help'        }
            ]
        ]
    }
});

const getLibraryKeyboard = () => ({
    reply_markup: {
        inline_keyboard: [
            [{ text: 'أذكار الصباح والمساء',   callback_data: 'lib_athkar_morning_evening' }],
            [{ text: 'أذكار النوم',             callback_data: 'lib_athkar_sleep'           }],
            [{ text: 'أذكار الاستيقاظ',         callback_data: 'lib_athkar_wake'            }],
            [{ text: 'القرآن الكريم',           callback_data: 'lib_quran'                  }],
            [{ text: 'حصن المسلم',              callback_data: 'lib_hisn_muslim'            }],
            [{ text: 'جوامع دعاء النبي',        callback_data: 'lib_jawami_duas'            }],
            [{ text: 'أحاديث نبوية مختارة',     callback_data: 'lib_ahadith_nabawiyya'      }],
            [{ text: 'رياض الصالحين',           callback_data: 'lib_riyad_salihin'          }],
            [{ text: 'أسهل طرق كسب الثواب',    callback_data: 'lib_easy_thawab'            }],
            [{ text: 'رجوع للقائمة',            callback_data: 'menu_back'                  }]
        ]
    }
});

const getSettingsKeyboard = () => ({
    reply_markup: {
        inline_keyboard: [
            [{ text: 'كل 30 دقيقة',       callback_data: 'interval_30min'  }],
            [{ text: 'كل ساعة',           callback_data: 'interval_1hour'  }],
            [{ text: 'كل ساعتين (افتراضي)', callback_data: 'interval_2hours'}],
            [{ text: 'كل 3 ساعات',        callback_data: 'interval_3hours' }],
            [{ text: 'كل 6 ساعات',        callback_data: 'interval_6hours' }],
            [{ text: 'رجوع للقائمة',      callback_data: 'menu_back'       }]
        ]
    }
});

const getTasbihSelectKeyboard = () => ({
    reply_markup: {
        inline_keyboard: [
            [{ text: 'سبحان الله (33)',          callback_data: 'tasbih_subhanallah'    }],
            [{ text: 'الحمد لله (33)',           callback_data: 'tasbih_alhamdulillah'  }],
            [{ text: 'الله أكبر (33)',           callback_data: 'tasbih_allahu_akbar'   }],
            [{ text: 'لا إله إلا الله (100)',    callback_data: 'tasbih_la_ilaha'       }],
            [{ text: 'أستغفر الله (100)',        callback_data: 'tasbih_astaghfirullah' }],
            [{ text: 'اللهم صل على محمد (100)', callback_data: 'tasbih_salawat'        }],
            [{ text: 'لا حول ولا قوة إلا بالله (33)', callback_data: 'tasbih_la_hawla'}],
            [{ text: 'رجوع للقائمة',            callback_data: 'menu_back'             }]
        ]
    }
});

const getTasbihCounterKeyboard = (userId, tasbihId) => {
    const t     = tasbihData[userId] || {};
    const count = t.count || 0;
    const target = t.target || 33;
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

// ==================== REMINDER ENGINE ====================
const startReminder = (chatId, interval = 'every_2hours') => {
    if (activeIntervals[chatId]) return;
    const ms = reminderIntervals[interval] || reminderIntervals['every_2hours'];
    activeIntervals[chatId] = setInterval(() => {
        const d = getRandomDhikr();
        bot.sendMessage(chatId,
            `تذكير:\n\n${d.text}`,
            { parse_mode: 'Markdown' }
        ).catch(err => {
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

activeChats.forEach(chatId => {
    let interval = 'every_2hours';
    for (const uid in userPreferences)
        if (userPreferences[uid].chatId === chatId) { interval = userPreferences[uid].reminderInterval || interval; break; }
    startReminder(chatId, interval);
});

// ==================== WELCOME TEXT ====================
const getWelcomeText = () => {
    const d = getRandomDhikr();
    return (
`*السلام عليكم ورحمة الله وبركاته*

يسعدني ويشرفني تجربتك لـ *بوت نورِفاي*
رفيقك في رحلة المداومة على ذكر الله

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
*المطوّر:* @vx\\_rq`
    );
};

// ==================== SEND FILE HELPER ====================
const sendFile = async (chatId, fileKey) => {
    const info = filesMap[fileKey];
    if (!info) return;
    const localPath = path.join(__dirname, info.file);
    if (fs.existsSync(localPath)) {
        await bot.sendChatAction(chatId, 'upload_document');
        await bot.sendDocument(chatId, localPath, {
            caption: `*${info.name}*\n\nبوت نورِفاي`,
            parse_mode: 'Markdown'
        });
    } else {
        // Try GitHub
        const url = `${GITHUB_RAW}/${encodeURIComponent(info.file)}`;
        await bot.sendChatAction(chatId, 'upload_document');
        await bot.sendDocument(chatId, url, {
            caption: `*${info.name}*\n\nبوت نورِفاي`,
            parse_mode: 'Markdown'
        }).catch(() => {
            bot.sendMessage(chatId, `الملف *${info.name}* غير متوفر حالياً.\nسيتم إضافته قريباً.`, { parse_mode: 'Markdown' });
        });
    }
};

// ==================== USER INIT ====================
const initUser = (userId, chatId) => {
    if (!userPreferences[userId]) {
        userPreferences[userId] = {
            joinDate: new Date().toISOString(),
            reminderInterval: 'every_2hours',
            chatId, dailyCount: 0,
            lastReset: new Date().toDateString(),
            totalDhikr: 0
        };
        botStats.totalUsers++;
        saveData();
    }
};

// ==================== HANDLERS ====================

// /start
bot.onText(/\/start/, (msg) => {
    const { id: chatId, type } = msg.chat;
    const userId = msg.from?.id;
    trackCommand('start');
    if (userId) initUser(userId, chatId);
    bot.sendMessage(chatId, getWelcomeText(), { parse_mode: 'Markdown', ...getMainKeyboard() })
       .catch(console.error);
});

// /menu
bot.onText(/\/menu/, (msg) => {
    trackCommand('menu');
    bot.sendMessage(msg.chat.id, getWelcomeText(), { parse_mode: 'Markdown', ...getMainKeyboard() })
       .catch(console.error);
});

// /dhikr — available to all
bot.onText(/\/dhikr/, (msg) => {
    trackCommand('dhikr');
    const d = getRandomDhikr();
    bot.sendMessage(msg.chat.id,
        `*ذكرك الآن:*\n\n_${d.text}_\n\nالعدد الموصى به: *${d.count}*`,
        { parse_mode: 'Markdown' }
    ).catch(console.error);
});

// /library — available to all
bot.onText(/\/library/, async (msg) => {
    const { id: chatId, type } = msg.chat;
    trackCommand('library');
    await bot.sendMessage(chatId, '*المكتبة الإسلامية*\n\nاختر الكتاب:', { parse_mode: 'Markdown', ...getLibraryKeyboard() });
});

// /tasbih — available to all
bot.onText(/\/tasbih/, (msg) => {
    trackCommand('tasbih');
    bot.sendMessage(msg.chat.id, '*المسبحة الإلكترونية*\n\nاختر الذكر:', { parse_mode: 'Markdown', ...getTasbihSelectKeyboard() });
});

// /jawami — available to all
bot.onText(/\/jawami/, (msg) => {
    trackCommand('jawami');
    sendRandomJawami(msg.chat.id);
});

// /stats — available to all
bot.onText(/\/stats/, (msg) => {
    const { id: chatId } = msg.chat;
    const userId = msg.from?.id;
    trackCommand('stats');
    showStats(chatId, userId);
});

// /daily_count — available to all
bot.onText(/\/daily_count/, (msg) => {
    handleDailyCount(msg.chat.id, msg.from?.id);
});

// ── ADMIN-ONLY COMMANDS ──

// /reminder_on
bot.onText(/\/reminder_on/, async (msg) => {
    const { id: chatId, type } = msg.chat;
    const userId = msg.from?.id;
    if (isGroupChat(type) && !(await isGroupAdmin(chatId, userId))) {
        return bot.sendMessage(chatId, 'هذا الأمر للمشرفين فقط.').catch(() => {});
    }
    handleReminderOn(chatId, userId, type);
});

// /reminder_off
bot.onText(/\/reminder_off/, async (msg) => {
    const { id: chatId, type } = msg.chat;
    const userId = msg.from?.id;
    if (isGroupChat(type) && !(await isGroupAdmin(chatId, userId))) {
        return bot.sendMessage(chatId, 'هذا الأمر للمشرفين فقط.').catch(() => {});
    }
    handleReminderOff(chatId);
});

// /reminder_settings
bot.onText(/\/reminder_settings/, async (msg) => {
    const { id: chatId, type } = msg.chat;
    const userId = msg.from?.id;
    if (isGroupChat(type) && !(await isGroupAdmin(chatId, userId))) {
        return bot.sendMessage(chatId, 'هذا الأمر للمشرفين فقط.').catch(() => {});
    }
    trackCommand('reminder_settings');
    bot.sendMessage(chatId, '*إعدادات التذكير*\n\nاختر الفترة:', { parse_mode: 'Markdown', ...getSettingsKeyboard() });
});

// /help
bot.onText(/\/help/, (msg) => {
    trackCommand('help');
    const isGroup = isGroupChat(msg.chat.type);
    const helpText =
`*مساعدة بوت نورِفاي*

*متاح للجميع:*
/dhikr — ذكر عشوائي
/tasbih — المسبحة الإلكترونية
/library — المكتبة الإسلامية
/jawami — جوامع دعاء النبي
/stats — إحصائياتك
/daily\\_count — عداد أذكار اليوم
/menu — القائمة الرئيسية
/help — المساعدة
${isGroup ? '\n*للمشرفين فقط في المجموعات:*\n/reminder\\_on — تفعيل التذكيرات\n/reminder\\_off — إيقاف التذكيرات\n/reminder\\_settings — إعدادات التذكير' : '\n/reminder\\_on — تفعيل التذكيرات\n/reminder\\_off — إيقاف التذكيرات\n/reminder\\_settings — إعدادات التذكير'}

*للتواصل:* @vx\\_rq`;
    bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' }).catch(console.error);
});

// ==================== BUSINESS LOGIC ====================

const sendRandomJawami = (chatId) => {
    const d = jawamiDuas[Math.floor(Math.random() * jawamiDuas.length)];
    bot.sendMessage(chatId,
        `*من جوامع دعاء النبي — ${d.num}*\n\n_${d.text}_\n\n*المصدر:* ${d.source}`,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'دعاء آخر', callback_data: 'jawami_random' }, { text: 'رجوع', callback_data: 'menu_back' }]
                ]
            }
        }
    ).catch(console.error);
};

const handleDailyCount = (chatId, userId) => {
    trackCommand('daily_count');
    if (!userId) return;
    if (!userPreferences[userId]) initUser(userId, chatId);
    const today = new Date().toDateString();
    if (userPreferences[userId].lastReset !== today) {
        userPreferences[userId].dailyCount = 0;
        userPreferences[userId].lastReset  = today;
    }
    userPreferences[userId].dailyCount++;
    userPreferences[userId].totalDhikr = (userPreferences[userId].totalDhikr || 0) + 1;
    saveData();
    const c     = userPreferences[userId].dailyCount;
    const total = userPreferences[userId].totalDhikr;
    const badge = c >= 100 ? 'درجة ذهبية' : c >= 50 ? 'درجة فضية' : c >= 20 ? 'درجة برونزية' : c >= 10 ? 'مواظب' : 'مبتدئ';
    bot.sendMessage(chatId,
        `*عداد أذكارك اليوم*\n\n*${c}* ذكر\nالمستوى: *${badge}*\nالإجمالي: *${total}* ذكر\n\n_"أحب الأعمال إلى الله أدومها وإن قل"_`,
        { parse_mode: 'Markdown' }
    ).catch(console.error);
};

const showStats = (chatId, userId) => {
    trackCommand('stats');
    const p        = userPreferences[userId] || {};
    const label    = intervalLabels[p.reminderInterval] || 'كل ساعتين';
    const isActive = activeChats.includes(chatId);
    const joined   = p.joinDate ? new Date(p.joinDate).toLocaleDateString('ar-SA') : 'غير محدد';
    bot.sendMessage(chatId,
        `*إحصائياتك*\n\nأذكارك اليوم: *${p.dailyCount || 0}*\nإجمالي الأذكار: *${p.totalDhikr || 0}*\nتاريخ الانضمام: *${joined}*\nفترة التذكير: *${label}*\nالتذكيرات: *${isActive ? 'مفعّلة' : 'موقوفة'}*`,
        { parse_mode: 'Markdown' }
    ).catch(console.error);
};

const handleReminderOn = (chatId, userId, chatType) => {
    trackCommand('reminder_on');
    if (activeChats.includes(chatId))
        return bot.sendMessage(chatId, 'التذكيرات مفعّلة بالفعل.').catch(() => {});
    activeChats.push(chatId);
    botStats.totalReminders++;
    const interval = (userId && userPreferences[userId]?.reminderInterval) || 'every_2hours';
    startReminder(chatId, interval);
    saveData();
    const isChannel = chatType === 'channel';
    bot.sendMessage(chatId,
        `*تم تفعيل التذكيرات بنجاح*\n\nسيصلك ذكر *${intervalLabels[interval]}*\n\n🤲 اللهم تقبّل`,
        { parse_mode: 'Markdown' }
    ).catch(console.error);
};

const handleReminderOff = (chatId) => {
    trackCommand('reminder_off');
    stopReminder(chatId);
    bot.sendMessage(chatId, 'تم إيقاف التذكيرات.\n\nيمكنك إعادة التفعيل بـ /reminder\\_on', { parse_mode: 'Markdown' }).catch(console.error);
};

// ==================== ADDED TO GROUP / CHANNEL ====================
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
            ? `*السلام عليكم ورحمة الله وبركاته*\n\nتم إضافة *بوت نورِفاي* لهذه القناة.\n\nتم تفعيل التذكيرات تلقائياً — ذكر كل ساعتين\n\nلتغيير الفترة: /reminder\\_settings\nلإيقاف التذكير: /reminder\\_off`
            : `*السلام عليكم ورحمة الله وبركاته*\n\nتم إضافة *بوت نورِفاي* لمجموعة *${title || ''}*\n\nالأوامر المتاحة للجميع:\n/dhikr — ذكر عشوائي\n/tasbih — المسبحة\n/library — المكتبة\n/jawami — جوامع الدعاء\n/stats — الإحصائيات\n\nالأوامر للمشرفين فقط:\n/reminder\\_on — تفعيل التذكيرات\n/reminder\\_off — إيقاف التذكيرات\n/reminder\\_settings — إعدادات التذكير`;
        bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' }).catch(console.error);
    }
    if (newStatus === 'kicked' || newStatus === 'left') stopReminder(chatId);
});

// ==================== CALLBACK QUERY ====================
bot.on('callback_query', async (query) => {
    const { id: queryId, message, from, data } = query;
    const chatId   = message.chat.id;
    const chatType = message.chat.type;
    const userId   = from.id;

    const answer = (text) => bot.answerCallbackQuery(queryId, text ? { text } : {}).catch(() => {});

    // ── Back to main menu ──
    if (data === 'menu_back') {
        answer();
        bot.sendMessage(chatId, getWelcomeText(), { parse_mode: 'Markdown', ...getMainKeyboard() }).catch(() => {});
        return;
    }

    // ── Main menu buttons ──
    if (data === 'menu_dhikr') {
        answer();
        const d = getRandomDhikr();
        bot.sendMessage(chatId, `*ذكرك الآن:*\n\n_${d.text}_\n\nالعدد الموصى به: *${d.count}*`, { parse_mode: 'Markdown' }).catch(() => {});
        return;
    }

    if (data === 'menu_tasbih') {
        answer();
        bot.sendMessage(chatId, '*المسبحة الإلكترونية*\n\nاختر الذكر:', { parse_mode: 'Markdown', ...getTasbihSelectKeyboard() }).catch(() => {});
        return;
    }

    if (data === 'menu_library') {
        answer();
        bot.sendMessage(chatId, '*المكتبة الإسلامية*\n\nاختر الكتاب:', { parse_mode: 'Markdown', ...getLibraryKeyboard() }).catch(() => {});
        return;
    }

    if (data === 'menu_jawami') {
        answer();
        sendRandomJawami(chatId);
        return;
    }

    if (data === 'jawami_random') {
        answer();
        sendRandomJawami(chatId);
        return;
    }

    if (data === 'menu_reminder_on') {
        if (isGroupChat(chatType) && !(await isGroupAdmin(chatId, userId))) {
            answer('هذا الخيار للمشرفين فقط');
            return;
        }
        answer();
        handleReminderOn(chatId, userId, chatType);
        return;
    }

    if (data === 'menu_reminder_off') {
        if (isGroupChat(chatType) && !(await isGroupAdmin(chatId, userId))) {
            answer('هذا الخيار للمشرفين فقط');
            return;
        }
        answer();
        handleReminderOff(chatId);
        return;
    }

    if (data === 'menu_settings') {
        if (isGroupChat(chatType) && !(await isGroupAdmin(chatId, userId))) {
            answer('هذا الخيار للمشرفين فقط');
            return;
        }
        answer();
        bot.sendMessage(chatId, '*إعدادات التذكير*\n\nاختر الفترة:', { parse_mode: 'Markdown', ...getSettingsKeyboard() }).catch(() => {});
        return;
    }

    if (data === 'menu_stats') {
        answer();
        showStats(chatId, userId);
        return;
    }

    if (data === 'menu_help') {
        answer();
        const helpText = `/dhikr — ذكر عشوائي\n/tasbih — المسبحة\n/library — المكتبة\n/jawami — جوامع الدعاء\n/stats — الإحصائيات\n/reminder\\_on — تفعيل التذكيرات\n/reminder\\_off — إيقاف التذكيرات\n/reminder\\_settings — الإعدادات\n/menu — القائمة الرئيسية\n\n*للتواصل:* @vx\\_rq`;
        bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' }).catch(() => {});
        return;
    }

    // ── Reminder interval ──
    if (data.startsWith('interval_')) {
        if (isGroupChat(chatType) && !(await isGroupAdmin(chatId, userId))) {
            answer('هذا الخيار للمشرفين فقط');
            return;
        }
        const map = {
            'interval_30min':  'every_30min',
            'interval_1hour':  'every_hour',
            'interval_2hours': 'every_2hours',
            'interval_3hours': 'every_3hours',
            'interval_6hours': 'every_6hours'
        };
        const selected = map[data] || 'every_2hours';
        if (!userPreferences[userId]) initUser(userId, chatId);
        userPreferences[userId].reminderInterval = selected;
        if (activeIntervals[chatId]) { clearInterval(activeIntervals[chatId]); delete activeIntervals[chatId]; startReminder(chatId, selected); }
        saveData();
        answer('تم تحديث فترة التذكير');
        bot.sendMessage(chatId, `تم تحديث فترة التذكير إلى: *${intervalLabels[selected]}*`, { parse_mode: 'Markdown' }).catch(() => {});
        return;
    }

    // ── Library files ──
    if (data.startsWith('lib_')) {
        const key = data.replace('lib_', '');
        answer('جاري إرسال الملف...');
        sendFile(chatId, key).catch(() => {
            bot.sendMessage(chatId, 'حدث خطأ أثناء إرسال الملف.').catch(() => {});
        });
        return;
    }

    // ── Tasbih select ──
    if (data.startsWith('tasbih_') && !data.startsWith('tasbih_add') && !data.startsWith('tasbih_reset') && data !== 'tasbih_noop') {
        const tasbihId = data.replace('tasbih_', '');
        const type     = tasbihTypes.find(t => t.id === tasbihId);
        if (!type) { answer(); return; }
        tasbihData[userId] = { id: tasbihId, text: type.text, count: 0, target: type.target };
        saveData();
        answer();
        bot.sendMessage(chatId,
            `*المسبحة — ${type.text}*\n\nالهدف: *${type.target}*`,
            { parse_mode: 'Markdown', ...getTasbihCounterKeyboard(userId, tasbihId) }
        ).catch(() => {});
        return;
    }

    if (data === 'tasbih_noop') { answer(); return; }

    // ── Tasbih +1 ──
    if (data.startsWith('tasbih_add_')) {
        const tasbihId = data.replace('tasbih_add_', '');
        if (!tasbihData[userId]) { answer(); return; }
        tasbihData[userId].count++;
        if (!userPreferences[userId]) initUser(userId, chatId);
        userPreferences[userId].totalDhikr = (userPreferences[userId].totalDhikr || 0) + 1;
        saveData();
        const t = tasbihData[userId];
        if (t.count === t.target) {
            answer('اكتمل الذكر! تقبّل الله منك');
            try {
                await bot.editMessageReplyMarkup(
                    getTasbihCounterKeyboard(userId, tasbihId).reply_markup,
                    { chat_id: chatId, message_id: message.message_id }
                );
            } catch {}
            bot.sendMessage(chatId, `تم اكتمال *${t.text}* — ${t.target} مرة\n\nتقبّل الله منك`, { parse_mode: 'Markdown' }).catch(() => {});
        } else {
            answer();
            try {
                await bot.editMessageReplyMarkup(
                    getTasbihCounterKeyboard(userId, tasbihId).reply_markup,
                    { chat_id: chatId, message_id: message.message_id }
                );
            } catch {}
        }
        return;
    }

    // ── Tasbih +10 ──
    if (data.startsWith('tasbih_add10_')) {
        const tasbihId = data.replace('tasbih_add10_', '');
        if (!tasbihData[userId]) { answer(); return; }
        tasbihData[userId].count = Math.min(tasbihData[userId].count + 10, tasbihData[userId].target);
        if (!userPreferences[userId]) initUser(userId, chatId);
        userPreferences[userId].totalDhikr = (userPreferences[userId].totalDhikr || 0) + 10;
        saveData();
        answer();
        try {
            await bot.editMessageReplyMarkup(
                getTasbihCounterKeyboard(userId, tasbihId).reply_markup,
                { chat_id: chatId, message_id: message.message_id }
            );
        } catch {}
        return;
    }

    // ── Tasbih reset ──
    if (data.startsWith('tasbih_reset_')) {
        const tasbihId = data.replace('tasbih_reset_', '');
        if (tasbihData[userId]) { tasbihData[userId].count = 0; saveData(); }
        answer('تم إعادة العداد');
        try {
            await bot.editMessageReplyMarkup(
                getTasbihCounterKeyboard(userId, tasbihId).reply_markup,
                { chat_id: chatId, message_id: message.message_id }
            );
        } catch {}
        return;
    }

    answer();
});

// ==================== MESSAGE LISTENER ====================
// Dhikr keyword reactions + auto file send
const dhikrResponses = [
    'تقبّل الله منك وزادك ذكراً وطاعة.',
    'اللهم تقبّل منا ومنك.',
    'جزاك الله خيراً، الذكر نور القلوب.',
    'اللهم ارزقنا المداومة على ذكرك.',
    'بارك الله فيك.',
    'اللهم آمين، لا تنسَ أن تداوم على الذكر.',
    'اللهم اجعلنا من الذاكرين.',
    'حفظك الله ورزقك الثبات.',
    'اللهم زدنا علماً ونوراً وذكراً.',
    'اللهم تقبّل وأعِن على المداومة.'
];

const dhikrKeywords = [
    'الحمد لله','سبحان الله','استغفر الله','أستغفر الله',
    'الله أكبر','لا إله إلا الله','لا حول ولا قوة إلا بالله',
    'اللهم صل','يا الله','بسم الله','ماشاء الله','ما شاء الله',
    'تبارك الله','حسبنا الله','توكلت على الله','لا إله إلا أنت',
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

// ==================== BOT COMMANDS MENU ====================
bot.setMyCommands([
    { command: 'start',             description: 'بدء البوت والقائمة الرئيسية' },
    { command: 'menu',              description: 'القائمة الرئيسية' },
    { command: 'dhikr',             description: 'ذكر عشوائي' },
    { command: 'tasbih',            description: 'المسبحة الإلكترونية' },
    { command: 'library',           description: 'المكتبة الإسلامية' },
    { command: 'jawami',            description: 'جوامع دعاء النبي' },
    { command: 'stats',             description: 'إحصائياتك' },
    { command: 'daily_count',       description: 'عداد أذكار اليوم' },
    { command: 'reminder_on',       description: 'تفعيل التذكيرات' },
    { command: 'reminder_off',      description: 'إيقاف التذكيرات' },
    { command: 'reminder_settings', description: 'إعدادات التذكير' },
    { command: 'help',              description: 'المساعدة' }
]).catch(() => {});

bot.on('polling_error', (err) => console.error('Polling error:', err.message));
console.log('Noorify Bot v3.0 — Running');
