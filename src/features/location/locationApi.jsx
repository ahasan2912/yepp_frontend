import apiSlice from "../api/apiSlice";

export const locationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        suggestionLocation: builder.query({
            query: (searchText) => ({
                url: `/locations/suggestions?search=${searchText}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        getDownloadLocationUploadTemplate: builder.query({
            query: () => ({
                url: `/dashboard/seed_cities/template`,
                method: "GET",
                credentials: "include",
            }),
        }),
        addLocationUploadCSVEXCL: builder.mutation({
            query: (data) => ({
                url: "/dashboard/seed_cities",
                headers: {
                    "Content-Type": "application/formdata"
                },
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),
        getDefaultLocation: builder.query({
            query: () => ({
                url: `/locations/default`,
                method: "GET",
                credentials: "include",
            }),
        }),
    }),

});

export const { useSuggestionLocationQuery, useGetDownloadLocationUploadTemplateQuery, useAddLocationUploadCSVEXCLMutation, useGetDefaultLocationQuery } = locationApi;
// /dashboard/seed_cities/template

// /dashboard/seed_cities