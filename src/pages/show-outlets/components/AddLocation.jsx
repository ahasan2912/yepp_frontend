import { MapPin, Store, X } from 'lucide-react';
import { useState } from 'react';
import GoogleMapComponent from '../../vendor/create-shop/components/GoogleMapComponent';
import { useAddShopOutletMutation } from '../../../features/shop/shopApi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AddLocation = ({ onClose, refetch }) => {
    const navigate = useNavigate();
    const [addShopOutlet, { isLoading, isSuccess }] = useAddShopOutletMutation();
    const [coordinates, setCoordinates] = useState(null);
    const [outlet_name, setOutletName] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [zip_code, setZip] = useState("");
    const [state, setState] = useState("");
    const [country, setCountry] = useState("United States");
    const { user } = useSelector((state) => state?.auth);

    const handleSave = async () => {
        const payLoad = {
            location_name: outlet_name,
            address: {
                street: street,
                zip_code: zip_code,
                city: city,
                state: state,
                country: country,
            },
            coordinates: [
                coordinates[0],
                coordinates[1],
            ],
        };
        const res = await addShopOutlet(payLoad);
        if (res?.data?.success) {
            navigate(`/show-outlet/${user?._id}`);
            refetch();
            onClose();
        }
    };

    const fullAddress = [street, city, zip_code, state, country]
        .filter(Boolean) // removes null, undefined, empty string, false
        .join(", ");

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white h-auto max-h-[90vh] overflow-y-auto rounded-xl w-full max-w-xl px-6 py-8 shadow-xl custom-scroll">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-2xl font-bold text-primary">Add Location</h3>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Outlet Name */}
                    <div>
                        <label className="block text-lg font-medium">
                            Name
                        </label>

                        <div className="relative mt-2">
                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                className="w-full pl-12 pr-4 py-3 border rounded-full outline-0"
                                placeholder="Shop name"
                                value={outlet_name}
                                onChange={(e) => setOutletName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-lg font-medium">
                            Street
                        </label>

                        <div className="relative mt-2">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                className="w-full pl-12 pr-4 py-3 border rounded-full outline-0"
                                placeholder="Shop street"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-lg font-medium">
                                City
                            </label>

                            <input
                                className="w-full mt-2 px-4 py-2.5 border rounded-full outline-0"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                        {/* Zip */}
                        <div>
                            <label className="block text-lg font-medium">
                                Zip Code
                            </label>

                            <input
                                className="w-full mt-2 px-4 py-2.5 border rounded-full outline-0"
                                placeholder="Zip code"
                                value={zip_code}
                                onChange={(e) => setZip(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-lg font-medium">
                                State
                            </label>

                            <input
                                className="w-full mt-2 px-4 py-2.5 border rounded-full outline-0"
                                placeholder="State"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium">
                                Country
                            </label>

                            <input
                                className="w-full mt-2 px-4 py-2.5 border rounded-full outline-0"
                                placeholder="Country"
                                readOnly
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Map */}
                    <div>
                        <label className="block text-lg font-medium">
                            Location
                        </label>

                        <div className="w-full h-56 rounded-xl overflow-hidden border mt-2">
                            <GoogleMapComponent
                                address={fullAddress}
                                onMarkerSelect={setCoordinates}
                            />

                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">

                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border rounded-full text-gray-800 cursor-pointer bg-gray-50 hover:bg-gray-200 font-semibold"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={coordinates === null || isLoading || isSuccess}
                            onClick={handleSave}
                            className={`flex-1 py-3 rounded-full transition-colors duration-300
                            ${coordinates === null || isLoading
                                    ? "bg-gray-300 text-gray-800 cursor-not-allowed"
                                    : isSuccess
                                        ? "bg-green-600 text-white cursor-default"
                                        : "bg-[#4CAF50] text-white hover:bg-[#79be7b] cursor-pointer"
                                }`}
                        >
                            {isLoading ? (
                                "Adding..."
                            ) : isSuccess ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Check size={18} />
                                    Added Location
                                </span>
                            ) : (
                                "Add Location"
                            )}
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default AddLocation;
