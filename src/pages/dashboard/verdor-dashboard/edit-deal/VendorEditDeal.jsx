/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/incompatible-library */
import { useForm } from "react-hook-form";
import UplodedImage from "../components/UplodedImage";
import { useEffect, useRef, useState } from "react";
import AddDealSkeleton from "../../../../components/skeleton/AddDealSkeleton";
import { useEditDealMutation, useGetDealDetailsQuery } from "../../../../features/deal/dealApi";
import { useNavigate, useParams } from "react-router-dom";
import { Check, ChevronDown, CircleCheckBig, MapPin, X } from "lucide-react";
import { DealsNotFound } from "../../../dealsDetails/DealsNotFound";
import { useSelector } from "react-redux";
import { useGetVendorDetailsQuery } from "../../../../features/shop/shopApi";

// accepts existing server previews so they count as "already filled"
const hasCouponCodeValue = (data, existingQrPreview = "", existingUpcPreview = "") => {
    return Boolean(
        data?.couponCode?.trim() ||
        data?.qr_code?.[0] ||
        data?.upc_code?.[0] ||
        existingQrPreview ||
        existingUpcPreview
    );
};

const discountTypeOptions = [
    {
        label: 'Percentage Off Item Price',
        value: 'PERCENT_OFF_PRICE',
    },
    {
        label: 'Percentage Off Total Purchase',
        value: 'PERCENT_OFF_TOTAL',
    },
    {
        label: 'Fixed Price',
        value: 'FIXED_PRICE',
    },
    {
        label: 'Custom Discount',
        value: 'CUSTOM_DISCOUNT',
    },
    {
        label: 'No Price',
        value: 'NO_PRICE',
    },
];;

