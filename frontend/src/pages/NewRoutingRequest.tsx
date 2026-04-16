import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ── Types ───────────────────────────────────────────────────────────────────

interface ApiResult {
    api: string;
    status: 'ok' | 'error';
    data?: unknown;
    error?: string;
}

interface IntelligencePayload {
    origin: string;
    destination: string;
    apis_queried: number;
    apis_ok: number;
    apis_failed: number;
    results: Record<string, ApiResult>;
}

// ── API label config ─────────────────────────────────────────────────────────

const API_META: Record<string, { label: string; icon: string; color: string }> = {
    weather_origin: { label: 'Weather (Origin)', icon: 'wb_cloudy', color: 'text-blue-400' },
    weather_destination: { label: 'Weather (Destination)', icon: 'wb_cloudy', color: 'text-blue-400' },
    route_distance: { label: 'Route & Distance', icon: 'route', color: 'text-emerald-400' },
    fuel_price_diesel: { label: 'Diesel Price', icon: 'local_gas_station', color: 'text-amber-400' },
    fuel_price_jet: { label: 'Jet Fuel Price', icon: 'flight', color: 'text-amber-400' },
    currency: { label: 'Currency Rate', icon: 'currency_exchange', color: 'text-yellow-300' },
    port_origin: { label: 'Port Congestion (Origin)', icon: 'anchor', color: 'text-cyan-400' },
    port_destination: { label: 'Port Congestion (Destination)', icon: 'anchor', color: 'text-cyan-400' },
    traffic_origin: { label: 'Traffic (Origin)', icon: 'traffic', color: 'text-orange-400' },
    traffic_destination: { label: 'Traffic (Destination)', icon: 'traffic', color: 'text-orange-400' },
};

// ── Sub-components ──────────────────────────────────────────────────────────

