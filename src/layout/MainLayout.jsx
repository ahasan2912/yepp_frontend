import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import VendorNavbar from '../components/navbar/VendorNavbar';
import BothNavbar from '../components/navbar/BothNavbar';
import { useEffect } from 'react';
import { useGsapAnimations } from '../hooks/useGsapAnimations';
import Footer from '../components/shared/Footer';

const MainLayout = () => {
    const location = useLocation();
    const animationScopeRef = useGsapAnimations(location.pathname);

    useEffect(() => {
        // Only request browser location if the user has explicitly chosen "Use my current location"
        const stored = (() => { try { return JSON.parse(localStorage.getItem('location')); } catch { return null; } })();
        if (stored?.mode !== 'CURRENT_LOCATION') return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {

                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };

                localStorage.setItem("userLocation", JSON.stringify(location));
            });
        }
    }, []);

    const hideNavbarRoutes = [
        "/login",
        "/register",
        "/forgetpassword",
        "/forget-password",
        "/verificationcode",
        "/verification-code",
        "/verify-otp-code",
        "/forget-password-verify",
        "/reset-password",
        "/otp-code-sending",
        "/otp-sending"
    ];

    const vendorNavbarRoutes = [
        "/vendor/create-shop",
        "/vendor-created-shop",
        "/approval"
    ];

    const bothNavbarRoutes = [
        "/shop-overview",
        "/vendor-dashboard",
        "/vendor-profile-setup",
        "/payment",
        "/my-deals",
        "/deal-analytics",
        "/menu",
        "/create-deal",
        "/create-deal-plan",
        "/all-top-views",
        "/my-profile",
        "/vendor-edit-deal",
        "/verdor-edit-shop",
        "/outlet-edit",
        "/show-outlet",
        "/show-outlets",
    ];

    const shouldHideNavbar = hideNavbarRoutes.some(route =>
        location.pathname.startsWith(route)
    );

    const shouldShowVendorNavbar = vendorNavbarRoutes.some(route =>
        location.pathname.startsWith(route)
    );

    const shouldShowBothNavbar = bothNavbarRoutes.some(route =>
        location.pathname.startsWith(route)
    );

    return (
        <div>
            {/* Normal Navbar */}
            {!shouldHideNavbar &&
                !shouldShowVendorNavbar &&
                !shouldShowBothNavbar && <Navbar />
            }
            {/* Vendor Navbar */}
            {!shouldHideNavbar &&
                shouldShowVendorNavbar &&
                !shouldShowBothNavbar && <VendorNavbar />
            }
            {/* Both Navbar */}
            {!shouldHideNavbar &&
                !shouldShowVendorNavbar &&
                shouldShowBothNavbar && <BothNavbar />
            }
            <div className="bg-gray-50" ref={animationScopeRef}>
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;
