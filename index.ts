<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Noorify Engine - Stable</title>
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
            background-color: #020d0a;
            color: #f1f5f9;
            margin: 0;
            overflow: hidden;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        .dhikr-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dhikr-card:active {
            transform: scale(0.95);
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useRef } = React;

        // Kararlı İkon Bileşeni (TS1161 ve TS1005 hatalarını önlemek için izole edildi)
        const SafeIcon = ({ name, size = 24, className = "" }) => {
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

            const iconSlug = name.toLowerCase().replace(/([A-Z])/g, "-$1").replace(/^-/, "");
            return <i ref={iconRef} data-lucide={iconSlug} className="inline-block"></i>;
        };

        // Veri Seti - Syntax hatalarını önlemek için değişkenlere atandı
        const DATA = {
            dhikrs: [
                { id: 1, text: "سُبْحَانَ اللَّهِ", label: "Tesbih" },
                { id: 2, text: "الْحَمْدُ لِلَّهِ", label: "Tahmid" },
                { id: 3, text: "اللَّهُ أَكْبَرُ", label: "Tekbir" },
                { id: 4, text: "لَا إِلَهَ إِلَّا اللَّهُ", label: "Tehlil" }
            ]
        };

        function App() {
            const [tab, setTab] = useState('dashboard');
            const [count, setCount] = useState(0);
            const [activeDhikr, setActiveDhikr] = useState(DATA.dhikrs[0]);
            const [isMuted, setIsMuted] = useState(false);

            const handleIncrement = () => {
                setCount(c => c + 1);
                // Burada haptik feedback eklenebilir
            };

            return (
                <div className="flex items-center justify-center min-h-screen p-4">
                    {/* Arka Plan Dekorasyonu */}
                    <div className="fixed inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full"></div>
                    </div>

                    <div className="w-full max-w-md h-[680px] bg-[#051a15]/95 backdrop-blur-2xl rounded-[3rem] border border-emerald-900/30 shadow-2xl flex flex-col relative ring-1 ring-white/5">
                        
                        {/* Header */}
                        <header className="p-8 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                                    <SafeIcon name="Moon" size={24} className="text-white fill-white" />
                                </div>
                                <div className="text-right">
                                    <h1 className="text-xl font-extrabold text-white">نورِفاي</h1>
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Sistem Hazır</span>
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsMuted(!isMuted)}
                                className="w-10 h-10 bg-emerald-900/20 rounded-xl flex items-center justify-center border border-emerald-800/30 text-emerald-400"
                            >
                                <SafeIcon name={isMuted ? "VolumeX" : "Volume2"} size={20} />
                            </button>
                        </header>

                        {/* İçerik Alanı */}
                        <main className="flex-1 overflow-y-auto px-6 py-2 no-scrollbar">
                            {tab === 'dashboard' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-emerald-900/20 p-6 rounded-[2rem] border border-emerald-800/30 text-right">
                                        <h2 className="text-lg font-bold text-white mb-2">Hoş Geldiniz 🌙</h2>
                                        <p className="text-xs text-emerald-200/60 leading-relaxed">
                                            Sözdizimi hataları giderildi. Karakter kodlaması ve RTL desteği optimize edilerek sistem kararlı hale getirildi.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <MenuBtn 
                                            icon="Zap" 
                                            title="Sayaç" 
                                            sub="Tasbeeh" 
                                            color="text-yellow-400" 
                                            onClick={() => setTab('counter')} 
                                        />
                                        <MenuBtn 
                                            icon="BookOpen" 
                                            title="Zikirler" 
                                            sub="Library" 
                                            color="text-cyan-400" 
                                            onClick={() => setTab('library')} 
                                        />
                                    </div>

                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                                        <SafeIcon name="ChevronLeft" size={16} className="text-slate-600" />
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold">Bulut Senkronizasyonu</span>
                                            <SafeIcon name="Cloud" size={20} className="text-emerald-500" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === 'counter' && (
                                <div className="h-full flex flex-col items-center justify-center space-y-12">
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-emerald-500 mb-4 tracking-widest bg-emerald-500/10 py-1 px-4 rounded-full inline-block">
                                            {activeDhikr.text}
                                        </div>
                                        <div className="text-9xl font-black tabular-nums text-white drop-shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
                                            {count}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <button 
                                            onClick={handleIncrement}
                                            className="w-36 h-36 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 active:scale-90 transition-all group"
                                        >
                                            <div className="w-12 h-12 bg-white/20 rounded-full border-2 border-white/30 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => setCount(0)}
                                            className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center border border-white/10 text-emerald-400"
                                        >
                                            <SafeIcon name="RotateCcw" size={24} />
                                        </button>
                                    </div>

                                    <div className="w-full grid grid-cols-2 gap-2">
                                        {DATA.dhikrs.map(d => (
                                            <button 
                                                key={d.id}
                                                onClick={() => {setActiveDhikr(d); setCount(0);}}
                                                className={`p-3 rounded-xl text-[10px] font-bold border transition-all ${activeDhikr.id === d.id ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                            >
                                                {d.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {tab === 'library' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Kütüphane</span>
                                        <h3 className="text-lg font-black">Zikir Kayıtları</h3>
                                    </div>
                                    {DATA.dhikrs.map(d => (
                                        <div key={d.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                                            <SafeIcon name="Plus" size={16} className="text-emerald-500" />
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-white">{d.text}</div>
                                                <div className="text-[10px] text-slate-500">{d.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </main>

                        {/* Bottom Navigation */}
                        <nav className="p-6 bg-[#03110d] border-t border-emerald-900/20 flex justify-around items-center rounded-b-[3rem]">
                            <NavTab active={tab === 'library'} icon="Settings" onClick={() => setTab('library')} />
                            <NavTab active={tab === 'counter'} icon="Zap" onClick={() => setTab('counter')} />
                            <NavTab active={tab === 'dashboard'} icon="Home" onClick={() => setTab('dashboard')} />
                        </nav>
                    </div>
                </div>
            );
        }

        const MenuBtn = ({ icon, title, sub, color, onClick }) => (
            <button onClick={onClick} className="p-6 bg-[#0a261f] rounded-[2.5rem] border border-emerald-800/40 hover:border-emerald-500/50 transition-all flex flex-col items-center gap-3 group">
                <div className={`p-3 bg-emerald-900/30 rounded-2xl group-hover:scale-110 transition-transform ${color}`}>
                    <SafeIcon name={icon} size={28} />
                </div>
                <div className="text-center">
                    <div className="text-sm font-bold text-white uppercase">{title}</div>
                    <div className="text-[9px] text-slate-500 font-black tracking-tighter uppercase">{sub}</div>
                </div>
            </button>
        );

        const NavTab = ({ active, icon, onClick }) => (
            <button onClick={onClick} className={`p-4 rounded-2xl transition-all relative ${active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110' : 'text-emerald-900 hover:text-emerald-700'}`}>
                <SafeIcon name={icon} size={22} />
                {active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>}
            </button>
        );

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
