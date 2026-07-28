import { useParams } from "react-router-dom";
import { useGetAllCategoriesQuery, useGetCategoryDetailsQuery } from "../../features/categories/CategoriesApi";
import { DealCardSkeleton } from "../../components/skeleton/DealCardSkeleton";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGsapAnimations } from "../../hooks/useGsapAnimations";
import DealCard from "../../components/shared/DealCard";
const DEALS_PER_BATCH = Number(import.meta.env.VITE_ROWS_PER_PAGE);

const CategorieDetails = () => {
    const { id } = useParams();
    const { latitude, longitude } = JSON.parse(localStorage.getItem("userLocation")) || {};
    const [visibleState, setVisibleState] = useState({
        count: DEALS_PER_BATCH,
        listKey: "",
    });

    const loadMoreRef = useRef(null);
    const { data: categoriess, isLoading: categoriesLoading } = useGetAllCategoriesQuery();

    const { data: categories, isLoading } = useGetCategoryDetailsQuery({
        id,
        longitude,
        latitude,
        limit: DEALS_PER_BATCH,
        page: 1,
    });
    const allDeals = useMemo(() => categories?.data?.deals ?? [], [categories?.data?.deals]);
    const listKey = `${id ?? ""}-${latitude ?? ""}-${longitude ?? ""}`;
    const visibleDealsCount = visibleState.listKey === listKey ? visibleState.count : DEALS_PER_BATCH;
    const visibleDeals = useMemo(
        () => allDeals.slice(0, visibleDealsCount),
        [allDeals, visibleDealsCount]
    );
    const hasMoreDeals = visibleDealsCount < allDeals.length;
    const animationScopeRef = useGsapAnimations(`category-deals-${id}-${visibleDeals.length}`);

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

    if (categoriesLoading || isLoading) {
        return <DealCardSkeleton />
    }

    const categoryName = categoriess?.data?.find((cat) => cat._id === id);
    const dealColumns = visibleDeals.reduce(
        (columns, deal, index) => {
            columns[index % 2].push({ deal, index });
            return columns;
        },
        [[], []]
    );

    return (
        <div ref={animationScopeRef} className="bg-gay-50 min-h-[65vh] pb-2 pt-5 sm:px-0">
            <div className="bg-gray-50" data-animate="fade-up">
                <div className="max-w-305 mx-auto px-2 sm:px-4 md:px-8 flex items-center justify-between pt-6 pb-3">
                    <h2 className="text-base md:text-2xl font-bold text-[#262626]">{categoryName?.category_name}</h2>
                    {/* <DynamicLocation
                        latitude={latitude}
                        longitude={longitude}
                        className="flex gap-2 items-center text-primary text-sm md:text-base font-semibold"
                        iconClassName="h-3 w-3 shrink-0"
                    /> */}
                </div>
            </div>
            <div className="max-w-305 mx-auto px-2 sm:px-4 md:px-8 py-3 md:py-3">
                {categories?.data?.deals?.length > 0 ? (
                    <>
                        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:gap-5 md:hidden">
                            {dealColumns.map((column, columnIndex) => (
                                <div
                                    key={columnIndex}
                                    className={`flex flex-col gap-3 sm:gap-5 ${columnIndex === 1 ? "max-[500px]:pt-5" : ""}`}
                                    data-animate="stagger"
                                >
                                    {column.map(({ deal, index }) => (
                                        <DealCard
                                            key={deal?.deal?._id || deal?._id || index}
                                            deal={deal}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="hidden gap-3 md:grid md:grid-cols-3 lg:grid-cols-4" data-animate="stagger">
                            {visibleDeals.map((deal) => (
                                <DealCard key={deal?.deal?._id || deal?._id}
                                    deal={deal} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 min-h-[10vh] flex items-center justify-center">
                        <p className="text-gray-600 text-lg font-semibold">Deal not Found</p>
                    </div>
                )}
                {hasMoreDeals && (
                    <div ref={loadMoreRef} className="min-h-12" aria-hidden="true" />
                )}
            </div>
        </div>
    );
};

export default CategorieDetails;
