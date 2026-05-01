import TelegramBot from "node-telegram-bot-api";
import { logger } from "../lib/logger";
import {
  CONTACT_MESSAGE,
  GROUP_WELCOME_MESSAGE,
  HELP_MESSAGE,
  SHARE_MESSAGE,
  WELCOME_MESSAGE,
  escapeHtml,
} from "./data/azkar";
import { findBookById, getPdfUrl, type PdfBook } from "./data/pdfs";
import {
  aboutKeyboard,
  backOnlyKeyboard,
  contactKeyboard,
  dhikrNowKeyboard,
  intervalChooserKeyboard,
  libraryKeyboard,
  mainMenuKeyboard,
  settingsKeyboard,
  shareKeyboard,
  tasbeehChooserKeyboard,
  tasbeehKeyboard,
} from "./lib/keyboards";
import { isPrivateChat, isUserAdmin } from "./lib/permissions";
import {
  buildAboutMessage,
  buildIntervalChooserMessage,
  buildLibraryMessage,
  buildMainMenuMessage,
  buildRandomDhikrMessage,
  buildSettingsMessage,
  buildStatsMessage,
  buildTasbeehChooserMessage,
  buildTasbeehMessage,
} from "./lib/format";
import {
  deleteChat,
  getChat,
  getStats,
  getTasbeehSession,
  resetTasbeeh,
  setTasbeehDhikr,
  tickTasbeeh,
  updateChatSettings,
  upsertChat,
  upsertUser,
} from "./lib/storage";
import { startScheduler } from "./lib/scheduler";
import { TASBEEH_OPTIONS } from "./data/azkar";

let botInstance: TelegramBot | null = null;
let cachedUsername: string | null = null;

export function startBot(): TelegramBot | null {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) {
    logger.warn("TELEGRAM_BOT_TOKEN not set; Telegram bot will not start");
    return null;
  }
  if (botInstance) return botInstance;

  const bot = new TelegramBot(token, {
    polling: {
      interval: 1000,
      autoStart: true,
      params: { timeout: 30 },
    },
  });
  botInstance = bot;

  bot
    .getMe()
    .then((me) => {
      cachedUsername = me.username ?? null;
      logger.info(
        { username: me.username, id: me.id },
        "Telegram bot connected",
      );
      void registerBotCommands(bot);
    })
    .catch((err) => logger.error({ err }, "Failed to call getMe"));

  registerHandlers(bot);
  startScheduler(bot);

  bot.on("polling_error", (err) => {
    logger.error({ err: err.message }, "Telegram polling error");
  });

  return bot;
}

async function registerBotCommands(bot: TelegramBot): Promise<void> {
  const commands = [
    { command: "start", description: "🌙 بدء استخدام البوت" },
    { command: "menu", description: "📿 القائمة الرئيسية" },
    { command: "tasbeeh", description: "📿 فتح المسبحة" },
    { command: "library", description: "📚 المكتبة الإسلامية" },
    { command: "dhikr", description: "🌟 إرسال ذكر فوري" },
    { command: "quran", description: "📖 القرآن الكريم" },
    { command: "hisn", description: "🛡️ حصن المسلم" },
    { command: "morning", description: "🌅 أذكار الصباح والمساء" },
    { command: "sleep", description: "🌙 أذكار النوم" },
    { command: "stats", description: "📊 الإحصائيات" },
    { command: "settings", description: "⚙️ الإعدادات" },
    { command: "share", description: "💚 شارك البوت" },
    { command: "contact", description: "📞 تواصل مع المطور" },
    { command: "about", description: "ℹ️ عن البوت" },
    { command: "help", description: "❓ المساعدة" },
  ];
  try {
    await bot.setMyCommands(commands);
    logger.info("Bot commands registered");
  } catch (err) {
    logger.warn({ err }, "Failed to register bot commands");
  }
}

