import { InlineKeyboardMarkup } from "node-telegram-bot-api";
import { TASBEEH_OPTIONS, DEVELOPER_URL } from "./azkar"; // تأكد من المسار
import { PDF_LIBRARY } from "./pdfs"; // تأكد من المسار

// زر الرجوع الموحد
export const BACK_BUTTON = { text: "« رجوع للقائمة", callback_data: "menu:main" };

// القائمة الرئيسية (مع إيموجي الألوان)
export function mainMenuKeyboard(isAdmin: boolean, botUsername: string): InlineKeyboardMarkup {
    const rows: any[][] = [
        [
            { text: "📿 المسبحة الإلكترونية", callback_data: "tasbeeh:open" },
            { text: "📚 المكتبة الشاملة", callback_data: "lib:open" }
        ],
        [
            { text: "📊 الإحصائيات", callback_data: "stats:open" }
        ]
    ];

    if (isAdmin) {
        rows.push([{ text: "⚙️ إعدادات التذكير (للمشرفين)", callback_data: "settings:open" }]);
    } else {
        rows.push([{ text: "🔒 الإعدادات (للمشرفين فقط)", callback_data: "settings:locked" }]);
    }

    rows.push([
        { text: "📞 المطور", url: DEVELOPER_URL },
        { text: "➕ أضفني لمجموعتك", url: `https://t.me/${botUsername}?startgroup=true` }
    ]);

    return { inline_keyboard: rows };
}

// قائمة اختيار الذكر
export function tasbeehChooserKeyboard(): InlineKeyboardMarkup {
    return {
        inline_keyboard: [
            ...TASBEEH_OPTIONS.map(opt => [{ 
                text: `• ${opt.text} •`, 
                callback_data: `tasbeeh:set:${opt.id}` 
            }]),
            [BACK_BUTTON]
        ]
    };
}

// المسبحة التفاعلية أثناء التسبيح
export function tasbeehActiveKeyboard(dhikrId: string, count: number): InlineKeyboardMarkup {
    return {
        inline_keyboard: [
            [{ text: `✨ إضغط للتسبيح [ ${count} ] ✨`, callback_data: `tasbeeh:tick:${dhikrId}:${count}` }],
            [
                { text: "🔄 إعادة", callback_data: `tasbeeh:reset:${dhikrId}` },
                { text: "🔙 تغيير الذكر", callback_data: "tasbeeh:open" }
            ],
            [BACK_BUTTON]
        ]
    };
}

// قائمة المكتبة
export function libraryKeyboard(): InlineKeyboardMarkup {
    const rows: any[][] = [];
    for (let i = 0; i < PDF_LIBRARY.length; i += 2) {
        const row = [];
        row.push({ text: `${PDF_LIBRARY[i].emoji} ${PDF_LIBRARY[i].title}`, callback_data: `lib:view:${PDF_LIBRARY[i].id}` });
        if (PDF_LIBRARY[i + 1]) {
            row.push({ text: `${PDF_LIBRARY[i + 1].emoji} ${PDF_LIBRARY[i + 1].title}`, callback_data: `lib:view:${PDF_LIBRARY[i + 1].id}` });
        }
        rows.push(row);
    }
    rows.push([BACK_BUTTON]);
    return { inline_keyboard: rows };
}

// قائمة فترات التذكير
export function intervalChooserKeyboard(): InlineKeyboardMarkup {
    return {
        inline_keyboard: [
            [
                { text: "30 د", callback_data: "settings:set:30" }, 
                { text: "ساعة", callback_data: "settings:set:60" }
            ],
            [
                { text: "ساعتان", callback_data: "settings:set:120" }, 
                { text: "4 س", callback_data: "settings:set:240" }
            ],
            [
                { text: "6 س", callback_data: "settings:set:360" }
            ],
            [BACK_BUTTON]
        ]
    };
}
