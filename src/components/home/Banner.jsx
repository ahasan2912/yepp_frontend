import LoacationBadge from './LoacationBadge';
import SearchBox from './SearchBox';

const Banner = ({ handleSearch }) => {
    return (
        <div className="bg-image px-4 bg-no-repeat bg-cover min-h-[52vh] sm:min-h-[56vh] md:min-h-[70vh] relative overflow-hidden">
            <div className="banner-overlay absolute inset-0 pointer-events-none" />
            <div className="max-w-305 mx-auto flex min-h-[52vh] flex-col justify-center py-12 sm:min-h-[56vh] sm:py-16 md:min-h-[70vh] md:py-10 space-y-2 sm:space-y-0" data-animate="hero">
                <LoacationBadge />
                <h1 className='text-[#FFFFFF] text-[32px] sm:text-[44px] md:text-[56px] font-bold max-w-70 sm:max-w-115.25 poppins leading-9 sm:leading-12 md:leading-17 mt-2' data-animate-item>Find Local Ads & Save Big!</h1>
                <p className='max-w-70 sm:max-w-115 text-[#FFFFFF] text-sm sm:text-base font-medium mt-1' data-animate-item>Discover the best discounts from your favorite local businesses and start saving today.  </p>
                <div data-animate-item className='max-w-100 md:max-w-120 lg:max-w-150 xl:max-w-170'>
                    <SearchBox handleSearch={handleSearch} />
                </div>
            </div>
        </div>

    );
};

export default Banner;
