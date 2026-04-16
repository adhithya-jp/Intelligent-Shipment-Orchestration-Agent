import React, { useState } from 'react';
import axios from 'axios';

const NewRoutingRequest = () => {
    // State for the Natural Language Prompt
    const [prompt, setPrompt] = useState('');
    const [isParsing, setIsParsing] = useState(false);

    // State for the parsed form attributes
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        weight: '',
        sla: '',
        budget: ''
    });

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const runAIParsing = async () => {
        if (!prompt.trim()) return;
        setIsParsing(true);

        try {
            // Hit the FastAPI endpoint connected to OpenAI
            const response = await axios.post('http://localhost:8000/api/ai/parse-routing', {
                prompt: prompt
            });

            if (response.data && response.data.data) {
                const parsed = response.data.data;
                setFormData({
                    origin: parsed.origin || '',
                    destination: parsed.destination || '',
                    weight: parsed.weight || '',
                    sla: parsed.sla || '',
                    budget: parsed.budget || ''
                });
            }
        } catch (error) {
            console.error("Failed to parse prompt with AI:", error);
            alert("AI Error: Verify your backend is running and OPENAI_API_KEY is configured in backend/.env.");
        } finally {
            setIsParsing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center text-on-primary-container">
                        <span className="material-symbols-outlined font-bold">add_road</span>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Initialize AI Routing</h2>
                </div>
                <p className="text-[#a4c9ff] opacity-70 text-sm ml-13">Configure logistics parameters for the execution engine to calculate the optimal path.</p>
            </div>

            {/* AI Natural Language Processor */}
            <div className="bg-surface-container-highest/20 border border-secondary/20 rounded-2xl p-6 relative overflow-hidden shadow-lg mb-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50"></div>
                <div className="flex justify-between items-end gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="font-label text-xs font-bold text-secondary flex items-center gap-1 uppercase tracking-widest ml-1">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span> Natural Language Command
                        </label>
                        <textarea 
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-secondary focus:ring-1 focus:ring-secondary/50 text-on-surface py-3 px-4 rounded-xl transition-all outline-none resize-none"
                            placeholder='e.g. "Ship 500kg from Dubai to Rotterdam within 5 days under $4000"'
                            rows={2}
                            value={prompt}
                            onChange={handlePromptChange}
                        ></textarea>
                    </div>
                    <button 
                        type="button" 
                        onClick={runAIParsing}
                        disabled={isParsing || !prompt.trim()}
                        className={`h-[74px] px-6 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${isParsing ? 'bg-secondary/20 text-secondary' : 'bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 active:scale-95'}`}
                    >
                        <span className={`material-symbols-outlined ${isParsing ? 'animate-spin' : ''}`}>
                            {isParsing ? 'sync' : 'smart_toy'}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider">{isParsing ? 'Extracting...' : 'Autofill'}</span>
                    </button>
                </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6"></div>

            <div className="bg-surface-container-low border border-white/5 rounded-2xl p-8 relative overflow-hidden shadow-2xl glass-shimmer">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

                <form className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Origin Node */}
                        <div className="space-y-2 relative">
                            <label className="font-label text-xs font-bold text-primary uppercase tracking-widest ml-1">Origin Node</label>
                            <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
                                <span className="material-symbols-outlined text-outline">flight_takeoff</span>
                            </div>
                            <input type="text" name="origin" value={formData.origin} onChange={handleInputChange} placeholder="e.g. Dubai (DXB)" className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary text-on-surface py-3 px-4 rounded-xl transition-all outline-none" required />
                        </div>

                        {/* Destination Node */}
                        <div className="space-y-2 relative">
                            <label className="font-label text-xs font-bold text-secondary uppercase tracking-widest ml-1">Destination Node</label>
                            <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
                                <span className="material-symbols-outlined text-outline">flight_land</span>
                            </div>
                            <input type="text" name="destination" value={formData.destination} onChange={handleInputChange} placeholder="e.g. Rotterdam Terminal" className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-secondary text-on-surface py-3 px-4 rounded-xl transition-all outline-none" required />
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Cargo Weight */}
                        <div className="space-y-2 relative">
                            <label className="font-label text-xs font-bold text-primary-fixed-dim uppercase tracking-widest ml-1">Net Weight (kg)</label>
                            <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="42000" className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary text-on-surface py-3 px-4 rounded-xl transition-all outline-none" required />
                            <span className="absolute right-4 top-1/2 mt-3 -translate-y-1/2 text-outline text-xs">KG</span>
                        </div>

                        {/* SLA Deadline */}
                        <div className="space-y-2 relative">
                            <label className="font-label text-xs font-bold text-primary-fixed-dim uppercase tracking-widest ml-1">SLA Deadline (Days)</label>
                            <input type="number" name="sla" value={formData.sla} onChange={handleInputChange} placeholder="14" className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary text-on-surface py-3 px-4 rounded-xl transition-all outline-none" required />
                        </div>

                        {/* Budget Constraints */}
                        <div className="space-y-2 relative">
                            <label className="font-label text-xs font-bold text-primary-fixed-dim uppercase tracking-widest ml-1">Budget Envelope</label>
                            <input type="number" name="budget" value={formData.budget} onChange={handleInputChange} placeholder="15000" className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary text-on-surface py-3 pl-8 pr-4 rounded-xl transition-all outline-none" />
                            <span className="absolute left-4 top-1/2 mt-3 -translate-y-1/2 text-outline text-sm">$$</span>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button type="button" className="w-full md:w-auto relative group float-right">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-container to-secondary-container rounded-xl blur-md group-hover:blur-lg opacity-40 transition-all"></div>
                            <div className="relative bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-headline font-bold py-4 px-10 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-transform">
                                <span>Engage AI Optimizer</span>
                                <span className="material-symbols-outlined text-xl">model_training</span>
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewRoutingRequest;
