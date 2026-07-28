/* eslint-disable no-unused-vars */
import {
    ArrowLeft,
    BadgePercent,
    CalendarDays,
    Eye,
    Globe,
    Image as ImageIcon,
    MapPin,
    Tag,
    TrendingUp,
    Zap,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useGetDealAnalyticsQuery } from "../../../../features/deal/dealApi";
import { useEffect } from "react";

const demoAnalytics = {
    _id: "6a45fd1075c5fdece4c0138f",
    shop: "69fecf727c714c0d8c6bf4f6",
    user: "69febe6b75028d4733251be4",
    category: "6a0ae1c5611c06309563588e",
    activePromotion: "6a45fd1775c5fdece4c0139c",
    title: "12 inch Pizza with 10% off",
    regular_price: 70,
    discount: 10,
    discount_type: "PERCENT_OFF_PRICE",
    highlight: ["pizza", "discount"],
    tags: ["pizza"],
    description: "Pizza discount for our pizza shop",
    images: [
        "https://res.cloudinary.com/dhk0b7qs5/image/upload/v1782971661/deals/files/k2axh4lo8jk1myiek8is.jpg",
    ],
    nationwide: false,
    available_in_location: ["6a20fd24c627b2d5225d6e71"],
    isPromoted: true,
    promotedUntil: "2026-08-01T05:54:40.785Z",
    coupon_required: false,
    isBanned: false,
    createdAt: "2026-07-02T05:54:24.086Z",
    updatedAt: "2026-07-02T08:46:37.785Z",
    __v: 0,
    totalViews: 7,
    totalImpression: 9,
};

// Animated progress bar — width driven by percentage
const ProgressBar = ({ value, max, color }) => {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
                className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
            />
        </div>
    );
};

