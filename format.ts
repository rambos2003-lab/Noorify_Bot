import TelegramBot from "node-telegram-bot-api";
import express from "express";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, getDocs, arrayUnion } from "firebase/firestore";
import { getAuth, signInAnonymously, signInWithCustomToken } from "firebase/auth";

import { WELCOME_MESSAGE, ADMIN_TELEGRAM_ID } from "./data/azkar";
import { PDF_LIBRARY, getPdfUrl } from "./data/pdfs";
import { 
  mainMenuKeyboard, tasbeehChooserKeyboard, tasbeehActiveKeyboard, 
  libraryKeyboard, quranKeyboard, hadithKeyboard, adminKeyboard 
} from "./lib/keyboards";
import { 
  buildTasbeehDisplay, buildQuranPage, buildPrayerTimes, 
  buildStatsDisplay, buildHadithPage, buildAdminDashboard 
} from "./lib/format";

// --- 1. التهيئة الأساسية ---
const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new TelegramBot(token, { polling: true });

// تهيئة Firebase (تستخدم Variables الخاصة بالاستضافة أو Canvas)
const firebaseConfig = JSON.parse(process.env.__firebase_config || "{}");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = typeof (global as any).__app_id !== 'undefined' ? (global as any).__app_id : 'noorify-app';

const adminStates = new Map<number, string>(); // لحفظ حالة المطور عند إرسال الإشعارات

// إعداد القائمة الجانبية (Commands Menu) للبوت
bot.setMyCommands([
  { command: "/start", description: "بدء استخدام البوت والقائمة الرئيسية" },
  { command: "/quran", description: "قراءة القرآن الكريم" },
  { command: "/tasbeeh", description: "فتح المسبحة الإلكترونية" },
  { command: "/library", description: "المكتبة الإسلامية الشاملة" },
  { command: "/stats", description: "إحصائياتي ونقاطي" }
]);

/**
 * --- 2. وظائف قاعدة البيانات (Firebase DB) ---
 */
async function authenticateFirebase() {
  const customToken = (global as any).__initial_auth_token;
  if (customToken) {
    await signInWithCustomToken(auth, customToken);
  } else {
    await signInAnonymously(auth);
  }
}

async function getUser(tgId: number, name: string) {
  await authenticateFirebase();
  const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', tgId.toString());
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const newUser = { telegramId: tgId, name: name, points: 0, level: 1, favorites: [], joinedAt: new Date().toISOString() };
    await setDoc(userRef, newUser);
    return newUser;
  }
  return snap.data();
}

async function addPoints(tgId: number, points: number) {
  await authenticateFirebase();
  const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', tgId.toString());
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const currentPoints = snap.data().points + points;
    const newLevel = Math.floor(currentPoints / 100) + 1; // ترقية المستوى كل 100 نقطة
    await updateDoc(userRef, { points: increment(points), level: newLevel });
  }
}

async function addToFavorites(tgId: number, content: string) {
  await authenticateFirebase();
  const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', tgId.toString());
  await updateDoc(userRef, { favorites: arrayUnion(content) });
}

/**
 * --- 3. وظائف واجهات البرمجة (External APIs) ---
 */
async function getQuranAyah() {
  const randomAyah = Math.floor(Math.random() * 6236) + 1;
  const res = await axios.get(`https://api.alquran.cloud/v1/ayah/${randomAyah}/ar.alafasy`);
  return res.data.data;
}

