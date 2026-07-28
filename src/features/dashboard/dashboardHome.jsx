import apiSlice from "../api/apiSlice";

export const dashboardHome = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAnalytics: builder.query({
            query: () => ({
                url: "/dashboard/dashboard_analytics_total",
                method: "GET",
                credentials: "include",
            }),
        }),

        getVendorsStat: builder.query({
            query: ({
                sort = "New to Old",
                searchTerm = "",
                page = 1,
                limit = 10,
                shopApproval = "",
            } = {}) => {
                const params = new URLSearchParams();
                if (searchTerm.trim()) {
                    params.append("searchTerm", searchTerm);
                }
                if (shopApproval && shopApproval !== "ALL") {
                    params.append("shop_approval", shopApproval);
                }
                params.append(
                    "sort",
                    sort === "Old to New" ? "createdAt" : "-createdAt"
                );

                params.append("page", page);
                params.append("limit", limit);

                return {
                    url: `/dashboard/vendor_stats?${params.toString()}`,
                    method: "GET",
                    credentials: "include",
                };
            },
            providesTags: ["Shops"],
        }),
        exportVendors: builder.mutation({
            query: () => ({
                url: `/dashboard/export_vendors`,
                method: "POST",
                credentials: "include",
            }),
        }),
        getVendorExportStatus: builder.query({
            query: (jobId) => ({
                url: `/dashboard/export_vendors/${jobId}/status`,
                method: "GET",
                credentials: "include",
            }),
        }),
        downloadVendorExport: builder.query({
            query: (jobId) => ({
                url: `/dashboard/export_vendors/${jobId}/download`,
                method: "GET",
                credentials: "include",
                responseHandler: "blob",
                headers: {
                    Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream, */*",
                },
            }),
        }),
        getDealStat: builder.query({
            query: () => ({
                url: "/dashboard/dashboard_analytics_total",
                method: "GET",
                credentials: "include",
            }),
        }),
        getRevenueTrendChart: builder.query({
            query: () => ({
                url: `/dashboard/last_one_year_revenue_trend`,
                method: "GET",
                credentials: "include",
            }),
        }),
        getDealCategoriesPieChart: builder.query({
            query: () => ({
                url: "/dashboard/deals_by_category_stats",
                method: "GET",
                credentials: "include",
            }),
        }),
        getRecentDealsList: builder.query({
            query: () => ({
                url: "/dashboard/recent_deals?limit=7",
                method: "GET",
                credentials: "include",
            }),
        }),
        getDealsStat: builder.query({
            query: ({
                sort = "New to Old",
                searchTerm = "",
                page = 1,
                limit = 10,
            } = {}) => {
                const params = new URLSearchParams();
                if (searchTerm.trim()) {
                    params.append("searchTerm", searchTerm);
                }
                params.append(
                    "sortBy",
                    sort === "Old to New" ? "createdAt" : "-createdAt"
                );
                params.append("page", page);
                params.append("limit", limit);

                return {
                    url: `/dashboard/deals_stats?${params.toString()}`,
                    method: "GET",
                    credentials: "include",
                };
            },
            providesTags: ["Deals"],
        }),
    }),
});

export const {
    useGetAnalyticsQuery,
    useGetVendorsStatQuery,
    useExportVendorsMutation,
    useLazyGetVendorExportStatusQuery,
    useLazyDownloadVendorExportQuery,
    useGetDealStatQuery,
    useGetRevenueTrendChartQuery,
    useGetDealCategoriesPieChartQuery,
    useGetRecentDealsListQuery,
    useGetDealsStatQuery,
} = dashboardHome;
