import apiSlice from "../api/apiSlice";

const getPaymentQueryUrl = ({
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
        "sort",
        sort === "Old to New" ? "createdAt" : "-createdAt"
    );
    params.append("page", page);
    params.append("limit", limit);

    return `/dashboard/latest_transactions?${params.toString()}&fields=deal,plan,transaction_id,amount,payment_method,provider,payment_status,createdAt&join=deal-title,plan-title`;
};

const getVendorPaymentHistoryQueryUrl = ({
  sort = "New to Old",
  searchTerm = "",
  page = 1,
  limit = 10,
} = {}) => {
  const params = new URLSearchParams();
  params.append("payment_status", "PAID");
  if (searchTerm.trim()) {
    params.append("searchTerm", searchTerm);
  }
  params.append(
    "sort",
    sort === "Old to New" ? "createdAt" : "-createdAt"
  );
  params.append("page", page);
  params.append("limit", limit);

  params.append(
    "join",
    "deal-title|reguler_price,plan-title|durationDays|price|currencey"
  );
  params.append(
    "fields",
    "deal,plan,transaction_id,amount,currency,provider,payment_status,createdAt,voucher_applied,invoice_url"
  );
  return `/payment/transaction_history?${params.toString()}`;
};

export const paymentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        handlePayment: builder.mutation({
            query: (data) => ({
                url: "/payment/stripe_pay",
                method: "POST",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ["Payments"],
        }),
        getAllPayment: builder.query({
            query: (params) => ({
                url: getPaymentQueryUrl(params),
                method: "GET",
                credentials: "include",
            }),
        }),
        getAllVendorPaymentHistory: builder.query({
            query: (params) => ({
                url: getVendorPaymentHistoryQueryUrl(params),
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const { useHandlePaymentMutation, useGetAllPaymentQuery, useGetAllVendorPaymentHistoryQuery } = paymentApi;