async function getHadith() {
  try {
    const res = await axios.get(`https://random-hadith-generator.vercel.app/bukhari/`);
    return res.data.data;
  } catch (e) {
    return { hadith_arabic: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ... سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ.", book: "صحيح البخاري" };
  }
}

/**
 * --- 4. معالجة الأوامر النصية (Commands) ---
 */
bot.onText(/\/(start|menu|quran|tasbeeh|library|stats)/, async (msg, match) => {
  const command = match ? match[1] : "start";
  const userId = msg.from!.id;
  const user = await getUser(userId, msg.from!.first_name);
  const me = await bot.getMe();
  const isAdmin = userId === ADMIN_TELEGRAM_ID;

  if (command === "start" || command === "menu") {
    bot.sendMessage(msg.chat.id, WELCOME_MESSAGE(me.username!), {
      parse_mode: "HTML", disable_web_page_preview: true,
      reply_markup: mainMenuKeyboard(user.points, user.level, isAdmin, me.username!)
    });
  } else if (command === "quran") {
    const ayah = await getQuranAyah();
    bot.sendMessage(msg.chat.id, buildQuranPage(ayah), { parse_mode: "HTML", reply_markup: quranKeyboard(ayah.number) });
  } else if (command === "tasbeeh") {
    bot.sendMessage(msg.chat.id, "📿 <b>المسبحة الإلكترونية</b>\nالرجاء اختيار الذكر:", { parse_mode: "HTML", reply_markup: tasbeehChooserKeyboard() });
  } else if (command === "library") {
    bot.sendMessage(msg.chat.id, "📚 <b>المكتبة الإسلامية</b>\nاختر الكتاب للتحميل:", { parse_mode: "HTML", reply_markup: libraryKeyboard() });
  } else if (command === "stats") {
    bot.sendMessage(msg.chat.id, buildStatsDisplay(user), { parse_mode: "HTML" });
  }
});

// معالجة الموقع الجغرافي للصلاة
bot.on("location", async (msg) => {
  const { latitude, longitude } = msg.location!;
  try {
    const res = await axios.get(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=4`);
    bot.sendMessage(msg.chat.id, buildPrayerTimes(res.data.data.timings), { parse_mode: "HTML" });
    await addPoints(msg.from!.id, 5);
  } catch (e) {
    bot.sendMessage(msg.chat.id, "⚠️ عذراً، تعذر جلب المواقيت حالياً.");
  }
});

// إرسال رسالة جماعية (Broadcast) للأدمن
bot.on('message', async (msg) => {
  if (msg.from?.id === ADMIN_TELEGRAM_ID && adminStates.get(ADMIN_TELEGRAM_ID) === 'AWAITING_BROADCAST') {
    if (!msg.text || msg.text.startsWith('/')) return;
    bot.sendMessage(msg.chat.id, "⏳ جاري إرسال الرسالة لجميع المستخدمين...");
    adminStates.delete(ADMIN_TELEGRAM_ID);
    
    await authenticateFirebase();
    const snapshot = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'users'));
    let successCount = 0;
    for (const document of snapshot.docs) {
      try {
        await bot.sendMessage(document.data().telegramId, `📢 <b>رسالة من الإدارة:</b>\n\n${msg.text}`, { parse_mode: "HTML" });
        successCount++;
      } catch (e) {} // تجاهل من حظر البوت
    }
    bot.sendMessage(msg.chat.id, `✅ تمت العملية بنجاح. تم إرسال الرسالة إلى ${successCount} مستخدم.`);
  }
});

/**
 * --- 5. معالجة الأزرار (Callback Queries) ---
 */
bot.on("callback_query", async (query) => {
  const chatId = query.message!.chat.id;
  const messageId = query.message!.message_id;
  const data = query.data || "";
  const userId = query.from.id;

  try {
    if (data === "menu:main") {
      const user = await getUser(userId, query.from.first_name);
      const me = await bot.getMe();
      bot.editMessageText(WELCOME_MESSAGE(me.username!), {
        chat_id: chatId, message_id: messageId, parse_mode: "HTML", disable_web_page_preview: true,
        reply_markup: mainMenuKeyboard(user.points, user.level, userId === ADMIN_TELEGRAM_ID, me.username!)
      });
    }

    if (data === "quran:random") {
      const ayah = await getQuranAyah();
      bot.editMessageText(buildQuranPage(ayah), {
        chat_id: chatId, message_id: messageId, parse_mode: "HTML", reply_markup: quranKeyboard(ayah.number)
      });
      await addPoints(userId, 10);
    }

    if (data === "hadith:random") {
      const hd = await getHadith();
      bot.editMessageText(buildHadithPage(hd.hadith_arabic, hd.book), {
        chat_id: chatId, message_id: messageId, parse_mode: "HTML", reply_markup: hadithKeyboard()
      });
      await addPoints(userId, 5);
    }

    if (data === "prayer:ask_loc") {
      bot.sendMessage(chatId, "📍 من فضلك أرسل موقعك الجغرافي لعرض مواقيت الصلاة بدقة.", {
        reply_markup: { keyboard: [[{ text: "إرسال موقعي الحالي 📍", request_location: true }]], resize_keyboard: true, one_time_keyboard: true }
      });
    }

    if (data === "tasbeeh:open") {
      bot.editMessageText("📿 <b>المسبحة الإلكترونية</b>\nالرجاء اختيار الذكر:", {
        chat_id: chatId, message_id: messageId, parse_mode: "HTML", reply_markup: tasbeehChooserKeyboard()
      });
    }
    if (data.startsWith("tasbeeh:set:")) {
      const id = data.split(":")[2];
      bot.editMessageText(buildTasbeehDisplay(id, 0), {
        chat_id: chatId, message_id: messageId, parse_mode: "HTML", reply_markup: tasbeehActiveKeyboard(id, 0)
      });
    }
    if (data.startsWith("tasbeeh:tick:")) {
      const [_, __, id, countStr] = data.split(":");
      const nextCount = parseInt(countStr) + 1;
      bot.editMessageText(buildTasbeehDisplay(id, nextCount), {
        chat_id: chatId, message_id: messageId, parse_mode: "HTML", reply_markup: tasbeehActiveKeyboard(id, nextCount)
      }).catch(() => {});
      await addPoints(userId, 1);
    }
    if (data.startsWith("tasbeeh:reset:")) {
      bot.editMessageText(buildTasbeehDisplay(data.split(":")[2], 0), {
        chat_id: chatId, message_id: messageId, parse_mode: "HTML", reply_markup: tasbeehActiveKeyboard(data.split(":")[2], 0)
      });
    }

    if (data === "lib:open") {
      bot.editMessageText("📚 <b>المكتبة الإسلامية</b>\nاختر الكتاب للتحميل:", {
        chat_id: chatId, message_id: messageId, parse_mode: "HTML", reply_markup: libraryKeyboard()
      });
    }
    if (data.startsWith("lib:view:")) {
      const book = PDF_LIBRARY.find(b => b.id === data.split(":")[2]);
      if (book) {
        bot.sendDocument(chatId, getPdfUrl(book.filename), { caption: `📖 كتاب: <b>${book.title}</b>`, parse_mode: "HTML" });
        await addPoints(userId, 5);
      }
    }

    if (data === "stats:open") {
      const user = await getUser(userId, query.from.first_name);
      bot.editMessageText(buildStatsDisplay(user), {
        chat_id: chatId, message_id: messageId, parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "« العودة", callback_data: "menu:main" }]] }
      });
    }

    if (data.startsWith("fav:add:ayah:")) {
      await addToFavorites(userId, `آية رقم: ${data.split(":")[3]}`);
      bot.answerCallbackQuery(query.id, { text: "⭐ تم الحفظ في المفضلة!", show_alert: true });
    }
    if (data === "fav:list") {
      const user = await getUser(userId, query.from.first_name);
      const text = user.favorites?.length > 0 ? `⭐ <b>مفضلاتك:</b>\n\n` + user.favorites.map((f: string, i: number) => `${i+1}. ${f}`).join("\n") : `⭐ قائمتك فارغة.`;
      bot.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "« العودة", callback_data: "menu:main" }]] } });
    }

    if (data === "admin:dashboard" && userId === ADMIN_TELEGRAM_ID) {
      await authenticateFirebase();
      const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'users'));
      bot.editMessageText(buildAdminDashboard(snap.size), { chat_id: chatId, message_id: messageId, parse_mode: "HTML", reply_markup: adminKeyboard() });
    }
    if (data === "admin:broadcast" && userId === ADMIN_TELEGRAM_ID) {
      adminStates.set(userId, 'AWAITING_BROADCAST');
      bot.sendMessage(chatId, "أرسل الرسالة التي تود إرسالها للجميع:");
    }

  } catch (error) {}
  bot.answerCallbackQuery(query.id).catch(() => {});
});

// بقاء السيرفر حياً
const appServer = express();
appServer.get("/", (req, res) => res.send("Noorify Ecosystem is Running!"));
appServer.listen(process.env.PORT || 8080);
