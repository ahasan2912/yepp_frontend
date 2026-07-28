import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, X, Check } from 'lucide-react';
import { getDealPricing } from '../../utils/dealPricing';


const ShowCuponModal = ({ isOpen, setIsOpen, deal }) => {
  const [activeTab, setActiveTab] = useState('coupon');
  const [copied, setCopied] = useState(false);

  const { 
    title, 
    regular_price, 
    discount, 
    discount_type, 
    minimum_purchase, 
    coupon_option, 
    coupon 
  } = deal?.data || {};

  const { 
    regularPrice, 
    finalPrice, 
    discount: dealDiscount
  } = getDealPricing(regular_price, discount_type, discount, minimum_purchase);

  
  const normalizeRedeemValue = (value) => typeof value === 'string' ? value.trim() : value;
  const couponCode = normalizeRedeemValue(coupon);
  const qrImage = normalizeRedeemValue(coupon_option?.qr);
  const barcodeImage = normalizeRedeemValue(coupon_option?.upc);

  const availableTabs = [
    couponCode && { key: 'coupon', label: 'Coupon' },
    qrImage && { key: 'qr', label: 'QR' },
    barcodeImage && { key: 'barcode', label: 'Barcode' },
  ].filter(Boolean);

  const activeRedemptionTab = availableTabs.some((tab) => tab.key === activeTab)
    ? activeTab
    : availableTabs[0]?.key;

  if (!isOpen || typeof document === 'undefined') return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(String(couponCode || ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-9999 flex min-h-dvh items-center justify-center overflow-y-auto p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative bg-white w-full max-w-2xl rounded-xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300 px-0 sm:px-6">
        <div className="flex justify-end items-center px-5 pt-6 pb-2">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-700 cursor-pointer">
            <X size={24} />
          </button>
        </div>
        <div className="mx-5 mb-5  flex flex-col">
          <h2 className="text-primary text-2xl text-center font-bold mb-6">
            {title}
          </h2>
           <div className="w-full space-y-3 mb-5">
              {/* Regular Price */}
              {regularPrice > finalPrice && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">
                    Regular Price
                  </span>

                  <span className="text-balck font-medium">
                    ${regularPrice.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Discount */}
              {discount_type !== "NO_DISCOUNT" && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">
                    Discount
                  </span>

                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold text-sm">
                    {discount_type === "PERCENT_OFF_PRICE" &&
                      `${dealDiscount}% OFF`}

                    {discount_type === "PERCENT_OFF_TOTAL" &&
                      `${dealDiscount}% OFF`}

                    {discount_type === "AMOUNT_OFF_PURCHASE" &&
                      `$${dealDiscount} OFF`}

                    {discount_type === "FREE" &&
                      "FREE"}
                  </span>
                </div>
              )}

              {/* Final Price */}
              {/* {discount_type !== "PERCENT_OFF_TOTAL" && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">
                     Final Price
                  </span>

                  <span className="text-primary font-bold text-medium">
                    {finalPrice === 0 ? "FREE" : `$${finalPrice.toFixed(2)}`}
                  </span>
                </div>
              )} */}


              {/* Minimum Purchase */}
              {/* {minimum_purchase && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">
                    Minimum Purchase
                  </span>

                  <span className="font-semibold">
                    ${Number(minimum_purchase).toFixed(2)}
                  </span>
                </div>
              )} */}

            </div>
          {/* <div className="mb-4">
            {hasDiscount ? (
              <p className="text-primary font-bold tracking-wide">
                You save ${savedAmount.toFixed(2)}
              </p>
            ) : (
              <p className="font-medium text-slate-500 text-left">
                 No discount available for this Ads.
              </p>
            )}
          </div> */}
          {availableTabs.length > 0 && (
            <div className="flex bg-gray-100/80 p-1.5 rounded-full w-full mb-8 border border-gray-200">
              {availableTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 cursor-pointer rounded-full text-sm font-extrabold uppercase tracking-wider transition-all duration-200 ${activeRedemptionTab === tab.key
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Content Area */}
          <div className="w-full min-h-30 flex flex-col items-center justify-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 p-4">
            {activeRedemptionTab === 'coupon' && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-[#e6f7f8] border-2 border-[#4dbbc4]/30 rounded-2xl p-3 sm:p-6 text-center">
                  <span className="block text-xs text-primary font-bold mb-2 uppercase tracking-widest">Promo Code</span>
                  <h3 className="text-xl sm:text-4xl font-black text-gray-800 mb-5 tracking-tighter">
                    {couponCode}
                  </h3>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1 sm:gap-2 mx-auto px-2 sm:px-8 py-2.5 rounded-md font-bold transition-all cursor-pointer ${copied ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:bg-secondary hover:shadow-md'
                      }`}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              </div>
            )}

            {activeRedemptionTab === 'qr' && (
              <div className="p-4 bg-white rounded-2xl shadow-sm border animate-in zoom-in-95 duration-200">
                <img
                  src={`${qrImage}`}
                  alt="Redemption QR"
                  className="w-full max-h-32 object-contain"
                />
              </div>
            )}

            {activeRedemptionTab === 'barcode' && (
              <div className="p-4 bg-white rounded-2xl shadow-sm border animate-in zoom-in-95 duration-200">
                <img
                  src={`${barcodeImage}`}
                  alt="Redemption barcode"
                  className="w-full max-h-32  object-contain"
                />
              </div>
            )}

            {!activeRedemptionTab && (
              <p className="text-sm font-medium text-slate-500">
                No coupon code is required to redeem this item.
              </p>
            )}
          </div>

          {activeRedemptionTab === 'coupon' && (
            <p className="text-gray-400 text-xs mt-6 font-medium">
              Present this code at the checkout counter.
            </p>
          )}

          {/* Final Action */}
          {/* <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-primary text-white cursor-pointer py-2 sm:py-3 rounded-full font-black text-lg mt-8 mb-3 shadow-[0_10px_20px_-5px_rgba(77,187,196,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(77,187,196,0.5)] active:scale-[0.98] transition-all">
            Close Deal
          </button> */}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShowCuponModal;
