import { DealCardSkeleton } from "../../../components/skeleton/DealCardSkeleton";
import { useGetDealAllDealsQuery } from "../../../features/deal/dealApi";
import DynamicLocation from "../../../components/location/DynamicLocation";
import { useGsapAnimations } from "../../../hooks/useGsapAnimations";
import DealCard from "../../../components/shared/DealCard";
const SearchDeals = ({ searchText }) => {
    const { data: allDeals, isLoading } = useGetDealAllDealsQuery({ searchText });
    const queryText = searchText?.trim() || "";
    const searchValue = [queryText].filter(Boolean).join(" / ");
    const headingText = searchValue ? `Search result of '${searchValue}'` : "Search result";
    const animationScopeRef = useGsapAnimations(`search-deals-${searchValue}-${allDeals?.data?.deals?.length ?? 0}`);

    if (isLoading) {
        return <DealCardSkeleton />
    }
    if (allDeals?.length === 0) {
        return <DealCardSkeleton />
    }

    return (
        <div ref={animationScopeRef} className="bg-gray-50 min-h-[10vh] px-4 py-12.5" data-animate="fade-up">
            <div className="max-w-305 mx-auto">
                <div className="flex items-start justify-between gap-4 mb-6" data-animate="fade-up">
                    <h2 className="max-w-[60%] wrap-break-word text-base font-bold leading-tight text-[#262626] sm:max-w-none sm:text-2xl md:text-[28px]">
                        {headingText}
                    </h2>
                </div>

                <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4" data-animate="stagger">
                    {allDeals?.data?.deals.map((deal) => (
                        <DealCard key={deal?.deal?._id} deal={deal} />
                    ))}
                    {
                        allDeals?.data?.deals?.length === 0 &&
                        <div className="col-span-full text-center py-10 min-h-[10vh] flex items-center justify-center">
                            <p className="text-gray-600 text-lg font-semibold">Deal not Found</p>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default SearchDeals;
