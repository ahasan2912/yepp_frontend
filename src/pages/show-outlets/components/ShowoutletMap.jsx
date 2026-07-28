import { useEffect, useState } from "react";
import { MapPin, Store, ChevronRight, Pencil, Plus, Trash } from "lucide-react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import outletMapIcon from "../../../assets/images/outletMap.png";
import { Link } from "react-router-dom";
import { googleMapsLoaderOptions } from "../../../lib/googleMapsLoader";
import AddLocation from "./AddLocation";
import AdLocationByCSV from "./AdLocationByCSV";
import { useDeleteLocationMutation } from "../../../features/shop/shopApi";

export default function ShowoutletMap({ outlets = [], shopId, refetch }) {
    const { latitude, longitude } = JSON.parse(localStorage.getItem("userLocation")) || {};
    const [showModal, setShowModal] = useState(false);
    const [showCSVModal, setCSVshowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(outlets?.[0] || null);
    const GOOGLE_MAP_API_KEY = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
    const { isLoaded } = useJsApiLoader(googleMapsLoaderOptions);
    const [deleteLocation, { isLoading, error, isSuccess, isError }] = useDeleteLocationMutation();

    useEffect(() => {
        const func = () => {
            if (outlets?.length && !selectedOutlet) {
                setSelectedOutlet(outlets[0]);
            }
        }
        func();
    }, [outlets, selectedOutlet]);

    const coordinates = selectedOutlet?.location?.coordinates;
    const outletLng = coordinates?.[0];
    const outletLat = coordinates?.[1];

    const center =
        outletLat != null && outletLng != null
            ? { lat: outletLat, lng: outletLng }
            : latitude != null && longitude != null
                ? { lat: latitude, lng: longitude }
                : { lat: latitude, lng: longitude };

    function getDistanceInMiles(userLat, userLng, shopLat, shopLng) {
        const toRad = (value) => (value * Math.PI) / 180;

        const earthRadiusMiles = 3958.8;
        const dLat = toRad(shopLat - userLat);
        const dLng = toRad(shopLng - userLng);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(userLat)) *
            Math.cos(toRad(shopLat)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusMiles * c;
    }

    const formatDistance = (distance) => {
        if (distance == null) return null;
        if (distance < 0.01) return "Less than 0.01 miles away";
        return `${distance.toFixed(2)} miles away`;
    };

    const selectedOutletDistance =
        latitude != null &&
            longitude != null &&
            outletLat != null &&
            outletLng != null
            ? getDistanceInMiles(latitude, longitude, outletLat, outletLng)
            : null;

    const hadleLocationDelete = (id) => {
        setLocationToDelete(id);
        setShowDeleteModal(true);
    }

    const confirmDelete = async () => {
        if (locationToDelete) {
            const payload = {
                shopId: shopId,
                locationId: locationToDelete
            }
            await deleteLocation(payload);
            if (isSuccess) {
                setShowDeleteModal(false);
            }
            setLocationToDelete(null);
            refetch();
        }
    }

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setLocationToDelete(null);
    }

    return (
        <div className="w-full max-w-305 mx-auto pb-10">
            <div className="flex flex-col md:flex-row border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white min-h-110">
                {/* LEFT */}
                <div className="md:w-6/12 flex flex-col p-3 sm:p-6 border-b md:border-b-0 md:border-r border-gray-200 max-h-140 custom-scroll overflow-y-auto">
                    <div className="flex justify-between items-center gap-1 sm:gap-2 mb-5">
                        <p className="text-base md:text-[22px] font-bold text-primary">
                            Available Locations
                        </p>
                        <div className="flex justify-between gap-1">
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="ml-3 relative z-20 shrink-0 inline-flex items-center gap-1 rounded-sm border border-transparent bg-primary px-1 sm:px-3 py-2 text-sm font-semibold text-white hover:bg-secondary transition-all duration-200 cursor-pointer">
                                <Plus className="w-3.5 sm:w-4.5 h-3.5 sm:h-4.5" />
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => setCSVshowModal(true)}
                                className="ml-3 relative z-20 shrink-0 inline-flex items-center gap-1 rounded-sm border border-transparent bg-primary px-1 sm:px-3 py-2 text-sm font-semibold text-white hover:bg-secondary transition-all duration-200 cursor-pointer">
                                <Plus className="w-3.5 sm:w-4.5 h-3.5 sm:h-4.5" />
                                Upload CSV/EXCEL
                            </button>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {outlets?.length === 0 ? <div className="flex items-center justify-center min-h-75 text-gray-500 text-lg font-medium">
                            No Data Found
                        </div> : outlets?.map((outlet) => {
                            const isActive = selectedOutlet?._id === outlet?._id;
                            const locCoordinates = outlet?.location?.coordinates;
                            const locLng = locCoordinates?.[0];
                            const locLat = locCoordinates?.[1];
                            const distance =
                                latitude != null &&
                                    longitude != null &&
                                    locLat != null &&
                                    locLng != null
                                    ? getDistanceInMiles(latitude, longitude, locLat, locLng)
                                    : null;
                            return (
                                <div
                                    key={outlet?._id}
                                    className={`w-full flex items-center justify-between rounded-lg px-3 py-3 sm:px-5 sm:py-4 transition-all duration-200 border ${isActive
                                        ? "bg-cyan-50 border-green-500 shadow-sm"
                                        : "bg-slate-100 border-transparent hover:bg-slate-200"
                                        }`}>
                                    <div
                                        onClick={() => setSelectedOutlet(outlet)}
                                        className="flex items-center justify-between flex-1 min-w-0 text-left cursor-pointer"
                                    >
                                        <div className="flex gap-2 min-w-0">
                                            <Store className="w-5 h-5 text-primary shrink-0 mt-1.5" />

                                            <div className="min-w-0">
                                                <p className="text-lg text-gray-500 truncate">
                                                    <span className="text-primary font-semibold">
                                                        {outlet?.location_name || outlet?.address?.street}:
                                                    </span>{" "}
                                                    {outlet?.address?.street}
                                                </p>

                                                {distance != null && (
                                                    <p className="text-sm text-gray-500 font-semibold mt-1">
                                                        Zip code {outlet?.address?.zip_code}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <ChevronRight className="w-6 h-6 text-gray-500 shrink-0 ml-3" />
                                    </div>

                                    <Link
                                        to={`/outlet-edit/${outlet?._id}`}
                                        state={{ outlet }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="ml-3 relative z-20 shrink-0 inline-flex items-center gap-1 rounded-md border border-transparent bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-secondary transition-all duration-200"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => hadleLocationDelete(outlet?._id)}
                                        className="ml-3 relative z-20 shrink-0 inline-flex items-center gap-1 rounded-md border border-transparent bg-red-500 px-2 py-2 text-sm font-semibold text-white hover:bg-red-400 transition-all duration-200 cursor-pointer"
                                    >
                                        <Trash className="w-4 h-4 -mt-0.5" />
                                        Delete
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="md:flex-1 flex flex-col min-h-80 md:min-h-0">
                    <div className="bg-slate-100 h-75 sm:h-87.5 md:h-auto md:flex-1">
                        {isLoaded && (outletLat != null || latitude != null) ? (
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "100%" }}
                                center={center}
                                zoom={15}
                                options={{
                                    mapTypeControl: false,
                                    streetViewControl: false,
                                    fullscreenControl: false,
                                    draggable: true,
                                    gestureHandling: "greedy",
                                }}>
                                {outletLat != null && outletLng != null && (
                                    <Marker
                                        position={{ lat: outletLat, lng: outletLng }}
                                        icon={{
                                            url: outletMapIcon,
                                            scaledSize: new window.google.maps.Size(40, 40),
                                        }}
                                    />
                                )}

                                {latitude != null && longitude != null && (
                                    <Marker
                                        position={{ lat: latitude, lng: longitude }}
                                        icon={{
                                            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                                                <svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="36" cy="36" r="22" fill="#4285F4" opacity="0.18"/>
                                                    <circle cx="36" cy="36" r="18" fill="#4285F4" opacity="0.25">
                                                        <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite" />
                                                        <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite" />
                                                    </circle>
                                                    <circle cx="36" cy="36" r="7" fill="#1A73E8" stroke="white" stroke-width="3"/>
                                                </svg>
                                            `)}`,
                                            scaledSize: new window.google.maps.Size(80, 80),
                                            anchor: new window.google.maps.Point(36, 36),
                                        }}
                                    />
                                )}
                            </GoogleMap>
                        ) : (
                            <div className="w-full h-full min-h-75 flex flex-col items-center justify-center gap-3 text-slate-400">
                                <MapPin className="w-8 h-8 opacity-40" />
                                <p className="text-sm">
                                    {GOOGLE_MAP_API_KEY
                                        ? "Loading map or missing coordinates..."
                                        : "Add your Google Maps API key"}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 bg-white">
                        <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="w-5.5 h-5.5 text-red-400 shrink-0" />
                            <p className="text-lg text-gray-600 font-bold truncate">
                                {selectedOutlet?.address?.street || "No address available"}
                            </p>
                        </div>

                        {selectedOutletDistance != null && (
                            <p className="text-base font-semibold text-primary shrink-0 text wrap-anywhere">
                                {formatDistance(selectedOutletDistance)} Distance
                            </p>
                        )}
                    </div>
                </div>

                {showModal && (
                    <AddLocation onClose={() => setShowModal(false)} refetch={refetch} />
                )}
                {showCSVModal && (
                    <AdLocationByCSV onClose={() => setCSVshowModal(false)} />
                )}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
                            <div className={`${isError ? 'bg-[#e0d01b]' : 'bg-red-400 '} px-6 py-4`}>
                                {
                                    isError ? <h3 className="text-xl font-semibold text-white">Delete Failed</h3> : <h3 className="text-xl font-semibold text-white">Confirm Delete</h3>
                                }
                            </div>
                            <div className="px-6 py-6">
                                {isError ? <p className="text-red-500 text-base">
                                    {error?.data?.message}
                                </p> : <p className="text-gray-700 text-base">
                                    If this location is linked to any deal as the only remaining outlet, you cannot delete it until you add a second location.
                                </p>}

                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                                <button
                                    onClick={cancelDelete}
                                    disabled={isLoading}
                                    className="px-7 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                                >
                                    No
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isLoading}
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-red-400 rounded-md hover:bg-red-600 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                                >
                                    {isLoading ? "Deleting..." : "Yes"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
