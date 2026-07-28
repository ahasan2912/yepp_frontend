import apiSlice from "../api/apiSlice";


export const dealApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createNewDeal: builder.mutation({
            query: (data) => ({
                url: "/service",
                headers: {
                    "Content-Type": "application/formdata"
                },
                method: "POST",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ["Deals"],
        }),
        getAllDeal: builder.query({
            query: ({
                longitude,
                latitude,
                page = 1,
                limit = 15,
                locationMode,
                city,
                state,
                country,
                radiusKm = 100,
            }) => {
                const params = new URLSearchParams({
                    locationMode,
                    page: String(page),
                    limit: String(limit),
                });

                if (locationMode === "CURRENT_LOCATION") {
                    params.append("lat", latitude);
                    params.append("lng", longitude);
                    params.append("radiusKm", radiusKm);
                }

                if (locationMode === "SELECTED_LOCATION") {
                    if (city) params.append("city", city);
                    if (state) params.append("state", state);
                    if (country) params.append("country", country);
                }

                return {
                    url: `/service/deals/location?${params.toString()}`,
                    method: "GET",
                    credentials: "include",
                };
            },
            providesTags: ["Deals"],
        }),
        getDealDetails: builder.query({
            query: ({ id, longitude, latitude }) => ({
                url: `/service/${id}/${longitude}/${latitude}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: (result, error, arg) => [
                { type: "Deal", id: arg.id },
            ],
        }),
        getDealAnalytics: builder.query({
            query: ({ id }) => ({
                url: `/service/deals/analytic/${id}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: (result, error, arg) => [
                { type: "Deal", id: arg.id },
            ],
        }),
        getDealAllDeals: builder.query({
            query: ({ searchText }) => ({
                url: `/service/deals/all_deals?searchTerm=${searchText}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["AllQueryDeals"],
        }),
        getAllSaveDeals: builder.query({
            query: (ids) => ({
                url: `/service/saved?ids=${ids.join(",")}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["Deals"],
        }),
        getMyDeals: builder.query({
            query: ({ openTab, page, limit }) => ({
                url: `/service/my_deals?deal_filter=${openTab}&join=shop-business_name|business_logo,category-category_name|category_logo&fields=title,deal_status,ban_reason,images,regular_price,discount,discount_type,custom_discount,promotedUntil,activePromotion&page=${page}&limit=${limit}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["Deals"],
        }),
        editDeal: builder.mutation({
            query: ({ id, data }) => (
                {
                    url: `/service/${id}`,
                    headers: {
                        "Content-Type": "application/formdata"
                    },
                    method: "PATCH",
                    body: data,
                }),
            invalidatesTags: (result, error, arg) => [
                "Deals",
                { type: "Deal", id: arg.id }
            ]
        }),
        handleDeleteDeal: builder.mutation({
            query: (id) => ({
                url: `/service/${id}`,
                method: 'DELETE',
                credentials: "include",
            }),
            invalidatesTags: ["Deals"],
        }),
    }),
});

export const {
    useGetAllDealQuery,
    useLazyGetAllDealQuery,
    useGetDealDetailsQuery,
    useGetDealAllDealsQuery,
    useGetAllSaveDealsQuery,
    useGetMyDealsQuery,
    useCreateNewDealMutation,
    useEditDealMutation,
    useHandleDeleteDealMutation,
    useGetDealAnalyticsQuery
} = dealApi;