import { 
    BORDER_TOP, BORDER_BOTTOM, DIVIDER, 
    TASBEEH_OPTIONS, RANDOM_AZKAR 
} from "./azkar";

export function buildMainMenuMessage(firstName: string = "مستخدمنا"): string {
    return `${BORDER_TOP}\n🌙 <b>نُـــورِفَـــاي</b> 🌙\n${BORDER_BOTTOM}\n\nأهلاً بك يا <b>${firstName}</b>\nاختر من القائمة بالأسفل 👇`;
}

export function buildRandomDhikrMessage(): string {
    const dhikr = RANDOM_AZKAR[Math.floor(Math.random() * RANDOM_AZKAR.length)];
    return `${BORDER_TOP}\n✨ <b>ذكر الله</b>\n${BORDER_BOTTOM}\n\n<code>${dhikr}</code>\n\n${DIVIDER}`;
}

export function buildTasbeehDisplay(dhikrId: string, count: number): string {
    const dhikr = TASBEEH_OPTIONS.find(o => o.id === dhikrId);
    return `${BORDER_TOP}\n📿 <b>المسبحة التفاعلية</b>\n${BORDER_BOTTOM}\n\nالذكر: <b>${dhikr?.text || "تسبيح"}</b>\nالعدد الحالي: <code>[ ${count} ]</code>\n\n${DIVIDER}\n<i>استمر بالضغط على الزر للتسبيح..</i>`;
}

export function buildLibraryMessage(): string {
    return `📚 <b>المكتبة الإسلامية</b>\n${DIVIDER}\nاختر الكتاب الذي تود تصفحه:`;
}

export function buildStatsMessage(totalTasbeeh: number): string {
    // شريط تقدم تفاعلي
    const progress = Math.min(Math.floor(totalTasbeeh / 10), 10);
    const bar = "█".repeat(progress) + "░".repeat(10 - progress);
    
    return `📊 <b>إحصائياتك الشاملة</b>\n${DIVIDER}\n\nإجمالي تسبيحاتك: <b>${totalTasbeeh}</b>\nالتقدم: <code>[${bar}]</code>\n\nواصل على هذا الجهد الرائع!`;
}

export function buildAboutMessage(): string {
    return `🌙 <b>عن البوت</b>\n${DIVIDER}\nبوت نورفاي صدقة جارية، نسأل الله القبول.`;
}

export function buildIntervalChooserMessage(): string {
    return `⚙️ <b>إعدادات التذكير (للمشرفين)</b>\n${DIVIDER}\n\nاختر كم مرة تود أن يقوم البوت بإرسال أذكار للمجموعة:`;
}
