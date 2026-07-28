import { useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import {
    useGetVendorsStatQuery,
    useExportVendorsMutation,
    useLazyGetVendorExportStatusQuery,
} from "../../../../features/dashboard/dashboardHome";
import { useShopApprovedEditMutation } from "../../../../features/shop/shopApi";
import HeadingTitle from "../components/HeadingTitle";
import StatsCard from "./components/StatsCard";
import Header from "./components/Header";
import Table from "./components/Table";
import VendorManagementSkeleton from "../../../../components/skeleton/dashboard/VendorManagementSkeleton";
import Pagination from "./components/Pagination";
import { AlertCircle, CheckCircle2, Store } from "lucide-react";
import { useGsapAnimations } from "../../../../hooks/useGsapAnimations";

const Verndors = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortFilter, setSortFilter] = useState("New to Old");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [isSortFilterOpen, setIsSortFilterOpen] = useState(false);
    const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [exportStatus, setExportStatus] = useState("idle");
    const [exportProgress, setExportProgress] = useState(0);
    const [exportMessage, setExportMessage] = useState("");
    const filtersRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filtersRef.current && !filtersRef.current.contains(event.target)) {
                setIsSortFilterOpen(false);
                setIsStatusFilterOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const [page, setPage] = useState(1);
    const [statusOverrides, setStatusOverrides] = useState({});
    const pageSize = 10;
    const shouldUseClientStatusFilter = statusFilter !== "ALL";
    const [shopApprovedEdit, { isLoading: isStatusUpdating }] = useShopApprovedEditMutation();
    const [exportVendors] = useExportVendorsMutation();
    const [triggerGetVendorExportStatus] = useLazyGetVendorExportStatusQuery();
    const API_BASE_URL = import.meta.env.VITE_BASE_URL?.replace(/\/$/, "") || "";

    const getDownloadUrl = (downloadPath) => {
        if (!downloadPath) return "";
        if (downloadPath.startsWith("http://") || downloadPath.startsWith("https://")) {
            return downloadPath;
        }

        const normalizedBase = API_BASE_URL.replace(/\/$/, "");
        let normalizedPath = downloadPath;

        if (normalizedBase.endsWith("/api/v1") && normalizedPath.startsWith("/api/v1")) {
            normalizedPath = normalizedPath.replace(/^\/api\/v1/, "");
        }
        if (!normalizedPath.startsWith("/")) {
            normalizedPath = `/${normalizedPath}`;
        }

        return `${normalizedBase}${normalizedPath}`;
    };

    const downloadWorkbook = async (downloadUrl) => {
        const token = Cookies.get("accessToken");
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(downloadUrl, {
            method: "GET",
            headers,
            credentials: "include",
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "");
            let message = `Download failed (${response.status})`;
            try {
                const json = JSON.parse(errorBody);
                message = json.message || message;
            } catch {
                if (errorBody) message = errorBody;
            }
            throw new Error(message);
        }

        const blob = await response.blob();
        const disposition = response.headers.get("content-disposition") || "";
        const matchedName = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
        const fileName = matchedName
            ? decodeURIComponent(matchedName[1].replace(/"/g, ""))
            : "vendors.xlsx";

        return { blob, fileName };
    };

    const { data: vendorDetails, isLoading } = useGetVendorsStatQuery({
        sort: sortFilter,
        searchTerm: debouncedSearchTerm,
        page: shouldUseClientStatusFilter ? 1 : page,
        limit: shouldUseClientStatusFilter ? 1000 : pageSize,
    });
    const animationScopeRef = useGsapAnimations(`vendors-${page}-${vendorDetails?.data?.vendors?.length ?? 0}`);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const vendors = useMemo(
        () =>
            (vendorDetails?.data?.vendors ?? []).map((vendor) => ({
                ...vendor,
                shop_approval: statusOverrides[vendor?._id] || vendor?.shop_approval,
            })),
        [statusOverrides, vendorDetails?.data?.vendors]
    );

    const filteredVendors = useMemo(() => {
        if (!shouldUseClientStatusFilter) {
            return vendors;
        }

        return vendors.filter(
            (vendor) => (vendor?.shop_approval ?? "").toUpperCase() === statusFilter
        );
    }, [shouldUseClientStatusFilter, statusFilter, vendors]);

    const totalItems = shouldUseClientStatusFilter
        ? filteredVendors.length
        : vendorDetails?.data?.summery?.totalVendors || 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(page, totalPages);

    const displayedVendors = useMemo(() => {
        if (!shouldUseClientStatusFilter) {
            return filteredVendors;
        }

        const startIndex = (currentPage - 1) * pageSize;
        return filteredVendors.slice(startIndex, startIndex + pageSize);
    }, [currentPage, filteredVendors, shouldUseClientStatusFilter]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleSearchTermChange = (value) => {
        setSearchTerm(value);
        setPage(1);
    };

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
        setPage(1);
    };

    const handleSortFilterChange = (value) => {
        setSortFilter(value);
        setPage(1);
    };

    const pollExport = async (jobId) => {
        while (true) {
            const statusResult = await triggerGetVendorExportStatus(jobId);
            if (statusResult.error) {
                const errorMessage = statusResult.error?.data?.message || statusResult.error?.error || "Vendor export status failed";
                throw new Error(errorMessage);
            }

            const job = statusResult.data?.data;
            const progress = Number(job?.progress ?? 0);

            setExportProgress(progress);
            setExportMessage(`Export ${job?.status || "queued"} — ${progress}%`);

            if (job?.status === "completed") {
                const downloadPath = job.downloadUrl || `/dashboard/export_vendors/${job.jobId}/download`;
                const downloadUrl = getDownloadUrl(downloadPath);
                const { blob, fileName } = await downloadWorkbook(downloadUrl);

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

                setExportProgress(100);
                setExportStatus("completed");
                setExportMessage(`Downloaded ${job?.rowCount ?? filteredVendors.length} vendor rows.`);
                return;
            }

            if (job?.status === "failed") {
                throw new Error(job?.error || "Vendor export failed");
            }

            await new Promise((resolve) => setTimeout(resolve, 1500));
        }
    };

    const handleExport = async (type) => {
        if (exportStatus === "running") return;
        if (filteredVendors.length === 0) {
            return;
        }

        setExportStatus("running");
        setExportProgress(5);
        setExportMessage("Queueing vendor export...");

        try {
            const exportResult = await exportVendors().unwrap();
            const jobId = exportResult?.data?.jobId || exportResult?.data?.data?.jobId;

            if (!jobId) {
                throw new Error("Export job could not be queued.");
            }

            setExportMessage(`Export queued. Job ${jobId}.`);
            await pollExport(jobId, type);

            setTimeout(() => {
                setExportStatus("idle");
                setExportProgress(0);
                setExportMessage("");
            }, 2000);
        } catch (error) {
            console.log(error?.data?.message || error?.message || "Export failed");
            setExportStatus("idle");
            setExportProgress(0);
            setExportMessage("");
        }
    };

    const handleStatusChange = async (id, status) => {
        setIsSortFilterOpen(false);
        setIsStatusFilterOpen(false);
        const previousStatus = vendors.find((vendor) => vendor?._id === id)?.shop_approval;

        setStatusOverrides((currentStatuses) => ({
            ...currentStatuses,
            [id]: status,
        }));

        try {
            await shopApprovedEdit({
                id: id,
                data: { shop_approval: status },
            }).unwrap();
        } catch (error) {
            setStatusOverrides((currentStatuses) => ({
                ...currentStatuses,
                [id]: previousStatus,
            }));
            console.log(error?.data?.message || "Status update failed!");
        }
    };

    if (isLoading) {
        return <VendorManagementSkeleton />;
    }

    const { totalActiveVendors, totalPendingVendors, totalVendors } = vendorDetails?.data?.summery || {};

    return (
        <div ref={animationScopeRef} className="min-h-screen pt-3 pb-5" data-animate="dashboard">
            <HeadingTitle
                title="Vendor Management"
                description="Manage Vendor accounts and applications"
            />

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5" data-animate="stagger">
                <StatsCard
                    bgColor="bg-[#FFFFFF]"
                    color="text-[#262626]"
                    subtitleColor="text-[#34C759]"
                    titleText="Total Vendors"
                    value={totalVendors}
                    iconBg="bg-[#F0F9FF]"
                    iconColor="text-[#A8EBF7]"
                    Icon={Store}
                />
                <StatsCard
                    bgColor="bg-[#FFFFFF]"
                    color="text-[#262626]"
                    subtitleColor="text-[#34C759]"
                    titleText="Active Vendors"
                    value={totalActiveVendors}
                    iconBg="bg-[#F0FDF4]"
                    iconColor="text-[#22C55E]"
                    Icon={CheckCircle2}
                />
                <StatsCard
                    bgColor="bg-[#FFFFFF]"
                    color="text-[#262626]"
                    subtitleColor="text-[#34C759]"
                    titleText="Pending Approval"
                    value={totalPendingVendors}
                    iconBg="bg-[#FFFAE8]"
                    iconColor="text-[#F0C106]"
                    Icon={AlertCircle}
                />
            </div>

            <div className="text-slate-700 pt-10" data-animate="fade-up">
                <div className="bg-white rounded-lg overflow-hidden">
                    <Header
                        filterRef={filtersRef}
                        setSearchTerm={handleSearchTermChange}
                        sortFilter={sortFilter}
                        setSortFilter={handleSortFilterChange}
                        isSortFilterOpen={isSortFilterOpen}
                        setIsSortFilterOpen={setIsSortFilterOpen}
                        statusFilter={statusFilter}
                        setStatusFilter={handleStatusFilterChange}
                        isStatusFilterOpen={isStatusFilterOpen}
                        setIsStatusFilterOpen={setIsStatusFilterOpen}
                        exportStatus={exportStatus}
                        exportProgress={exportProgress}
                        exportMessage={exportMessage}
                        onExport={handleExport}
                    />
                    <Table
                        vendorData={displayedVendors}
                        handleStatusChange={handleStatusChange}
                        isStatusUpdating={isStatusUpdating}
                    />

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        handlePageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default Verndors;

