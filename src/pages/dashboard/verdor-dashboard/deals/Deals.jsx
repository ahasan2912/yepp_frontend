import { Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import DealCard from "./components/DealCard";
import { useGetMyDealsQuery } from "../../../../features/deal/dealApi";
import { DealCardSkeleton } from "../../../../components/skeleton/DealCardSkeleton";
import Pagination from "../../../vendor/created-shop/components/Pagination";

const LIMIT = 10;

const Deals = () => {
    const [activeTab, setActiveTab] = useState("promoted");
    const [pageByTab, setPageByTab] = useState({
        promoted: 1,
        expired: 1,
        new: 1,
    });

    const currentPage = pageByTab[activeTab] ?? 1;

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // page for each tab is preserved independently
    };

    const handlePageChange = (page) => {
        setPageByTab((prev) => ({ ...prev, [activeTab]: page }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const { data: myDeals, isLoading, isFetching } = useGetMyDealsQuery({
        openTab: activeTab,
        limit: LIMIT,
        page: currentPage,
    });

    const deals = myDeals?.data?.deals ?? [];
    // Try multiple common response shapes for total count
    const totalItems = myDeals?.data?.meta?.total
        ?? myDeals?.data?.total
        ?? myDeals?.data?.totalCount
        ?? myDeals?.total
        ?? deals.length
        ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / LIMIT));

    // "Showing X of Y" — last index on current page
    const indexOfLast = Math.min(currentPage * LIMIT, totalItems);

    // TODO: remove after confirming correct path — check console for API shape
    if (myDeals);

    return (
        <div className="bg-white min-h-screen px-4 pt-20 pb-12">
            <div className="max-w-305 mx-auto">

                {/* Tab bar + Create button */}
                <div className="flex items-center justify-between mt-8 md:mt-12.5 border-b border-gray-200">
                    <div className="flex w-full items-center gap-1 sm:gap-3 pb-3 overflow-x-auto no-scrollbar">
                        {[
                            { key: "promoted", label: "Current Ads" },
                            { key: "expired", label: "Expired Ads" },
                            { key: "new", label: "Saved Ads" },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => handleTabChange(key)}
                                className={`shrink-0 whitespace-nowrap rounded-full text-sm sm:text-base px-3 sm:px-6 py-2 font-medium cursor-pointer transition-colors ${activeTab === key
                                        ? "bg-primary text-white"
                                        : "bg-white text-[#A3A3A3]"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <Link
                        to="/create-deal"
                        className="hidden bg-primary hover:bg-secondary py-2.5 rounded-full sm:flex items-center justify-center gap-1 text-white text-sm font-bold max-w-40 w-full cursor-pointer mb-3 transition-colors"
                    >
                        <Plus />
                        <span>Create Ad</span>
                    </Link>
                </div>

                {/* Deal list */}
                <div className="mt-4">
                    {isLoading || isFetching ? (
                        <DealCardSkeleton />
                    ) : (
                        <div className="space-y-4">
                            {deals.length > 0 ? (
                                deals.map((deal) => (
                                    <DealCard key={deal?._id} deal={deal} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10 min-h-[10vh] flex items-center justify-center">
                                    <p className="text-gray-600 text-lg font-semibold">
                                        Ads Not Found
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination — show whenever there are deals */}
                    {deals.length > 0 && (
                        <Pagination
                            totalPages={totalPages}
                            totalItems={totalItems}
                            rowsPerPage={LIMIT}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                            indexOfLast={indexOfLast}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Deals;