const ApiStatusRow = ({ result }: { result: ApiResult }) => {
    const meta = API_META[result.api] ?? {
        label: result.api,
        icon: 'api',
        color: 'text-outline',
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${result.status === 'ok'
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-error/5 border-error/20'
            }`}>
            <span className={`material-symbols-outlined text-lg ${meta.color}`}>{meta.icon}</span>
            <span className="flex-1 text-sm font-medium text-on-surface">{meta.label}</span>
            {result.status === 'ok' ? (
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Data Received
                </span>
            ) : (
                <span className="flex items-center gap-1 text-error text-xs font-bold" title={result.error}>
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    Failed
                </span>
            )}
        </div>
    );
};

const IntelligencePanel = ({
    payload,
    onClose,
}: {
    payload: IntelligencePayload;
    onClose: () => void;
}) => {
    const resultList = Object.values(payload.results);

    return (
        <div className="bg-surface-container-low border border-white/10 rounded-2xl p-6 space-y-5 relative overflow-hidden shadow-2xl">
            {/* Top accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-emerald-400">verified</span>
                    </div>
                    <div>
                        <p className="text-base font-bold text-on-surface">Intelligence Fetch Complete</p>
                        <p className="text-xs text-on-surface-variant">
                            {payload.origin} → {payload.destination}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-outline hover:text-on-surface transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Summary badges */}
            <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                    ✓ {payload.apis_ok} APIs returned data
                </span>
                {payload.apis_failed > 0 && (
                    <span className="px-3 py-1 bg-error/10 border border-error/20 text-error text-xs font-bold rounded-full">
                        ✗ {payload.apis_failed} failed (check API keys in .env)
                    </span>
                )}
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-outline text-xs font-bold rounded-full">
                    {payload.apis_queried} total queried
                </span>
            </div>

            {/* Per-API status rows */}
            <div className="space-y-2">
                {resultList.map((r) => (
                    <ApiStatusRow key={r.api} result={r} />
                ))}
            </div>

            <p className="text-[11px] text-on-surface-variant opacity-60 text-center">
                Raw data is stored in backend logs. Route optimization parameters are ready.
            </p>
        </div>
    );
};


// ── Main Page ───────────────────────────────────────────────────────────────

const NewRoutingRequest = () => {
    const navigate = useNavigate();
    
    const [prompt, setPrompt] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [intelligence, setIntelligence] = useState<IntelligencePayload | null>(null);

    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        weight: '',
        sla: '',
        budget: '',
    });

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ── AI autofill ────────────────────────────────────────────────────────
    const runAIParsing = async () => {
        if (!prompt.trim()) return;
        setIsParsing(true);
        try {
            const response = await axios.post('http://localhost:8000/api/ai/parse-routing', {
                prompt,
            });
            if (response.data?.data) {
                const parsed = response.data.data;
                setFormData({
                    origin: parsed.origin || '',
                    destination: parsed.destination || '',
                    weight: parsed.weight || '',
                    sla: parsed.sla || '',
                    budget: parsed.budget || '',
                });
            }
        } catch (error) {
            console.error('Failed to parse prompt with AI:', error);
            alert('AI Error: Verify your backend is running and OPENAI_API_KEY is configured in backend/.env.');
        } finally {
            setIsParsing(false);
        }
    };

    // ── Intelligence fetch + GPT-4o analysis ──────────────────────────────────
    const runIntelligenceFetch = async () => {
        if (!formData.origin.trim() || !formData.destination.trim()) {
            alert('Please fill in at least Origin and Destination before engaging the optimizer.');
            return;
        }

        setIsFetching(true);
        setIntelligence(null);

        try {
            // Single call: fetches all APIs + sends to GPT-4o
            const response = await axios.post('http://localhost:8000/api/ai/analyze-route', {
                origin: formData.origin,
                destination: formData.destination,
                weight_kg: parseFloat(formData.weight) || 0,
                sla_days: parseInt(formData.sla) || 0,
                budget: parseFloat(formData.budget) || 0,
                currency: 'USD',
            });

            if (response.data?.data) {
                const { analysis: gptAnalysis } = response.data.data;
                // Navigate to the full report page, passing the analysis via router state
                navigate('/optimization', { state: { analysis: gptAnalysis } });
            }
        } catch (error) {
            console.error('Intelligence fetch / analysis failed:', error);
            alert('Failed. Make sure backend is running and API keys are set in .env.');
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Page header */}
            <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center text-on-primary-container">
                        <span className="material-symbols-outlined font-bold">add_road</span>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">
                        Initialize AI Routing
                    </h2>
                </div>
                <p className="text-[#a4c9ff] opacity-70 text-sm ml-13">
                    Configure logistics parameters for the execution engine to calculate the optimal path.
                </p>
            </div>

            {/* AI Natural Language Processor */}
            <div className="bg-surface-container-highest/20 border border-secondary/20 rounded-2xl p-6 relative overflow-hidden shadow-lg mb-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50" />
                <div className="flex justify-between items-end gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="font-label text-xs font-bold text-secondary flex items-center gap-1 uppercase tracking-widest ml-1">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>{' '}
                            Natural Language Command
                        </label>
                        <textarea
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-secondary focus:ring-1 focus:ring-secondary/50 text-on-surface py-3 px-4 rounded-xl transition-all outline-none resize-none"
                            placeholder='e.g. "Ship 500kg from Dubai to Rotterdam within 5 days under $4000"'
                            rows={2}
                            value={prompt}
                            onChange={handlePromptChange}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={runAIParsing}
                        disabled={isParsing || !prompt.trim()}
                        className={`h-[74px] px-6 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${isParsing
                                ? 'bg-secondary/20 text-secondary'
                                : 'bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 active:scale-95'
                            }`}
                    >
                        <span className={`material-symbols-outlined ${isParsing ? 'animate-spin' : ''}`}>
                            {isParsing ? 'sync' : 'smart_toy'}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {isParsing ? 'Extracting...' : 'Autofill'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

            {/* Form */}
            <div className="bg-surface-container-low border border-white/5 rounded-2xl p-8 relative overflow-hidden shadow-2xl glass-shimmer">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

                <form className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Origin */}
                        <div className="space-y-2 relative">
                            <label className="font-label text-xs font-bold text-primary uppercase tracking-widest ml-1">
                                Origin Node
                            </label>
                            <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
                                <span className="material-symbols-outlined text-outline">flight_takeoff</span>
                            </div>
                            <input
                                type="text"
                                name="origin"
                                value={formData.origin}
                                onChange={handleInputChange}
                                placeholder="e.g. Dubai (DXB)"
                                className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary text-on-surface py-3 px-4 rounded-xl transition-all outline-none"
                                required
                            />
                        </div>

                        {/* Destination */}
                        <div className="space-y-2 relative">
                            <label className="font-label text-xs font-bold text-secondary uppercase tracking-widest ml-1">
                                Destination Node
                            </label>
                            <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
                                <span className="material-symbols-outlined text-outline">flight_land</span>
                            </div>
                            <input
                                type="text"
                                name="destination"
                                value={formData.destination}
                                onChange={handleInputChange}
                                placeholder="e.g. Rotterdam Terminal"
                                className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-secondary text-on-surface py-3 px-4 rounded-xl transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Weight */}
                        <div className="space-y-2 relative">
                            <label className="font-label text-xs font-bold text-primary-fixed-dim uppercase tracking-widest ml-1">
                                Net Weight (kg)
                            </label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleInputChange}
                                placeholder="42000"
                                className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary text-on-surface py-3 px-4 rounded-xl transition-all outline-none"
                                required
                            />
                            <span className="absolute right-4 top-1/2 mt-3 -translate-y-1/2 text-outline text-xs">KG</span>
                        </div>

                        {/* SLA */}
                        <div className="space-y-2 relative">
                            <label className="font-label text-xs font-bold text-primary-fixed-dim uppercase tracking-widest ml-1">
                                SLA Deadline (Days)
                            </label>
                            <input
                                type="number"
                                name="sla"
                                value={formData.sla}
                                onChange={handleInputChange}
                                placeholder="14"
                                className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary text-on-surface py-3 px-4 rounded-xl transition-all outline-none"
                                required
                            />
                        </div>

                        {/* Budget */}
                        <div className="space-y-2 relative">
                            <label className="font-label text-xs font-bold text-primary-fixed-dim uppercase tracking-widest ml-1">
                                Budget Envelope
                            </label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                placeholder="15000"
                                className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary text-on-surface py-3 pl-8 pr-4 rounded-xl transition-all outline-none"
                            />
                            <span className="absolute left-4 top-1/2 mt-3 -translate-y-1/2 text-outline text-sm">$</span>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-6">
                        <button
                            type="button"
                            onClick={runIntelligenceFetch}
                            disabled={isFetching}
                            className="w-full md:w-auto relative group float-right"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-container to-secondary-container rounded-xl blur-md group-hover:blur-lg opacity-40 transition-all" />
                            <div className="relative bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-headline font-bold py-4 px-10 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-transform">
                                {isFetching ? (
                                    <>
                                        <span className="material-symbols-outlined text-xl animate-spin">sync</span>
                                        <span>Fetching Intelligence...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Engage AI Optimizer</span>
                                        <span className="material-symbols-outlined text-xl">model_training</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </form>
            </div>

            {/* Intelligence confirmation panel */}
            {intelligence && (
                <IntelligencePanel
                    payload={intelligence}
                    onClose={() => setIntelligence(null)}
                />
            )}

            {/* Removed the localized AnalysisReport since it now redirects to /optimization */}
        </div>
    );
};

export default NewRoutingRequest;
