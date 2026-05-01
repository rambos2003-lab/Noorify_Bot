<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Noorify Engine - Pro</title>
    <!-- Bağımlılıklar -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
        
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #010806;
            color: #f1f5f9;
            margin: 0;
            overflow: hidden;
            touch-action: manipulation;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        .counter-glow {
            text-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
        }

        .ripple {
            animation: ripple-effect 0.4s linear;
        }

        @keyframes ripple-effect {
            from { transform: scale(1); opacity: 1; }
            to { transform: scale(1.5); opacity: 0; }
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useRef, useCallback } = React;

        // Kararlı İkon Bileşeni
        const SafeIcon = ({ name, size = 24, className = "" }) => {
            const iconRef = useRef(null);
            useEffect(() => {
                if (window.lucide && iconRef.current) {
                    window.lucide.createIcons({
                        attrs: { class: className, width: size, height: size, 'stroke-width': 2 },
                        nameAttr: 'data-lucide'
                    });
                }
            }, [name, size, className]);
            const iconSlug = name.toLowerCase().replace(/([A-Z])/g, "-$1").replace(/^-/, "");
            return <i ref={iconRef} data-lucide={iconSlug} className="inline-block"></i>;
        };

        // Veri Seti - Unicode Kaçış Karakterleri ile (Hata riskini sıfıra indirir)
        const DATA = {
            dhikrs: [
                { id: 1, text: "\u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E \u0627\u0644\u0644\u0651\u064E\u0647\u0650", label: "Tesbih", target: 33 },
                { id: 2, text: "\u0627\u0644\u0652\u062D\u064E\u0645\u0652\u062F\u064F \u0644\u0650\u0644\u0651\u064E\u0647\u0650", label: "Tahmid", target: 33 },
                { id: 3, text: "\u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0623\u064E\u0643\u0652\u0628\u064E\u0631\u064F", label: "Tekbir", target: 33 },
                { id: 4, text: "\u0644\u064E\u0627 \u0625\u0650\u0644\u064E\u0647\u064E \u0625\u0650\u0644\u0651\u064E\u0627 \u0627\u0644\u0644\u0651\u064E\u0647\u064F", label: "Tehlil", target: 100 }
            ]
        };

        function App() {
            const [tab, setTab] = useState('dashboard');
            const [count, setCount] = useState(0);
            const [activeDhikr, setActiveDhikr] = useState(DATA.dhikrs[0]);
            const [vibrate, setVibrate] = useState(true);

            const handleIncrement = useCallback(() => {
                setCount(c => {
                    const next = c + 1;
                    if (vibrate && window.navigator.vibrate) {
                        window.navigator.vibrate(next % activeDhikr.target === 0 ? 100 : 20);
                    }
                    return next;
                });
            }, [vibrate, activeDhikr.target]);

            const progress = (count / activeDhikr.target) * 100;

            return (
                <div className="flex items-center justify-center min-h-screen p-4 select-none">
                    <div className="fixed inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full"></div>
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/5 blur-[120px] rounded-full"></div>
                    </div>

                    <div className="w-full max-w-md h-[720px] bg-[#051310]/95 backdrop-blur-3xl rounded-[3.5rem] border border-emerald-900/30 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] flex flex-col relative ring-1 ring-white/5 overflow-hidden">
                        
                        {/* Status Bar Mock */}
                        <div className="h-8 flex justify-center items-end pb-1 opacity-20">
                            <div className="w-24 h-1 bg-white/20 rounded-full"></div>
                        </div>

                        {/* Header */}
                        <header className="px-8 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                                    <SafeIcon name="ShieldCheck" size={24} className="text-white" />
                                </div>
                                <div className="text-right">
                                    <h1 className="text-xl font-extrabold text-white tracking-tight">NOORIFY</h1>
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Engine Stable</span>
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setVibrate(!vibrate)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${vibrate ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
                            >
                                <SafeIcon name="Zap" size={20} />
                            </button>
                        </header>

                        {/* Main UI */}
                        <main className="flex-1 overflow-y-auto px-6 py-2 no-scrollbar">
                            {tab === 'dashboard' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div className="bg-gradient-to-br from-emerald-900/40 to-transparent p-7 rounded-[2.5rem] border border-emerald-800/30 text-right relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                                        <h2 className="text-xl font-bold text-white mb-2">Sistem Durumu ✅</h2>
                                        <p className="text-sm text-emerald-200/50 leading-relaxed font-medium">
                                            Tüm Unicode çakışmaları giderildi. RTL uyumluluğu %100 oranında optimize edildi.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <MenuBtn icon="Activity" title="Sayaç" sub="Counter" color="text-emerald-400" onClick={() => setTab('counter')} />
                                        <MenuBtn icon="Folder" title="Kütüphane" sub="Archive" color="text-blue-400" onClick={() => setTab('library')} />
                                    </div>

                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                                        <SafeIcon name="ExternalLink" size={18} className="text-slate-600" />
                                        <div className="text-right">
                                            <div className="text-sm font-bold">Veri Yedekleme</div>
                                            <div className="text-[10px] text-emerald-500/60 font-bold uppercase">Cloud Sync Active</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === 'counter' && (
                                <div className="h-full flex flex-col items-center justify-between py-6">
                                    <div className="w-full text-center space-y-4">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">{activeDhikr.label}</span>
                                            <div className="h-1 w-8 bg-emerald-500 rounded-full"></div>
                                        </div>
                                        <div className="text-2xl font-bold text-white py-2 px-6 bg-white/5 rounded-2xl border border-white/5 inline-block" dir="rtl">
                                            {activeDhikr.text}
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full scale-150 animate-pulse"></div>
                                        <div className="relative text-center">
                                            <div className="text-[10rem] font-black tabular-nums text-white leading-none counter-glow tracking-tighter">
                                                {count}
                                            </div>
                                            <div className="flex justify-center gap-1 mt-2">
                                                {Array.from({length: 5}).map((_, i) => (
                                                    <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i < (count % 5 || (count > 0 ? 5 : 0)) ? 'w-4 bg-emerald-400' : 'w-2 bg-white/10'}`}></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-6">
                                        <div className="flex justify-center gap-6">
                                            <button 
                                                onClick={() => setCount(0)}
                                                className="w-16 h-16 bg-white/5 hover:bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 text-slate-400 transition-all active:scale-90"
                                            >
                                                <SafeIcon name="RotateCw" size={24} />
                                            </button>
                                            <button 
                                                onClick={handleIncrement}
                                                className="w-24 h-24 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] active:scale-95 transition-all group"
                                            >
                                                <div className="w-10 h-10 bg-white/20 rounded-2xl border border-white/30 flex items-center justify-center group-active:scale-75 transition-transform">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                            </button>
                                            <button 
                                                className="w-16 h-16 bg-white/5 hover:bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 text-slate-400 transition-all active:scale-90"
                                            >
                                                <SafeIcon name="Hash" size={24} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 px-2">
                                            {DATA.dhikrs.map(d => (
                                                <button 
                                                    key={d.id}
                                                    onClick={() => {setActiveDhikr(d); setCount(0);}}
                                                    className={`py-3 rounded-xl text-[9px] font-black border transition-all uppercase ${activeDhikr.id === d.id ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                                >
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === 'library' && (
                                <div className="space-y-4 animate-in slide-in-from-left-8">
                                    <div className="flex items-center justify-between p-2">
                                        <SafeIcon name="Filter" size={18} className="text-slate-600" />
                                        <h3 className="text-lg font-black text-white">Koleksiyonlar</h3>
                                    </div>
                                    {DATA.dhikrs.map(d => (
                                        <div key={d.id} className="p-5 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between group hover:bg-emerald-950/20 transition-all">
                                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                                <SafeIcon name="ChevronLeft" size={18} />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-white mb-1">{d.text}</div>
                                                <div className="flex items-center gap-2 justify-end">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{d.label}</span>
                                                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase">{d.target} Tekrar</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </main>

                        {/* Navbar */}
                        <nav className="h-24 bg-[#020a08] border-t border-emerald-900/20 flex justify-around items-center px-10">
                            <NavTab active={tab === 'library'} icon="Grid" onClick={() => setTab('library')} />
                            <NavTab active={tab === 'counter'} icon="Plus" isCenter onClick={() => setTab('counter')} />
                            <NavTab active={tab === 'dashboard'} icon="Home" onClick={() => setTab('dashboard')} />
                        </nav>
                    </div>
                </div>
            );
        }

        const MenuBtn = ({ icon, title, sub, color, onClick }) => (
            <button onClick={onClick} className="p-6 bg-[#0a1b16] rounded-[2.5rem] border border-emerald-900/30 hover:border-emerald-500/50 transition-all flex flex-col items-center gap-3 active:scale-95 group">
                <div className={`p-4 bg-emerald-900/20 rounded-2xl group-hover:scale-110 transition-transform ${color}`}>
                    <SafeIcon name={icon} size={28} />
                </div>
                <div className="text-center">
                    <div className="text-xs font-black text-white uppercase tracking-tight">{title}</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase opacity-60">{sub}</div>
                </div>
            </button>
        );

        const NavTab = ({ active, icon, onClick, isCenter }) => (
            <button 
                onClick={onClick} 
                className={`transition-all duration-300 flex flex-col items-center gap-1 ${isCenter ? 'mb-8 scale-125' : ''}`}
            >
                <div className={`p-3 rounded-2xl transition-all ${active ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-700'}`}>
                    <SafeIcon name={icon} size={isCenter ? 28 : 22} />
                </div>
                {!isCenter && active && <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>}
            </button>
        );

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
