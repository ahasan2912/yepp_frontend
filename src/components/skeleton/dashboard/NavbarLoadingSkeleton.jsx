const NavbarLoadingSkeleton = () => {
    return (
        <>
            {/* ── Top Navbar ── */}
            <div className="relative z-50 w-full bg-[#E0F2FE]">
                <div className="max-w-305 px-4 py-5 mx-auto flex items-center justify-between">

                    {/* Logo */}
                    <div className="h-12 w-28 animate-pulse rounded-md bg-primary/20" />

                    {/* Right side */}
                    <div className="flex items-center gap-6">
                        {/* "Interested in becoming a vendor?" + button — hidden on mobile */}
                        <div className="hidden md:flex items-center gap-4">
                            <div className="h-5 w-52 animate-pulse rounded-full bg-primary/20" />
                            <div className="h-9 w-36 animate-pulse rounded-full bg-primary/30" />
                        </div>

                        {/* Heart + Bell icons */}
                        <div className="flex items-center gap-5 mr-16 md:mr-0">
                            <div className="h-6 w-6 animate-pulse rounded-full bg-primary/25" />
                            <div className="h-6 w-6 animate-pulse rounded-full bg-primary/25" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Category Sub-header ── */}
            <div className="sticky top-0 z-40 w-full bg-[#F0F9FF] py-2 shadow-sm sm:px-4">
                <div className="max-w-305 mx-auto flex items-center gap-3 py-1.5 sm:gap-4">

                    {/* Category grid — 10 cols on desktop, fewer on mobile */}
                    <div className="grid min-w-0 flex-1 grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-6 lg:grid-cols-10 sm:gap-x-3 lg:gap-x-4">
                        {Array.from({ length: 13 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5">
                                {/* Icon circle */}
                                <div className="h-10 w-10 sm:h-11 sm:w-11 animate-pulse rounded-full bg-gray-200" />
                                {/* Label */}
                                <div className="h-3 w-12 animate-pulse rounded-full bg-gray-200" />
                            </div>
                        ))}
                    </div>

                    {/* "See all" pill */}
                    <div className="h-8 w-14 shrink-0 animate-pulse rounded-full bg-gray-200 sm:w-16" />
                </div>
            </div>
        </>
    );
};

export default NavbarLoadingSkeleton;
