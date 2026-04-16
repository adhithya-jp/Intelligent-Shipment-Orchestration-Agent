import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();

    const handleMockLogin = (e) => {
        e.preventDefault();
        // Since backend isn't hooked to frontend yet, immediately push to dashboard
        navigate('/dashboard');
    };

    return (
        <div className="bg-background font-body text-on-surface selection:bg-primary/30 min-h-screen flex items-center justify-center overflow-hidden relative">
            {/* Background Cinematic Atmosphere */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-surface-dim via-background to-surface-container-lowest"></div>
                {/* Decorative Pulse Orbs */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary-container/10 rounded-full blur-[120px]"></div>
                {/* Subtle Grid Texture */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #414751 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
            </div>

            {/* Main Content Area */}
            <main className="relative z-10 w-full max-w-lg px-6">
                {/* Cinematic Glass Card */}
                <div className="bg-surface-variant/20 backdrop-blur-xl rounded-xl border-t border-slate-900/10 shadow-2xl p-8 md:p-12 glass-shimmer">
                    {/* Branding Header */}
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-on-primary-container text-4xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>hub</span>
                            </div>
                        </div>
                        <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-on-surface mb-2">
                            Orchestration Agent
                        </h1>
                        <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest opacity-60">
                            Orchestrator Command Access
                        </p>
                    </div>

                    {/* Login Form */}
                    <form className="space-y-6" onSubmit={handleMockLogin}>
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="font-label text-xs font-medium text-primary ml-1" htmlFor="email">Email Identity</label>
                            <div className="group relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>alternate_email</span>
                                </div>
                                <input className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-secondary text-on-surface py-4 pl-12 pr-4 rounded-t-xl transition-all outline-none placeholder:text-outline/40" id="email" placeholder="clois@logistics.corp" type="email" required/>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="font-label text-xs font-medium text-primary" htmlFor="password">Secure Cipher</label>
                                <a className="text-[10px] text-primary/60 hover:text-primary transition-colors" href="#">Recover Access</a>
                            </div>
                            <div className="group relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>lock</span>
                                </div>
                                <input className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-secondary text-on-surface py-4 pl-12 pr-4 rounded-t-xl transition-all outline-none placeholder:text-outline/40" id="password" placeholder="••••••••••••" type="password" required/>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer">
                                    <span className="material-symbols-outlined text-outline hover:text-on-surface transition-colors" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>visibility</span>
                                </div>
                            </div>
                        </div>

                        {/* Primary Action */}
                        <button className="w-full relative group" type="submit">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-container to-secondary-container rounded-xl blur-md group-hover:blur-lg opacity-40 transition-all"></div>
                            <div className="relative bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-headline font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                                <span>Secure Login</span>
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>login</span>
                            </div>
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-outline-variant/30"></div>
                            <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">or continue with</span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-outline-variant/30"></div>
                        </div>

                        {/* Secondary Action */}
                        <button className="w-full bg-surface-container-highest/40 hover:bg-surface-container-highest border border-outline-variant/15 text-on-surface font-label text-sm font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-95" type="button">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="currentColor"></path>
                            </svg>
                            Sign in with Google
                        </button>
                    </form>

                    {/* Footer Meta */}
                    <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
                        <p className="text-outline text-xs">
                            Protected by Orchestrator Multi-Factor Authentication. 
                            <br />
                            Unauthorized access is logged and traced.
                        </p>
                    </div>
                </div>

                {/* Decorative Floating Elements */}
                <div className="mt-8 flex justify-between px-4 opacity-40">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[10px] font-label text-on-surface uppercase tracking-widest">Global Status: Optimal</span>
                    </div>
                    <div className="text-[10px] font-label text-on-surface uppercase tracking-widest">Version 4.2.0-Alpha</div>
                </div>
            </main>

            {/* Side Image Decoration */}
            <div className="hidden lg:block absolute bottom-0 left-0 p-12 opacity-20">
                <div className="flex gap-4">
                    <div className="h-12 w-1 bg-primary/40 rounded-full"></div>
                    <div className="h-24 w-1 bg-secondary/40 rounded-full"></div>
                    <div className="h-16 w-1 bg-primary/40 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