function registerHandlers(bot: TelegramBot): void {
  bot.onText(/^\/start(?:@\w+)?(?:\s+(.+))?$/i, async (msg) => {
    await handleStart(bot, msg);
  });

  bot.onText(/^\/(menu|help)(?:@\w+)?$/i, async (msg, match) => {
    if (match && match[1]?.toLowerCase() === "help") {
      await trackChatAndUser(msg);
      await bot
        .sendMessage(msg.chat.id, HELP_MESSAGE, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: backOnlyKeyboard(),
        })
        .catch(() => {});
      return;
    }
    await sendMainMenu(bot, msg.chat.id, msg.chat.type, msg.from);
  });

  bot.onText(/^\/dhikr(?:@\w+)?$/i, async (msg) => {
    await trackChatAndUser(msg);
    await bot.sendMessage(msg.chat.id, buildRandomDhikrMessage(), {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: dhikrNowKeyboard(),
    });
  });

  bot.onText(/^\/tasbeeh(?:@\w+)?$/i, async (msg) => {
    await trackChatAndUser(msg);
    if (!msg.from) return;
    const session = await getTasbeehSession(msg.from.id);
    await bot.sendMessage(
      msg.chat.id,
      buildTasbeehMessage({
        dhikr: session.currentDhikr,
        count: session.count,
        totalCount: session.totalCount,
        firstName: msg.from.first_name ?? null,
      }),
      {
        parse_mode: "HTML",
        reply_markup: tasbeehKeyboard(session.currentDhikr),
      },
    );
  });

  bot.onText(/^\/library(?:@\w+)?$/i, async (msg) => {
    await trackChatAndUser(msg);
    await bot.sendMessage(msg.chat.id, buildLibraryMessage(), {
      parse_mode: "HTML",
      reply_markup: libraryKeyboard(),
    });
  });

  bot.onText(/^\/stats(?:@\w+)?$/i, async (msg) => {
    await trackChatAndUser(msg);
    if (!msg.from) return;
    await sendStats(bot, msg.chat.id, msg.chat.type, msg.from.id);
  });

  bot.onText(/^\/settings(?:@\w+)?$/i, async (msg) => {
    await trackChatAndUser(msg);
    if (!msg.from) return;
    await sendSettings(bot, msg.chat.id, msg.chat.type, msg.from.id);
  });

  bot.onText(/^\/about(?:@\w+)?$/i, async (msg) => {
    await trackChatAndUser(msg);
    await bot.sendMessage(msg.chat.id, buildAboutMessage(), {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: aboutKeyboard(cachedUsername ?? undefined),
    });
  });

  bot.onText(/^\/contact(?:@\w+)?$/i, async (msg) => {
    await trackChatAndUser(msg);
    await bot.sendMessage(msg.chat.id, CONTACT_MESSAGE, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: contactKeyboard(),
    });
  });

  bot.onText(/^\/share(?:@\w+)?$/i, async (msg) => {
    await trackChatAndUser(msg);
    await bot.sendMessage(msg.chat.id, SHARE_MESSAGE(cachedUsername ?? ""), {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: shareKeyboard(cachedUsername ?? ""),
    });
  });

  const directBookCommands: Array<[RegExp, string]> = [
    [/^\/quran(?:@\w+)?$/i, "quran"],
    [/^\/hisn(?:@\w+)?$/i, "hisn"],
    [/^\/morning(?:@\w+)?$/i, "morning_evening"],
    [/^\/sleep(?:@\w+)?$/i, "sleep"],
  ];
  for (const [re, bookId] of directBookCommands) {
    bot.onText(re, async (msg) => {
      await trackChatAndUser(msg);
      const book = findBookById(bookId);
      if (book) await sendBookDocument(bot, msg.chat.id, book);
    });
  }

  bot.on("my_chat_member", async (update) => {
    const chat = update.chat;
    const newStatus = update.new_chat_member.status;
    if (
      (newStatus === "member" ||
        newStatus === "administrator" ||
        newStatus === "creator") &&
      chat.type !== "private"
    ) {
      await upsertChat({
        chatId: chat.id,
        type: chat.type,
        title: chat.title ?? null,
        addedById: update.from?.id ?? null,
      });
      try {
        await bot.sendMessage(
          chat.id,
          GROUP_WELCOME_MESSAGE(chat.title ?? "هذه المجموعة"),
          {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: mainMenuKeyboard(false, cachedUsername ?? undefined),
          },
        );
      } catch (err) {
        logger.warn({ err, chatId: chat.id }, "Failed to send group welcome");
      }
    } else if (newStatus === "kicked" || newStatus === "left") {
      await deleteChat(chat.id).catch(() => {});
    }
  });

  bot.on("callback_query", async (query) => {
    try {
      await handleCallback(bot, query);
    } catch (err) {
      logger.error({ err }, "callback handler failed");
      await bot
        .answerCallbackQuery(query.id, { text: "حدث خطأ، حاول مجددًا" })
        .catch(() => {});
    }
  });
}