const VendorEditDeal = () => {
    const { latitude, longitude } = JSON.parse(localStorage.getItem("userLocation")) || {};
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useSelector((state) => state?.auth);
    const [imageFiles, setImagesFiles] = useState([]);
    const [initialTags, setInitialTags] = useState([]);
    const [qrPreview, setQrPreview] = useState("");
    const [upcPreview, setUpcPreview] = useState("");
    const [removeQr, setRemoveQr] = useState(false);
    const [removeUpc, setRemoveUpc] = useState(false);
    const qrInputRef = useRef(null);
    const upcInputRef = useRef(null);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const [initialHighlights, setInitialHighlights] = useState([]);
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [nationwide, setNationwide] = useState(false);
    const locationDropdownRef = useRef(null);
    const { data: dealDetail, isLoading: dealDetailsLoading, isError } = useGetDealDetailsQuery({ id, longitude, latitude });
    const { data: shopDetails, isLoading: shopLoading } = useGetVendorDetailsQuery(user?._id);

    const { register, handleSubmit, watch, formState: { errors }, setValue, reset, clearErrors, setError, getValues, trigger } = useForm({
        defaultValues: {
            title: "",
            discountType: "",
            regularPrice: "",
            discountValue: "",
            minimumPurchase: "",
            fixedprice: "",
            customerinputbox: "",
            description: "",
            couponCode: "",
            outlets: [],
            category: "",
            qr_code: "",
            upc_code: "",
            startDate: "",
            endDate: "",
            deletedImages: [],
            deletedHighlights: [],
            deletedTags: [],
        }
    });

    const watchRegularPrice = watch("regularPrice");
    const watchDiscountType = watch("discountType");
    const watchDiscountValue = watch("discountValue");
    const watchCouponCode = watch("couponCode");
    const watchQrCode = watch("qr_code");
    const watchUpcCode = watch("upc_code");
    const [editDeal, { isLoading, error, isSuccess, isError: updateError }] = useEditDealMutation();

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                navigate("/my-deals");
            }, 1000);
        }
    }, [navigate, isSuccess]);

    useEffect(() => {
        if (dealDetail?.data) {
            const { title, highlight, tags, description, regular_price, discount, discount_type, minimum_purchase, available_location, coupon, category, createdAt, promotedUntil, coupon_option, coupon_required, nationwide: dealNationwide } = dealDetail.data || {};
            const { qr, upc } = coupon_option || {};
            const formatDate = (date) => {
                if (!date) return "";
                return new Date(date).toISOString().split("T")[0];
            };

            // Pre-populate location state
            const locationIds = available_location?.map((outlet) => outlet?._id) || [];
            setSelectedLocations(locationIds);
            setNationwide(dealNationwide || false);

            reset({
                title: title || "",
                discountType: discount_type === "FREE" || discount_type === "NO_DISCOUNT" ? "PERCENT_OFF_PRICE" : discount_type,
                regularPrice: discount_type === "CUSTOM_DISCOUNT" ? (regular_price || "") : (regular_price || ""),
                discountValue: discount || "",
                minimumPurchase: minimum_purchase || "",
                fixedprice: discount_type === "FIXED_PRICE" ? (regular_price || "") : "",
                customerinputbox: dealDetail?.data?.custom_discount || "",
                description: description || "",
                couponCode: coupon || "",
                outlets: locationIds,
                category: category?._id,
                startDate: formatDate(createdAt),
                endDate: formatDate(promotedUntil),
                qr_code: null,
                upc_code: null,
            });
            setQrPreview(qr || "");
            setUpcPreview(upc || "");
            setInitialTags(tags || []);
            setInitialHighlights(highlight || []);
            // Restore active coupon field state
            if (coupon_required === false) {
                setActiveField("no_required");
                setOpenDropdown(true);
            } else if (coupon) {
                setActiveField("coupon");
                setOpenDropdown(true);
            } else if (qr) {
                setActiveField("qr");
                setOpenDropdown(true);
            } else if (upc) {
                setActiveField("upc");
                setOpenDropdown(true);
            }
        }
    }, [dealDetail, reset]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (hasCouponCodeValue({
            couponCode: watchCouponCode,
            qr_code: watchQrCode,
            upc_code: watchUpcCode,
        }, qrPreview, upcPreview)) {
            clearErrors("couponCodes");
        }
    }, [watchCouponCode, watchQrCode, watchUpcCode, qrPreview, upcPreview, clearErrors]);

    useEffect(() => {
        return () => { if (qrPreview) URL.revokeObjectURL(qrPreview); };
    }, [qrPreview]);

    useEffect(() => {
        return () => { if (upcPreview) URL.revokeObjectURL(upcPreview); };
    }, [upcPreview]);

    // Close location dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) {
                setLocationDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const allLocationIds = shopDetails?.data?.locations?.map((l) => l._id) || [];
    const allSelected = allLocationIds.length > 0 && allLocationIds.every((id) => selectedLocations.includes(id));

    const toggleSelectAll = () => {
        const next = allSelected ? [] : allLocationIds;
        setSelectedLocations(next);
        setValue("outlets", next);
        if (next.length > 0) clearErrors("outlets");
        else trigger("outlets");
    };

    const toggleLocation = (locationId) => {
        const next = selectedLocations.includes(locationId)
            ? selectedLocations.filter((l) => l !== locationId)
            : [...selectedLocations, locationId];
        setSelectedLocations(next);
        setValue("outlets", next);
        if (next.length > 0) clearErrors("outlets");
        else trigger("outlets");
    };

    const toggleNationwide = () => {
        const next = !nationwide;
        setNationwide(next);
        if (next) {
            clearErrors("outlets");
            setLocationDropdownOpen(false);
        }
    };

    const disabledPricingInputClasses = "disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400";

    // Computed final price based on discount type
    const reg = Number(watchRegularPrice) || 0;
    const disc = Number(watchDiscountValue) || 0;
    const computedFinalPrice = (() => {
        if (!watchDiscountType || reg <= 0) return null;
        if (watchDiscountType === "PERCENT_OFF_PRICE" || watchDiscountType === "PERCENT_OFF_TOTAL") {
            return Math.max(0, reg - (reg * disc) / 100);
        }
        if (watchDiscountType === "AMOUNT_OFF_PURCHASE") {
            return Math.max(0, reg - disc);
        }
        // if (watchDiscountType === "NO_DISCOUNT") return reg;
        // if (watchDiscountType === "FREE") return 0;
        // return null;
    })();

    if (dealDetailsLoading || shopLoading) {
        return <AddDealSkeleton />;
    }
    if (isError) {
        return <DealsNotFound />;
    }

    const validateCodeImages = async (data) => {
        clearErrors(["couponCodes", "qr_code", "upc_code"]);

        if (activeField === "no_required") return true;

        if (!hasCouponCodeValue(data, qrPreview, upcPreview)) {
            setOpenDropdown(true);
            setActiveField((cur) => cur || "coupon");
            setError("couponCodes", {
                type: "manual",
                message: "Enter a coupon code, upload a QR image, or upload a UPC image",
            });
            return false;
        }
        clearErrors(["couponCodes", "qr_code", "upc_code"]);
        return true;
    };

    const qrCodeInput = register("qr_code");
    const upcCodeInput = register("upc_code");

    const handleCodeFileChange = (event, setPreview, fieldName) => {
        const file = event.target.files?.[0];
        setPreview(file ? URL.createObjectURL(file) : "");
        if (file) {
            clearErrors([fieldName, "couponCodes"]);
            // A new file was chosen — clear the "remove" flag
            if (fieldName === "qr_code") setRemoveQr(false);
            if (fieldName === "upc_code") setRemoveUpc(false);
        }
    };

    const removeCodeFile = (fieldName, inputRef, setPreview) => {
        setValue(fieldName, null, { shouldValidate: true });
        setPreview("");
        clearErrors([fieldName, "couponCodes"]);
        if (inputRef.current) inputRef.current.value = "";
        // Mark as explicitly removed so the backend knows to clear it
        if (fieldName === "qr_code") setRemoveQr(true);
        if (fieldName === "upc_code") setRemoveUpc(true);
    };

    const onSubmit = async (data) => {
        const isCodeImagesValid = await validateCodeImages(data);
        if (!isCodeImagesValid) return;

        const couponCode = data?.couponCode?.trim();
        const qrCodeFile = data.qr_code?.[0];
        const upcCodeFile = data.upc_code?.[0];

        const submittedDiscount = Number(data?.discountValue) || 0;

        const updateDeal = {
            category: data?.category,
            title: data?.title,
            discount_type: data?.discountType,
            highlight: data?.highlights,
            deletedImages: data?.deletedImages,
            deletedHighlights: data?.deletedHighlights,
            tags: data?.tags,
            deletedTags: data?.deletedTags,
            description: data?.description,
            available_in_location: selectedLocations,
            nationwide: nationwide,
            coupon_required: activeField === "no_required" ? false : true,
            remove_qr: removeQr,
            remove_upc: removeUpc,
        };

        if (couponCode && activeField === "coupon") {
            updateDeal.coupon = data.couponCode;
        }

        if (data?.discountType === "PERCENT_OFF_PRICE") {
            updateDeal.regular_price = Number(data?.regularPrice);
            updateDeal.discount = submittedDiscount;
        }
        if (data?.discountType === "PERCENT_OFF_TOTAL") {
            updateDeal.discount = submittedDiscount;
        }

        if (data?.discountType === "FIXED_PRICE") {
            updateDeal.regular_price = Number(data?.fixedprice);
        }

        if (data?.discountType === "CUSTOM_DISCOUNT") {
            updateDeal.custom_discount = data?.customerinputbox;
            updateDeal.regular_price = 0;
        }

        const formData = new FormData();
        formData.append("data", JSON.stringify(updateDeal));
        imageFiles.forEach((file) => formData.append("files", file));

        if (qrCodeFile) {
            formData.append("qr", qrCodeFile);
        }
        // If no new file chosen but a server image exists (qrPreview is the URL),
        // do NOT append anything — the backend keeps the existing value.

        if (upcCodeFile) {
            formData.append("upc", upcCodeFile);
        }
        // Same for UPC — omit if no new file, backend retains the existing image.

        editDeal({ id, data: formData });
    };

    const onInvalid = () => {
        validateCodeImages(getValues());
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] px-4 pt-28 pb-12">
            <div className="max-w-305 mx-auto">
                <div className="mb-8 border-b border-slate-200 pb-6">
                    <h1 className="text-3xl font-bold tracking-normal text-[#262626] sm:text-[32px]">Update Your Ad</h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                        {/* Deal Info */}
                        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-xl font-bold text-primary">Ad Info</h2>
                            {/* Title */}
                            <div>
                                <label className="block text-base text-[#262626] font-medium mb-2">
                                    Ad Title
                                </label>
                                <input
                                    {...register("title", {
                                        required: "Ad title is required",
                                        validate: (value) =>
                                            value.trim().length >= 5 || "Ad Title must be minimum 5 characters",
                                    })}
                                    placeholder="Title"
                                    className={`w-full rounded-full border bg-white px-6 py-4 text-[#262626] outline-none transition-all focus:ring-4 focus:ring-primary/10 ${errors.title ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-primary"}`}
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Highlights */}
                            {/* <Highlights setValue={setValue} initialHighlights={initialHighlights} /> */}

                            {/* Tags */}
                            {/* <Tags setValue={setValue} initialTags={initialTags} /> */}

                            {/* Available Location */}
                            <div>
                                <div className="flex items-center justify-between mb-2 gap-3">
                                    <label className="block text-base text-[#262626] font-medium">
                                        Available Location
                                    </label>
                                    <div className="flex gap-5">
                                        <button
                                            type="button"
                                            onClick={toggleSelectAll}
                                            aria-label={allSelected ? "Deselect all locations" : "Select all locations"}
                                            className="flex items-center gap-2 group">
                                            <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                                                Selected All
                                            </span>
                                            <span
                                                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${allSelected ? "bg-primary" : "bg-slate-300"}`}>
                                                <span
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${allSelected ? "translate-x-5" : "translate-x-0"}`}
                                                />
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={toggleNationwide}
                                            aria-label={nationwide ? "Disable nationwide" : "Enable nationwide"}
                                            className="flex items-center gap-2 group">
                                            <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                                                Nationwide
                                            </span>
                                            <span
                                                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${nationwide ? "bg-primary" : "bg-slate-300"}`}>
                                                <span
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${nationwide ? "translate-x-5" : "translate-x-0"}`}
                                                />
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <input
                                    type="hidden"
                                    {...register("outlets", {
                                        validate: () => {
                                            if (nationwide) return true;
                                            if (selectedLocations.length === 0) return "Select at least one outlet or enable Nationwide";
                                            return true;
                                        },
                                    })}
                                />

                                <div
                                    ref={locationDropdownRef}
                                    className={`relative transition-opacity duration-200 ${nationwide ? "pointer-events-none opacity-40" : ""}`}>
                                    <button
                                        type="button"
                                        onClick={() => !nationwide && setLocationDropdownOpen((prev) => !prev)}
                                        className={`flex w-full items-center justify-between rounded-full border bg-white px-6 py-4 text-[#262626] transition-all focus:border-primary focus:ring-1 focus:ring-primary/20 ${!nationwide && errors.outlets ? "border-red-500" : "border-slate-300"}`}>
                                        <span className="text-[15px]">
                                            {selectedLocations.length === 0
                                                ? "Select locations…"
                                                : `${selectedLocations.length} location${selectedLocations.length > 1 ? "s" : ""} selected`}
                                        </span>
                                        <ChevronDown
                                            size={18}
                                            className={`text-slate-500 transition-transform duration-200 ${locationDropdownOpen ? "rotate-180" : ""}`}
                                        />
                                    </button>

                                    {locationDropdownOpen && !nationwide && (
                                        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                                            <div className="max-h-66 overflow-y-auto">
                                                {shopDetails?.data?.locations?.map((out, idx) => {
                                                    const checked = selectedLocations.includes(out._id);
                                                    return (
                                                        <button
                                                            key={out._id}
                                                            type="button"
                                                            onClick={() => toggleLocation(out._id)}
                                                            className={`flex w-full items-center justify-between px-5 py-3 text-sm font-medium transition-colors ${idx !== 0 ? "border-t border-slate-100" : ""} ${checked ? "bg-primary/5 text-primary" : "text-[#525252] hover:bg-slate-50"}`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <MapPin size={14} className={checked ? "text-primary" : "text-slate-400"} />
                                                                {out?.location_name || "Location Name"}
                                                            </span>
                                                            <span
                                                                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${checked ? "bg-primary" : "bg-slate-300"}`}
                                                            >
                                                                <span
                                                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`}
                                                                />
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {nationwide && (
                                    <p className="text-[15px] mt-3 text-black!">
                                        Selecting Nationwide makes your product available to buyers across the entire country
                                    </p>
                                )}

                                {!nationwide && errors.outlets && (
                                    <p className="text-red-500 text-sm mt-1">{errors.outlets.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Ad Pricing */}
                        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div>
                                <h2 className="text-xl font-bold text-primary">Ads Pricing</h2>
                                <p className="text-sm text-slate-400 mt-0.5">Select how the discount should be applied.</p>
                            </div>

                            {/* Discount Type dropdown */}
                            <div>
                                <label className="block text-base text-[#262626] font-medium mb-2">
                                    Discount type<span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        {...register("discountType", { required: "Discount type is required" })}
                                        className={`w-full appearance-none rounded-full border bg-white px-6 py-4 pr-12 text-[#262626] outline-none transition-all focus:ring-1 focus:ring-primary/10 ${errors.discountType ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-primary"}`}
                                    >
                                        <option value="">Select discount type</option>
                                        {discountTypeOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                                {errors.discountType && (
                                    <p className="text-red-500 text-sm mt-1">{errors.discountType.message}</p>
                                )}
                            </div>

                            {/* PERCENT_OFF_PRICE */}
                            {watchDiscountType === "PERCENT_OFF_PRICE" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#262626] mb-2">
                                            Regular Price<span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                            <input
                                                type="number" step="0.01" placeholder="Enter regular price" autoComplete="off"
                                                {...register("regularPrice", {
                                                    setValueAs: (v) => (v === "" ? "" : Number(v)),
                                                })}
                                                className={`w-full rounded-full border bg-white py-4 pl-10 pr-6 text-[#262626] outline-none transition-all focus:ring-1 focus:ring-primary/10 ${errors.regularPrice ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-primary"} ${disabledPricingInputClasses}`}
                                            />
                                        </div>
                                        {errors.regularPrice && <p className="text-red-500 text-sm mt-1">{errors.regularPrice.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#262626] mb-2">
                                            Discount Percentage<span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number" placeholder="Enter discount (0–100)" autoComplete="off"
                                                {...register("discountValue", {
                                                    setValueAs: (v) => (v === "" ? "" : Number(v)),
                                                })}
                                                className={`w-full rounded-full border bg-white px-6 py-4 pr-14 text-[#262626] outline-none transition-all focus:ring-1 focus:ring-primary/10 ${errors.discountValue ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-primary"}`}
                                            />
                                            <span className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                                        </div>
                                        {errors.discountValue && <p className="text-red-500 text-sm mt-1">{errors.discountValue.message}</p>}
                                    </div>

                                    {computedFinalPrice !== null && (
                                        <div className="rounded-xl border border-slate-300 bg-primary/5 px-6 py-4">
                                            <p className="text-[15px] font-medium text-slate-500 mb-0.5">Final price after discount</p>
                                            <p className="text-2xl font-bold text-primary">${computedFinalPrice.toFixed(2)}</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* PERCENT_OFF_TOTAL */}
                            {watchDiscountType === "PERCENT_OFF_TOTAL" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#262626] mb-2">
                                            Discount Percentage<span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number" placeholder="Enter discount (0–100)" autoComplete="off"
                                                {...register("discountValue", {
                                                    setValueAs: (v) => (v === "" ? "" : Number(v)),
                                                })}
                                                className={`w-full rounded-full border bg-white px-6 py-4 pr-14 text-[#262626] outline-none transition-all focus:ring-1 focus:ring-primary/10 ${errors.discountValue ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-primary"}`}
                                            />
                                            <span className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                                        </div>
                                        {errors.discountValue && <p className="text-red-500 text-sm mt-1">{errors.discountValue.message}</p>}
                                    </div>
                                </>
                            )}

                            {/* FIXED_PRICE */}
                            {watchDiscountType === "FIXED_PRICE" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#262626] mb-2">
                                            Fixed Price<span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                            <input
                                                type="number" step="0.01" placeholder="e.g. 75" autoComplete="off"
                                                {...register("fixedprice", {
                                                    setValueAs: (v) => (v === "" ? "" : Number(v)),
                                                })}
                                                className={`w-full rounded-full border bg-white py-4 pl-10 pr-6 text-[#262626] outline-none transition-all focus:ring-1 focus:ring-primary/10 ${errors.fixedprice ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-primary"}`}
                                            />
                                        </div>
                                        {errors.fixedprice && <p className="text-red-500 text-sm mt-1">{errors.fixedprice.message}</p>}
                                    </div>
                                </>
                            )}

                            {/* CUSTOM_DISCOUNT */}
                            {watchDiscountType === "CUSTOM_DISCOUNT" && (
                                <div>
                                    {/* <label className="block text-sm font-semibold text-[#262626] mb-2">
                                        Regular Price<span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                        <input
                                            type="number" step="0.01" placeholder="Enter regular price" autoComplete="off"
                                            {...register("regularPrice", {
                                                setValueAs: (v) => (v === "" ? "" : Number(v)),
                                            })}
                                            className={`w-full rounded-full border bg-white py-4 pl-10 pr-6 text-[#262626] outline-none transition-all focus:ring-1 focus:ring-primary/10 ${errors.regularPrice ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-primary"} ${disabledPricingInputClasses}`}
                                        />
                                    </div>
                                    {errors.regularPrice && <p className="text-red-500 text-sm mt-1">{errors.regularPrice.message}</p>} */}

                                    <label className="block text-sm font-semibold text-[#262626] mb-2 mt-5">
                                        Custom Discount<span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={5}
                                        placeholder="Describe custom discount"
                                        autoComplete="off"
                                        {...register("customerinputbox", {
                                            required: "Custom discount description is required!",
                                        })}
                                        className={`w-full rounded-lg border bg-white px-5 py-3 text-[#262626] outline-none transition-all focus:ring-1 focus:ring-primary/10 ${errors.customerinputbox ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-primary"} ${disabledPricingInputClasses}`}
                                    />
                                    {errors.customerinputbox && (
                                        <p className="text-red-500 text-sm mt-1">{errors.customerinputbox.message}</p>
                                    )}
                                </div>
                            )}

                            {/* NO_PRICE — no fields needed */}
                            {watchDiscountType === "NO_PRICE" && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-4">
                                    <p className="text-sm text-slate-500">No price will be shown for this ad.</p>
                                </div>
                            )}
                        </div>

                        {/* Deal Media */}
                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <UplodedImage
                                setImagesFiles={setImagesFiles}
                                getAllImages={dealDetail?.data?.images}
                                setValue={setValue}
                                className="w-full"
                            />
                        </div>

                        {/* Deal Details */}
                        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-xl font-bold text-primary">Ad Details</h2>
                            {/* Description */}
                            <div>
                                <label className="block text-base text-[#262626] font-medium mb-2">
                                    Description
                                </label>
                                <div className="relative">
                                    <textarea
                                        {...register("description", {
                                            required: "Description is required",
                                            validate: (value) =>
                                                value.trim().length >= 10 || "Description must be minimum 10 characters",
                                        })}
                                        placeholder="Enter Product Description"
                                        rows={6}
                                        className={`w-full resize-none rounded-lg border bg-white p-5 text-[#262626] outline-none transition-all focus:ring-4 focus:ring-primary/10 ${errors.description ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-primary"}`}
                                    />
                                </div>
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>

                            {/* Coupon, QR Code, UPC Code - Accordion */}
                            <div className={`overflow-hidden rounded-lg border bg-white ${errors.couponCodes ? "border-red-500" : "border-slate-300"}`}>
                                <button
                                    type="button"
                                    onClick={() => setOpenDropdown(prev => !prev)}
                                    className="flex w-full items-center justify-between px-6 py-4 text-base font-medium text-[#262626] transition-all hover:bg-slate-50">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <span>Coupon & Codes</span><span className="text-red-500">*</span>
                                        </div>
                                        {errors.couponCodes && (
                                            <p className="text-red-500 text-sm mt-1 font-normal">
                                                {errors.couponCodes.message}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        <ChevronDown className="cursor-pointer" />
                                    </span>
                                </button>
                                {openDropdown && (
                                    <div className="border-t border-gray-200">
                                        <div className="flex flex-wrap gap-3 bg-slate-50 px-6 py-3">
                                            {[
                                                { key: "coupon", label: "Coupon Code" },
                                                { key: "qr", label: "QR Code" },
                                                { key: "upc", label: "UPC Code" },
                                                { key: "no_required", label: "None Required" },
                                            ].map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => setActiveField(prev => prev === item.key ? null : item.key)}
                                                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${activeField === item.key
                                                        ? "border-primary bg-primary text-white shadow-sm"
                                                        : "border-slate-300 bg-white text-[#262626] hover:border-primary hover:bg-primary/5"
                                                        }`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Coupon Code Field */}
                                        {activeField === "coupon" && (
                                            <div className="border-t border-gray-100 px-6 py-4">
                                                <label className="block text-base text-[#262626] font-medium mb-2">
                                                    Coupon Code
                                                </label>
                                                <input
                                                    {...register("couponCode")}
                                                    placeholder="ABCD456"
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-6 py-4 text-[#262626] outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/10"
                                                />
                                            </div>
                                        )}

                                        {/* QR Code Field */}
                                        {activeField === "qr" && (
                                            <div className="border-t border-gray-100 px-6 py-4">
                                                <label className="block text-base text-[#262626] font-medium mb-2">
                                                    QR Code
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    {...qrCodeInput}
                                                    ref={(element) => {
                                                        qrCodeInput.ref(element);
                                                        qrInputRef.current = element;
                                                    }}
                                                    onChange={(event) => {
                                                        qrCodeInput.onChange(event);
                                                        handleCodeFileChange(event, setQrPreview, "qr_code");
                                                    }}
                                                    className={`w-full rounded-lg border bg-white px-3 py-2 text-[#262626] outline-none transition-all file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white focus:ring-1 ${errors.qr_code ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-primary focus:ring-primary/10"}`}
                                                />
                                                {errors.qr_code && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.qr_code.message}</p>
                                                )}
                                                {qrPreview && (
                                                    <div className="mt-3 w-fit rounded-lg border border-slate-200 bg-slate-50 p-2">
                                                        <div className="relative h-28 w-40 overflow-hidden rounded-md bg-white">
                                                            <img src={qrPreview} alt="QR Preview" className="h-full w-full object-contain" />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeCodeFile("qr_code", qrInputRef, setQrPreview)}
                                                                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white shadow-sm transition-all hover:bg-red-600 active:scale-90"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* UPC Code Field */}
                                        {activeField === "upc" && (
                                            <div className="border-t border-gray-100 px-6 py-4">
                                                <label className="block text-base text-[#262626] font-medium mb-2">
                                                    UPC Code
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    {...upcCodeInput}
                                                    ref={(element) => {
                                                        upcCodeInput.ref(element);
                                                        upcInputRef.current = element;
                                                    }}
                                                    onChange={(event) => {
                                                        upcCodeInput.onChange(event);
                                                        handleCodeFileChange(event, setUpcPreview, "upc_code");
                                                    }}
                                                    className={`w-full rounded-lg border bg-white px-3 py-2 text-[#262626] outline-none transition-all file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white focus:ring-1 ${errors.upc_code ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-primary focus:ring-primary/10"}`}
                                                />
                                                {errors.upc_code && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.upc_code.message}</p>
                                                )}
                                                {upcPreview && (
                                                    <div className="mt-3 w-fit rounded-lg border border-slate-200 bg-slate-50 p-2">
                                                        <div className="relative h-28 w-48 overflow-hidden rounded-md bg-white">
                                                            <img src={upcPreview} alt="UPC Preview" className="h-full w-full object-contain" />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeCodeFile("upc_code", upcInputRef, setUpcPreview)}
                                                                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white shadow-sm transition-all hover:bg-red-600 active:scale-90"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* No Required */}
                                        {activeField === "no_required" && (
                                            <div className="border-t border-gray-100 px-6 py-4">
                                                <p className="text-sm text-slate-500">No coupon code required for this ad.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {updateError && <div className="">
                        <p className="text-red-600">{error?.data?.message}</p>
                    </div>}

                    {/* Submit */}
                    <div className="flex justify-center border-t border-slate-200 pt-6">
                        <button
                            type="submit"
                            disabled={isLoading || isSuccess}
                            className={`flex min-w-60 cursor-pointer items-center justify-center gap-2 rounded-full px-12 py-3.5 text-lg font-bold text-white shadow-xl transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${isSuccess
                                ? 'bg-green-600 shadow-green-600/20'
                                : 'bg-primary hover:bg-secondary shadow-[#4BBDCF]/20'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
                                    <span>Updating...</span>
                                </>
                            ) : isSuccess ? (
                                <>
                                    <CircleCheckBig size={20} className="shrink-0" />
                                    <span>Updated!</span>
                                </>
                            ) : (
                                <span>Update Ad</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default VendorEditDeal;