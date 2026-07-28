import { useHandleCurrentLoggedInUserQuery } from "../../../features/auth/authApi";
import VendorProfileSkeleton from "../../../components/skeleton/VendorProfileSkeleton";
import ProfileDetails from "./ProfileDetails";
import PasswordChange from "./PasswordChange";
import { Link } from "react-router-dom";
import { Eye, SquarePen } from "lucide-react";
import { useState } from "react";

const VendorProfile = () => {
    const [setActiveTab] = useState('profile-details');
    const { data: currentVendor, isLoading } = useHandleCurrentLoggedInUserQuery();
    if (isLoading) {
        return <VendorProfileSkeleton />
    }
    const { email, isVerified, user_name, _id } = currentVendor?.data || {};
    const shortName = user_name
        .split(" ")
        .map(word => word[0])
        .join("");
    return (
        <div className="bg-white min-h-[70vh] px-4 pt-32 pb-12">
            <div className="max-w-305 mx-auto space-y-6">
                <div className="bg-white px-8 py-10 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-center md:justify-between gap-2">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden ring-4 ring-[#28B8D7]/20">
                                    <div className="w-full h-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
                                        {shortName}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="text-center md:text-left space-y-3">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <h1 className="text-3xl font-extrabold text-slate-900">{user_name}</h1>
                                        <span className={`flex items-center gap-1 text-sm font-bold  px-4 py-1 rounded-full border border-[#28B8D7]/20 ${isVerified ? 'text-primary bg-[#28B8D7]/10' : 'text-[#d7c528] bg-amber-100'}`}>
                                            {isVerified ? 'VERIFIED' : 'NOT VERIFIED'}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 font-medium">{email}</p>
                                </div>
                                <div className="w-full md:hidden mt-5 flex flex-col items-center">
                                    <Link to={`/show-outlet/${_id}`} className="w-full ">
                                        <button className="mt-1 flex gap-1 items-center justify-center bg-primary text-white w-full px-10 py-2.5 rounded-full text-base font-medium hover:bg-secondary transition cursor-pointer">
                                            <Eye size={20} />Edit Location
                                        </button>
                                    </Link>
                                    <Link to={`/verdor-edit-shop/${_id}`} className="w-full flex">
                                        <button className="mt-2 flex items-center justify-center gap-1 bg-primary text-white w-full px-10 py-2.5 rounded-full text-base font-medium hover:bg-secondary transition cursor-pointer">
                                            <SquarePen size={20} /> Update Shop
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <Link to={`/show-outlet/${_id}`}>
                                <button className="mt-1 flex items-center bg-primary text-white w-full px-10 py-2.5 rounded-full text-base gap-1 font-medium hover:bg-secondary transition cursor-pointer">
                                    <Eye size={20} /> Edit Location
                                </button>
                            </Link>
                            <Link to={`/verdor-edit-shop/${_id}`}>
                                <button className="mt-2 flex items-center gap-1 bg-primary text-white w-full px-10 py-2.5 rounded-full text-base font-medium hover:bg-secondary transition cursor-pointer">
                                    <SquarePen size={20} /> Update shop
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
                <PasswordChange setActiveTab={setActiveTab} />
            </div>
        </div>
    );
};

export default VendorProfile;