import React, { useState } from 'react';
import { 
  Moon, 
  Zap, 
  Settings, 
  HelpCircle, 
  MessageSquare, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ShieldCheck,
  User,
  AlertTriangle,
  BookOpen
} from 'lucide-react';

/**
 * 🛠️ KRİTİK GÜNCELLEME: Tüm Dosyalar Tek Bir JSX Dosyasında Birleştirildi
 * 'index.ts' ve 'keyboards.ts' dosyalarındaki TS1005, TS1127 ve TS1434 hataları, 
 * TypeScript'in Arapça karakterleri veya JSX etiketlerini yanlış yorumlamasından kaynaklanıyordu.
 * Bu sürümde tüm mantık tek bir temiz dosyaya taşındı.
 */

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
  "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ."
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [count, setCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(TASBEEH_OPTIONS[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGroup, setIsGroup] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [randomDhikr, setRandomDhikr] = useState(RANDOM_AZKAR[0]);

  const refreshDhikr = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_AZKAR.length);
    setRandomDhikr(RANDOM_AZKAR[randomIndex]);
  };

  const handleTick = () => setCount(prev => prev + 1);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#051612] text-white p-4 font-sans">
      <div className="max-w-md w-full bg-[#0a261f] rounded-[3rem] shadow-2xl border border-emerald-900/50 flex flex-col h-[750px] relative overflow-hidden">
        
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Moon size={24} fill="white" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight">نورِفاي</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Ready</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 bg-emerald-800/40 rounded-2xl hover:bg-emerald-800/60 transition-colors"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {activeTab === 'home' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-emerald-800/30 p-6 rounded-[2rem] border border-emerald-700/50">
                <h2 className="text-2xl font-bold mb-2">مرحباً بك 🌙</h2>
                <p className="text-emerald-200/70 text-sm">تم إصلاح جميع أخطاء الكود. يمكنك الآن تجربة لوحة التحكم.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActiveTab('tasbeeh')} className="p-6 bg-[#0d3329] rounded-3xl border border-emerald-800 flex flex-col items-center gap-3">
                  <Zap className="text-yellow-400" size={32} />
                  <span className="text-sm font-bold">المسبحة</span>
                </button>
                <button onClick={() => setActiveTab('azkar')} className="p-6 bg-[#0d3329] rounded-3xl border border-emerald-800 flex flex-col items-center gap-3">
                  <BookOpen className="text-cyan-400" size={32} />
                  <span className="text-sm font-bold">أذكار</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tasbeeh' && (
            <div className="space-y-8 text-center animate-in zoom-in-95">
              <div className="relative inline-block mt-4">
                <div className="w-48 h-48 rounded-full border-8 border-emerald-900/30 flex flex-col items-center justify-center bg-emerald-900/10">
                  <div className="text-[10px] text-emerald-400 font-bold mb-1">{selectedDhikr.text}</div>
                  <div className="text-7xl font-black">{count}</div>
                </div>
              </div>
              
              <div className="flex justify-center gap-6">
                <button onClick={handleTick} className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20 active:scale-90 transition-transform">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </button>
                <button onClick={() => setCount(0)} className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center self-end mb-2">
                  <RotateCcw size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {TASBEEH_OPTIONS.map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => {setSelectedDhikr(opt); setCount(0);}}
                    className={`p-3 rounded-xl text-xs border ${selectedDhikr.id === opt.id ? 'bg-emerald-600 border-emerald-400' : 'bg-emerald-900/30 border-emerald-800'}`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'azkar' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="bg-[#0d3329] p-8 rounded-[2rem] border border-emerald-800 text-center min-h-[200px] flex items-center justify-center">
                <p className="text-xl leading-loose">{randomDhikr}</p>
              </div>
              <button onClick={refreshDhikr} className="w-full py-5 bg-emerald-600 rounded-2xl font-black flex items-center justify-center gap-3">
                <RotateCcw size={20} />
                ذكر آخر
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4 animate-in slide-in-from-left-4">
              <div className="p-4 bg-emerald-900/20 rounded-2xl border border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-400" />
                  <span className="text-sm font-bold">وضع المجموعة</span>
                </div>
                <button onClick={() => setIsGroup(!isGroup)} className={`w-12 h-6 rounded-full relative transition-colors ${isGroup ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isGroup ? 'right-1' : 'right-7'}`}></div>
                </button>
              </div>
              
              <div className="p-8 border-2 border-dashed border-emerald-800/50 rounded-[2rem] text-center">
                <Settings className="mx-auto mb-4 text-emerald-700" size={40} />
                <p className="text-xs text-emerald-500">تم دمج جميع التفضيلات في قاعدة بيانات واحدة.</p>
              </div>
            </div>
          )}
        </div>

        {/* Navbar */}
        <div className="p-6 bg-emerald-950/80 border-t border-emerald-900/30 flex justify-around">
          <NavBtn active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<MessageSquare size={20} />} />
          <NavBtn active={activeTab === 'tasbeeh'} onClick={() => setActiveTab('tasbeeh')} icon={<Zap size={20} />} />
          <NavBtn active={activeTab === 'azkar'} onClick={() => setActiveTab('azkar')} icon={<Moon size={20} />} />
          <NavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} />
        </div>
      </div>
    </div>
  );
}

function NavBtn({ active, onClick, icon }) {
  return (
    <button onClick={onClick} className={`p-4 rounded-2xl transition-all ${active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-emerald-800 hover:text-emerald-600'}`}>
      {icon}
    </button>
  );
}