async function trackChatAndUser(msg: TelegramBot.Message): Promise<void> {
  await upsertChat({
    chatId: msg.chat.id,
    type: msg.chat.type,
    title: msg.chat.title ?? null,
    addedById: msg.from?.id ?? null,
  });
  if (msg.from && !msg.from.is_bot) {
    await upsertUser({
      userId: msg.from.id,
      firstName: msg.from.first_name ?? null,
      username: msg.from.username ?? null,
    });
  }
}

async function handleStart(
  bot: TelegramBot,
  msg: TelegramBot.Message,
): Promise<void> {
  await trackChatAndUser(msg);
  const username = cachedUsername ?? "";
  if (isPrivateChat(msg.chat.type)) {
    await bot.sendMessage(msg.chat.id, WELCOME_MESSAGE(username), {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: mainMenuKeyboard(true, username || undefined),
    });
  } else {
    await sendMainMenu(bot, msg.chat.id, msg.chat.type, msg.from);
  }
}

async function sendMainMenu(
  bot: TelegramBot,
  chatId: number,
  chatType: string,
  from?: TelegramBot.User,
): Promise<void> {
  if (from && !from.is_bot) {
    await upsertUser({
      userId: from.id,
      firstName: from.first_name ?? null,
      username: from.username ?? null,
    });
  }
  await upsertChat({ chatId, type: chatType });
  await bot.sendMessage(chatId, buildMainMenuMessage(from?.first_name ?? null), {
    parse_mode: "HTML",
    reply_markup: mainMenuKeyboard(
      isPrivateChat(chatType),
      cachedUsername ?? undefined,
    ),
  });
}

async function sendStats(
  bot: TelegramBot,
  chatId: number,
  chatType: string,
  userId: number,
): Promise<void> {
  const stats = await getStats();
  const isPrivate = isPrivateChat(chatType);
  let userTasbeeh = 0;
  let userCurrentCount = 0;
  let userDhikr: string | undefined;
  let chatRemindersSent: number | undefined;
  let chatRemindersEnabled: boolean | undefined;
  let chatIntervalMinutes: number | undefined;
  if (isPrivate) {
    const session = await getTasbeehSession(userId);
    userTasbeeh = session.totalCount;
    userCurrentCount = session.count;
    userDhikr = session.currentDhikr;
  } else {
    const chat = await getChat(chatId);
    if (chat) {
      chatRemindersSent = chat.totalRemindersSent;
      chatRemindersEnabled = chat.remindersEnabled;
      chatIntervalMinutes = chat.reminderIntervalMinutes;
    }
  }
  await bot.sendMessage(
    chatId,
    buildStatsMessage({
      isPrivate,
      userTasbeeh,
      userCurrentCount,
      userDhikr,
      totalUsers: stats.totalUsers,
      totalGroups: stats.totalGroups,
      totalTasbeeh: stats.totalTasbeeh,
      totalReminders: stats.totalReminders,
      chatRemindersSent,
      chatRemindersEnabled,
      chatIntervalMinutes,
    }),
    { parse_mode: "HTML", reply_markup: backOnlyKeyboard() },
  );
}

async function sendSettings(
  bot: TelegramBot,
  chatId: number,
  chatType: string,
  userId: number,
): Promise<void> {
  if (!isPrivateChat(chatType)) {
    const isAdmin = await isUserAdmin(bot, chatId, userId);
    if (!isAdmin) {
      await bot
        .sendMessage(
          chatId,
          "🔒 الإعدادات مخصصة للمشرفين فقط في المجموعات.",
        )
        .catch(() => {});
      return;
    }
  }
  const chat = await getChat(chatId);
  if (!chat) return;
  await bot.sendMessage(
    chatId,
    buildSettingsMessage({ isPrivate: isPrivateChat(chatType) }),
    {
      parse_mode: "HTML",
      reply_markup: settingsKeyboard({
        remindersEnabled: chat.remindersEnabled,
        fastingEnabled: chat.fastingRemindersEnabled,
        intervalMinutes: chat.reminderIntervalMinutes,
      }),
    },
  );
}

