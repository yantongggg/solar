import { ChevronRight, CheckCircle2 } from 'lucide-react';
import solarLogo from 'figma:asset/3312b1e08d991ea24dcb0e7aa9941a2793c42980.png';

interface WalletCardProps {
  darkMode: boolean;
  onOpenRecords: () => void;
}

export function WalletCard({ darkMode, onOpenRecords }: WalletCardProps) {
  const balance = 'RM 248.50';
  const co2Tokens = 20;
  const blockchainStatus = 'Verified';

  return (
    <div
      className="rounded-xl p-4 glass-card"
      style={{
        background: darkMode
          ? 'linear-gradient(90deg, rgba(42, 64, 53, 0.95), rgba(53, 90, 70, 0.95))'
          : 'linear-gradient(90deg, rgba(98, 191, 212, 0.65) 0%, rgba(241, 221, 118, 0.65) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
      }}
    >
      {/* Header: Solar Logo & Balance Display (Clickable) */}
      <button
        onClick={onOpenRecords}
        className="flex items-center gap-3 mb-2.5 w-full transition-all hover:opacity-90 active:scale-[0.99]"
      >
        {/* Solar Logo */}
        <div className="flex items-center justify-center" style={{ width: '90px', flexShrink: 0 }}>
          <img
            src={solarLogo}
            alt="Luméa Solar"
            style={{
              width: '90px',
              height: 'auto',
              objectFit: 'contain',
              filter: darkMode ? 'brightness(1.1)' : 'brightness(1)',
            }}
          />
        </div>

        {/* Balance Display */}
        <div className="flex-1 flex items-center justify-between">
          <div>
            <p
              className="text-xs mb-0.5"
              style={{
                color: darkMode ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.65)',
                fontWeight: 'var(--font-weight-light)',
                letterSpacing: '0.01em',
              }}
            >
              Balance
            </p>
            <p
              style={{
                color: darkMode ? '#FFFFFF' : '#000000',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: '1.75rem',
                letterSpacing: '-0.02em',
                lineHeight: '1.15',
              }}
            >
              {balance}
            </p>
          </div>
          <ChevronRight
            className="w-6 h-6"
            style={{ color: darkMode ? '#FFFFFF' : '#000000' }}
          />
        </div>
      </button>

      {/* Action Button: Top Up */}
      <button
        className="w-full py-3 rounded-xl mb-2.5 transition-all hover:shadow-lg active:scale-95 flex items-center justify-center"
        style={{
          background: darkMode ? '#10B981' : '#0d9488',
          color: '#FFFFFF',
          fontWeight: 'var(--font-weight-semibold)',
          fontSize: '1rem',
        }}
      >
        + Top Up
      </button>

      {/* Footer Section */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Left: CO2 Tokens (Non-clickable) */}
        <div
          className="rounded-lg py-2.5 px-3"
          style={{
            background: darkMode
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <p
            className="text-xs mb-1"
            style={{
              color: darkMode ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.65)',
              fontWeight: 'var(--font-weight-light)',
            }}
          >
            CO2 Tokens
          </p>
          <p
            style={{
              color: darkMode ? '#FFFFFF' : '#000000',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: '1.5rem',
              lineHeight: '1.2',
            }}
          >
            {co2Tokens}
          </p>
        </div>

        {/* Right: Blockchain Status */}
        <div
          className="rounded-lg py-2.5 px-3"
          style={{
            background: darkMode
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <div className="flex items-center gap-1 mb-1">
            <p
              className="text-xs"
              style={{
                color: darkMode ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.65)',
                fontWeight: 'var(--font-weight-light)',
              }}
            >
              Blockchain Status
            </p>
            <CheckCircle2
              className="w-3.5 h-3.5"
              style={{ color: darkMode ? '#5FC3A2' : '#10B981' }}
            />
          </div>
          <p
            style={{
              color: darkMode ? '#5FC3A2' : '#10B981',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: '1.25rem',
              lineHeight: '1.2',
            }}
          >
            {blockchainStatus}
          </p>
        </div>
      </div>
    </div>
  );
}
