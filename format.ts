import {
  EMOTIONAL_PHRASES,
  RANDOM_AZKAR,
  TASBEEH_OPTIONS,
  DEVELOPER_USERNAME,
  DEVELOPER_URL,
  escapeHtml,
} from "../data/azkar";

const DIVIDER = "─────────────────────";
const FANCY_TOP = "╭─❀──────────❀─╮";
const FANCY_BOTTOM = "╰─❀──────────❀─╯";

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function buildRandomDhikrMessage(): string {
  const dhikr = pickRandom(RANDOM_AZKAR);
  const dua = pickRandom(EMOTIONAL_PHRASES);
  return (
    `${FANCY_TOP}\n` +
    `   📿 <b>ذكر اليوم</b> 📿\n` +
    `${FANCY_BOTTOM}\n\n` +
    `${escapeHtml(dhikr)}\n\n` +
    `${DIVIDER}\n` +
    `🤍 <i>${escapeHtml(dua)}</i>\n` +
    `${DIVIDER}`
  );
}

export function buildTasbeehMessage(opts: {
  dhikr: string;
  count: number;
  totalCount: number;
  firstName?: string | null;
}): string {
  const beadIndex = opts.count > 0 ? ((opts.count - 1) % 33 + 33) % 33 : 0;
  const beads = renderBeads(beadIndex, opts.count > 0);
  const greeting = opts.firstName
    ? `يا ${escapeHtml(opts.firstName)}`
    : "أيها المسبِّح الكريم";
  const progress = renderProgressBar(opts.count % 100, 100);
  return (
    `${FANCY_TOP}\n` +
    `   📿 <b>المسبحة الإلكترونية</b>\n` +
    `${FANCY_BOTTOM}\n\n` +
    `${beads}\n\n` +
    `${DIVIDER}\n` +
    `🌹 <b>${escapeHtml(opts.dhikr)}</b>\n` +
    `${DIVIDER}\n\n` +
    `🔢 العدد الحالي: <b>${opts.count}</b>\n` +
    `🌟 المجموع الكلي: <b>${opts.totalCount}</b>\n\n` +
    `📊 التقدم نحو ١٠٠:\n${progress}\n\n` +
    `${DIVIDER}\n` +
    `🤍 ${greeting}، اضغط «سبّح» لتزيد من حسناتك.\n` +
    `${DIVIDER}`
  );
}

function renderBeads(activeIndex: number, hasCount: boolean): string {
  const total = 11;
  const positions: string[] = [];
  for (let i = 0; i < total; i++) {
    if (!hasCount) {
      positions.push("⚪");
    } else if (i === activeIndex % total) {
      positions.push("🟢");
    } else {
      positions.push("🔵");
    }
  }
  return "      " + positions.join(" ");
}

function renderProgressBar(value: number, max: number): string {
  const totalSegments = 10;
  const filled = Math.round((value / max) * totalSegments);
  const empty = totalSegments - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  const pct = Math.round((value / max) * 100);
  return `<code>${bar}</code> ${pct}%`;
}

export function buildTasbeehChooserMessage(): string {
  const lines = [
    `${FANCY_TOP}`,
    `   📜 <b>اختر الذكر</b>`,
    `${FANCY_BOTTOM}`,
    ``,
    `${DIVIDER}`,
    ``,
  ];
  for (const opt of TASBEEH_OPTIONS) {
    lines.push(`🌹 <b>${escapeHtml(opt.text)}</b>`);
    lines.push(`     <i>${escapeHtml(opt.virtue)}</i>`);
    lines.push(``);
  }
  lines.push(DIVIDER);
  return lines.join("\n");
}

export function buildLibraryMessage(): string {
  return (
    `${FANCY_TOP}\n` +
    `   📚 <b>المكتبة الإسلامية</b>\n` +
    `${FANCY_BOTTOM}\n\n` +
    `${DIVIDER}\n\n` +
    `اختر الكتاب الذي تريده وسيتم إرساله\n` +
    `لك بصيغة PDF فورًا.\n\n` +
    `${DIVIDER}\n` +
    `🌿 <i>«مَنْ سلكَ طريقًا يلتمسُ فيه علمًا\n` +
    `سهَّلَ اللهُ له به طريقًا إلى الجنةِ»</i>\n` +
    `${DIVIDER}`
  );
}

export function buildAboutMessage(): string {
  return (
    `${FANCY_TOP}\n` +
    `   ℹ️ <b>عن بوت نورِفاي</b>\n` +
    `${FANCY_BOTTOM}\n\n` +
    `<b>نورِفاي</b> بوت إسلامي متكامل يجمع لك:\n\n` +
    `${DIVIDER}\n\n` +
    `📿 <b>المسبحة الإلكترونية</b>\n` +
    `   ┗ ١٢ ذكرًا مع فضل كل ذكر\n\n` +
    `📚 <b>مكتبة من ٩ كتب أمهات</b>\n` +
    `   ┗ القرآن الكريم وحصن المسلم وغيرها\n\n` +
    `🔔 <b>تذكيرات أذكار تلقائية</b>\n` +
    `   ┗ ٤٠+ ذكرًا متجددًا، فترة قابلة للتعديل\n\n` +
    `🌅 <b>تذكير صيام الإثنين والخميس</b>\n` +
    `   ┗ مع الأحاديث والأدلة\n\n` +
    `📊 <b>إحصائيات شخصية وعامة</b>\n\n` +
    `${DIVIDER}\n` +
    `👤 <b>المطور:</b> <a href="${DEVELOPER_URL}">@${DEVELOPER_USERNAME}</a>\n` +
    `${DIVIDER}\n\n` +
    `💚 <i>شارك البوت لتنال أجره الجاري.</i>\n` +
    `${DIVIDER}`
  );
}

