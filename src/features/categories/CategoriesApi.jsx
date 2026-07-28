import apiSlice from "../api/apiSlice";

export const categoriesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createNewCategory: builder.mutation({
            query: (data) => ({
                url: "/category",
                headers: {
                    "Content-Type": "application/formdata"
                },
                method: "POST",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ["Categories"],
        }),
        getAllCategories: builder.query({
            query: () => ({
                url: "/category",
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["Categories"],
        }),
        getCategoryDetails: builder.query({
            query: ({ id, longitude, latitude, page = 100 }) => ({
                url: `/service/c/${id}?lng=${longitude}&lat=${latitude}&sort=distance&page=${page}&limit=${1000}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: (_result, _error, arg) => [
                { type: "Category", id: arg.id },
            ],
        }),
        editCategories: builder.mutation({
            query: ({ id, data }) => ({
                url: `/category/${id}`,
                headers: {
                    "Content-Type": "application/formdata"
                },
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (_result, _error, arg) => [
                "Categories",
                { type: "Category", id: arg.id }
            ]
        }),
        handleCategoriesDelete: builder.mutation({
            query: (id) => ({
                url: `/category/${id}`,
                method: 'DELETE',
                credentials: "include",
            }),
            invalidatesTags: ["Categories"],
        }),
    }),
});

export const {
    useGetAllCategoriesQuery,
    useGetCategoryDetailsQuery,
    useLazyGetCategoryDetailsQuery,
    useCreateNewCategoryMutation,
    useHandleCategoriesDeleteMutation,
    useEditCategoriesMutation,
} = categoriesApi;




