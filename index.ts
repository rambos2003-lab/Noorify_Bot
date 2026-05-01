<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Noorify Engine</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- React & ReactDOM -->
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <!-- Babel for JSX -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        
        body {
            font-family: 'Plus+Jakarta+Sans', sans-serif;
            background-color: #020d0a;
            color: #f1f5f9;
            overflow: hidden;
        }

        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }

        .animate-fade-in {
            animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useRef } = React;

        // Lucide Icon Component (Fixed for Browser Version)
        const Icon = ({ name, size = 24, className = "" }) => {
            const iconRef = useRef(null);

            useEffect(() => {
                if (window.lucide && iconRef.current) {
                    window.lucide.createIcons({
                        attrs: {
                            class: className,
                            width: size,
                            height: size,
                            'stroke-width': 2
                        },
                        nameAttr: 'data-lucide'
                    });
                }
            }, [name, size, className]);

            return <i ref={iconRef} data-lucide={name.toLowerCase().replace(/([A-Z])/g, "-$1").replace(/^-/, "")}></i>;
        };

        const DHIKR_LIST = [
            { id: 1, text: "سُبْحَانَ اللَّهِ", category: "tasbeeh" },
            { id: 2, text: "الْحَمْدُ لِلَّهِ", category: "tasbeeh" },
            { id: 3, text: "اللَّهُ أَكْبَرُ", category: "tasbeeh" },
            { id: 4, text: "لَا إِلَهَ إِلَّا اللَّهُ", category: "tasbeeh" }
        ];

        function App() {
            const [tab, setTab] = useState('dashboard');
            const [count, setCount] = useState(0);
            const [activeDhikr, setActiveDhikr] = useState(DHIKR_LIST[0]);
            const [muted, setMuted] = useState(false);

            const increment = () => setCount(prev => prev + 1);
            const reset = () => setCount(0);

            return (
                <div className="flex items-center justify-center min-h-screen p-4 select-none">
                    {/* Arka Plan Efektleri */}
                    <div className="fixed inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[100px] rounded-full" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/10 blur-[100px] rounded-full" />
                    </div>

                    <div className="w-full max-w-md h-[720px] bg-[#051a15]/90 backdrop-blur-xl rounded-[2.5rem] border border-emerald-900/30 shadow-2xl flex flex-col relative overflow-hidden ring-1 ring-white/5">
                        
                        {/* Üst Bar */}
                        <header className="p-8 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                                    <Icon name="Moon" size={24} className="text-white fill-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-black tracking-tight text-white">نورِفاي</h1>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-tighter">Sistem Aktif</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setMuted(!muted)}
                                className="p-3 bg-emerald-900/20 rounded-xl hover:bg-emerald-900/40 transition-colors border border-emerald-800/30"
                            >
                                <Icon name={muted ? "VolumeX" : "Volume2"} size={20} className={muted ? "text-slate-400" : "text-emerald-400"} />
                            </button>
                        </header>

                        {/* Ana İçerik */}
                        <main className="flex-1 overflow-y-auto px-8 py-4 scrollbar-hide">
                            {tab === 'dashboard' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-emerald-800/20 p-6 rounded-[2rem] border border-emerald-700/30">
                                        <h2 className="text-lg font-bold mb-1 text-white text-right">Hoş Geldiniz 🌙</h2>
                                        <p className="text-xs text-emerald-100/60 leading-relaxed text-right">
                                            İkon motoru ve sistem bileşenleri optimize edildi. Artık tüm özellikler kararlı çalışıyor.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => setTab('counter')} className="p-6 bg-[#0a261f] rounded-[2rem] border border-emerald-800/40 hover:border-emerald-500/50 transition-all flex flex-col items-center gap-3 group">
                                            <div className="p-3 bg-emerald-900/30 rounded-2xl group-hover:scale-110 transition-transform text-yellow-400">
                                                <Icon name="Zap" size={28} />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-white uppercase">المسبحة</div>
                                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">SAYAÇ</div>
                                            </div>
                                        </button>
                                        <button onClick={() => setTab('settings')} className="p-6 bg-[#0a261f] rounded-[2rem] border border-emerald-800/40 hover:border-emerald-500/50 transition-all flex flex-col items-center gap-3 group">
                                            <div className="p-3 bg-emerald-900/30 rounded-2xl group-hover:scale-110 transition-transform text-cyan-400">
                                                <Icon name="BookOpen" size={28} />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-white uppercase">الأذكار</div>
                                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">ZİKİRLER</div>
                                            </div>
                                        </button>
                                    </div>

                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-3">
                                            <Icon name="ShieldCheck" size={20} className="text-emerald-500" />
                                            <span className="text-sm font-semibold">Veri Koruması</span>
                                        </div>
                                        <Icon name="ChevronRight" size={16} className="text-slate-600 group-hover:text-slate-300" />
                                    </div>
                                </div>
                            )}

                            {tab === 'counter' && (
                                <div className="h-full flex flex-col items-center justify-center space-y-12 animate-fade-in">
                                    <div className="text-center space-y-2">
                                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{activeDhikr.text}</span>
                                        <div className="text-8xl font-black tabular-nums tracking-tighter text-white drop-shadow-2xl">
                                            {count}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <button 
                                            onClick={increment}
                                            className="w-32 h-32 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-white/20 rounded-full border-2 border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        </button>
                                        <button 
                                            onClick={reset}
                                            className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center border border-white/10 transition-colors"
                                        >
                                            <Icon name="RotateCcw" size={24} className="text-emerald-400" />
                                        </button>
                                    </div>

                                    <div className="w-full grid grid-cols-2 gap-2 mt-4">
                                        {DHIKR_LIST.map(d => (
                                            <button 
                                                key={d.id}
                                                onClick={() => {setActiveDhikr(d); reset();}}
                                                className={`p-3 rounded-xl text-[10px] font-bold border transition-all ${activeDhikr.id === d.id ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                                            >
                                                {d.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {tab === 'settings' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-sm font-bold">
                                                <Icon name="LayoutGrid" size={18} className="text-emerald-500" />
                                                <span>Arayüz Ayarları</span>
                                            </div>
                                            <div className="w-10 h-5 bg-emerald-600 rounded-full relative">
                                                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                                            </div>
                                        </div>
                                        <hr className="border-white/5" />
                                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest text-center">
                                            Tüm sistemler %100 verimlilikle çalışıyor
                                        </div>
                                    </div>
                                </div>
                            )}
                        </main>

                        {/* Alt Navigasyon */}
                        <nav className="p-6 bg-emerald-950/50 backdrop-blur-md border-t border-emerald-900/20 flex justify-around items-center">
                            <button onClick={() => setTab('dashboard')} className={`p-4 rounded-2xl transition-all relative ${tab === 'dashboard' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-emerald-900 hover:text-emerald-700'}`}>
                                <Icon name="MessageSquare" size={22} />
                                {tab === 'dashboard' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />}
                            </button>
                            <button onClick={() => setTab('counter')} className={`p-4 rounded-2xl transition-all relative ${tab === 'counter' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-emerald-900 hover:text-emerald-700'}`}>
                                <Icon name="Zap" size={22} />
                                {tab === 'counter' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />}
                            </button>
                            <button onClick={() => setTab('settings')} className={`p-4 rounded-2xl transition-all relative ${tab === 'settings' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-emerald-900 hover:text-emerald-700'}`}>
                                <Icon name="Settings" size={22} />
                                {tab === 'settings' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />}
                            </button>
                        </nav>
                    </div>
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
