import { MapPin, Store, X } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import GoogleMapComponent from "./components/GoogleMapComponent";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEditShopOutletMutation, useGetVendorDetailsQuery } from "../../../../features/shop/shopApi";
import { useEffect } from "react";
import EditOutletSkeleton from "../../../../components/skeleton/EditOutletSkeleton";

const EditOutlet = () => {
    const { id } = useParams();
    const { user } = useSelector((state) => state?.auth);
    const navigate = useNavigate();
    const { data: shopDetails, isLoading, refetch } = useGetVendorDetailsQuery(user?._id, {
        skip: !user?._id,
    });
    const [editShopOutlet, { isLoading: editLoading, error, isSuccess }] =
        useEditShopOutletMutation();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            outlet_name: "",
            street: "",
            city: "",
            zip_code: "",
            state: "",
            country: "",
            coordinates: null,
        },
    });

    const streetValue = useWatch({
        control,
        name: "street",
    });
    const cityValue = useWatch({
        control,
        name: "city",
    });
    const zipCodetValue = useWatch({
        control,
        name: "zip_code",
    });
    const stateValue = useWatch({
        control,
        name: "state",
    });
    const countryValue = useWatch({
        control,
        name: "country",
    });

    useEffect(() => {
        if (isSuccess) {
            navigate(`/show-outlet/${user?._id}`);
            refetch();
        }
    }, [navigate, isSuccess, error, user?._id, refetch]);

    useEffect(() => {
        if (shopDetails?.data?.locations?.length) {
            const outlet = shopDetails.data.locations.find((out) => out?._id === id);
            if (outlet) {
                const { address, location_name, location } = outlet;

                reset({
                    outlet_name: location_name || "",
                    street: address?.street || "",
                    city: address?.city || "",
                    state: address?.state || "",
                    country: address?.country || "",
                    zip_code: address?.zip_code || "",
                    coordinates:
                        location?.coordinates?.length === 2
                            ? {
                                lat: location.coordinates[1],
                                lng: location.coordinates[0],
                            }
                            : null,
                });
            }
        }
    }, [shopDetails, id, reset]);

    const onSubmit = async (data) => {
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return;
        }

        const payload = {
            location_name: data.outlet_name,
            address: {
                street: data.street,
                city: data.city,
                state: data.state,
                country: data.country,
                zip_code: data.zip_code,
            },
            coordinates: [data.coordinates.lng, data.coordinates.lat],
        };

        await editShopOutlet({
            locationId: id,
            shopId: shopDetails?.data?._id,
            data: payload,
        }).unwrap();
    };

    if (isLoading) {
        return <EditOutletSkeleton />;
    }

    const fullAddress = [streetValue, cityValue, zipCodetValue, stateValue, countryValue]
        .filter(Boolean) // removes null, undefined, empty string, false
        .join(", ");

    return (
        <div className="w-full max-w-xl mx-auto pt-34 pb-12">
            <div className="bg-white rounded-2xl w-full p-6 md:p-8 border border-gray-300 shadow-2xl">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-2xl font-bold text-primary">Edit Location</h3>

                    <button
                        type="button"
                        onClick={() => navigate(`/show-outlet/${user?._id}`)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-lg font-medium">
                            Name
                        </label>
                        <div className="relative mt-2">
                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-3 border rounded-full outline-0"
                                placeholder="Shop name"
                                {...register("outlet_name", {
                                    required: "Outlet name is required",
                                })}
                            />
                        </div>
                        {errors.outlet_name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.outlet_name.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-lg font-medium">
                            Street
                        </label>
                        <div className="relative mt-2">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-3 border rounded-full outline-0"
                                placeholder="Shop street"
                                {...register("street", {
                                    required: "Street is required",
                                })}
                            />
                        </div>
                        {errors.street && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.street.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-lg font-medium">
                                City
                            </label>
                            <input
                                type="text"
                                className="w-full mt-2 px-4 py-3 border rounded-full outline-0"
                                placeholder="City"
                                {...register("city", {
                                    required: "City is required",
                                })}
                            />
                            {errors.city && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.city.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-lg font-medium">
                                Zip Code
                            </label>
                            <input
                                type="text"
                                className="w-full mt-2 px-4 py-3 border rounded-full outline-0"
                                placeholder="Zip code"
                                {...register("zip_code", {
                                    required: "Zip code is required",
                                })}
                            />
                            {errors.zip_code && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.zip_code.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-lg font-medium">
                                State
                            </label>
                            <input
                                type="text"
                                className="w-full mt-2 px-4 py-3 border rounded-full outline-0"
                                placeholder="State"
                                {...register("state", {
                                    required: "State is required",
                                })}
                            />
                            {errors.state && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.state.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-lg font-medium">
                                Country
                            </label>
                            <input
                                type="text"
                                className="w-full mt-2 px-4 py-3 border rounded-full outline-0"
                                placeholder="Country"
                                {...register("country", {
                                    required: "Country is required",
                                })}
                            />
                            {errors.country && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.country.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-lg font-medium">
                            Location
                        </label>

                        <Controller
                            name="coordinates"
                            control={control}
                            rules={{
                                required: "Location is required",
                            }}
                            render={({ field }) => (
                                <div className="w-full h-52 rounded-xl overflow-hidden border mt-2">
                                    <GoogleMapComponent
                                        address={fullAddress}
                                        selectedLocation={field.value}
                                        onMarkerSelect={(coords) => field.onChange(coords)}
                                    />
                                </div>
                            )}
                        />
                        {errors.coordinates && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.coordinates.message}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate("/shop-overview")}
                            className="flex-1 py-3 border rounded-full text-gray-800 cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={editLoading}
                            className="flex-1 py-3 rounded-full bg-primary text-white cursor-pointer transition-colors duration-300 hover:bg-secondary disabled:bg-gray-300 disabled:text-gray-800 disabled:cursor-not-allowed"
                        >
                            {editLoading ? (
                                <div className="mx-auto animate-spin border-2 border-t-4 border-white w-6 h-6 rounded-full" />
                            ) : (
                                "Update Location"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditOutlet;

