import { Link, useParams } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight, Store, ArrowRight, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import Redeem from './components/Redeem';
import ShowCuponModal from '../../components/modal/ShowCuponModal';
import { useGetDealDetailsQuery } from '../../features/deal/dealApi';
import DealDetailsSkeleton from '../../components/skeleton/DealDetailsSkeleton';
import CopiedLink from './components/CopiedLink';
import OutLetshowMap from './OutLetshowMap';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { getDealPricing } from '../../utils/dealPricing';
import Countdown from '../../components/shared/Countdown';
import { DealsNotFound } from './DealsNotFound';

const DealDetails = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectId, setSelectId] = useState();
    const { id } = useParams();
    const { latitude, longitude } = JSON.parse(localStorage.getItem("userLocation")) || {};
    const { data: deal, isLoading, isError } = useGetDealDetailsQuery({ id, longitude, latitude }, {
        skip: !id
    });
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const animationScopeRef = useGsapAnimations(`deal-details-${id}-${deal?.data?._id ?? ""}`);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [id]);

    useEffect(() => {
        const func = () => {
            const savedIds = JSON.parse(localStorage.getItem("saveForLater")) || [];
            const selectId = savedIds.find(saveId => saveId === id);
            setSelectId(selectId);
        }
        func();
    }, [id])

    if (isLoading) {
        return <DealDetailsSkeleton />
    }

    if (isError) {
        return <DealsNotFound />
    }

    const { _id, title, images, category, description, regular_price
        , discount_type, discount, minimum_purchase, promotedUntil, shop, available_location, nationwide, custom_discount } = deal?.data || {};

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleSaveForLater = (id) => {
        const savedIds = JSON.parse(localStorage.getItem("saveForLater")) || [];
        if (!savedIds.includes(id)) {
            savedIds.push(id);
            localStorage.setItem("saveForLater", JSON.stringify(savedIds));
            setSelectId(id);
            window.dispatchEvent(new Event("savedDealsUpdated"));
        } else {
            setSelectId(id);
        }
    };

    const { regularPrice: price, finalPrice, hasDiscount, label } = getDealPricing(regular_price, discount_type, discount, minimum_purchase);
    // const outletDistanceMiles = (Number(available_location?.[0]?.distance) || 0) / 1609.344;

    return (
        <div ref={animationScopeRef} className="bg-white px-4 pt-10 pb-8 sm:px-6" data-animate="fade-up">
            <div className="max-w-305 mx-auto">
                <div className="flex flex-col gap-6 md:flex-row lg:gap-8">
                    {/* left side */}
                    <div className="w-full space-y-6 md:w-6/12 sm:space-y-6" data-animate="stagger">
                        <div className="relative group rounded-lg overflow-hidden bg-gray-100">
                            <img
                                src={images[currentImageIndex]}
                                alt="Profile"
                                className="h-60 w-full object-contain object-center transition-all duration-500 sm:h-72 md:h-80 lg:h-92.5" />
                            <button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition-all">
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition-all">
                                <ChevronRight size={24} />
                            </button>
                            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-md text-base">
                                {currentImageIndex + 1}/{images?.length}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-xl font-semibold leading-tight text-[#262626] sm:text-2xl">
                                {title}
                            </h1>

                            <div className="flex items-center gap-1">
                                <p className="text-sm font-semibold text-[#525252] transition-transform duration-300 group-hover:translate-x-1 sm:text-sm">
                                    {category?.category_name || "Category"}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 justify-between">
                                <div className="flex items-center gap-1">
                                    <Store className='h-4 w-4 shrink-0 text-[#525252] sm:h-4.5 sm:w-4.5' />
                                    <Link to={`/vendor-details/${shop?._id}`} className="flex items-center underline gap-1 group cursor-pointer">
                                        <span className="text-sm font-semibold text-[#525252] transition-transform duration-300 group-hover:translate-x-1 sm:text-lg">
                                            {shop?.business_name}
                                        </span>
                                        <ArrowRight className="mt-0.5 h-4 w-4 text-[#525252] transition-transform duration-300 group-hover:translate-x-2 sm:mt-1 sm:h-5 sm:w-5" />
                                    </Link>
                                </div>
                                <div className="shrink-0">
                                    <CopiedLink _id={_id} />
                                </div>
                            </div>

                            {/* <div className="flex items-start justify-end">
                                {
                                    !nationwide && <div className=" ">
                                        <p className="text-base text-primary font-semibold text-[#525252] sm:text-md">
                                            Most nearest loaction
                                        </p>
                                        <div className="flex items-start justify-between" >
                                            <div>
                                                <span className="flex items-center gap-1 text-sm text-[#262626] sm:text-md">
                                                    <MapPin size={12} />
                                                    {available_location[0]?.address?.street}
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <span className="text-sm sm:text-md">•</span>
                                                <span className="text-sm sm:text-md"> {outletDistanceMiles.toFixed(2)} miles away</span>
                                            </div>
                                        </div>
                                    </div>
                                }
                                <div className="shrink-0">
                                    <CopiedLink _id={_id} />
                                </div>
                            </div> */}

                            {/* <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                {
                                    (
                                        discount_type !== 'NO_PRICE' &&
                                        discount_type !== 'FIXED_PRICE' && 
                                        discount_type !== 'CUSTOM_DISCOUNT') && 
                                            <div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4'>
                                                {discount_type === 'PERCENT_OFF_TOTAL' ? (
                                                    <span className="inline-block rounded-full bg-primary/10 py-1.5 text-base font-bold text-primary sm:text-2xl">
                                                        {discount_type === 'PERCENT_OFF_TOTAL' && `${discount}% off`}
                                                    </span>
                                                ) : (
                                                    <>
                                                        <span className="text-3xl font-bold text-[#262626] sm:text-3xl">
                                                            ${finalPrice.toFixed(2)}
                                                        </span>
                                                        {hasDiscount && (
                                                            <span className="text-base text-[#A3A3A3] line-through sm:text-xl">
                                                                ${price.toFixed(2)}
                                                            </span>
                                                        )}
                                                        {hasDiscount && (
                                                            <span className="rounded-md bg-primary px-2 py-1 text-sm font-bold text-white sm:text-base">{label}</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                }

                                <div className='mt-0 sm:mt-3'>
                                    <Countdown countdown={promotedUntil} />
                                </div>
                            </div> */}

                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                {discount_type !== "NO_PRICE" &&
                                    discount_type !== "CUSTOM_DISCOUNT" && (
                                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4">
                                        {discount_type === "PERCENT_OFF_TOTAL" ? (
                                        <span className="inline-block rounded-full bg-primary/10 py-1.5 text-base font-bold text-primary sm:text-2xl">
                                            {discount}% off
                                        </span>
                                        ) : discount_type === "FIXED_PRICE" ? (
                                        <>
                                            <span className="text-3xl font-bold text-[#262626] sm:text-3xl">
                                            ${finalPrice.toFixed(2)}
                                            </span>

                                            <span className="rounded-md bg-primary px-2 py-1 text-sm font-bold text-white sm:text-base">
                                            Fixed Price
                                            </span>
                                        </>
                                        ) : (
                                        <>
                                            <span className="text-3xl font-bold text-[#262626] sm:text-3xl">
                                            ${finalPrice.toFixed(2)}
                                            </span>

                                            {hasDiscount && (
                                            <>
                                                <span className="text-base text-[#A3A3A3] line-through sm:text-xl">
                                                ${price.toFixed(2)}
                                                </span>

                                                <span className="rounded-md bg-primary px-2 py-1 text-sm font-bold text-white sm:text-base">
                                                {label}
                                                </span>
                                            </>
                                            )}
                                        </>
                                        )}
                                    </div>
                                    )}

                                    <div className='mt-0 sm:mt-3'>
                                        <Countdown countdown={promotedUntil} />
                                    </div>
                                </div>

                            <div>
                                {
                                    discount_type === "CUSTOM_DISCOUNT" && <h3 className="mb-1 text-base font-bold text-[#262626] sm:text-xl">
                                        Offer Description
                                    </h3>
                                }

                                {discount_type === "CUSTOM_DISCOUNT" && (
                                    <p className="rounded-sm bg-gray-100 w-fit px-2 py-1.5 text-sm font-medium">
                                        {custom_discount}
                                    </p>
                                )}
                            </div>

                            <section className="space-y-2 mt-2">
                                <h3 className="mb-2 text-lg font-bold text-[#262626] sm:text-xl">Description</h3>
                                <p className="text-sm leading-relaxed text-[#262626] sm:text-base">
                                    {description}
                                </p>
                            </section>

                            <div className="grid grid-cols-2 gap-2 pt-2 sm:gap-4">
                                <button onClick={() => handleSaveForLater(_id)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-transparent bg-primary px-1 sm:px-3 py-2 sm:py-3 text-sm font-bold text-white transition-colors hover:bg-secondary cursor-pointer sm:text-base">
                                    {
                                        selectId ? <div className='flex items-center gap-2'>Save For Later <Heart className="h-5 w-5 shrink-0 sm:h-5.5 sm:w-5.5 fill-white" /></div> : <div className='flex items-center gap-2'>Save For Later <Heart className="h-5 w-5 shrink-0 sm:h-5.5 sm:w-5.5" /></div>
                                    }
                                </button>
                                <button onClick={() => setIsOpen(true)} className="min-h-12 w-full rounded-full bg-primary px-1 sm:px-3 py-2 sm:py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-secondary cursor-pointer sm:text-base">
                                    Show Coupon
                                </button>
                            </div>
                            <ShowCuponModal
                                isOpen={isOpen}
                                setIsOpen={setIsOpen}
                                deal={deal}
                            />
                        </div>
                        {/* Nearest Location */}
                        {
                            !nationwide && <div className="pb-8">
                                <h3 className="mb-3 text-xl font-bold text-[#262626] sm:text-2xl">Nearest Location</h3>
                                <p className="text-sm text-[#262626]">
                                    Tap the marker below to open Google Maps and get directions to the nearest location.
                                </p>
                                <div className="rounded-xl overflow-hidden border border-gray-400 h-66">
                                    <OutLetshowMap locations={available_location} />
                                </div>
                            </div>
                        }
                    </div>

                    {/* right side */}
                    <div className="w-full md:w-5/12 space-y-5" data-animate="stagger">
                        <section>
                            <h3 className="font-bold text-xl text-[#262626] mb-2">How to Redeem</h3>
                            <Redeem />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealDetails;
