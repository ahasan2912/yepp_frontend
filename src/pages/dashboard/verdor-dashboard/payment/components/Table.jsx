import { BadgeRussianRuble, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Table = ({ paymentData }) => {
    const showInvoice = (url) => {
        window.open(url);
    };

    const renderStatusBadge = (status) => {
        const normalizedStatus = status?.toUpperCase();
        const baseClass = "px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold";

        if (normalizedStatus === "PAID") {
            return `${baseClass} bg-[#DCFCE7] text-[#22C55E]`;
        }
        if (normalizedStatus === "PENDING") {
            return `${baseClass} bg-[#FEF9C3] text-[#CA8A04]`;
        }
        if (normalizedStatus === "CANCELED") {
            return `${baseClass} bg-[#FEE2E2] text-[#DC2626]`;
        }
        if (normalizedStatus === "FAILED") {
            return `${baseClass} bg-[#FECACA] text-[#B91C1C]`;
        }
        return `${baseClass} bg-gray-100 text-gray-500`;
    };

    return (
        <div className="overflow-x-auto">
            <table className="hidden sm:table w-full text-left border-collapse">
                <thead>
                    <tr className="border-y border-gray-100 bg-gray-50/50">
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-base font-semibold text-primary">Transaction ID</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-base font-semibold text-primary">Ads</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-base font-semibold text-primary">Plan</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-base font-semibold text-primary">Status</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-base font-semibold text-primary">Amount</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-base font-semibold text-primary">Date</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-base font-semibold text-primary">Invoice</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                    {paymentData?.length > 0 ? (
                        paymentData.map((item) => (
                            <tr key={item?._id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-md bg-cyan-50 flex items-center justify-center border border-cyan-100 text-primary">
                                            <BadgeRussianRuble size={18} className="text-primary" />
                                        </div>
                                        <div className="font-semibold text-[#525252] text-sm">
                                            {item?.transaction_id}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-base text-gray-600">
                                    {item?.deal?.title}
                                </td>

                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-base text-gray-600">
                                    {item?.plan?.title}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                    <span className={renderStatusBadge(item?.payment_status)}>
                                        {item?.payment_status
                                            ? item?.payment_status.charAt(0).toUpperCase() +
                                            item?.payment_status.slice(1).toLowerCase()
                                            : ""}
                                    </span>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-base font-bold text-[#525252]">
                                    ${item?.amount?.toFixed(2)}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-base font-semibold text-[#525252]">
                                    {new Date(item?.createdAt).toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: '2-digit',
                                    })}
                                </td>
                                <td onClick={() => showInvoice(item?.invoice_url)} className="px-4 lg:px-6 py-3 lg:py-4 text-sm cursor-pointer font-semibold text-[#525252] hover:text-[#4CAF50]">
                                    <Eye size={18} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                No payment found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="sm:hidden divide-y divide-gray-100">
                {paymentData?.length > 0 ? (
                    paymentData.map((item) => (
                        <div key={item?._id} className="px-3 py-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 rounded-md bg-cyan-50 flex items-center justify-center border border-cyan-100 text-primary shrink-0">
                                        <BadgeRussianRuble size={16} className="text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-semibold text-gray-500">Transaction ID</div>
                                        <div className="text-sm font-semibold text-[#525252] truncate">
                                            {item?.transaction_id}
                                        </div>
                                    </div>
                                </div>
                                <span className={renderStatusBadge(item?.payment_status)}>
                                    {item?.payment_status
                                        ? item?.payment_status.charAt(0).toUpperCase() +
                                        item?.payment_status.slice(1).toLowerCase()
                                        : ""}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                <div>
                                    <div className="text-[11px] font-semibold text-gray-500">Ads</div>
                                    <div className="truncate">{item?.deal?.title}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold text-gray-500">Plan</div>
                                    <div className="truncate">{item?.plan?.title}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold text-gray-500">Amount</div>
                                    <div className="font-bold text-[#525252]">${item?.amount?.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold text-gray-500">Date</div>
                                    <div>{new Date(item?.createdAt).toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: '2-digit',
                                    })}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                <div className="text-xs text-gray-500">Invoice</div>
                                <button
                                    onClick={() => showInvoice(item?.invoice_url)}
                                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-semibold text-[#525252] hover:text-[#4CAF50]"
                                >
                                    <Eye size={16} />
                                    View
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="px-4 py-10 text-center text-gray-500 text-sm">
                        No payment found
                    </div>
                )}
            </div>
        </div>
    );
};

export default Table;