async function sendBookDocument(
  bot: TelegramBot,
  chatId: number,
  book: PdfBook,
): Promise<void> {
  try {
    await bot.sendDocument(
      chatId,
      getPdfUrl(book),
      {
        caption:
          `${book.emoji} <b>${escapeHtml(book.title)}</b>\n\n` +
          `<i>${escapeHtml(book.description)}</i>\n\n` +
          `🌿 جزى الله خيرًا كل من ساهم في نشر هذا الكتاب.`,
        parse_mode: "HTML",
      },
      { filename: `${book.title}.pdf`, contentType: "application/pdf" },
    );
  } catch (err) {
    logger.error({ err, bookId: book.id }, "Failed to send PDF");
    await bot
      .sendMessage(
        chatId,
        `⚠️ تعذّر إرسال الملف حاليًا، يمكنك تحميله من:\n${getPdfUrl(book)}`,
        { disable_web_page_preview: true },
      )
      .catch(() => {});
  }
}

async function handleCallback(
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
): Promise<void> {
  const data = query.data;
  const msg = query.message;
  if (!data || !msg) {
    await bot.answerCallbackQuery(query.id).catch(() => {});
    return;
  }

  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  const messageId = msg.message_id;
  const userId = query.from.id;

  if (query.from && !query.from.is_bot) {
    await upsertUser({
      userId: query.from.id,
      firstName: query.from.first_name ?? null,
      username: query.from.username ?? null,
    });
  }
  await upsertChat({ chatId, type: chatType, title: msg.chat.title ?? null });

  const [section, action, ...rest] = data.split(":");

  if (section === "menu") {
    if (action === "main") {
      await editMessage(
        bot,
        chatId,
        messageId,
        buildMainMenuMessage(query.from.first_name ?? null),
        mainMenuKeyboard(isPrivateChat(chatType), cachedUsername ?? undefined),
      );
    } else if (action === "dhikr_now") {
      await bot
        .sendMessage(chatId, buildRandomDhikrMessage(), {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: dhikrNowKeyboard(),
        })
        .catch(() => {});
    } else if (action === "dhikr_now_edit") {
      await editMessage(
        bot,
        chatId,
        messageId,
        buildRandomDhikrMessage(),
        dhikrNowKeyboard(),
      );
    } else if (action === "about") {
      await editMessage(
        bot,
        chatId,
        messageId,
        buildAboutMessage(),
        aboutKeyboard(cachedUsername ?? undefined),
      );
    }
    await bot.answerCallbackQuery(query.id).catch(() => {});
    return;
  }

  if (section === "tasbeeh") {
    await handleTasbeehCallback(
      bot,
      query,
      chatId,
      messageId,
      userId,
      action,
      rest,
    );
    return;
  }

  if (section === "lib") {
    await handleLibraryCallback(bot, query, chatId, messageId, action, rest);
    return;
  }

  if (section === "stats") {
    await handleStatsCallback(bot, query, chatId, messageId, chatType, userId);
    return;
  }

  if (section === "settings") {
    await handleSettingsCallback(
      bot,
      query,
      chatId,
      messageId,
      chatType,
      userId,
      action,
      rest,
    );
    return;
  }

  await bot.answerCallbackQuery(query.id).catch(() => {});
}

async function handleTasbeehCallback(
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  chatId: number,
  messageId: number,
  userId: number,
  action: string | undefined,
  rest: string[],
): Promise<void> {
  if (action === "open") {
    const session = await getTasbeehSession(userId);
    await editMessage(
      bot,
      chatId,
      messageId,
      buildTasbeehMessage({
        dhikr: session.currentDhikr,
        count: session.count,
        totalCount: session.totalCount,
        firstName: query.from.first_name ?? null,
      }),
      tasbeehKeyboard(session.currentDhikr),
    );
    await bot.answerCallbackQuery(query.id).catch(() => {});
    return;
  }

  if (action === "tick") {
    const session = await tickTasbeeh(userId);
    await editMessage(
      bot,
      chatId,
      messageId,
      buildTasbeehMessage({
        dhikr: session.currentDhikr,
        count: session.count,
        totalCount: session.totalCount,
        firstName: query.from.first_name ?? null,
      }),
      tasbeehKeyboard(session.currentDhikr),
    );
    let toast = `📿 ${session.count}`;
    if (session.count > 0 && session.count % 100 === 0)
      toast = "✨ مائة تسبيحة، حُطّت خطاياك ولو كانت مثل زبد البحر!";
    else if (session.count > 0 && session.count % 33 === 0)
      toast = "🌟 أتممت ٣٣ تسبيحة، تقبل الله!";
    await bot.answerCallbackQuery(query.id, { text: toast }).catch(() => {});
    return;
  }

  if (action === "reset") {
    await resetTasbeeh(userId);
    const session = await getTasbeehSession(userId);
    await editMessage(
      bot,
      chatId,
      messageId,
      buildTasbeehMessage({
        dhikr: session.currentDhikr,
        count: session.count,
        totalCount: session.totalCount,
        firstName: query.from.first_name ?? null,
      }),
      tasbeehKeyboard(session.currentDhikr),
    );
    await bot
      .answerCallbackQuery(query.id, { text: "🔄 تم تصفير العداد" })
      .catch(() => {});
    return;
  }

  if (action === "change") {
    await editMessage(
      bot,
      chatId,
      messageId,
      buildTasbeehChooserMessage(),
      tasbeehChooserKeyboard(),
    );
    await bot.answerCallbackQuery(query.id).catch(() => {});
    return;
  }

  if (action === "set") {
    const optId = rest[0];
    const opt = TASBEEH_OPTIONS.find((o) => o.id === optId);
    if (!opt) {
      await bot
        .answerCallbackQuery(query.id, { text: "ذكر غير معروف" })
        .catch(() => {});
      return;
    }
    const session = await setTasbeehDhikr(userId, opt.text);
    await editMessage(
      bot,
      chatId,
      messageId,
      buildTasbeehMessage({
        dhikr: session.currentDhikr,
        count: session.count,
        totalCount: session.totalCount,
        firstName: query.from.first_name ?? null,
      }),
      tasbeehKeyboard(session.currentDhikr),
    );
    await bot
      .answerCallbackQuery(query.id, { text: `📜 ${opt.text}` })
      .catch(() => {});
    return;
  }

  await bot.answerCallbackQuery(query.id).catch(() => {});
}

