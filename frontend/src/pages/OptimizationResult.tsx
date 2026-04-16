import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ProgressCircle = ({ percentage, color, label }: { percentage: number; color: string; label: string }) => (
    <div className="flex flex-col items-center gap-2">
        <div className="relative w-16 h-16">
            <svg className="w-full h-full" viewBox="0 0 36 36">
                <path className="text-white/5" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className={color} strokeDasharray={`${percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-on-surface">
                {percentage}%
            </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{label}</span>
    </div>
);

const OptimizationResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Fallback if accessed directly without state
    const data = location.state?.analysis;

    if (!data) {
        return (
            <div className="w-full flex-col flex items-center justify-center min-h-[50vh]">
                <p className="text-on-surface-variant mb-4">No analysis data found.</p>
                <button onClick={() => navigate('/new-request')} className="px-4 py-2 bg-primary/20 text-primary font-bold rounded-lg hover:bg-primary/30">
                    Back to Request
                </button>
            </div>
        );
    }

    const riskColors: Record<string, string> = {
        LOW: 'text-emerald-400',
        MEDIUM: 'text-yellow-400',
        HIGH: 'text-orange-400',
        CRITICAL: 'text-error',
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
             <div className="flex items-center gap-4 mb-4">
                <button onClick={() => navigate('/new-request')} className="w-10 h-10 rounded-lg bg-surface-container-high border border-white/5 flex items-center justify-center text-outline hover:text-on-surface hover:bg-white/5 transition-all">
                    <span className="material-symbols-outlined font-bold">arrow_back</span>
                </button>
                <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">
                    Intelligence Report
                </h2>
            </div>
            
            <div className="bg-surface-container-low border border-white/5 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b border-white/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-primary text-sm">analytics</span>
                                <h3 className="text-xl font-bold text-on-surface">GPT-4o Cognitive Analysis</h3>
                            </div>
                            <p className="text-sm text-on-surface-variant max-w-2xl">{data.executive_summary}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">SLA Feasibility</p>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${data.sla_feasibility === 'ON_TRACK' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                                {data.sla_feasibility?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Mode & Cost Section */}
                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                            <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-4">Recommended Strategy</p>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                                    <span className="material-symbols-outlined text-2xl">{data.recommended_mode === 'AIR' ? 'flight' : data.recommended_mode === 'SEA' ? 'directions_boat' : 'local_shipping'}</span>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-on-surface">{data.recommended_mode} Shipment</p>
                                    <p className="text-xs text-on-surface-variant line-clamp-2">{data.mode_rationale}</p>
                                </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-outline">Est. Total Cost</span>
                                    <span className="text-primary font-mono font-bold">${data.estimated_cost_usd?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-outline">Transit Time</span>
                                    <span className="text-on-surface font-bold">{data.estimated_transit_days} Days</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-highest/20 rounded-xl p-5 border border-white/5">
                            <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-4">Cost Breakdown</p>
                            <div className="space-y-3">
                                {Object.entries(data.cost_breakdown || {}).map(([key, val]: [string, any]) => (
                                    <div key={key} className="flex flex-col gap-1">
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="capitalize text-on-surface-variant">{key}</span>
                                            <span className="text-on-surface font-mono">${val}</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary/40 rounded-full" style={{ width: `${(val / data.estimated_cost_usd) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Risk & Confidence Section */}
                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-xl p-5 border border-white/5 h-full">
                            <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-6 text-center">Risk Vector Analysis</p>
                            <div className="flex justify-around items-center py-4">
                                <ProgressCircle percentage={data.risk_assessment?.overall === 'LOW' ? 20 : data.risk_assessment?.overall === 'MEDIUM' ? 50 : 85} color={riskColors[data.risk_assessment?.overall] || 'text-primary'} label="Overall" />
                                <ProgressCircle percentage={data.risk_assessment?.weather_risk === 'LOW' ? 15 : 70} color={riskColors[data.risk_assessment?.weather_risk] || 'text-blue-400'} label="Weather" />
                                <ProgressCircle percentage={data.risk_assessment?.port_risk === 'LOW' ? 25 : 60} color={riskColors[data.risk_assessment?.port_risk] || 'text-cyan-400'} label="Ports" />
                            </div>

                            <div className="mt-8 space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                                    <span className="text-xs text-on-surface-variant">Data Confidence</span>
                                    <span className={`text-xs font-bold ${data.data_confidence === 'HIGH' ? 'text-emerald-400' : 'text-yellow-400'}`}>{data.data_confidence}</span>
                                </div>
                                <p className="text-[10px] text-outline italic text-center px-4">"{data.confidence_reason}"</p>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations Section */}
                    <div className="space-y-6">
                        <div className="h-full flex flex-col">
                            <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-4">Strategic Recommendations</p>
                            <div className="flex-1 space-y-4">
                                {data.recommendations?.map((rec: string, i: number) => (
                                    <div key={i} className="flex gap-3 items-start group">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                                            {i + 1}
                                        </div>
                                        <p className="text-xs text-on-surface-variant leading-relaxed">{rec}</p>
                                    </div>
                                ))}
                            </div>
                            {data.alerts?.length > 0 && (
                                <div className="mt-6 p-4 rounded-xl bg-error/10 border border-error/20 flex gap-3">
                                    <span className="material-symbols-outlined text-error text-sm">priority_high</span>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-error uppercase">Urgent Alerts</p>
                                        {data.alerts.map((alert: string, i: number) => (
                                            <p key={i} className="text-[11px] text-on-surface">{alert}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="bg-surface-container-highest/30 p-4 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[9px] text-outline font-mono">HASH: {Math.random().toString(16).substring(2, 10).toUpperCase()} | COGNITIVE_ENGINE: GPT-4O</p>
                    <div className="flex items-center gap-4">
                        <button className="text-[10px] font-bold text-outline hover:text-on-surface transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">download</span> Export PDF
                        </button>
                        <button className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-primary-content text-[11px] uppercase tracking-widest font-black rounded-lg hover:brightness-125 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] active:scale-95 transition-all">
                            Execute Shipment Strategy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptimizationResult;
