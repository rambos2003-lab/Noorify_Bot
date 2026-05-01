import { DIVIDER, BORDER_TOP, BORDER_BOTTOM, RANDOM_AZKAR } from "./azkar";

export function buildMainMenuMessage(firstName: string = "مستخدمنا"): string {
    return `${BORDER_TOP}\n🌙 <b>نُـــورِفَـــاي</b> 🌙\n${BORDER_BOTTOM}\n\nأهلاً بك يا <b>${firstName}</b>\nاختر من القائمة بالأسفل 👇`;
}

export function buildRandomDhikrMessage(): string {
    const dhikr = RANDOM_AZKAR[Math.floor(Math.random() * RANDOM_AZKAR.length)];
    return `${BORDER_TOP}\n✨ <b>ذكر الله</b>\n${BORDER_BOTTOM}\n\n<code>${dhikr}</code>\n\n${DIVIDER}`;
}

export function buildTasbeehMessage(data: any): string {
    return `${BORDER_TOP}\n📿 <b>المسبحة</b>\n${BORDER_BOTTOM}\n\nالذكر: <b>${data.dhikr}</b>\nالعدد الحالي: <code>${data.count}</code>\nالإجمالي: <code>${data.totalCount}</code>`;
}

export function buildLibraryMessage(): string {
    return `📚 <b>المكتبة الإسلامية</b>\n${DIVIDER}\nاختر الكتاب للتحميل:`;
}

export function buildStatsMessage(s: any): string {
    return `📊 <b>الإحصائيات</b>\n${DIVIDER}\nإجمالي تسبيحاتك: ${s.totalTasbeeh}`;
}

export function buildAboutMessage(): string {
    return `🌙 <b>عن البوت</b>\n${DIVIDER}\nبوت نورفاي صدقة جارية..`;
}