const StatCard = ({ icon: Icon, iconBg, label, value, sub }) => (
    <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${iconBg}`}>
            <Icon size={20} />
        </div>
        <div className="min-w-0">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="mt-0.5 text-2xl sm:text-3xl font-bold text-[#262626]">{value}</p>
            {sub && <p className="mt-0.5 truncate text-sm text-gray-400">{sub}</p>}
        </div>
    </div>
);

const InfoRow = ({ icon: Icon, label, value, accent }) => (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-2 text-sm text-gray-500">
            <Icon size={14} className="shrink-0 text-gray-400" />
            {label}
        </div>
        <span className={`text-sm font-semibold ${accent ?? "text-[#262626]"}`}>{value}</span>
    </div>
);

const DealAnalyticsDemo = () => {
    const { id } = useParams();
    const { data, isLoading, isError } = useGetDealAnalyticsQuery({ id }, { skip: !id });

    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);

    const apiDeal = data?.data;
    const deal = apiDeal ?? { ...demoAnalytics, _id: id || demoAnalytics._id };

    const finalPrice =
        deal.regular_price
            ? deal.regular_price - (deal.regular_price * (deal.discount ?? 0)) / 100
            : 0;
    const maxMetric = Math.max(deal.totalViews ?? 0, deal.totalImpression ?? 0, 1);

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#f8fcfd] px-4 pt-28 pb-10">
                <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm font-semibold text-gray-600">Loading analytics...</span>
                </div>
            </div>
        );
    }

    if (isError && !apiDeal) {
        return (
            <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-[#f8fcfd] px-4 pt-44 pb-10">
                <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 shadow-sm text-sm font-semibold text-red-600">
                    Unable to load analytics for this deal.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-10rem)] bg-[#f8fcfd] px-4 pt-28 pb-12 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-305 space-y-6">

                {/* Back link */}
                <Link
                    to="/my-deals"
                    className="inline-flex items-center gap-2 text-base mt-2 font-semibold text-primary transition-colors hover:text-secondary"
                >
                    <ArrowLeft size={18} />
                    Back to Ads
                </Link>

                {/* ── Main grid ── */}
                <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">

                    {/* LEFT COLUMN */}
                    <div className="space-y-5">

                        {/* Deal hero card */}
                        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
                            {/* Cover image */}
                            <div className="relative h-52 w-full overflow-hidden bg-gray-100 sm:h-64">
                                {deal.images?.[0] ? (
                                    <img
                                        src={deal.images[0]}
                                        alt={deal.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                {/* Overlay badges */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                                <div className="absolute bottom-3 left-4 flex flex-wrap gap-2">
                                    {deal.isPromoted && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow">
                                            <Zap size={11} /> Promoted
                                        </span>
                                    )}
                                    {deal.isBanned && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow">
                                            Banned
                                        </span>
                                    )}
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className="inline-flex rounded-full bg-[#E8F8FB] px-3 py-1 text-xs font-bold text-primary shadow">
                                        Deal Analytics
                                    </span>
                                </div>
                            </div>

                            {/* Deal info */}
                            <div className="p-5 sm:p-6">
                                <h2 className="text-2xl font-bold text-[#262626] sm:text-3xl leading-tight">
                                    {deal.title}
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-gray-500 sm:text-base">
                                    {deal.description}
                                </p>

                                {/* Tags */}
                                {deal.tags?.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {deal.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600"
                                            >
                                                <Tag size={11} />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stat cards */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <StatCard
                                icon={BadgePercent}
                                iconBg="bg-emerald-50 text-emerald-600"
                                label="Deal Price"
                                value={`$${finalPrice.toFixed(2)}`}
                                sub={`Regular $${deal.regular_price} · ${deal.discount}% off`}
                            />
                            <StatCard
                                icon={Eye}
                                iconBg="bg-[#E8F8FB] text-primary"
                                label="Total Views"
                                value={deal.totalViews ?? 0}
                                sub="Engagement reach"
                            />
                            <StatCard
                                icon={TrendingUp}
                                iconBg="bg-violet-50 text-violet-600"
                                label="Impressions"
                                value={deal.totalImpression ?? 0}
                                sub="Exposure count"
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-5">

                        {/* Analytics overview card */}
                        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-[#262626]">Analytics Overview</h3>
                                    <p className="text-sm text-gray-400">Live metrics for this deal</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F8FB] text-primary">
                                    <TrendingUp size={18} />
                                </div>
                            </div>

                            {/* Metric bars */}
                            <div className="mt-5 space-y-4">
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">Views</span>
                                        <span className="text-sm font-bold text-[#262626]">{deal.totalViews ?? 0}</span>
                                    </div>
                                    <ProgressBar value={deal.totalViews ?? 0} max={maxMetric} color="#008A24" />
                                </div>
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">Impressions</span>
                                        <span className="text-sm font-bold text-[#262626]">{deal.totalImpression ?? 0}</span>
                                    </div>
                                    <ProgressBar value={deal.totalImpression ?? 0} max={maxMetric} color="#4BBDCF" />
                                </div>
                            </div>
                        </div>

                        {/* Performance summary card */}
                        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-1 flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8F8FB] text-primary">
                                    <Eye size={14} />
                                </div>
                                <h4 className="font-bold text-[#262626]">Performance Summary</h4>
                            </div>
                            <p className="mb-4 text-xs text-gray-400">Key details about this deal</p>

                            <InfoRow
                                icon={Zap}
                                label="Promotion status"
                                value={deal.isPromoted ? "Active" : "Inactive"}
                                accent={deal.isPromoted ? "text-emerald-600" : "text-gray-400"}
                            />
                            <InfoRow
                                icon={BadgePercent}
                                label="Discount type"
                                value={deal.discount_type?.replace(/_/g, " ")}
                            />
                            <InfoRow
                                icon={Globe}
                                label="Nationwide"
                                value={deal.nationwide ? "Yes" : "No"}
                            />
                            <InfoRow
                                icon={Tag}
                                label="Coupon required"
                                value={deal.coupon_required ? "Yes" : "No"}
                            />
                            <InfoRow
                                icon={MapPin}
                                label="Locations"
                                value={
                                    deal.nationwide
                                        ? "All locations"
                                        : `${deal.available_in_location?.length ?? 0} location(s)`
                                }
                            />
                            <InfoRow
                                icon={CalendarDays}
                                label="Created on"
                                value={new Date(deal.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            />
                            {deal.promotedUntil && (
                                <InfoRow
                                    icon={CalendarDays}
                                    label="Promoted until"
                                    value={new Date(deal.promotedUntil).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                    accent="text-primary"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealAnalyticsDemo;
