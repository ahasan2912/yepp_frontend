import { useState, useEffect } from 'react';
import DynamicLocation from '../location/DynamicLocation';
import LocationSetModal from './LocationSetModal';
import { useGetDefaultLocationQuery } from '../../features/location/locationApi';

const DEFAULT_SEARCH = import.meta.env.VITE_DEFAULT_SEARCH;

const getStoredLocation = () => {
    try {
        return JSON.parse(localStorage.getItem('location')) || null;
    } catch {
        return null;
    }
};

const LoacationBadge = () => {
    const stored = getStoredLocation();

    // If a non-default location is already stored, we don't need to fetch
    const hasUserLocation =
        stored?.mode === 'SELECTED_LOCATION' || stored?.mode === 'CURRENT_LOCATION';

    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [displayLabel, setDisplayLabel] = useState(stored?.label || '');

    // Fetch default location only when no user-chosen location exists
    // const { data: suggestionData, isSuccess } = useSuggestionLocationQuery(DEFAULT_SEARCH, {
    //     skip: hasUserLocation,
    // });

    const { data: defaultLocation, isSuccess } = useGetDefaultLocationQuery(
        { skip: hasUserLocation }
    );

    useEffect(() => {
        if (!isSuccess) return;
        // Already have a user-chosen location, don't overwrite
        if (getStoredLocation()?.mode === 'SELECTED_LOCATION' || getStoredLocation()?.mode === 'CURRENT_LOCATION') return;

        // const city = "Detroit";
        // const state = "Mi";

        // const city = "Bhola";
        // const state = "Barishal";

        // const first = suggestionData.data.find(
        //     item =>
        //         item.city.toLowerCase().includes(city.toLowerCase()) &&
        //         item.state.toLowerCase() === state.toLowerCase()
        // );

        // if (!first) return;

        const city = defaultLocation?.data?.address?.city;
        const state = defaultLocation?.data?.address?.state;
        const country = defaultLocation?.data?.address?.country;

        const label = `${city}, ${state}`;
        const params = {
            city: city.toLowerCase(),
            state: state.toLowerCase(),
            country: country.toLowerCase(),
        };

        // Save as SELECTED_LOCATION so it can be overridden later
        localStorage.setItem(
            'location',
            JSON.stringify({ mode: 'SELECTED_LOCATION', data: params, label })
        );

        // Notify other components on the same page that location has been set
        window.dispatchEvent(new CustomEvent('app:locationset'));

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDisplayLabel(label);
    }, [isSuccess, defaultLocation]);

    // Coords are only set when user explicitly picks "Use my current location"
    const storedCoords =
        stored?.mode === 'CURRENT_LOCATION'
            ? stored.data
            : null;

    const handleLocationChange = (label) => {
        setDisplayLabel(label || '');
        setIsLocationModalOpen(false);
        window.location.reload();
    };

    return (
        <>
            <div className="relative z-10 my-3 flex w-fit max-w-[70vw] sm:max-w-[90vw] items-center gap-1 sm:gap-2 rounded-full border border-white/25 bg-white/15 px-2 sm:px-4 py-1.5 text-sm sm:text-base font-semibold text-white backdrop-blur-sm">
                {displayLabel ? (
                    <span className="truncate max-w-[44vw] sm:max-w-xs font-semibold leading-tight text-white">
                        {displayLabel}
                    </span>
                ) : storedCoords ? (
                    // Only render DynamicLocation when we have explicit coords from "Use my current location"
                    <DynamicLocation
                        latitude={storedCoords.latitude}
                        longitude={storedCoords.longitude}
                        className="flex min-w-0 items-center gap-1.5 truncate max-w-[44vw] sm:max-w-xs font-semibold leading-tight text-white"
                        iconClassName="h-4 w-4 shrink-0"
                    />
                ) : (
                    // Fallback while API is loading
                    <span className="truncate max-w-[44vw] sm:max-w-xs font-semibold leading-tight text-white/60">
                        {DEFAULT_SEARCH}
                    </span>
                )}
                <span className="shrink-0 text-white/60" aria-hidden="true">•</span>
                <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="shrink-0 cursor-pointer whitespace-nowrap text-[#4dc575] transition-colors hover:text-[#8AECAB] text-sm sm:text-base">
                    Change Location
                </button>
            </div>

            {isLocationModalOpen && (
                <LocationSetModal
                    isOpen={isLocationModalOpen}
                    onClose={() => setIsLocationModalOpen(false)}
                    onLocationChange={handleLocationChange}
                />
            )}
        </>
    );
};

export default LoacationBadge;
