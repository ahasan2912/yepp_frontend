import { Check, LocateFixed, MapPin, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSuggestionLocationQuery } from '../../features/location/locationApi';

const GOOGLE_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";

const reverseGeocode = async (lat, lng) => {
    const googleMapApiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
    if (!googleMapApiKey) return null;
    try {
        const res = await fetch(
            `${GOOGLE_GEOCODING_URL}?latlng=${lat},${lng}&key=${googleMapApiKey}`
        );
        const data = await res.json();
        const components = data?.results?.[0]?.address_components || [];
        const get = (types) =>
            components.find((c) => types.some((t) => c.types?.includes(t)))?.long_name;
        const city = get(["locality", "postal_town", "sublocality", "sublocality_level_1", "neighborhood", "administrative_area_level_2"]);
        const region = get(["administrative_area_level_1"]);
        if (city && region) return `${city}, ${region}`;
        if (city) return city;
        if (region) return region;
        return data?.results?.[0]?.formatted_address || null;
    } catch {
        return null;
    }
};

const LocationSetModal = ({ onClose, onLocationChange }) => {
    const [inputValue, setInputValue] = useState('');
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState('');
    const [debouncedValue, setDebouncedValue] = useState('');
    const [locating, setLocating] = useState(false);
    const [locationInfo, setLocationInfo] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(inputValue);
        }, 1000);
        return () => clearTimeout(timer);
    }, [inputValue]);

    const { data: suggestionLocation, isLoading: isSuggesting } = useSuggestionLocationQuery(
        inputValue,
        { skip: debouncedValue.trim().length < 2 }
    );

    const suggestions = suggestionLocation?.data || [];

    const isValidSelection = selectedSuggestion !== null && inputValue === selectedSuggestion.label;

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        setSelectedSuggestion(null);
        setShowSuggestions(true);
        setError('');
    };

    const handleSelectSuggestion = (suggestion) => {
        setInputValue(suggestion.label);
        setSelectedSuggestion(suggestion);
        setShowSuggestions(false);
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!inputValue.trim()) {
            setError('Please enter a location.');
            return;
        }

        if (!isValidSelection) {
            setError('Please select a location from the suggestions list.');
            return;
        }

        const label = selectedSuggestion.label;
        const params = {
            city: selectedSuggestion?.city,
            state: selectedSuggestion?.state,
            country: selectedSuggestion?.country,
        };

        localStorage.setItem(
            'location',
            JSON.stringify({ mode: 'SELECTED_LOCATION', data: params, label })
        );

        if (onLocationChange) onLocationChange(label);
        else { onClose(); window.location.reload(); }
    };

    const handleSetCurrentLocation = (e) => {
        e.preventDefault();

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        setLocating(true);
        setError('');
        setLocationInfo('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Save coordinates so DynamicLocation & API calls can use them
                localStorage.setItem(
                    'userLocation',
                    JSON.stringify({ latitude, longitude })
                );

                // Reverse geocode to get a human-readable label
                const label = await reverseGeocode(latitude, longitude) || '';

                localStorage.setItem(
                    'location',
                    JSON.stringify({ mode: 'CURRENT_LOCATION', data: { latitude, longitude }, label })
                );

                setLocating(false);

                if (onLocationChange) onLocationChange(label);
                else { onClose(); window.location.reload(); }
            },
            (err) => {
                setLocating(false);
                if (err.code === err.PERMISSION_DENIED) {
                    // Permission denied — show a soft info message, don't block the form
                    setLocationInfo('Location access denied. You can still search manually below.');
                    setTimeout(() => setLocationInfo(''), 4000);
                } else {
                    setError('Unable to retrieve your location. Please try again.');
                }
            },
            { timeout: 10000 }
        );
    };

    return createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close location modal"
                className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="location-modal-title"
                className="relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <h1 id="location-modal-title" className="text-lg sm:text-2xl font-bold">
                        Change Location
                    </h1>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close location modal"
                        className="shrink-0 cursor-pointer p-1 text-gray-500 transition-colors hover:text-gray-900"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form — no autoComplete on the form itself; use autoComplete="new-password" on input to suppress browser autofill */}
                <form
                    onSubmit={handleSubmit}
                    autoComplete="off"
                    className="flex min-h-0 flex-1 flex-col px-5 py-5"
                >
                    {/* Search input */}
                    <div className="flex flex-col">
                        <div className={`flex min-w-0 flex-1 items-center gap-3 rounded-full border-2 px-3.5 py-2.5 transition-colors ${error
                            ? 'border-red-500'
                            : isValidSelection
                                ? 'border-green-500'
                                : 'border-gray-700'
                            }`}>
                            <MapPin className="h-4 w-4 shrink-0 text-black" aria-hidden="true" />
                            <label htmlFor="location-search" className="sr-only">Location</label>
                            <input
                                id="location-search"
                                type="text"
                                autoComplete="off"
                                value={inputValue}
                                onChange={handleInputChange}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Zip Code, Neighborhood, City"
                                className="min-w-0 flex-1 bg-transparent text-sm text-black font-medium outline-none placeholder:text-gray-500 selection:bg-gray-200 selection:text-black"
                            />
                            {/* Clear button — only show when there's input */}
                            {inputValue && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInputValue('');
                                        setSelectedSuggestion(null);
                                        setShowSuggestions(false);
                                        setError('');
                                    }}
                                    aria-label="Clear search"
                                    className="cursor-pointer text-gray-400 hover:text-gray-700"
                                >
                                    <X size={15} />
                                </button>
                            )}
                            <div className="relative inline-block group">
                                <button
                                    type="button"
                                    onClick={handleSetCurrentLocation}
                                    aria-label="Use your current location"
                                    className="cursor-pointer text-gray-600 hover:text-black transition-colors"
                                >
                                    <LocateFixed size={21} />
                                </button>
                                <span className="absolute -left-5 -top-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-600 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none">
                                    Select current location
                                </span>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <p className="mt-1.5 ml-3 text-xs font-medium text-red-500">
                                {error}
                            </p>
                        )}
                        {/* Soft info message (e.g. permission denied) */}
                        {locationInfo && !error && (
                            <p className="mt-1.5 ml-3 text-xs font-medium text-amber-600">
                                {locationInfo}
                            </p>
                        )}

                        <div className='flex items-center gap-1 mt-2 ml-2'>
                            <button
                                type="button"
                                onClick={handleSetCurrentLocation}
                                disabled={locating}
                                className="flex items-center gap-1.5 cursor-pointer text-primary hover:text-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {locating ? (
                                    <>
                                        <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                                        <span className='text-sm font-medium'>Detecting location...</span>
                                    </>
                                ) : (
                                    <>
                                        <LocateFixed size={18} />
                                        <span className='text-sm font-medium'>Use my current location</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Suggestions list */}
                    <div className="max-h-110 overflow-y-auto px-1 pt-4">
                        {isSuggesting && inputValue.trim().length >= 2 && (
                            <p className="py-2 text-center text-sm text-gray-400">Searching...</p>
                        )}

                        {!isSuggesting && showSuggestions && suggestions.length > 0 && (
                            <>
                                <h2 className="font-bold text-slate-900 pb-1 pl-1">
                                    Suggested Locations
                                </h2>
                                <ul>
                                    {suggestions.map((suggestion, index) => {
                                        const label = suggestion?.label;
                                        const isSelected = selectedSuggestion?.label === label;
                                        return (
                                            <li
                                                key={suggestion?.id || label || index}
                                                className="border-b border-gray-200"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelectSuggestion(suggestion)}
                                                    className="flex w-full cursor-pointer items-center justify-between gap-4 py-1.5 text-left"
                                                >
                                                    <span className="flex min-w-0 items-center gap-1">
                                                        <MapPin className="h-4 w-4 shrink-0 text-slate-900" aria-hidden="true" />
                                                        <span className="truncate font-semibold text-slate-900">
                                                            {label}
                                                        </span>
                                                    </span>
                                                    <span
                                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${isSelected
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-400'
                                                            }`}
                                                    >
                                                        <Check className="h-5 w-5" />
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}

                        {!isSuggesting && showSuggestions && inputValue.trim().length >= 2 && suggestions.length === 0 && (
                            <p className="py-2 text-center text-sm text-gray-400">No locations found.</p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="shrink-0 pt-2">
                        <button
                            type="submit"
                            disabled={!isValidSelection}
                            className="w-full cursor-pointer rounded-full bg-[#008A24] py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#00751F] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Set Location
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default LocationSetModal;
