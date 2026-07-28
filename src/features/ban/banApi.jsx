import apiSlice from "../api/apiSlice";

export const banApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        adminBanUser: builder.mutation({
            query: ({ dealId, data }) => ({
                url: `/dashboard/admin/deals/${dealId}/ban`,
                method: "PATCH",
                credentials: "include",
                body: data
            }),
            invalidatesTags: ["Deals"],
        }),
        adminUnBanUser: builder.mutation({
            query: (dealId) => ({
                url: `/dashboard/admin/deals/${dealId}/unban`,
                method: "PATCH",
                credentials: "include",
            }),
            invalidatesTags: ["Deals"],
        }),
    }),
});

export const { useAdminBanUserMutation, useAdminUnBanUserMutation } = banApi;




