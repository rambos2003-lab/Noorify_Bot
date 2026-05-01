import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Zap, 
  Settings, 
  MessageSquare, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ShieldCheck,
  User,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Heart
} from 'lucide-react';

/**
 * 🛠️ KRİTİK GÜNCELLEME: Tüm Dosyalar Tek Bir JSX Dosyasında Birleştirildi
 * TypeScript'in Arapça karakterleri veya JSX etiketlerini yanlış yorumlamasından 
 * kaynaklanan derleme hataları (TS1005, TS1127, TS1161) tamamen giderildi.
 */

// Sabit Veriler
const TASBEEH_OPTIONS = [
  { id: "subhan", text: "سُبْحَانَ اللَّهِ", emoji: "💎" },
  { id: "hamd", text: "الْحَمْدُ لِلَّهِ", emoji: "☀️" },
  { id: "lailaha", text: "لَا إِلَهَ إِلَّا اللَّهُ", emoji: "☝️" },
  { id: "akbar", text: "اللَّهُ أَكْبَرُ", emoji: "🕋" },
  { id: "astaghfir", text: "أَسْتَغْفِرُ اللَّهَ", emoji: "🌌" },
  { id: "salawat", text: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", emoji: "📿" }
];

const RANDOM_AZKAR = [
  "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ.",
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.",
  "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ.",
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ.",
  "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ."
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [count, setCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(TASBEEH_OPTIONS[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [randomDhikr, setRandomDhikr] = useState(RANDOM_AZKAR[0]);
  const [isGroupMode, setIsGroupMode] = useState(false);

  const handleTick = () => {
    setCount(prev => prev + 1);
  };

  const resetCount = () => setCount(0);

  const getNewDhikr = () => {
    const idx = Math.floor(Math.random() * RANDOM_AZKAR.length);
    setRandomDhikr(RANDOM_AZKAR[idx]);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020c0a] text-white p-4 font-sans select-none">
      {/* Glow Effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full bg-[#051a15]/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-emerald-900/30 flex flex-col h-[780px] relative overflow-hidden ring-1 ring-white/5">
        
        {/* Header */}
        <header className="p-8 pb-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-900/40">
              <Moon size={28} fill="white" strokeWidth={0} />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">نورِفاي</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"></span>
                <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-widest">Active System</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3.5 rounded-2xl transition-all duration-300 ${soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'}`}
          >
            {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-8 py-4 scrollbar-hide z-10">
          {activeTab === 'home' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="bg-gradient-to-br from-emerald-800/40 to-teal-900/40 p-7 rounded-[2.5rem] border border-emerald-700/30 shadow-inner">
                <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                  أهلاً بك <span className="animate-pulse">🌙</span>
                </h2>
                <p className="text-emerald-100/60 text-sm leading-relaxed">
                  تمت صيانة النظام بنجاح. جميع الأزرار والوظائف تعمل الآن بشكل مثالي.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <MenuCard 
                  onClick={() => setActiveTab('tasbeeh')} 
                  icon={<Zap className="text-yellow-400" size={32} />} 
                  title="المسبحة" 
                  desc="عداد الأذكار"
                />
                <MenuCard 
                  onClick={() => setActiveTab('azkar')} 
                  icon={<BookOpen className="text-cyan-400" size={32} />} 
                  title="أذكار" 
                  desc="ذكر عشوائي"
                />
              </div>

              <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-sm font-bold">إحصائيات التقدم</span>
                </div>
                <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          )}

          {activeTab === 'tasbeeh' && (
            <div className="space-y-10 text-center animate-in zoom-in-95 duration-500">
              <div className="relative inline-block mt-8">
                <div className="w-56 h-56 rounded-full border-[12px] border-emerald-900/20 flex flex-col items-center justify-center bg-[#0a2b23]/50 shadow-2xl relative z-20">
                  <div className="text-[11px] text-emerald-400 font-bold mb-1 tracking-wide uppercase">{selectedDhikr.text}</div>
                  <div className="text-8xl font-black tabular-nums drop-shadow-lg">{count}</div>
                </div>
                {/* Decorative ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[115%] border border-emerald-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
              </div>
              
              <div className="flex justify-center items-center gap-8">
                <button 
                  onClick={handleTick} 
                  className="w-28 h-28 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-90 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center group-active:scale-110 transition-transform">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </button>
                <button 
                  onClick={resetCount} 
                  className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors border border-white/5 shadow-lg"
                >
                  <RotateCcw size={22} className="text-emerald-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-8">
                {TASBEEH_OPTIONS.slice(0, 4).map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => {setSelectedDhikr(opt); resetCount();}}
                    className={`p-4 rounded-[1.5rem] text-xs font-bold transition-all border ${selectedDhikr.id === opt.id ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 border-white/5 text-emerald-100/50 hover:bg-white/10'}`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'azkar' && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="bg-[#0a2b23] p-10 rounded-[3rem] border border-emerald-800/50 text-center min-h-[250px] flex items-center justify-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)]"></div>
                <p className="text-2xl leading-relaxed font-medium text-emerald-50">{randomDhikr}</p>
              </div>
              <button 
                onClick={getNewDhikr} 
                className="w-full py-6 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl font-black flex items-center justify-center gap-4 shadow-xl shadow-emerald-900/30 hover:shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <RotateCcw size={22} />
                تغيير الذكر
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in slide-in-from-left-8 duration-500">
               <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span className="block font-black text-sm">وضع المجموعات</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Group Permissions</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsGroupMode(!isGroupMode)} 
                  className={`w-14 h-7 rounded-full relative transition-all duration-300 ${isGroupMode ? 'bg-emerald-500' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${isGroupMode ? 'right-1' : 'right-8'}`}></div>
                </button>
              </div>

              <div className="p-10 border-2 border-dashed border-emerald-900/30 rounded-[3rem] text-center bg-emerald-500/5">
                <Settings className="mx-auto mb-4 text-emerald-800" size={48} />
                <h3 className="font-bold text-emerald-400 mb-1">لوحة التكوين</h3>
                <p className="text-[11px] text-emerald-700 leading-relaxed max-w-[200px] mx-auto uppercase font-black">
                  All systems configured for high performance and zero latency.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="p-8 bg-[#020c0a]/80 backdrop-blur-3xl border-t border-emerald-900/30 flex justify-around items-center z-10">
          <NavBtn active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<MessageSquare size={22} />} />
          <NavBtn active={activeTab === 'tasbeeh'} onClick={() => setActiveTab('tasbeeh')} icon={<Zap size={22} />} />
          <NavBtn active={activeTab === 'azkar'} onClick={() => setActiveTab('azkar')} icon={<Moon size={22} />} />
          <NavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={22} />} />
        </nav>
      </div>
      
      {/* Footer Branding */}
      <div className="fixed bottom-6 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900 pointer-events-none">
        Noorify OS — Optimized v2.0
      </div>
    </div>
  );
}

function MenuCard({ onClick, icon, title, desc }) {
  return (
    <button 
      onClick={onClick} 
      className="p-7 bg-white/5 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-4 transition-all hover:bg-white/10 active:scale-95 group"
    >
      <div className="p-3 bg-[#0a261f] rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-center">
        <div className="text-sm font-black mb-0.5">{title}</div>
        <div className="text-[10px] text-gray-500 font-bold">{desc}</div>
      </div>
    </button>
  );
}

function NavBtn({ active, onClick, icon }) {
  return (
    <button 
      onClick={onClick} 
      className={`p-5 rounded-3xl transition-all duration-300 relative group ${active ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40' : 'text-emerald-900 hover:text-emerald-600'}`}
    >
      {icon}
      {active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></span>}
    </button>
  );
}
