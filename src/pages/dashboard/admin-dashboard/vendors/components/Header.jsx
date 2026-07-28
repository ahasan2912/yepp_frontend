import { ArrowUpDown, ChevronDown, Filter, Search } from "lucide-react";

const sortOptions = [
    { label: "New to Old", value: "New to Old" },
    { label: "Old to New", value: "Old to New" },
];

const statusOptions = [
    { label: "All Status", value: "ALL" },
    { label: "Approved", value: "APPROVED" },
    { label: "Pending", value: "PENDING" },
    { label: "Rejected", value: "REJECTED" },
];

const Header = ({
    filterRef,
    setSearchTerm,
    sortFilter,
    setSortFilter,
    isSortFilterOpen,
    setIsSortFilterOpen,
    statusFilter,
    setStatusFilter,
    isStatusFilterOpen,
    setIsStatusFilterOpen,
    exportStatus,
    exportProgress,
    exportMessage,
    onExport,
}) => {
    const selectedStatus =
        statusOptions.find((option) => option.value === statusFilter)?.label || "All Status";

    return (
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-lg font-bold text-[#262626]">Vendor List</h1>
                <p className="text-sm text-[#737373] font-medium">
                    Search, filter and manage all vendor
                </p>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto" ref={filterRef}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search vendor"
                            className="pl-10 pr-4 py-2.5 border border-[#A3A3A3] rounded-lg outline-none w-64 text-sm"
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                            }}
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => {
                                setIsSortFilterOpen(!isSortFilterOpen);
                                setIsStatusFilterOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 border border-[#A3A3A3] rounded-lg text-sm font-medium transition-all"
                        >
                            <ArrowUpDown className="w-4 h-4 text-gray-400" />
                            {sortFilter}
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {isSortFilterOpen && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSortFilter(option.value);
                                            setIsSortFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                            sortFilter === option.value
                                                ? "bg-green-50 text-primary font-semibold"
                                                : "hover:bg-gray-50 text-[#262626]"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => {
                                setIsStatusFilterOpen(!isStatusFilterOpen);
                                setIsSortFilterOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 border border-[#A3A3A3] rounded-lg text-sm font-medium transition-all"
                        >
                            <Filter className="w-4 h-4 text-gray-400" />
                            {selectedStatus}
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {isStatusFilterOpen && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setStatusFilter(option.value);
                                            setIsStatusFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                            statusFilter === option.value
                                                ? "bg-green-50 text-primary font-semibold"
                                                : "hover:bg-gray-50 text-[#262626]"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-auto">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                            onClick={() => onExport("excel")}
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-secondary disabled:opacity-70"
                            disabled={exportStatus === "running"}
                        >
                            Export Excel
                        </button>
                    </div>
                </div>
            </div>

            {exportStatus !== "idle" && (
                <div className="fixed left-1/2 top-4 z-50 w-[min(92%,420px)] -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl shadow-slate-900/10 backdrop-blur">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-900">
                            {exportMessage ||
                                (exportStatus === "running"
                                    ? `Preparing download... ${exportProgress}%`
                                    : "Export complete.")}
                        </p>
                        <span className="text-xs text-slate-500">
                            {exportStatus === "running" ? `${exportProgress}%` : "Done"}
                        </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${exportProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