async function handleLibraryCallback(
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  chatId: number,
  messageId: number,
  action: string | undefined,
  rest: string[],
): Promise<void> {
  if (action === "open") {
    await editMessage(
      bot,
      chatId,
      messageId,
      buildLibraryMessage(),
      libraryKeyboard(),
    );
    await bot.answerCallbackQuery(query.id).catch(() => {});
    return;
  }
  if (action === "get") {
    const id = rest[0];
    const book = id ? findBookById(id) : undefined;
    if (!book) {
      await bot
        .answerCallbackQuery(query.id, { text: "لم يتم العثور على الكتاب" })
        .catch(() => {});
      return;
    }
    await bot
      .answerCallbackQuery(query.id, { text: `جارٍ إرسال ${book.title}…` })
      .catch(() => {});
    await sendBookDocument(bot, chatId, book);
    return;
  }
  await bot.answerCallbackQuery(query.id).catch(() => {});
}

async function handleStatsCallback(
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  chatId: number,
  messageId: number,
  chatType: string,
  userId: number,
): Promise<void> {
  const stats = await getStats();
  const isPrivate = isPrivateChat(chatType);
  let userTasbeeh = 0;
  let userCurrentCount = 0;
  let userDhikr: string | undefined;
  let chatRemindersSent: number | undefined;
  let chatRemindersEnabled: boolean | undefined;
  let chatIntervalMinutes: number | undefined;
  if (isPrivate) {
    const session = await getTasbeehSession(userId);
    userTasbeeh = session.totalCount;
    userCurrentCount = session.count;
    userDhikr = session.currentDhikr;
  } else {
    const chat = await getChat(chatId);
    if (chat) {
      chatRemindersSent = chat.totalRemindersSent;
      chatRemindersEnabled = chat.remindersEnabled;
      chatIntervalMinutes = chat.reminderIntervalMinutes;
    }
  }
  await editMessage(
    bot,
    chatId,
    messageId,
    buildStatsMessage({
      isPrivate,
      userTasbeeh,
      userCurrentCount,
      userDhikr,
      totalUsers: stats.totalUsers,
      totalGroups: stats.totalGroups,
      totalTasbeeh: stats.totalTasbeeh,
      totalReminders: stats.totalReminders,
      chatRemindersSent,
      chatRemindersEnabled,
      chatIntervalMinutes,
    }),
    backOnlyKeyboard(),
  );
  await bot.answerCallbackQuery(query.id).catch(() => {});
}

