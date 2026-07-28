import { X } from 'lucide-react';
import React from 'react';

const BanModal = ({closeBanModal, banReason, setBanReason, handleBanDeal, isBanUpdating}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-[#262626]">Ban Ad</h2>
                        <p className="mt-1 text-sm text-[#737373]">
                            Add a reason so the vendor can understand why this ad was banned.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={closeBanModal}
                        className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Close ban modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <label className="mb-2 block text-sm font-semibold text-[#262626]">
                    Ban Reason<span className="text-red-500">*</span>
                </label>
                <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    rows={4}
                    placeholder="Write ban reason"
                    className="w-full resize-none rounded-lg border border-slate-300 bg-white p-4 text-sm text-[#262626] outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={closeBanModal}
                        className="rounded-md border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleBanDeal}
                        disabled={isBanUpdating}
                        className="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isBanUpdating ? "Banning..." : "Banned"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BanModal;