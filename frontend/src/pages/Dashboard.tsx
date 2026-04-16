import React, { useEffect, useState } from 'react';
import axios from 'axios';

// ── Components ──────────────────────────────────────────────────────────────

const StatCard = ({ label, value, unit, icon, trend, sub }: any) => (
    <div className="bg-surface-container-low border border-slate-900/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-4xl">{icon}</span>
        </div>
        <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-on-surface font-headline">{value || '---'}</h3>
            <span className="text-xs font-bold text-outline">{unit}</span>
        </div>
        {trend && (
            <p className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${trend.startsWith('+') ? 'text-emerald-400' : 'text-error'}`}>
                <span className="material-symbols-outlined text-xs">{trend.startsWith('+') ? 'trending_up' : 'trending_down'}</span>
                {trend} vs last week
            </p>
        )}
        {sub && <p className="text-[10px] text-on-surface-variant mt-2 italic">"{sub}"</p>}
    </div>
);

const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <h2 className="text-lg font-bold tracking-tight text-on-surface">{title}</h2>
    </div>
);

// ── Main Page ───────────────────────────────────────────────────────────────

const Dashboard = () => {
    const [liveData, setLiveData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/analytics/dashboard-summary');
                if (response.data?.live_cache) {
                    setLiveData(response.data.live_cache);
                }
            } catch (err) {
                console.error('Failed to sync dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // Helper to get data safely
    const get = (key: string) => liveData?.[key];

    return (
        <div className="space-y-10 pb-10">
            {/* Market Intelligence Row */}
            <section>
                <SectionHeader title="Global Market Intelligence" icon="query_stats" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        label="Diesel Price (US)" 
                        value={get('fuel_price_diesel')?.price_usd_per_gallon} 
                        unit="USD/GAL" 
                        icon="local_gas_station"
                        sub={get('fuel_price_diesel')?.period}
                    />
                    <StatCard 
                        label="Jet Fuel Index" 
                        value={get('fuel_price_jet')?.price_usd_per_gallon} 
                        unit="USD/GAL" 
                        icon="flight"
                        sub={get('fuel_price_jet')?.period}
                    />
                    <StatCard 
                        label="Exchange Rate" 
                        value={get('currency')?.rate} 
                        unit={get('currency')?.currency + "/USD"} 
                        icon="currency_exchange"
                    />
                    <StatCard 
                        label="Avg Container Transit" 
                        value={get('route_distance')?.duration_hours} 
                        unit="HRS" 
                        icon="schedule"
                        sub="Ground Route"
                    />
                </div>
            </section>

            {/* Port & Logistics Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <section>
                    <SectionHeader title="Latest Port Conditions" icon="anchor" />
                    <div className="bg-surface-container-low border border-slate-900/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/5 text-[10px] font-black text-outline uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Port / Hub</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Congestion</th>
                                    <th className="px-6 py-4">Activity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900/5">
                                {['port_origin', 'port_destination'].map(key => (
                                    get(key) && (
                                        <tr key={key} className="hover:bg-slate-900/2 transition-colors">
                                            <td className="px-6 py-4 font-bold text-on-surface">{get(key).port_name}</td>
                                            <td className="px-6 py-4 uppercase text-[10px] font-bold">
                                                <span className={`px-2 py-1 rounded-full ${get(key).congestion_status === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                                    {get(key).congestion_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-on-surface-variant">{get(key).vs_4wk_avg_pct}% vs Avg</td>
                                            <td className="px-6 py-4 font-mono text-outline">{get(key).vessel_calls} Calls</td>
                                        </tr>
                                    )
                                ))}
                                {!get('port_origin') && !get('port_destination') && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-outline italic">
                                            No recent port data synced. Perform a routing request to update.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <SectionHeader title="Operational Weather Risk" icon="tsunami" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['weather_origin', 'weather_destination'].map(key => (
                            get(key) && (
                                <div key={key} className="bg-surface-container-low border border-slate-900/5 p-5 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-outline uppercase mb-1">{key === 'weather_origin' ? 'Origin' : 'Destination'}</p>
                                        <p className="text-sm font-bold text-on-surface uppercase">{get(key).condition}</p>
                                        <p className="text-xs text-on-surface-variant">{get(key).temperature_c}°C | {get(key).wind_speed_ms}m/s Wind</p>
                                    </div>
                                    <div className={`p-2 rounded-lg ${get(key).shipping_risk === 'LOW' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                        <span className="material-symbols-outlined">
                                            {get(key).shipping_risk === 'LOW' ? 'check_circle' : 'warning'}
                                        </span>
                                    </div>
                                </div>
                            )
                        ))}
                         {!get('weather_origin') && !get('weather_destination') && (
                             <div className="col-span-2 py-10 text-center text-outline italic border border-dashed border-slate-900/10 rounded-xl">
                                 Awaiting route intelligence weather sync...
                             </div>
                         )}
                    </div>
                </section>
            </div>
            
            <p className="text-center text-[10px] text-outline italic opacity-50">
                Passive Data Sync Active — Dashboard updates automatically upon each new Routing Analysis.
            </p>
        </div>
    );
};

export default Dashboard;
