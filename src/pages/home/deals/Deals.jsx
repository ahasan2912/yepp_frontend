import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGetAllDealQuery, useLazyGetAllDealQuery } from '../../../features/deal/dealApi';
import { DealCardSkeleton } from '../../../components/skeleton/DealCardSkeleton';
import { useGsapAnimations } from '../../../hooks/useGsapAnimations';
import DealCard from '../../../components/shared/DealCard';

const DEALS_PER_BATCH = Number(import.meta.env.VITE_ROWS_PER_PAGE) || 15;

const getDealsFromResponse = (response) => response?.data?.deals ?? [];

const getTotalDealsCount = (response) => {
    const total =
        response?.data?.meta?.total ??
        response?.data?.total ??
        response?.data?.totalDeals ??
        response?.meta?.total ??
        response?.total;
    return Number.isFinite(Number(total)) ? Number(total) : null;
};

const getDealId = (deal) => deal?._id ?? deal?.deal?._id;

const mergeUniqueDeals = (...dealLists) => {
    const seenIds = new Set();
    const merged = [];
    dealLists.flat().forEach((deal) => {
        const id = getDealId(deal);
        if (id && seenIds.has(id)) return;
        if (id) seenIds.add(id);
        merged.push(deal);
    });
    return merged;
};

const readStoredLocation = () => {
    try {
        return JSON.parse(localStorage.getItem('location') || '{}');
    } catch {
        return {};
    }
};

