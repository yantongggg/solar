import { useState } from 'react';
import { X, TrendingDown, AlertCircle } from 'lucide-react';

interface PlaceSellOrderModalProps {
  onClose: () => void;
  onConfirm: (price: string, amount: string) => void;
  darkMode?: boolean;
  suggestedPrice?: number;
}

export function PlaceSellOrderModal({ 
  onClose, 
  onConfirm, 
  darkMode = false,
  suggestedPrice = 0.13
}: PlaceSellOrderModalProps) {
  const [price, setPrice] = useState(suggestedPrice.toFixed(2));
  const [amount, setAmount] = useState('50');
  const [errors, setErrors] = useState({ price: '', amount: '' });

  const handlePriceChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    if (numValue < 0.05) {
      setErrors(prev => ({ ...prev, price: 'Price must be at least $0.05/kWh' }));
    } else if (numValue > 1.00) {
      setErrors(prev => ({ ...prev, price: 'Price cannot exceed $1.00/kWh' }));
    } else {
      setErrors(prev => ({ ...prev, price: '' }));
    }
    setPrice(value);
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    if (numValue < 1) {
      setErrors(prev => ({ ...prev, amount: 'Amount must be at least 1 kWh' }));
    } else if (numValue > 100) {
      setErrors(prev => ({ ...prev, amount: 'Amount cannot exceed 100 kWh' }));
    } else {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
    setAmount(value);
  };

  const handleConfirm = () => {
    const numPrice = parseFloat(price) || 0;
    const numAmount = parseFloat(amount) || 0;
    
    if (numPrice < 0.05 || numPrice > 1.00) {
      setErrors(prev => ({ ...prev, price: 'Please enter a valid price' }));
      return;
    }
    if (numAmount < 1 || numAmount > 100) {
      setErrors(prev => ({ ...prev, amount: 'Please enter a valid amount' }));
      return;
    }
    
    onConfirm(price, amount);
    onClose();
  };

  const gridPrice = 0.10;
  const marketPrice = parseFloat(price) || 0;
  const profitMargin = marketPrice > gridPrice 
    ? (((marketPrice - gridPrice) / gridPrice) * 100).toFixed(1)
    : '0';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md relative p-6"
        style={{
          background: darkMode ? 'rgba(45, 74, 62, 0.95)' : 'rgba(255, 250, 219, 0.8)',
          borderRadius: '16px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: darkMode 
            ? '0 20px 60px rgba(0, 0, 0, 0.5)' 
            : '0 20px 60px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-all hover:bg-white/10"
        >
          <X className="w-5 h-5" style={{ color: darkMode ? '#FFFFFF' : '#000000' }} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="p-3 rounded-full"
            style={{
              background: darkMode ? 'rgba(243, 170, 170, 0.2)' : 'rgba(255, 112, 67, 0.15)'
            }}
          >
            <TrendingDown className="w-6 h-6" style={{ color: darkMode ? '#F3AAAA' : '#FF7043' }} />
          </div>
          <div>
            <h2 className="text-xl" style={{ 
              color: darkMode ? '#FFFFFF' : '#000000',
              fontWeight: 'var(--font-weight-bold)',
              letterSpacing: '-0.01em'
            }}>
              Place Sell Order
            </h2>
            <p className="text-sm" style={{ 
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
            }}>
              Set your ask price
            </p>
          </div>
        </div>

        {/* Info Banner - Center-aligned for emphasis */}
        <div 
          className="mb-5 p-3 rounded-lg"
          style={{
            background: darkMode ? 'rgba(95, 195, 162, 0.15)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${darkMode ? 'rgba(95, 195, 162, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`
          }}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <AlertCircle className="w-5 h-5" style={{ 
              color: darkMode ? '#5FC3A2' : '#10B981' 
            }} />
            <p className="text-sm" style={{ 
              color: darkMode ? '#FFFFFF' : '#000000',
              lineHeight: '1.5'
            }}>
              Your order will be visible to all neighbors. Buyers can accept your offer at the price you set.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-5">
          {/* Ask Price Input */}
          <div>
            <label className="text-sm block mb-2" style={{ 
              color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
              fontWeight: 'var(--font-weight-semibold)'
            }}>
              Ask Price ($/kWh)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="w-full rounded-xl px-4 py-3 border transition-all focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
              style={{
                background: darkMode ? 'rgba(42, 64, 53, 0.85)' : '#FFFFFF',
                borderColor: errors.price 
                  ? '#ef4444' 
                  : (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(209, 213, 219, 1)'),
                color: darkMode ? '#FFFFFF' : '#000000'
              }}
            />
            {errors.price && (
              <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>
                {errors.price}
              </p>
            )}
            {!errors.price && marketPrice > gridPrice && (
              <p className="text-xs mt-1.5" style={{ 
                color: darkMode ? '#5FC3A2' : '#10B981' 
              }}>
                +{profitMargin}% more than grid price ($0.10/kWh)
              </p>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm block mb-2" style={{ 
              color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
              fontWeight: 'var(--font-weight-semibold)'
            }}>
              Amount (kWh)
            </label>
            <input
              type="number"
              step="0.1"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full rounded-xl px-4 py-3 border transition-all focus:outline-none focus:ring-2 focus:ring-[#FF7043]"
              style={{
                background: darkMode ? 'rgba(42, 64, 53, 0.85)' : '#FFFFFF',
                borderColor: errors.amount 
                  ? '#ef4444' 
                  : (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(209, 213, 219, 1)'),
                color: darkMode ? '#FFFFFF' : '#000000'
              }}
            />
            {errors.amount && (
              <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>
                {errors.amount}
              </p>
            )}
          </div>

          {/* Total Revenue Display */}
          <div 
            className="rounded-xl p-4"
            style={{
              background: darkMode ? 'rgba(42, 64, 53, 0.85)' : 'rgba(243, 244, 246, 1)',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(209, 213, 219, 1)'}`
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ 
                color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                fontWeight: 'var(--font-weight-semibold)'
              }}>
                Expected Revenue
              </span>
              <span className="text-xl" style={{ 
                color: darkMode ? '#FFFFFF' : '#000000',
                fontWeight: 'var(--font-weight-bold)'
              }}>
                ${((parseFloat(price) || 0) * (parseFloat(amount) || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Third-Tier Container Footer (Center-aligned) */}
        <div className="flex justify-center items-center">
          <div className="flex gap-3 justify-center" style={{ width: '100%' }}>
            <button
              onClick={onClose}
              className="rounded-xl py-3.5 px-8 transition-all hover:scale-105 active:scale-95"
              style={{
                background: darkMode ? 'rgba(42, 64, 53, 0.85)' : 'rgba(229, 231, 235, 1)',
                color: darkMode ? '#FFFFFF' : '#000000',
                fontWeight: 'var(--font-weight-semibold)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="rounded-xl py-3.5 px-8 transition-all hover:shadow-lg hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #FF7043 0%, #f97316 100%)',
                color: '#FFFFFF',
                fontWeight: 'var(--font-weight-semibold)'
              }}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
