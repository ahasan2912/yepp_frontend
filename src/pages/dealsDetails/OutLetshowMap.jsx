import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useMemo, useState } from "react";
import outletMapIcon from "../../assets/images/outletMap.png";
import { googleMapsLoaderOptions } from "../../lib/googleMapsLoader";

const OutLetshowMap = ({ locations = [] }) => {
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const { isLoaded } = useJsApiLoader(googleMapsLoaderOptions);


    const userLocation = useMemo(() => {
        try {
            const data = JSON.parse(localStorage.getItem("userLocation"));

            if (data?.latitude != null && data?.longitude != null) {
                return {
                    lat: Number(data.latitude),
                    lng: Number(data.longitude),
                };
            }
        } catch (e) {
            console.log(e)
        }

        return null;
    }, []);

    const userIcon = useMemo(() => {
        if (!isLoaded) return null;

        // 🔥 SAFE ACCESS (ONLY AFTER LOAD)
        const google = window.google;

        if (!google?.maps) return null;

        return {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
        };
    }, [isLoaded]);

    const onLoad = useCallback(
        (map) => {
            const bounds = new window.google.maps.LatLngBounds();

            locations.forEach((loc) => {
                const lat = loc.location.coordinates[1];
                const lng = loc.location.coordinates[0];
                bounds.extend({ lat, lng });
            });

            if (userLocation) {
                bounds.extend(userLocation);
            }

            map.fitBounds(bounds, 80);
        },
        [locations, userLocation]
    );

    if (!isLoaded) return <div>Loading Map...</div>;

    return (
        <>
            {selectedOutlet && userLocation && (
                <div style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    background: "#fff",
                    padding: "10px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    zIndex: 9999
                }}>
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedOutlet.lat},${selectedOutlet.lng}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        🧭 Get Directions
                    </a>
                </div>
            )}
            <GoogleMap
                mapContainerStyle={{ width: "100%", height: "500px" }}
                onLoad={onLoad}
            >
                {/* Outlets */}
                {locations.map((loc, i) => (
                    <Marker
                        key={i}
                        position={{
                            lat: loc.location.coordinates[1],
                            lng: loc.location.coordinates[0],
                        }}
                        icon={{
                            url: outletMapIcon,
                            scaledSize: new window.google.maps.Size(40, 40),
                        }}
                        onClick={() =>
                            setSelectedOutlet({
                                lat: loc.location.coordinates[1],
                                lng: loc.location.coordinates[0],
                            })
                        }
                    />
                ))}

                {/* User Blue Dot */}
                {userLocation && userIcon && (
                    <Marker position={userLocation} icon={userIcon} />
                )}
            </GoogleMap>
        </>
    );
};

export default OutLetshowMap;