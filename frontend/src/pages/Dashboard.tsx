import React from 'react';

const Dashboard = () => {
    return (
        <>
            {/* Hero Section: Global AI Routing Overview */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8 overflow-hidden">
                <div className="xl:col-span-2 glass-panel border-t border-primary/30 rounded-xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between min-h-[340px]" style={{ background: "rgba(45, 52, 73, 0.2)", backdropFilter: "blur(12px)" }}>
                    <div className="relative z-10 w-full pr-4">
                        <div className="flex items-center gap-2 mb-4 w-fit">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/20 whitespace-nowrap">System Live</span>
                            <span className="text-[#a4c9ff] text-sm font-medium whitespace-nowrap" style={{ opacity: 0.8 }}>Overview</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-6 w-full leading-tight">
                            Optimizing 1.2M nodes across the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary break-words">Kinetic Grid</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 relative z-10 pt-8 border-t border-white/5">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-outline mb-1 font-bold">Active Cargo</p>
                            <p className="text-3xl font-headline font-extrabold text-on-surface">42,000kg</p>
                            <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">trending_up</span> +12% vs LY
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-outline mb-1 font-bold">Saved by AI</p>
                            <p className="text-3xl font-headline font-extrabold text-on-surface">$1.2M</p>
                            <p className="text-xs text-primary mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">auto_awesome</span> Efficiency Max
                            </p>
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[10px] uppercase tracking-widest text-outline mb-1 font-bold">Network Uptime</p>
                            <p className="text-3xl font-headline font-extrabold text-on-surface">99.9%</p>
                            <p className="text-xs text-outline mt-1">Real-time Sync</p>
                        </div>
                    </div>
                    {/* Abstract Visual Decor */}
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] pointer-events-none"></div>
                </div>

                {/* Side Stat Bento */}
                <div className="space-y-6 flex flex-col">
                    <div className="bg-surface-container-low rounded-xl p-6 flex-1 flex flex-col justify-center border border-white/5">
                        <p className="text-xs font-bold text-[#a4c9ff] opacity-80 uppercase tracking-tighter mb-4">Critical Alerts</p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-3 bg-error-container/20 rounded-lg border-l-4 border-error">
                                <span className="material-symbols-outlined text-error mt-0.5">warning</span>
                                <div>
                                    <p className="text-sm font-bold text-on-surface">Weather Delay: North Atlantic</p>
                                    <p className="text-xs text-on-surface-variant">4 vessel re-routes suggested by AI</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-surface-container-highest/50 rounded-lg">
                                <span className="material-symbols-outlined text-secondary mt-0.5">bolt</span>
                                <div>
                                    <p className="text-sm font-bold text-on-surface">Fuel Optimization Ready</p>
                                    <p className="text-xs text-on-surface-variant">Update engine parameters for Route 88</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Visualization Area */}
            <section className="space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-bold text-on-surface">Live Network Pulse</h3>
                        <p className="text-sm text-outline">Real-time global logistics orchestration visualization</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-surface-container-highest rounded text-xs text-on-surface cursor-pointer">Global</span>
                        <span className="px-3 py-1 hover:bg-surface-container-highest rounded text-xs text-outline cursor-pointer transition-colors">Sea</span>
                        <span className="px-3 py-1 hover:bg-surface-container-highest rounded text-xs text-outline cursor-pointer transition-colors">Air</span>
                    </div>
                </div>
                <div className="relative w-full aspect-[21/9] bg-surface-container-low rounded-xl overflow-hidden border border-white/5 shadow-inner">
                    <div className="absolute inset-0 z-0 bg-slate-950">
                        {/* Background Map Aesthetic */}
                        <div className="w-full h-full opacity-20 bg-slate-800" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(1) brightness(0.5)' }}></div>
                    </div>

                    {/* SVG Network Overlays */}
                    <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="line-grad" x1="0%" x2="100%" y1="0%" y2="0%">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0"></stop>
                                <stop offset="50%" stopColor="#ae05c6" stopOpacity="0.8"></stop>
                                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"></stop>
                            </linearGradient>
                        </defs>
                        <path className="animate-pulse" d="M700,250 Q850,150 1000,200" fill="transparent" stroke="url(#line-grad)" strokeWidth="2"></path>
                        <circle className="shadow-[0_0_10px_#60a5fa]" cx="700" cy="250" fill="#60a5fa" r="4"></circle>
                        <circle className="shadow-[0_0_10px_#ae05c6]" cx="1000" cy="200" fill="#ae05c6" r="4"></circle>
                    </svg>

                    {/* Node Labels */}
                    <div className="absolute left-[54%] top-[45%] z-20">
                        <div className="flex flex-col items-center">
                            <div className="bg-surface-container-highest/80 backdrop-blur-md px-3 py-1 rounded-full border border-primary/20 text-[10px] font-bold text-white shadow-xl">Dubai Hub</div>
                            <div className="w-px h-6 bg-gradient-to-b from-primary to-transparent"></div>
                        </div>
                    </div>
                    <div className="absolute left-[78%] top-[35%] z-20">
                        <div className="flex flex-col items-center">
                            <div className="bg-surface-container-highest/80 backdrop-blur-md px-3 py-1 rounded-full border border-secondary/20 text-[10px] font-bold text-white shadow-xl">Rotterdam Terminal</div>
                            <div className="w-px h-6 bg-gradient-to-b from-secondary to-transparent"></div>
                        </div>
                    </div>

                    {/* UI Overlays in Map */}
                    <div className="absolute bottom-6 left-6 z-30 space-y-2">
                        <div className="p-4 rounded-xl border border-white/5 max-w-[200px]" style={{ background: "rgba(45, 52, 73, 0.2)", backdropFilter: "blur(12px)" }}>
                            <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Active Arc</p>
                            <p className="text-sm font-bold text-on-surface">Dubai → Rotterdam</p>
                            <div className="mt-3 flex justify-between text-[10px]">
                                <span className="text-outline">Latency:</span>
                                <span className="text-primary">12ms</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Active Shipments Table */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-on-surface">Active Shipment Execution</h3>
                    <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                        View All Shipments <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
                <div className="overflow-hidden bg-surface-container-lowest rounded-xl border border-white/5">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-wider">Origin</th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-wider">Destination</th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-wider">AI-Calculated Cost</th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-wider">SLA ETA</th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-sm">flight</span>
                                        </div>
                                        <span className="text-sm font-medium text-on-surface">Shanghai (PVG)</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-on-surface-variant">Los Angeles (LAX)</td>
                                <td className="px-6 py-4 text-sm font-mono text-primary">$4,280.00</td>
                                <td className="px-6 py-4 text-sm text-on-surface-variant">Oct 24, 08:00</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">IN TRANSIT</span>
                                </td>
                            </tr>
                            {/* ... remaining table rows ... */}
                            <tr className="bg-surface-container-lowest/50 hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center text-secondary">
                                            <span className="material-symbols-outlined text-sm">directions_boat</span>
                                        </div>
                                        <span className="text-sm font-medium text-on-surface">Singapore (SGSIN)</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-on-surface-variant">Hamburg (DEHAM)</td>
                                <td className="px-6 py-4 text-sm font-mono text-primary">$12,450.00</td>
                                <td className="px-6 py-4 text-sm text-on-surface-variant">Oct 29, 14:30</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-error/10 text-error border border-error/20">DELAYED</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
};

export default Dashboard;
