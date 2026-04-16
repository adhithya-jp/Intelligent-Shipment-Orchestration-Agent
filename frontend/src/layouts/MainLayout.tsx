import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="bg-background text-on-background selection:bg-primary/30 min-h-screen flex">
            {/* SideNavBar */}
            <aside className="hidden md:flex h-screen w-72 sticky left-0 bg-slate-950/60 backdrop-blur-xl flex-col p-6 z-[60]">
                <div className="mb-10">
                    <span className="text-2xl font-black bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent">Kinetic</span>
                    <p className="text-xs font-medium tracking-widest text-[#a4c9ff] uppercase mt-1 opacity-60">Shipment Command</p>
                </div>
                <nav className="flex-1 space-y-2">
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors font-headline text-sm font-medium hover:translate-x-1 duration-200">
                        <span className="material-symbols-outlined">dashboard</span>
                        Overview
                    </Link>
                    <Link to="/routes" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors font-headline text-sm font-medium hover:translate-x-1 duration-200">
                        <span className="material-symbols-outlined">route</span>
                        Active Routes
                    </Link>
                    <Link to="/optimization" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors font-headline text-sm font-medium hover:translate-x-1 duration-200">
                        <span className="material-symbols-outlined">psychology</span>
                        AI Optimization
                    </Link>
                    <Link to="/analytics" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors font-headline text-sm font-medium hover:translate-x-1 duration-200">
                        <span className="material-symbols-outlined">insights</span>
                        Analytics
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors font-headline text-sm font-medium hover:translate-x-1 duration-200">
                        <span className="material-symbols-outlined">settings</span>
                        Settings
                    </Link>
                </nav>
                <div className="mt-auto">
                    <Link to="/new-request" className="block w-full text-center py-4 bg-gradient-to-br from-primary-container to-secondary-container rounded-xl text-on-primary-container font-bold text-sm tracking-tight active:scale-95 transition-transform shadow-lg shadow-purple-500/20">
                        New Routing Request
                    </Link>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                {/* TopNavBar */}
                <header className="w-full sticky top-0 z-50 bg-slate-900/40 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-8 py-4 shadow-2xl shadow-blue-500/5">
                    <div className="flex items-center gap-8">
                        <h1 className="text-xl font-bold tracking-tighter text-slate-100 font-headline hidden sm:block">Orchestration Agent</h1>
                        <div className="hidden lg:flex items-center bg-surface-container-lowest rounded-full px-4 py-1.5 border border-outline-variant/15">
                            <span className="material-symbols-outlined text-outline text-sm mr-2">search</span>
                            <input className="bg-transparent border-none focus:ring-0 text-sm text-on-surface-variant w-48 xl:w-64 outline-none placeholder:text-outline/50" placeholder="Search cargo or nodes..." type="text" />
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2">
                            <button className="hidden sm:block p-2 text-slate-400 hover:bg-white/5 transition-all duration-300 rounded-lg active:scale-95">
                                <span className="material-symbols-outlined">hub</span>
                            </button>
                            <button className="p-2 text-slate-400 hover:bg-white/5 transition-all duration-300 rounded-lg active:scale-95 relative">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border border-slate-900"></span>
                            </button>
                        </div>
                        <div className="h-8 w-px bg-outline-variant/20"></div>
                        <div className="flex items-center gap-3 pl-2">
                            <img alt="CLO Profile" className="w-9 h-9 rounded-full object-cover border border-primary/20" src="https://ui-avatars.com/api/?name=C+L&background=0D8ABC&color=fff" />
                            <div className="hidden sm:block text-right">
                                <p className="text-xs font-bold text-on-surface leading-none">Chief Logistics Officer</p>
                                <p className="text-[10px] text-primary mt-0.5 whitespace-nowrap" style={{ opacity: 0.8 }}>Fleet Ops</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 space-y-8 overflow-y-auto w-full max-w-[100vw]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
