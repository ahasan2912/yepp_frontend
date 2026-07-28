import { MegaphoneOff, Search, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const DealsNotFound = () => {

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const location = useLocation();
    const navigate = useNavigate();
    const pageName = location?.pathname.split("/")[1];

    return (
        <div className={`${pageName === 'deal-details' ? 'min-h-[calc(100vh-320px)]' : 'min-h-[calc(100vh-200px)]'} flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 ${pageName === 'deal-details' ? 'pt-0' : 'pt-24'}`}>
            {/* Premium glassmorphism container */}
            <div className="max-w-md w-full text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none transition-all duration-300 p-10">

                {/* Animated Icon Circle */}
                <div className="relative mx-auto w-24 h-24 bg-linear-to-tr from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 rounded-full flex items-center justify-center mb-6 group">
                    <div className="absolute inset-0 bg-rose-500/10 rounded-full animate-ping opacity-75 scale-75" />
                    <MegaphoneOff className="w-10 h-10 text-rose-500 transform transition-transform group-hover:scale-110 duration-300" />
                </div>

                {/* Text Details */}
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight sm:text-3xl">
                    Ads Not Found
                </h2>

                <p className="mt-3 text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                    No location found or not a nationwide ads. Please add a location or make nationwide available
                </p>
                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-base cursor-pointer font-semibold text-white bg-primary hover:bg-green-400 rounded-md transition-all duration-200 shadow-md shadow-emerald-500/20 active:scale-[0.98]">
                        <ArrowLeft size={20} />
                        Back To
                    </button>
                </div>
            </div>
        </div>
    );
};
