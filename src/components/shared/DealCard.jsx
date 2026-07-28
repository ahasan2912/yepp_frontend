import { Eye, Flag, Heart, MapPin, Store, Tag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getDealPricing } from "../../utils/dealPricing";
import Countdown from "../shared/Countdown";

const DealCard = ({ deal, shopName, handleDeleteWistListId, totalViews }) => {
    const location = useLocation();
    const readStoredLocation = () => {
        try {
            return JSON.parse(localStorage.getItem('location') || '{}');
        } catch {
            return {};
        }
    };
    const website_location = readStoredLocation();
    const {
        _id,
        title,
        regular_price,
        discount,
        discount_type,
        minimum_purchase,
        distance,
        promotedUntil,
        shop,
        images
    } = deal?.deal || deal || {};

    const {
        regularPrice: price,
        finalPrice,
        hasDiscount,
        label
    } = getDealPricing(regular_price, discount_type, discount, minimum_purchase);

    // Distance calculation
    const dealDistance = Number(deal?.distance) || Number(distance) || 0; // distance in meters
    const distanceMiles = dealDistance / 1609.344; // Convert meters to miles

    const nationwide = deal.nationwide || deal?.deal?.nationwide || false;

    // Dynamic route handling
    const routeName = location.pathname.split("/")[1];
    const isShowNearestDistance = [
        'vendor-details',
        'shop-overview',
        'all-top-views'
    ].includes(routeName);

    const isShowWistDeal = routeName === 'saved_deals';
    const isShowView = [
        'shop-overview',
        'all-top-views'
    ].includes(routeName);
    const isAnalyticsRoute = routeName === 'shop-overview' || routeName === 'all-top-views';

    const handleCardKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
        }
    };

    const handleWishListId = (event, id) => {
        event.preventDefault();
        event.stopPropagation();
        handleDeleteWistListId?.(id);
    };

    const handleImageError = (event) => {
        if (!event.currentTarget.src.endsWith("/no-image.png")) {
            event.currentTarget.src = "/no-image.png";
        }
    };

    return (
        <Link onKeyDown={handleCardKeyDown} to={isAnalyticsRoute ? `/deal-analytics/${_id}` : `/deal-details/${_id}`} className="group flex h-fit flex-col overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--primary-color)_14%,white)] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--primary-color)_32%,white)] hover:shadow-lg">
            <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                <img
                    src={images?.[0] || "/no-image.png"}
                    alt={title}
                    onError={handleImageError}
                    className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
                {
                    isShowView ? <div>
                        <div className="absolute top-3 left-3 bg-white shadow-lg text-primary text-sm font-bold px-1.5 py-1 rounded">
                            <div className="flex items-center gap-1">
                                <Eye size={20} />
                                <span>{String(totalViews || 0).padStart(2, "0")}</span>
                            </div>
                        </div>
                    </div> : <div>
                        {hasDiscount && (discount_type === 'PERCENT_OFF_PRICE' || discount_type === 'PERCENT_OFF_TOTAL') && (
                            <div className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs sm:text-sm font-bold text-white shadow-sm">
                                <Tag size={12} aria-hidden="true" />
                                {label}
                            </div>
                        )}
                    </div>
                }
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[#262626] line-clamp-2 leading-tight">
                        {title}
                    </h3>
                    {
                        isShowWistDeal && <button
                            type="button"
                            aria-label="Remove from saved deals"
                            className="text-right cursor-pointer border-0 bg-transparent p-0"
                            onClick={(event) => handleWishListId(event, _id)}
                            onKeyDown={(event) => event.stopPropagation()}
                        >
                            <Heart className="fill-primary text-primary" size={20} />
                        </button>
                    }
                </div>
                {
                    !isShowView && <div className="mt-2 flex min-w-0 items-center gap-1.5 text-sm font-medium text-[#737373]">
                        <Store size={17} className="shrink-0 text-primary" aria-hidden="true" />
                        <span className="min-w-0 truncate">{deal?.shop?.business_name || shop?.business_name || shopName}</span>
                    </div>
                }

                <div className="mt-4 flex min-w-0 flex-col items-start justify-between gap-3">
                    <div className="flex min-w-0 items-baseline gap-x-1 gap-y-0.5">
                        {
                            discount_type === 'NO_PRICE' || discount_type === 'CUSTOM_DISCOUNT' || discount_type === 'PERCENT_OFF_TOTAL' ? (
                                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                                    {discount_type === 'NO_PRICE' && ''}
                                    {discount_type === 'CUSTOM_DISCOUNT' && ''}
                                    {discount_type === 'PERCENT_OFF_TOTAL' && ``}
                                    {discount_type === 'FIXED_PRICE' && ``}
                                </span>
                            ) : (
                                <>
                                    <span className="text-xl sm:text-2xl font-bold leading-none text-[#262626]">
                                        ${finalPrice.toFixed(2)}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-sm text-[#A3A3A3] font-medium line-through">
                                            ${price.toFixed(2)}
                                        </span>
                                    )}
                                </>
                            )
                        }
                    </div>
                    {
                        !isShowNearestDistance &&
                        (nationwide || website_location?.mode !== "SELECTED_LOCATION") && (
                            <div className="inline-flex max-w-[calc(100%-1.5rem)] items-center gap-0.5 text-[13px] font-bold text-primary">
                                {nationwide ? (
                                    <div className="flex items-center gap-1">
                                        <Flag size={18} className="shrink-0" />
                                        <span>Nationwide</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <MapPin size={14} className="shrink-0" />
                                        {distanceMiles.toFixed(2)} Miles away
                                    </div>
                                )}
                            </div>
                        )
                    }
                    <Countdown countdown={promotedUntil} />
                </div>

                <span className="mt-4 block w-full rounded-full bg-primary py-2.5 text-center text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(76,175,80,0.9)] transition-colors hover:bg-secondary">
                    Redeem Now
                </span>
            </div>
        </Link >
    );
};

export default DealCard;