export function buildSettingsMessage(opts: { isPrivate: boolean }): string {
  return (
    `${FANCY_TOP}\n` +
    `   ⚙️ <b>الإعدادات</b>\n` +
    `${FANCY_BOTTOM}\n\n` +
    `${DIVIDER}\n` +
    (opts.isPrivate
      ? `🔧 هذه الإعدادات تخصّك أنت.\n`
      : `🔒 <i>تنبيه: تعديل الإعدادات متاح للمشرفين فقط.</i>\n`) +
    `${DIVIDER}\n\n` +
    `اختر ما تريد تعديله من الأزرار أدناه 👇`
  );
}

export function buildIntervalChooserMessage(currentMinutes: number): string {
  return (
    `${FANCY_TOP}\n` +
    `   ⏱️ <b>فترة التذكير</b>\n` +
    `${FANCY_BOTTOM}\n\n` +
    `${DIVIDER}\n` +
    `الفترة الحالية: <b>${formatHumanInterval(currentMinutes)}</b>\n` +
    `${DIVIDER}\n\n` +
    `سيتم إرسال ذكرٍ عشوائي بعد كل فترة.\n` +
    `اختر الفترة المناسبة 👇`
  );
}

function formatHumanInterval(m: number): string {
  if (m < 60) return `${m} دقيقة`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) {
    if (h === 1) return "ساعة";
    if (h === 2) return "ساعتان";
    if (h < 11) return `${h} ساعات`;
    return `${h} ساعة`;
  }
  return `${h} ساعة و ${rem} دقيقة`;
}

export function buildStatsMessage(opts: {
  isPrivate: boolean;
  userTasbeeh?: number;
  userCurrentCount?: number;
  userDhikr?: string;
  totalUsers: number;
  totalGroups: number;
  totalTasbeeh: number;
  totalReminders: number;
  chatRemindersSent?: number;
  chatRemindersEnabled?: boolean;
  chatIntervalMinutes?: number;
}): string {
  const lines: string[] = [
    FANCY_TOP,
    `   📊 <b>الإحصائيات</b>`,
    FANCY_BOTTOM,
    ``,
  ];

  if (opts.isPrivate) {
    lines.push(`${DIVIDER}`);
    lines.push(`👤 <b>إحصائياتك الشخصية</b>`);
    lines.push(`${DIVIDER}`);
    lines.push(``);
    lines.push(`📿 إجمالي تسبيحاتك: <b>${opts.userTasbeeh ?? 0}</b>`);
    lines.push(`🔢 العدد الحالي: <b>${opts.userCurrentCount ?? 0}</b>`);
    if (opts.userDhikr) {
      lines.push(`📜 ذكرك الحالي: <b>${escapeHtml(opts.userDhikr)}</b>`);
    }
    lines.push(``);
  } else if (opts.chatRemindersSent !== undefined) {
    lines.push(`${DIVIDER}`);
    lines.push(`👥 <b>إحصائيات هذه المجموعة</b>`);
    lines.push(`${DIVIDER}`);
    lines.push(``);
    lines.push(`🔔 التذكيرات المُرسلة: <b>${opts.chatRemindersSent}</b>`);
    lines.push(
      `⚙️ الحالة: <b>${opts.chatRemindersEnabled ? "🟢 مفعّلة" : "🔴 معطّلة"}</b>`,
    );
    if (opts.chatIntervalMinutes) {
      lines.push(
        `⏱️ الفترة: <b>${formatHumanInterval(opts.chatIntervalMinutes)}</b>`,
      );
    }
    lines.push(``);
  }

  lines.push(`${DIVIDER}`);
  lines.push(`🌍 <b>إحصائيات البوت العامة</b>`);
  lines.push(`${DIVIDER}`);
  lines.push(``);
  lines.push(`👥 إجمالي المستخدمين: <b>${opts.totalUsers}</b>`);
  lines.push(`💬 المجموعات والقنوات: <b>${opts.totalGroups}</b>`);
  lines.push(`📿 مجموع التسبيحات: <b>${opts.totalTasbeeh}</b>`);
  lines.push(`🔔 إجمالي التذكيرات: <b>${opts.totalReminders}</b>`);
  lines.push(``);
  lines.push(DIVIDER);

  return lines.join("\n");
}

export function buildMainMenuMessage(firstName?: string | null): string {
  const greeting = firstName
    ? `أهلًا بك يا <b>${escapeHtml(firstName)}</b> 🌹`
    : `أهلًا بك في نورِفاي 🌹`;
  return (
    `${FANCY_TOP}\n` +
    `   📿 <b>القائمة الرئيسية</b>\n` +
    `${FANCY_BOTTOM}\n\n` +
    `${greeting}\n\n` +
    `${DIVIDER}\n` +
    `اختر ما تريد من الأزرار أدناه 👇\n` +
    `${DIVIDER}`
  );
}
