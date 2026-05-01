import TelegramBot from "node-telegram-bot-api";
import express from "express";
import * as dotenv from "dotenv";

// Ortam değişkenlerini yükle
dotenv.config();

// Kendi dosyalarından importlar (Yolların doğruluğundan emin ol)
import { 
  WELCOME_MESSAGE, 
  TASBEEH_OPTIONS, 
  RANDOM_AZKAR 
} from "./azkar";
import { 
  mainMenuKeyboard, 
  tasbeehKeyboard, 
  tasbeehChooserKeyboard 
} from "./keyboards";
import { 
  buildMainMenuMessage, 
  buildTasbeehDisplay 
} from "./format";

const token = process.env.TELEGRAM_BOT_TOKEN || "BURAYA_TOKEN_GELECEK";
const PORT = process.env.PORT || 3000;

// Sunucu canlılığı için Express kurulumu
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🌙 Noorify Bot aktif ve çalışıyor...");
});

// Bot başlatma
const bot = new TelegramBot(token, { polling: true });

console.log("🚀 Bot başlatıldı...");

// Hata yönetimi
bot.on("polling_error", (error) => {
  console.log("⚠️ Polling Hatası:", error.message);
});

// Ana Menü Komutu
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from?.first_name || "Mümin";
  
  try {
    await bot.sendMessage(chatId, WELCOME_MESSAGE(username), {
      parse_mode: "HTML",
      reply_markup: mainMenuKeyboard(true, "NoorifyBot")
    });
  } catch (err) {
    console.error("Mesaj gönderilemedi:", err);
  }
});

// Callback Sorguları (Butonlar)
bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat.id;
  const messageId = query.message?.message_id;
  const data = query.data;

  if (!chatId || !messageId || !data) return;

  try {
    if (data === "menu:main") {
      await bot.editMessageText(buildMainMenuMessage(), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard(true, "NoorifyBot")
      });
    }
    // Diğer buton mantıklarını buraya ekleyebilirsin...
  } catch (err) {
    console.error("Buton hatası:", err);
  }
  
  bot.answerCallbackQuery(query.id);
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`📡 Port dinleniyor: ${PORT}`);
});