async function handleSettingsCallback(
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  chatId: number,
  messageId: number,
  chatType: string,
  userId: number,
  action: string | undefined,
  rest: string[],
): Promise<void> {
  if (!isPrivateChat(chatType)) {
    const isAdmin = await isUserAdmin(bot, chatId, userId);
    if (!isAdmin) {
      await bot
        .answerCallbackQuery(query.id, {
          text: "🔒 هذا الزر مخصص للمشرفين فقط",
          show_alert: true,
        })
        .catch(() => {});
      return;
    }
  }

  const chat = await getChat(chatId);
  if (!chat) {
    await bot
      .answerCallbackQuery(query.id, { text: "لم يتم تهيئة هذه المحادثة" })
      .catch(() => {});
    return;
  }

  if (action === "open") {
    await editMessage(
      bot,
      chatId,
      messageId,
      buildSettingsMessage({ isPrivate: isPrivateChat(chatType) }),
      settingsKeyboard({
        remindersEnabled: chat.remindersEnabled,
        fastingEnabled: chat.fastingRemindersEnabled,
        intervalMinutes: chat.reminderIntervalMinutes,
      }),
    );
    await bot.answerCallbackQuery(query.id).catch(() => {});
    return;
  }

  if (action === "toggle_reminders") {
    await updateChatSettings(chatId, {
      remindersEnabled: !chat.remindersEnabled,
    });
    const updated = await getChat(chatId);
    if (updated) {
      await editMessage(
        bot,
        chatId,
        messageId,
        buildSettingsMessage({ isPrivate: isPrivateChat(chatType) }),
        settingsKeyboard({
          remindersEnabled: updated.remindersEnabled,
          fastingEnabled: updated.fastingRemindersEnabled,
          intervalMinutes: updated.reminderIntervalMinutes,
        }),
      );
    }
    await bot
      .answerCallbackQuery(query.id, {
        text: !chat.remindersEnabled
          ? "🔔 تم تفعيل التذكيرات"
          : "🔕 تم تعطيل التذكيرات",
      })
      .catch(() => {});
    return;
  }

  if (action === "toggle_fasting") {
    await updateChatSettings(chatId, {
      fastingRemindersEnabled: !chat.fastingRemindersEnabled,
    });
    const updated = await getChat(chatId);
    if (updated) {
      await editMessage(
        bot,
        chatId,
        messageId,
        buildSettingsMessage({ isPrivate: isPrivateChat(chatType) }),
        settingsKeyboard({
          remindersEnabled: updated.remindersEnabled,
          fastingEnabled: updated.fastingRemindersEnabled,
          intervalMinutes: updated.reminderIntervalMinutes,
        }),
      );
    }
    await bot
      .answerCallbackQuery(query.id, {
        text: !chat.fastingRemindersEnabled
          ? "🌅 تم تفعيل تذكير الصيام"
          : "🌅 تم تعطيل تذكير الصيام",
      })
      .catch(() => {});
    return;
  }

  if (action === "interval") {
    await editMessage(
      bot,
      chatId,
      messageId,
      buildIntervalChooserMessage(chat.reminderIntervalMinutes),
      intervalChooserKeyboard(),
    );
    await bot.answerCallbackQuery(query.id).catch(() => {});
    return;
  }

  if (action === "set_interval") {
    const minutes = Number(rest[0]);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      await bot
        .answerCallbackQuery(query.id, { text: "قيمة غير صالحة" })
        .catch(() => {});
      return;
    }
    await updateChatSettings(chatId, { reminderIntervalMinutes: minutes });
    const updated = await getChat(chatId);
    if (updated) {
      await editMessage(
        bot,
        chatId,
        messageId,
        buildSettingsMessage({ isPrivate: isPrivateChat(chatType) }),
        settingsKeyboard({
          remindersEnabled: updated.remindersEnabled,
          fastingEnabled: updated.fastingRemindersEnabled,
          intervalMinutes: updated.reminderIntervalMinutes,
        }),
      );
    }
    await bot
      .answerCallbackQuery(query.id, { text: "✅ تم حفظ الفترة الجديدة" })
      .catch(() => {});
    return;
  }

  await bot.answerCallbackQuery(query.id).catch(() => {});
}

async function editMessage(
  bot: TelegramBot,
  chatId: number,
  messageId: number,
  text: string,
  reply_markup: TelegramBot.InlineKeyboardMarkup,
): Promise<void> {
  try {
    await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup,
    });
  } catch (err: unknown) {
    const e = err as { response?: { body?: { description?: string } } };
    const desc = e.response?.body?.description ?? "";
    if (desc.includes("message is not modified")) return;
    if (
      desc.includes("message can't be edited") ||
      desc.includes("message to edit not found") ||
      desc.includes("there is no text in the message to edit")
    ) {
      await bot
        .sendMessage(chatId, text, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup,
        })
        .catch(() => {});
      return;
    }
    throw err;
  }
}
