import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  MessageSquare, 
  Book, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  User,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';

/**
 * 🛠️ GÜNCELLEME: Modül Çözümleme Hatası Giderildi
 * Tarayıcı ortamında 'node-telegram-bot-api' ve 'express' gibi Node.js paketleri çalışmaz.
 * Bu nedenle, botun mantığını ve kullanıcı arayüzünü simüle eden interaktif bir 
 * "Bot Dashboard" yapısı oluşturuldu.
 */

// --- Veriler ---
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
  "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ.",
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ.",
  "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ.",
  "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ."
];

// --- Dashboard Bileşeni ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(TASBEEH_OPTIONS[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGroup, setIsGroup] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [randomDhikr, setRandomDhikr] = useState(RANDOM_AZKAR[0]);

  // Yeni bir zikir üret
  const refreshDhikr = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_AZKAR.length);
    setRandomDhikr(RANDOM_AZKAR[randomIndex]);
  };

  // Tesbih çekme fonksiyonu
  const handleTick = () => {
    setCount(prev => prev + 1);
    setTotal(prev => prev + 1);
    if (soundEnabled && typeof window !== 'undefined') {
      // Ses efekti simülasyonu
      console.log("Tick sound...");
    }
  };

  // Sekme değiştirme
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-emerald-800/50 p-6 rounded-3xl border border-emerald-700">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                السلام عليكم <span className="animate-bounce">🌙</span>
              </h2>
              <p className="text-emerald-200 text-sm leading-relaxed">
                مرحباً بك في لوحة تحكم بوت <b>نورِفاي</b>. يمكنك هنا تجربة جميع وظائف البوت قبل نشرها على تلجرام.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setActiveTab('tasbeeh')}
                className="p-4 bg-emerald-700/30 hover:bg-emerald-700/50 rounded-2xl border border-emerald-600 transition-all flex flex-col items-center gap-2"
              >
                <Zap className="text-yellow-400" />
                <span className="text-sm font-medium">المسبحة</span>
              </button>
              <button 
                onClick={() => setActiveTab('azkar')}
                className="p-4 bg-emerald-700/30 hover:bg-emerald-700/50 rounded-2xl border border-emerald-600 transition-all flex flex-col items-center gap-2"
              >
                <Moon className="text-blue-400" />
                <span className="text-sm font-medium">أذكار</span>
              </button>
            </div>
          </div>
        );

      case 'tasbeeh':
        return (
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-900/40 py-8 px-4 rounded-full border-4 border-emerald-500/30 inline-block mx-auto min-w-[200px]">
              <div className="text-sm text-emerald-400 mb-1">{selectedDhikr.text}</div>
              <div className="text-6xl font-black font-mono text-white">{count}</div>
              <div className="text-xs text-emerald-500 mt-2 uppercase tracking-widest">Counts</div>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={handleTick}
                className="w-24 h-24 bg-emerald-500 hover:bg-emerald-400 active:scale-95 rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/50 transition-all"
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center">
                   <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </button>
              <button 
                onClick={() => setCount(0)}
                className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center mt-auto"
              >
                <RotateCcw size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
               {TASBEEH_OPTIONS.map(opt => (
                 <button 
                  key={opt.id}
                  onClick={() => {setSelectedDhikr(opt); setCount(0);}}
                  className={`p-2 text-[10px] rounded-lg border ${selectedDhikr.id === opt.id ? 'bg-emerald-500 border-emerald-400' : 'bg-emerald-800/50 border-emerald-700'}`}
                 >
                   {opt.text}
                 </button>
               ))}
            </div>
          </div>
        );

      case 'azkar':
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-emerald-800/20 p-8 rounded-3xl border border-emerald-700 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Moon size={80} /></div>
               <p className="text-xl leading-loose font-arabic text-emerald-100 relative z-10">
                 {randomDhikr}
               </p>
            </div>
            <button 
              onClick={refreshDhikr}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              ذكر آخر
            </button>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            <div className="flex items-center justify-between p-4 bg-emerald-800/30 rounded-2xl border border-emerald-700">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-400" />
                <div>
                  <div className="font-bold text-sm">وضع المجموعة</div>
                  <div className="text-[10px] text-emerald-500">تحقق من صلاحيات المشرفين</div>
                </div>
              </div>
              <button 
                onClick={() => setIsGroup(!isGroup)}
                className={`w-12 h-6 rounded-full transition-all relative ${isGroup ? 'bg-emerald-500' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isGroup ? 'right-1' : 'right-7'}`} />
              </button>
            </div>

            {isGroup && (
              <div className="flex items-center justify-between p-4 bg-emerald-800/30 rounded-2xl border border-emerald-700">
                <div className="flex items-center gap-3">
                  <User className="text-blue-400" />
                  <div>
                    <div className="font-bold text-sm">صلاحية المشرف</div>
                    <div className="text-[10px] text-emerald-500">تفعيل/تعطيل وصولك للإعدادات</div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAdmin(!isAdmin)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isAdmin ? 'bg-blue-500' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAdmin ? 'right-1' : 'right-7'}`} />
                </button>
              </div>
            )}

            <div className="p-6 bg-emerald-900/50 rounded-3xl border-2 border-dashed border-emerald-700 text-center">
              {(!isGroup || (isGroup && isAdmin)) ? (
                <div className="space-y-4">
                  <CheckCircle2 className="mx-auto text-emerald-400" size={40} />
                  <p className="text-sm">لديك صلاحية الوصول لإعدادات التذكير الآلي ⚙️</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 bg-emerald-800 rounded">كل 30 دقيقة</div>
                    <div className="p-2 bg-emerald-800 rounded">كل ساعة</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <AlertTriangle className="mx-auto text-yellow-500" size={40} />
                  <p className="text-sm text-yellow-200">عذراً! أنت في مجموعة ولست مشرفاً. الإعدادات مغلقة.</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-white p-4 font-sans flex items-center justify-center overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-emerald-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-emerald-800 flex flex-col h-[700px] relative overflow-hidden">
        
        {/* Header */}
        <header className="p-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Moon size={20} fill="white" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight">نورِفاي <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full ml-1">V2</span></h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-tighter">Server Running</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-emerald-800 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {renderContent()}
        </main>

        {/* Footer Navigation */}
        <footer className="p-4 bg-emerald-950/50 backdrop-blur-md border-t border-emerald-800/50">
          <nav className="flex justify-around items-center">
            <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<MessageSquare size={20} />} label="الرئيسية" />
            <NavButton active={activeTab === 'tasbeeh'} onClick={() => setActiveTab('tasbeeh')} icon={<Zap size={20} />} label="المسبحة" />
            <NavButton active={activeTab === 'azkar'} onClick={() => setActiveTab('azkar')} icon={<Moon size={20} />} label="أذكار" />
            <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} label="الإعدادات" />
          </nav>
        </footer>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-emerald-400' : 'text-emerald-700 hover:text-emerald-500'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-emerald-500/10' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold">{label}</span>
      {active && <div className="w-1 h-1 bg-emerald-400 rounded-full" />}
    </button>
  );
}
