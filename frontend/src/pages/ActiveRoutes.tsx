import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ActiveRoutes = () => {
    const [routes, setRoutes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/shipments/active');
                if (response.data?.data) {
                    setRoutes(response.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch active routes:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRoutes();
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center text-on-primary-container">
                        <span className="material-symbols-outlined font-bold">timeline</span>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">
                        Active Shipments Network
                    </h2>
                </div>
                <p className="text-[#a4c9ff] opacity-70 text-sm ml-13">
                    Overview of all ongoing logistics operations processed by the cognitive engine.
                </p>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="w-full py-20 flex flex-col items-center justify-center space-y-4">
                    <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
                    <span className="text-xs font-bold text-outline uppercase tracking-widest">Hydrating Active Routes...</span>
                </div>
            ) : routes.length === 0 ? (
                <div className="w-full py-20 flex flex-col items-center justify-center bg-surface-container-low border border-white/5 rounded-2xl border-dashed">
                    <span className="material-symbols-outlined text-4xl text-outline mb-4">route</span>
                    <h3 className="text-xl font-bold text-on-surface mb-2">No Active Shipments</h3>
                    <p className="text-xs text-on-surface-variant mb-6 text-center max-w-md">There are no optimized routes stored in the database right now. Execute a new Route Intelligence attempt to see it appear here.</p>
                    <button 
                        onClick={() => navigate('/new-request')}
                        className="px-6 py-2 bg-primary/20 text-primary font-bold rounded-lg hover:bg-primary/30 transition-all border border-primary/30"
                    >
                        Initialize New Route
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {routes.map((route, i) => (
                        <div key={route.id || i} className="bg-surface-container-low border border-white/5 rounded-2xl p-6 shadow-lg hover:border-white/10 transition-colors group">
                            
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded border border-emerald-500/20">
                                        {route.status || 'Active'}
                                    </span>
                                    <span className="text-[10px] text-outline font-mono opacity-50">ID: {route.id?.substring(0, 8)}...</span>
                                </div>
                                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/optimization', { state: { analysis: route.full_analysis } })}>
                                    open_in_new
                                </span>
                            </div>

                            <div className="flex items-center justify-between mb-6 relative">
                                <div className="absolute top-1/2 left-0 w-full h-[1px] border-t border-dashed border-white/10 pointer-events-none" />
                                
                                {/* Origin Node */}
                                <div className="text-center relative bg-surface-container-low px-2 z-10">
                                    <span className="material-symbols-outlined text-primary mb-1">location_on</span>
                                    <p className="text-xs font-bold text-on-surface w-24 truncate" title={route.origin}>{route.origin}</p>
                                </div>
                                
                                {/* Center Info */}
                                <div className="text-center relative z-10 bg-surface-container-low px-4 flex flex-col items-center">
                                    <span className="material-symbols-outlined text-[10px] text-outline p-1 rounded-full border border-white/10 bg-surface-container-lowest">
                                        {route.recommended_mode === 'AIR' ? 'flight' : route.recommended_mode === 'SEA' ? 'directions_boat' : 'local_shipping'}
                                    </span>
                                    <span className="text-[10px] text-primary font-mono mt-1 font-bold">
                                        ${route.estimated_cost_usd?.toLocaleString()}
                                    </span>
                                </div>

                                {/* Dest Node */}
                                <div className="text-center relative bg-surface-container-low px-2 z-10">
                                    <span className="material-symbols-outlined text-secondary mb-1">location_on</span>
                                    <p className="text-xs font-bold text-on-surface w-24 truncate" title={route.destination}>{route.destination}</p>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-surface-container-lowest rounded-xl border border-white/5 space-y-2">
                                <p className="text-[10px] font-black text-outline uppercase tracking-widest">Execution Summary</p>
                                <p className="text-xs text-on-surface-variant line-clamp-3">
                                    {route.analysis_summary}
                                </p>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-white/5 flex gap-4 text-[10px] font-bold text-outline uppercase tracking-widest">
                                <span>{route.weight_kg} KG</span>
                                <span className="opacity-30">•</span>
                                <span>{route.sla_days} DAYS SLA</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActiveRoutes;
