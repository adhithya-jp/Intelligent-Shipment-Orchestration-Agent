import React from 'react';

const StatCard = ({ label, icon }: { label: string; icon: string }) => (
    <div>
        <p className="text-[10px] uppercase tracking-widest text-outline mb-1 font-bold">{label}</p>
        <div className="h-8 w-24 bg-white/5 rounded animate-pulse mt-2" />
        <p className="text-xs text-outline mt-2">No data yet</p>
    </div>
);

const AlertEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
        <span className="material-symbols-outlined text-3xl text-outline">notifications_off</span>
        <p className="text-sm font-bold text-on-surface">No Active Alerts</p>
        <p className="text-xs text-on-surface-variant">Alerts will appear here once the system is live.</p>
    </div>
);

const MapEmptyState = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
        <span className="material-symbols-outlined text-5xl text-outline">public_off</span>
        <p className="text-base font-bold text-on-surface">Network Map Unavailable</p>
        <p className="text-xs text-on-surface-variant">Connect to the backend and start a routing session to visualize the network.</p>
    </div>
);

const ShipmentEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="material-symbols-outlined text-5xl text-outline">local_shipping</span>
        <p className="text-base font-bold text-on-surface">No Active Shipments</p>
        <p className="text-xs text-on-surface-variant max-w-xs">
            Create a new routing request to begin tracking shipments here.
        </p>
    </div>
);

const Dashboard = () => {
    return (
        <>
            {/* Hero Section: Global AI Routing Overview */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8 overflow-hidden">
                <div
                    className="xl:col-span-2 glass-panel border-t border-primary/30 rounded-xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between min-h-[340px]"
                    style={{ background: "rgba(45, 52, 73, 0.2)", backdropFilter: "blur(12px)" }}
                >
                    <div className="relative z-10 w-full pr-4">
                        <div className="flex items-center gap-2 mb-4 w-fit">
                            <span className="px-3 py-1 bg-surface-container-high text-outline text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10 whitespace-nowrap">
                                Awaiting Data
                            </span>
                            <span className="text-[#a4c9ff] text-sm font-medium whitespace-nowrap" style={{ opacity: 0.8 }}>
                                Overview
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-6 w-full leading-tight">
                            AI Shipment Orchestrator{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary break-words">
                                Ready
                            </span>
                        </h2>
                        <p className="text-sm text-on-surface-variant max-w-md">
                            System is online. Connect to MongoDB and start a routing session to populate live statistics.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 relative z-10 pt-8 border-t border-white/5">
                        <StatCard label="Active Cargo" icon="inventory_2" />
                        <StatCard label="Saved by AI" icon="savings" />
                        <div className="hidden sm:block">
                            <StatCard label="Network Uptime" icon="wifi_tethering" />
                        </div>
                    </div>
                    {/* Abstract Visual Decor */}
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />
                </div>

                {/* Side Alerts Panel */}
                <div className="space-y-6 flex flex-col">
                    <div className="bg-surface-container-low rounded-xl p-6 flex-1 flex flex-col border border-white/5">
                        <p className="text-xs font-bold text-[#a4c9ff] opacity-80 uppercase tracking-tighter mb-4">
                            Critical Alerts
                        </p>
                        <AlertEmptyState />
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
                    <div className="absolute inset-0 z-0 bg-slate-950" />
                    <MapEmptyState />
                </div>
            </section>

            {/* Active Shipments Table */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-on-surface">Active Shipment Execution</h3>
                    <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                        View All Shipments{' '}
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
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
                        <tbody>
                            <tr>
                                <td colSpan={5}>
                                    <ShipmentEmptyState />
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
