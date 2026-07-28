import { useEffect, useMemo, useRef, useState } from "react";
import { DealCardSkeleton } from "../../../components/skeleton/DealCardSkeleton";
import { useGetShopDetailsQuery } from "../../../features/shop/shopApi";
import { images } from "../../../assets/image";
import { useParams } from "react-router-dom";
import OutletLocation from "./address/OutletLocation";
import DealCard from "../../../components/shared/DealCard";
const DEALS_PER_BATCH = Number(import.meta.env.VITE_ROWS_PER_PAGE) || 8;

const VendorDeails = () => {
    const [activeTab, setActiveTab] = useState('active-deals');
    const { id } = useParams();
    const { data: shopDetails, isLoading } = useGetShopDetailsQuery(id);
    const [visibleState, setVisibleState] = useState({
        count: DEALS_PER_BATCH,
        listKey: "",
    });
    const loadMoreRef = useRef(null);
    const allDeals = useMemo(() => shopDetails?.data?.deals ?? [], [shopDetails?.data?.deals]);
    const listKey = `${id ?? ""}-${activeTab}`;
    const visibleDealsCount = visibleState.listKey === listKey ? visibleState.count : DEALS_PER_BATCH;
    const visibleDeals = useMemo(
        () => allDeals.slice(0, visibleDealsCount),
        [allDeals, visibleDealsCount]
    );
    const hasMoreDeals = activeTab === 'active-deals' && visibleDealsCount < allDeals.length;

    useEffect(() => {
        if (!hasMoreDeals || !loadMoreRef.current) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;

                setVisibleState((currentState) => {
                    const currentCount = currentState.listKey === listKey
                        ? currentState.count
                        : DEALS_PER_BATCH;

                    return {
                        count: Math.min(currentCount + DEALS_PER_BATCH, allDeals.length),
                        listKey,
                    };
                });
            },
            { rootMargin: "240px 0px" }
        );

        observer.observe(loadMoreRef.current);

        return () => observer.disconnect();
    }, [allDeals.length, hasMoreDeals, listKey]);

    if (isLoading) {
        return <DealCardSkeleton />
    }

    const businessName = shopDetails?.data?.business_name;
    const dealColumns = visibleDeals.reduce(
        (columns, deal, index) => {
            columns[index % 2].push({ deal, index });
            return columns;
        },
        [[], []]
    );

    return (
        <div className="bg-white px-4 pt-8">
            <div className="max-w-305 mx-auto">
                <div className="flex flex-col">
                    <div className="flex flex-col items-center sm:items-start md:flex-row gap-3">
                        <div className="w-40 h-40 rounded-full p-1.5 border-2 border-(--primary-color) overflow-hidden">
                            <img
                                src={shopDetails?.data?.business_logo || images?.profilePic}
                                alt="vendor-image"
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                        <div className="max-w-230 w-full bg-white mt-2">
                            <h1 className="text-[26px] pb-2 sm:text-[28px] md:text-3xl font-bold text-gray-600 mb-1">
                                {businessName}
                            </h1>
                            <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-4 md:mb-8">
                                {shopDetails?.data?.description}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 py-4 sm:py-10">
                        <button onClick={() => setActiveTab('active-deals')} className={`w-full sm:w-auto px-10 cursor-pointer py-2 ${activeTab === 'active-deals' ? 'bg-primary hover:bg-secondary text-white' : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-400'} text-xl font-medium rounded-full transition-colors duration-200`}>
                            Active Ad
                        </button>
                        <button onClick={() => setActiveTab('address')} className={`w-full sm:w-auto px-10 cursor-pointer py-2 ${activeTab === 'address' ? 'bg-primary hover:bg-secondary text-white' : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-400'} text-xl font-medium rounded-full transition-colors duration-200`}>
                            Locations
                        </button>
                    </div>
                    {
                        activeTab === 'active-deals' && (
                            <>
                                {allDeals.length > 0 ? (
                                    <>
                                        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:gap-5 md:hidden">
                                            {dealColumns.map((column, columnIndex) => (
                                                <div
                                                    key={columnIndex}
                                                    className={`flex flex-col gap-3 sm:gap-5 ${columnIndex === 1 ? "max-[500px]:pt-5" : ""}`}
                                                >
                                                    {column.map(({ deal, index }) => (
                                                        <DealCard
                                                            key={deal?._id || deal?.deal?._id || index}
                                                            deal={deal}
                                                            shopName={businessName}
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="hidden gap-3 md:grid md:grid-cols-3 lg:grid-cols-4 mb-16">
                                            {visibleDeals.map((deal) => (
                                                <DealCard
                                                    key={deal?._id || deal?.deal?._id}
                                                    deal={deal}
                                                    shopName={businessName}
                                                />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-10 min-h-[10vh] flex items-center justify-center">
                                        <p className="text-gray-600 text-lg font-semibold">Deal not Found</p>
                                    </div>
                                )}
                            </>
                        )
                    }
                    {
                        activeTab === 'address' && <OutletLocation outlets={shopDetails?.data?.locations} />
                    }
                </div>
                {hasMoreDeals && (
                    <div ref={loadMoreRef} className="min-h-12" aria-hidden="true" />
                )}
            </div>
        </div>
    );
};

export default VendorDeails;
