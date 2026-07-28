import Cookies from "js-cookie";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "./errorHandling";

export const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    // Global headers
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    headers.set("ngrok-skip-browser-warning", "true");

    const resetToken = localStorage.getItem("resetToken");
    const token = Cookies.get("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (resetToken) {
      headers.set("token", resetToken);
    }
    return headers;
  },
});

const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    "User",
    "Deals",
    "Deal",
    "AllDeals",
    "AllQueryDeals",
    "Categories",
    "Category",
    "saveIds",
    "Plans",
    "Plan",
    "VoucherCodes",
    "VoucherCode",
    "Payments",
    "Payment",
    "Notifications"
  ],
  endpoints: () => ({}),
});

export default apiSlice;