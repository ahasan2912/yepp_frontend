import { MoreHorizontal, Store, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminBanUserMutation, useAdminUnBanUserMutation } from '../../../../../features/ban/banApi';
import BanModal from './BanModal';

const Table = ({ dealsData }) => {
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [banDealId, setBanDealId] = useState(null);
    const [banReason, setBanReason] = useState("");
    const dropdownRef = useRef(null);
    const [adminBanUser, { isLoading: isBanUpdating }] = useAdminBanUserMutation();
    const [adminUnBanUser, { isLoading: isUnBanUpdating }] = useAdminUnBanUserMutation();
    const isStatusUpdating = isBanUpdating || isUnBanUpdating;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const openBanModal = (dealId) => {
        setOpenDropdownId(null);
        setBanDealId(dealId);
        setBanReason("");
    };

    const closeBanModal = () => {
        setBanDealId(null);
        setBanReason("");
    };

    const handleBanDeal = async () => {
        const trimmedReason = banReason.trim();

        if (!trimmedReason) {
            return;
        }

        await adminBanUser({
            dealId: banDealId,
            data: { reason: trimmedReason },
        }).unwrap();
        closeBanModal();
    };

    const handleEnableDeal = async (dealId) => {
        setOpenDropdownId(null);
        await adminUnBanUser(dealId).unwrap();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };
    const statusStyles = {
        Active: "bg-[#DCFCE7] text-[#22C55E]",
        New: "bg-[#FEF9C3] text-[#CA8A04]",
        Banned: "bg-[#FEE2E2] text-[#DC2626]",
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-y border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4 text-base font-semibold text-primary">Vendor</th>
                        <th className="px-6 py-4 text-base font-semibold text-primary">Ads</th>
                        <th className="px-6 py-4 text-base font-semibold text-primary">Impression</th>
                        <th className="px-6 py-4 text-base font-semibold text-primary">View</th>
                        <th className="px-6 py-4 text-base font-semibold text-primary">Status</th>
                        <th className="px-6 py-4 text-base font-semibold text-primary">Created Date</th>
                        <th className="px-6 py-4 text-base font-semibold text-primary">Expired Date</th>
                        <th className="px-6 py-4 text-base font-semibold text-primary text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {dealsData?.length > 0 ? (
                        dealsData.map((item) => (
                            <tr key={item?._id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-md bg-cyan-50 flex items-center justify-center border border-cyan-100 text-primary">
                                            <Store size={22} className="text-primary" />
                                        </div>
                                        <Link to={`/vendor-details/${item?.shop_id}`}>
                                            <div className="font-bold text-[#525252] text-base">
                                                {item?.business_name}
                                            </div>
                                            <div className="text-sm font-medium text-[#737373]">
                                                {item?.category_name}
                                            </div>
                                        </Link>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <Link to={`/deal-details/${item?._id}`} className="underline transition-colors hover:text-primary">
                                        {item?.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {item?.impressions}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {item?.views}
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-sm font-semibold ${statusStyles[item?.status] || "bg-[#FFF7ED] text-[#EA580C]"
                                            }`}
                                    >
                                        {item?.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {formatDate(item?.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                    {formatDate(item?.expiry)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="relative inline-block" ref={openDropdownId === item?._id ? dropdownRef : null}>
                                        <button
                                            onClick={() =>
                                                setOpenDropdownId(openDropdownId === item?._id ? null : item?._id)
                                            }
                                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>

                                        {openDropdownId === item?._id && (
                                            <div className="absolute right-0 -top-22 mt-2 w-40 pb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                                <button
                                                    onClick={() => openBanModal(item?._id)}
                                                    disabled={isStatusUpdating}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    Banned
                                                </button>
                                                <button
                                                    onClick={() => handleEnableDeal(item?._id)}
                                                    disabled={isStatusUpdating}
                                                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 font-medium disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    Enabled
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                                No ads found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {banDealId && <BanModal
                closeBanModal={() => setBanDealId(null)}
                banReason={banReason}
                setBanReason={setBanReason}
                handleBanDeal={handleBanDeal}
                isBanUpdating={isBanUpdating}
            />}
        </div>
    );
};

export default Table;
