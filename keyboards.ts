import React from 'react';

/**
 * NOT: Bu dosya Telegram Bot API için klavye yapılandırmalarını içerir.
 * React bileşeni hatasını gidermek için dosya yapısı düzeltilmiştir.
 * Bu kodlar bir backend ortamında (Node.js) Telegram Botu ile kullanılmak üzere tasarlanmıştır.
 */

// Veri yapıları
const TASBEEH_OPTIONS = [
  { id: "subhan", text: "سُبْحَانَ اللَّهِ", emoji: "💎" },
  { id: "hamd", text: "الْحَمْدُ لِلَّهِ", emoji: "☀️" },
  { id: "lailaha", text: "لَا إِلَهَ إِلَّا اللَّهُ", emoji: "☝️" },
  { id: "akbar", text: "اللَّهُ أَكْبَرُ", emoji: "🕋" },
  { id: "astaghfir", text: "أَسْتَغْفِرُ اللَّهَ", emoji: "🌌" },
  { id: "salawat", text: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", emoji: "📿" },
  { id: "hawqala", text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", emoji: "💪" },
  { id: "mashallah", text: "مَا شَاءَ اللَّهُ تَبَارَكَ اللَّهُ", emoji: "✨" }
];

const DEVELOPER_URL = "https://t.me/vx_rq";

const PDF_LIBRARY = [
  { id: "quran", title: "القرآن الكريم", emoji: "📖", url: "https://github.com/path/to/quran.pdf" },
  { id: "hisn", title: "حصن المسلم", emoji: "🏰", url: "https://github.com/path/to/hisn.pdf" },
  { id: "arbain", title: "الأربعون النووية", emoji: "📜", url: "https://github.com/path/to/arbain.pdf" }
];

// Ana Menü Butonu
const BACK_BUTTON = { text: "🔙 القائمة الرئيسية", callback_data: "menu:main" };

/**
 * Ana Klavye Menüsü
 */
export function mainMenuKeyboard() {
  return {
    keyboard: [
      [{ text: "🔵 المسبحة الإلكترونية" }, { text: "🟢 المكتبة الإسلامية" }],
      [{ text: "🟡 ذكر عشوائي" }, { text: "⚪ إحصائياتي" }],
      [{ text: "⚙️ الإعدادات" }, { text: "🔴 المساعدة والمطور" }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
    input_field_placeholder: "اذكر الله.."
  };
}

/**
 * Mسبحة Klavyesi
 */
export function tasbeehKeyboard(count: number, dhikr: string, soundEnabled: boolean) {
  const progressValue = count % 10;
  const progress = "🟢".repeat(progressValue) + "⚪".repeat(10 - progressValue);
  
  return {
    inline_keyboard: [
      [{ text: `✨ ${dhikr} ✨`, callback_data: "none" }],
      [{ text: `📊 [ ${progress} ]`, callback_data: "none" }],
      [
        { text: "🔘 تسبيح", callback_data: "tasbeeh:tick" },
        { text: "🔄 تصفير", callback_data: "tasbeeh:reset" }
      ],
      [
        { text: "📿 تغيير الذكر", callback_data: "tasbeeh:change" },
        { text: soundEnabled ? "🔊 صوت: تشغيل" : "🔇 صوت: إيقاف", callback_data: "tasbeeh:toggle_sound" }
      ],
      [BACK_BUTTON]
    ]
  };
}

/**
 * Zikir Seçim Klavyesi
 */
export function tasbeehSelectionKeyboard() {
  const rows: any[][] = [];
  for (let i = 0; i < TASBEEH_OPTIONS.length; i += 2) {
    const row = [{ 
      text: `${TASBEEH_OPTIONS[i].emoji} ${TASBEEH_OPTIONS[i].text}`, 
      callback_data: `tasbeeh:set:${TASBEEH_OPTIONS[i].id}` 
    }];
    if (TASBEEH_OPTIONS[i + 1]) {
      row.push({ 
        text: `${TASBEEH_OPTIONS[i + 1].emoji} ${TASBEEH_OPTIONS[i + 1].text}`, 
        callback_data: `tasbeeh:set:${TASBEEH_OPTIONS[i + 1].id}` 
      });
    }
    rows.push(row);
  }
  rows.push([BACK_BUTTON]);
  return { inline_keyboard: rows };
}

/**
 * Kitaplık Klavyesi
 */
export function libraryKeyboard() {
  const rows = PDF_LIBRARY.map(book => ([
    { text: `${book.emoji} ${book.title}`, callback_data: `lib_file:${book.id}` }
  ]));
  rows.push([BACK_BUTTON]);
  return { inline_keyboard: rows };
}

/**
 * Ayarlar Klavyesi
 */
export function settingsKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "⏱️ فترة التذكير التلقائي", callback_data: "none" }],
      [
        { text: "30 د", callback_data: "set_timer:30" },
        { text: "1 ساعة", callback_data: "set_timer:60" },
        { text: "2 ساعة", callback_data: "set_timer:120" }
      ],
      [
        { text: "4 ساعات", callback_data: "set_timer:240" },
        { text: "6 ساعات", callback_data: "set_timer:360" },
        { text: "🚫 إيقاف", callback_data: "set_timer:off" }
      ],
      [BACK_BUTTON]
    ]
  };
}

/**
 * Yardım Klavyesi
 */
export function helpKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "👨‍💻 مراسلة المطور", url: DEVELOPER_URL }],
      [{ text: "📣 قناة البوت", url: "https://t.me/Noorify_Bot" }],
      [BACK_BUTTON]
    ]
  };
}

/**
 * Preview Hatasını Gidermek İçin Boş React Bileşeni
 */
const App = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-6 font-sans">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-gray-700">
        <div className="text-5xl mb-4">🌙</div>
        <h1 className="text-2xl font-bold mb-4 text-blue-400">Noorify Bot Klavye Yapılandırması</h1>
        <p className="text-gray-400 mb-6 leading-relaxed">
          Bu dosya backend tarafında çalışan bir Telegram botu için klavye ve menü mantığını içerir.
        </p>
        <div className="space-y-3">
          <div className="bg-gray-700 p-3 rounded-lg text-sm text-left border-l-4 border-green-500">
            ✅ Modül çözümleme hataları giderildi.
          </div>
          <div className="bg-gray-700 p-3 rounded-lg text-sm text-left border-l-4 border-blue-500">
            ✅ Backend verileri dosya içine dahil edildi.
          </div>
          <div className="bg-gray-700 p-3 rounded-lg text-sm text-left border-l-4 border-purple-500">
            ✅ Önizleme için boş bir App bileşeni eklendi.
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-xs text-gray-500">
          Geliştirici: @vx_rq
        </div>
      </div>
    </div>
  );
};

export default App;
