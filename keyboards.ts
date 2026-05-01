import React from 'react';

/**
 * 🛠️ GÜNCELLEME: TypeScript Sözdizimi Hataları Giderildi
 * JSX içindeki yorum satırları ve HTML etiketleri arasındaki geçişler düzeltildi.
 * Gereksiz veya yanlış yerleştirilmiş karakterler temizlendi.
 */

const TASBEEH_OPTIONS = [
  { id: "subhan", text: "سُبْحَانَ اللَّهِ", emoji: "💎" },
  { id: "hamd", text: "الْحَمْدُ لِلَّهِ", emoji: "☀️" },
  { id: "lailaha", text: "لَا إِلَهَ إِلَّا اللَّهُ", emoji: "☝️" },
  { id: "akbar", text: "اللَّهُ أَكْبَرُ", emoji: "🕋" },
  { id: "astaghfir", text: "أَسْتَغْفِرُ اللَّهَ", emoji: "🌌" },
  { id: "salawat", text: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", emoji: "📿" }
];

const DEVELOPER_URL = "https://t.me/vx_rq";

// Bot Klavye Fonksiyonları (Backend için)
export function mainMenuKeyboard() {
  return {
    keyboard: [
      [{ text: "🔵 المسبحة الإلكترونية" }, { text: "🟢 المكتبة الإسلامية" }],
      [{ text: "🟡 ذكر عشوائي" }, { text: "⚪ إحصائياتي" }],
      [{ text: "⚙️ الإعدادات" }, { text: "🔴 المساعدة والمطور" }]
    ],
    resize_keyboard: true
  };
}

// Önizleme Bileşeni (Dashboard)
const App = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white p-4 font-sans">
      <div className="max-w-md w-full bg-slate-900 rounded-[2rem] shadow-2xl p-8 text-center border border-slate-800">
        <div className="text-6xl mb-6 drop-shadow-lg">🌙</div>
        <h1 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          Noorify Config
        </h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          تم تصحيح أخطاء بناء الجملة (Syntax Errors) في ملف الأزرار. 
          الآن يمكنك استخدام الملف بأمان في مشروعك.
        </p>
        
        <div className="space-y-3 text-right" dir="rtl">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 hover:border-emerald-500 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 font-bold group-hover:scale-110 transition-transform">✓</div>
              <span className="text-sm font-medium">إصلاح أخطاء TypeScript</span>
            </div>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 hover:border-cyan-500 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 font-bold group-hover:scale-110 transition-transform">✓</div>
              <span className="text-sm font-medium">تنظيف الأكواد غير الضرورية</span>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 hover:border-purple-500 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-bold group-hover:scale-110 transition-transform">✓</div>
              <span className="text-sm font-medium">تحسين واجهة العرض</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
          <span>Version 2.0.1</span>
          <a href={DEVELOPER_URL} className="text-emerald-500 hover:underline">Support Developer</a>
        </div>
      </div>
    </div>
  );
};

export default App;
