import TelegramBot from "node-telegram-bot-api";
import express from "express";

// استيراد من نفس المجلد (بدون lib أو data)
import { 
  WELCOME_MESSAGE, 
  TASBEEH_OPTIONS, 
  EMOTIONAL_PHRASES, 
  RANDOM_AZKAR,
  DEVELOPER_USERNAME,
  FASTING_RESOURCES
} from "./azkar"; // تم تغيير المسار من ./data/azkar إلى ./azkar

import { 
  mainMenuKeyboard, 
  tasbeehKeyboard, 
  tasbeehChooserKeyboard, 
  libraryKeyboard,
  settingsKeyboard,
  intervalChooserKeyboard,
  dhikrNowKeyboard,
  tasbeehActiveKeyboard // تأكد من استيرادها إذا كنت تستخدمها
} from "./keyboards"; // تم تغيير المسار من ./lib/keyboards إلى ./keyboards

import { 
  buildRandomDhikrMessage, 
  buildTasbeehMessage, 
  buildLibraryMessage,
  buildAboutMessage,
  buildSettingsMessage,
  buildStatsMessage,
  buildMainMenuMessage,
  buildIntervalChooserMessage,
  buildTasbeehDisplay // تأكد من استيرادها
} from "./format"; // تم تغيير المسار من ./lib/format إلى ./format

import { PDF_LIBRARY, getPdfUrl } from "./pdfs"; // تم تغيير المسار من ./data/pdfs إلى ./pdfs

// --- إعدادات السيرفر لمنع الإغلاق ---
const app = express();
const PORT = process.env.PORT || 10000;
app.get("/", (req, res) => res.send("Noorify Bot Status: Active"));
app.listen(PORT, () => console.log(`📡 Health check listening on port ${PORT}`));

// --- إعدادات البوت ---
const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new TelegramBot(token, { polling: true });

console.log("🌙 Noorify Bot has started successfully...");

// باقي كود البوت يستمر هنا...
