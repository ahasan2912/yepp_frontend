import Cookies from "js-cookie";
import { baseQuery } from "./apiSlice";

export const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    const refreshToken = Cookies.get("refreshToken");

    const statusMessage = result?.error?.data?.message ?? result?.error?.data?.err?.message;
    const statusCode = result?.error?.status;

    const isExpired =
        statusCode === 500 &&
        statusMessage === "jwt expired";

    if (refreshToken && isExpired) {

        const refreshResult = await baseQuery(
            {
                url: "/auth/generate_token",
                method: "POST",
                body: { refreshToken },
            },
            api,
            extraOptions
        );

        if (refreshResult?.data?.data) {

            const accessToken = refreshResult.data.data.newAccessToken;
            const newRefreshToken = refreshResult.data.data.newRefreshToken;

            Cookies.set("accessToken", accessToken, {
                expires: 5,
                secure: false,
                sameSite: "Strict",
            });

            Cookies.set("refreshToken", newRefreshToken, {
                expires: 5,
                secure: false,
                sameSite: "Strict",
            });
            result = await baseQuery(args, api, extraOptions)
        }
    }

    return result;
};