const Deals = () => {
    const { latitude, longitude } = JSON.parse(localStorage.getItem("userLocation")) || {};
    const [website_location, setWebsiteLocation] = useState(readStoredLocation);

    // Re-read location from localStorage when LoacationBadge sets the default
    useEffect(() => {
        const onLocationSet = () => setWebsiteLocation(readStoredLocation());
        window.addEventListener('app:locationset', onLocationSet);
        return () => window.removeEventListener('app:locationset', onLocationSet);
    }, []);

    // Build a stable query args object – same shape for both first-page and lazy pages
    const queryArgs = useMemo(() => ({
        latitude,
        longitude,
        limit: DEALS_PER_BATCH,
        page: 1,
        locationMode: website_location?.mode ?? 'SELECTED_LOCATION',
        city: website_location?.data?.city,
        state: website_location?.data?.state,
        country: website_location?.data?.country,
    }), [
        latitude,
        longitude,
        website_location?.mode,
        website_location?.data?.city,
        website_location?.data?.state,
        website_location?.data?.country,
    ]);

    const { data: firstPageData, isLoading } = useGetAllDealQuery(queryArgs);
    const [loadDealPage] = useLazyGetAllDealQuery();

    // listKey changes whenever the query identity changes — resets accumulated pages
    const listKey = [
        latitude ?? '',
        longitude ?? '',
        website_location?.mode ?? '',
        website_location?.data?.city ?? '',
        website_location?.data?.state ?? '',
        DEALS_PER_BATCH,
    ].join('|');

    const [accPages, setAccPages] = useState({ listKey: '', items: [], nextPage: 2, hasMore: true, loading: false });
    const accPagesRef = useRef(accPages);
    const loadMoreRef = useRef(null);
    const isFetchingRef = useRef(false);

    useEffect(() => {
        accPagesRef.current = accPages;
    }, [accPages]);

    const firstPageDeals = getDealsFromResponse(firstPageData);
    const totalCount = getTotalDealsCount(firstPageData);

    const activeAcc = accPages.listKey === listKey ? accPages : { listKey, items: [], nextPage: 2, hasMore: true, loading: false };

    const allDeals = useMemo(
        () => mergeUniqueDeals(firstPageDeals, activeAcc.items),
        [firstPageDeals, activeAcc.items]
    );

    const hasMoreDeals =
        totalCount !== null
            ? allDeals.length < totalCount
            : firstPageDeals.length >= DEALS_PER_BATCH && activeAcc.hasMore;

    const animationScopeRef = useGsapAnimations(`deals-${listKey}-${firstPageDeals.length}`);

    const loadNextPage = useCallback(() => {
        const state = accPagesRef.current;
        const currentAcc = state.listKey === listKey ? state : { listKey, items: [], nextPage: 2, hasMore: true, loading: false };

        if (isFetchingRef.current || currentAcc.loading || !currentAcc.hasMore) return;

        isFetchingRef.current = true;
        setAccPages((prev) => ({
            ...(prev.listKey === listKey ? prev : { listKey, items: [], nextPage: 2, hasMore: true }),
            loading: true,
        }));

        loadDealPage({
            ...queryArgs,
            page: currentAcc.nextPage,
        })
            .unwrap()
            .then((response) => {
                const newDeals = getDealsFromResponse(response);
                const responseTotal = getTotalDealsCount(response);

                setAccPages((prev) => {
                    const base = prev.listKey === listKey ? prev : { listKey, items: [], nextPage: 2, hasMore: true };
                    const merged = mergeUniqueDeals(base.items, newDeals);
                    const loadedCount = firstPageDeals.length + merged.length;
                    const hasMore =
                        responseTotal !== null
                            ? loadedCount < responseTotal
                            : newDeals.length >= DEALS_PER_BATCH;

                    return {
                        ...base,
                        items: merged,
                        nextPage: base.nextPage + 1,
                        hasMore,
                        loading: false,
                    };
                });
            })
            .catch(() => {
                setAccPages((prev) => ({
                    ...(prev.listKey === listKey ? prev : { listKey, items: [], nextPage: 2, hasMore: true }),
                    loading: false,
                }));
            })
            .finally(() => {
                isFetchingRef.current = false;
            });
    }, [firstPageDeals.length, listKey, loadDealPage, queryArgs]);

    // IntersectionObserver — watches the sentinel div at the bottom
    useEffect(() => {
        const sentinel = loadMoreRef.current;
        if (!sentinel || !hasMoreDeals) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) loadNextPage();
            },
            { rootMargin: '300px 0px' }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMoreDeals, loadNextPage]);

    if (isLoading) {
        return <DealCardSkeleton />;
    }

    const dealColumns = allDeals.reduce(
        (cols, deal, i) => {
            cols[i % 2].push({ deal, index: i });
            return cols;
        },
        [[], []]
    );

    return (
        <div ref={animationScopeRef} className="bg-gray-50 min-h-[10vh] px-4 py-12.5" data-animate="fade-up">
            <div className="max-w-305 mx-auto">
                <div className="flex items-start justify-between gap-2 mb-6" data-animate="fade-up">
                    <h2 className="text-base font-bold leading-tight text-[#262626] sm:text-2xl md:text-[28px]">
                        {website_location?.mode === 'SELECTED_LOCATION' ? 'Explore Ads' : 'Explore nearby'}
                    </h2>
                </div>

                {allDeals.length > 0 ? (
                    <>
                        {/* 2-column masonry — mobile */}
                        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:gap-5 md:hidden" data-animate="stagger">
                            {dealColumns.map((column, colIdx) => (
                                <div
                                    key={colIdx}
                                    className={`flex flex-col gap-3 sm:gap-5 ${colIdx === 1 ? 'max-[500px]:pt-5' : ''}`}
                                >
                                    {column.map(({ deal, index }) => (
                                        <DealCard key={getDealId(deal) || index} deal={deal} />
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Grid — tablet/desktop */}
                        <div className="hidden gap-3 md:grid md:grid-cols-3 lg:grid-cols-4" data-animate="stagger">
                            {allDeals.map((deal, i) => (
                                <DealCard key={getDealId(deal) || i} deal={deal} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 min-h-[10vh] flex items-center justify-center">
                        <p className="text-gray-600 text-lg font-semibold">Deal not Found</p>
                    </div>
                )}

                {/* Loading spinner for next pages */}
                {activeAcc.loading && (
                    <div className="flex justify-center py-6">
                        <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                )}

                {/* Sentinel — must always be rendered when there could be more */}
                {hasMoreDeals && (
                    <div ref={loadMoreRef} className="h-1" aria-hidden="true" />
                )}
            </div>
        </div>
    );
};

export default Deals;
