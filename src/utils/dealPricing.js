export const discountType = {
    PERCENT_OFF_PRICE: 'PERCENT_OFF_PRICE',
    PERCENT_OFF_TOTAL: 'PERCENT_OFF_TOTAL',
    CUSTOM_DISCOUNT: 'CUSTOM_DISCOUNT',
    FIXED_PRICE: 'FIXED_PRICE',
    NO_PRICE: 'NO_PRICE'
};

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * @param {*} regularPriceValue  - regular_price from DB
 * @param {*} discount_type      - one of discountType keys
 * @param {*} discountValue      - discount value (percentage)
 */
export const getDealPricing = (regularPriceValue, discount_type, discountValue) => {

    // ── PERCENT_OFF_PRICE ──────────────────────────────────────────────────────
    // Vendor sets regular_price + discount%. Final = price - (price * disc / 100)
    if (discount_type === discountType.PERCENT_OFF_PRICE) {
        const regularPrice = toNumber(regularPriceValue);
        const discount = Math.min(Math.max(toNumber(discountValue), 0), 100);
        const hasDiscount = regularPrice > 0 && discount > 0;
        const finalPrice = hasDiscount
            ? regularPrice - (regularPrice * discount) / 100
            : regularPrice;
        return {
            regularPrice,
            discount,
            finalPrice,
            savedAmount: regularPrice - finalPrice,
            hasDiscount,
            label: `${discount}% off`
        };
    }

    // ── PERCENT_OFF_TOTAL ──────────────────────────────────────────────────────
    // Vendor only sets discount%. No regular_price stored.
    // Show only the discount label, no dollar prices.
    if (discount_type === discountType.PERCENT_OFF_TOTAL) {
        const regularPrice = toNumber(regularPriceValue);
        const discount = Math.min(Math.max(toNumber(discountValue), 0), 100);
        // If a regular_price exists treat same as PERCENT_OFF_PRICE
        if (regularPrice > 0) {
            const finalPrice = discount > 0
                ? regularPrice - (regularPrice * discount) / 100
                : regularPrice;
            return {
                regularPrice,
                discount,
                finalPrice,
                savedAmount: regularPrice - finalPrice,
                hasDiscount: discount > 0,
                label: `${discount}% off`
            };
        }
        // No price stored — just surface the percentage label, price shown as 0
        return {
            regularPrice: 0,
            discount,
            finalPrice: 0,
            savedAmount: 0,
            hasDiscount: discount > 0,
            label: discount > 0 ? `${discount}% off` : ''
        };
    }

    // ── FIXED_PRICE ────────────────────────────────────────────────────────────
    // Vendor saves the fixed price directly as regular_price
    if (discount_type === discountType.FIXED_PRICE) {
        const regularPrice = toNumber(regularPriceValue);
        return {
            regularPrice,
            discount: 0,
            finalPrice: regularPrice,
            savedAmount: 0,
            hasDiscount: false,
            label: 'Fixed Price'
        };
    }

    // ── CUSTOM_DISCOUNT ────────────────────────────────────────────────────────
    // Vendor describes the discount in free text. No numeric price to calculate.
    if (discount_type === discountType.CUSTOM_DISCOUNT) {
        return {
            regularPrice: 0,
            discount: 0,
            finalPrice: 0,
            savedAmount: 0,
            hasDiscount: false,
            label: 'Custom Deal'
        };
    }

    // ── NO_PRICE ───────────────────────────────────────────────────────────────
    // Free / no monetary value. Show $0.00.
    if (discount_type === discountType.NO_PRICE) {
        return {
            regularPrice: 0,
            discount: 0,
            finalPrice: 0,
            savedAmount: 0,
            hasDiscount: false,
            label: 'Free'
        };
    }

    // ── FALLBACK ───────────────────────────────────────────────────────────────
    const regularPrice = toNumber(regularPriceValue);
    return {
        regularPrice,
        discount: 0,
        finalPrice: regularPrice,
        savedAmount: 0,
        hasDiscount: false,
        label: ''
    };
};
