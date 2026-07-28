import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ totalItems, currentPage, totalPages, onPageChange, indexOfLast }) => {

    return (
        <div className="mt-4 flex w-full flex-col gap-3 px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="whitespace-nowrap text-base font-medium text-primary">
                Showing{" "}
                <span className="text-gray-500 font-bold">{indexOfLast}</span>{" "}
                of{" "}
                <span className="text-gray-500 font-bold">{totalItems}</span>{" "}
                entries
            </div>

            <div className="flex w-full max-w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:justify-end sm:overflow-visible sm:pb-0">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    name="prev"
                    disabled={currentPage === 1}
                    className="shrink-0 p-2 rounded-md bg-primary text-white hover:bg-secondary disabled:opacity-30 transition-all border border-slate-700"
                >
                    <ChevronLeft size={18} />
                </button>
                <div className="flex shrink-0 gap-1">
                    {Array.from({ length: totalPages }, (_, i) => {
                        const page = i + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-9 h-9 rounded-md text-sm font-bold transition-all border ${currentPage === page
                                        ? "bg-primary text-white border-[#00B8DB]"
                                        : "text-gray-500 hover:text-white border-gray-400 hover:bg-secondary"
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    name="next"
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="shrink-0 p-2 rounded-md bg-primary text-white hover:bg-secondary disabled:opacity-30 transition-all border border-slate-700"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
