import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface SolarCommunityMapProps {
  darkMode?: boolean;
  solarPotentialData?: {
    level: 'strong' | 'moderate' | 'limited';
    sunshineHours: number;
    label?: string;
    detail?: string;
  } | null;
  onBuildingClick?: (lat: number, lng: number) => Promise<any>;
}

interface SolarPotentialLevel {
  id: string;
  minSunHours: number;
  label: string;
  detail: string;
  stroke: string;
  fill: string;
  fillOpacity: number;
  background: string;
  glow: string;
  dot: string;
}

const POTENTIAL_LEVELS: SolarPotentialLevel[] = [
  {
    id: "strong",
    minSunHours: 1500,
    label: "Strong solar potential",
    detail: "Great candidate for a high-output array.",
    stroke: "#ff6f00",
    fill: "#fff59d",
    fillOpacity: 0.6,
    background: "rgba(255, 193, 7, 0.26)",
    glow: "rgba(255, 111, 0, 0.42)",
    dot: "#ff6f00",
  },
  {
    id: "moderate",
    minSunHours: 1100,
    label: "Moderate solar potential",
    detail: "Seasonal shading; optimize layout for yield.",
    stroke: "#f9a825",
    fill: "#ffe082",
    fillOpacity: 0.5,
    background: "rgba(249, 168, 37, 0.22)",
    glow: "rgba(249, 168, 37, 0.36)",
    dot: "#f9a825",
  },
  {
    id: "limited",
    minSunHours: 0,
    label: "Limited solar potential",
    detail: "Lower sunlight; check alternate roof sections.",
    stroke: "#5c6bc0",
    fill: "#c5cae9",
    fillOpacity: 0.45,
    background: "rgba(92, 107, 192, 0.22)",
    glow: "rgba(92, 107, 192, 0.32)",
    dot: "#5c6bc0",
  },
];

// HARDCODED DATA
const HARDCODED_INDICATOR = {
  background: "rgba(255, 255, 255, 0.95)",  
  stroke: "#ff6f00",
  glow: "rgba(255, 111, 0, 0.42)",
  dot: "#ff6f00",
  label: "Strong solar potential",
  detail: "Great candidate for a high-output array.",
  sunshineHours: 1551,
};

export function SolarCommunityMap({ 
  darkMode = false,
  solarPotentialData = null,
  onBuildingClick 
}: SolarCommunityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [solarData, setSolarData] = useState<any>(null);
  const [potentialLevel, setPotentialLevel] = useState<SolarPotentialLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const API_KEY = " ";
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const glowPolygonRef = useRef<google.maps.Polygon | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (solarPotentialData) {
      console.log('🔥 Backend Solar Data Received:', solarPotentialData);
      
      const level = POTENTIAL_LEVELS.find(l => l.id === solarPotentialData.level) || null;
      setPotentialLevel(level);
      
      setSolarData({
        solarPotential: {
          maxSunshineHoursPerYear: solarPotentialData.sunshineHours,
          maxArrayPanelsCount: 343,
          maxArrayAreaMeters2: 673.5,
          maxKwhPerYear: 245000,
          carbonOffsetFactorKgPerMwh: 417,
        }
      });
    }
  }, [solarPotentialData]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('📍 GPS Location:', location);
          setUserLocation(location);
          setLocationError(null);
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
          setLocationError('Could not get your location');
          setUserLocation({ lat: 1.2966, lng: 103.7764 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError('Geolocation not supported');
      setUserLocation({ lat: 1.2966, lng: 103.7764 });
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('🗺️ Google Maps loaded successfully');
      const newMap = new google.maps.Map(mapRef.current!, {
        center: userLocation,
        zoom: 18,
        mapTypeId: 'satellite',
        tilt: 0,
        disableDefaultUI: true,
        styles: darkMode ? [
          { elementType: 'labels', stylers: [{ visibility: 'simplified' }] }
        ] : undefined,
      });

      setMap(newMap);

      newMap.addListener('click', async (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          console.log('🖱️ Building clicked:', { lat, lng });
          
          if (onBuildingClick) {
            setLoading(true);
            try {
              const backendData = await onBuildingClick(lat, lng);
              console.log('🔥 Backend returned:', backendData);
            } catch (error) {
              console.error('❌ Backend error:', error);
            } finally {
              setLoading(false);
            }
          } else {
            fetchSolarData(lat, lng);
          }
        }
      });

      const communityPoints = [
        { lat: userLocation.lat + 0.0002, lng: userLocation.lng - 0.0004, price: "$0.15" },
        { lat: userLocation.lat - 0.0002, lng: userLocation.lng + 0.0004, price: "$0.16" },
        { lat: userLocation.lat + 0.0004, lng: userLocation.lng + 0.0008, price: "$0.17" },
        { lat: userLocation.lat - 0.0004, lng: userLocation.lng, price: "$0.14" },
      ];

      communityPoints.forEach(point => {
        const marker = new google.maps.Marker({
          position: { lat: point.lat, lng: point.lng },
          map: newMap,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 16,
            fillColor: darkMode ? '#5FC3A2' : '#10B981',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
          label: {
            text: point.price,
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 'bold',
          },
        });
        markersRef.current.push(marker);
      });

      userMarkerRef.current = new google.maps.Marker({
        position: userLocation,
        map: newMap,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 18,
          fillColor: darkMode ? '#6BA3E8' : '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 4,
        },
        label: {
          text: 'You',
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 'bold',
        },
      });

      // 🔥 AUTO-LOAD: Always fetch solar data for user's location on startup
      if (!onBuildingClick && !solarPotentialData) {
        console.log('🚀 Auto-fetching solar data for user location...');
        // Small delay to ensure map is fully initialized
        setTimeout(() => {
          fetchSolarData(userLocation.lat, userLocation.lng);
        }, 500);
      }
    };

    if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      document.head.appendChild(script);
    } else if (window.google?.maps) {
      console.log('🔄 Google Maps already loaded, initializing...');
      script.onload(null as any);
    }

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
    };
  }, [darkMode, userLocation]);

  const fetchSolarData = async (lat: number, lng: number) => {
    if (!map) {
      console.warn('⚠️ Map not ready, skipping solar data fetch');
      return;
    }
    
    setLoading(true);
    console.log(`🌞 Fetching solar data for: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    
    try {
      const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&key=${API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Solar API Response:', data);
      
      setSolarData(data);
      
      const sunHours = data.solarPotential?.maxSunshineHoursPerYear;
      console.log('🌞 Sun hours:', sunHours);
      
      const level = determinePotential(sunHours);
      console.log('📊 Potential level:', level);
      
      setPotentialLevel(level);
      
      drawBuildingPolygon(data, level);
      
    } catch (error) {
      console.error('❌ Solar API error:', error);
      setSolarData(null);
      setPotentialLevel(null);
    } finally {
      setLoading(false);
    }
  };

  const determinePotential = (sunHours: number | undefined): SolarPotentialLevel | null => {
    if (sunHours === undefined || sunHours === null) return null;
    
    for (const level of POTENTIAL_LEVELS) {
      if (sunHours >= level.minSunHours) {
        return level;
      }
    }
    return POTENTIAL_LEVELS[POTENTIAL_LEVELS.length - 1];
  };

  const drawBuildingPolygon = (data: any, level: SolarPotentialLevel | null) => {
    if (!map || !data.boundingBox) return;

    const { southWest, northEast } = data.boundingBox;
    if (!southWest || !northEast) return;

    const padding = 0.00008;
    const path = [
      { lat: southWest.lat - padding, lng: southWest.lng - padding },
      { lat: southWest.lat - padding, lng: northEast.lng + padding },
      { lat: northEast.lat + padding, lng: northEast.lng + padding },
      { lat: northEast.lat + padding, lng: southWest.lng - padding },
    ];

    const stroke = level?.stroke || '#ff6f00';
    const fill = level?.fill || '#ffd54f';
    const fillOpacity = level?.fillOpacity || 0.45;
    const glowColor = level?.glow || 'rgba(255, 193, 7, 0.35)';

    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }
    if (glowPolygonRef.current) {
      glowPolygonRef.current.setMap(null);
    }

    glowPolygonRef.current = new google.maps.Polygon({
      paths: path,
      strokeColor: glowColor,
      strokeOpacity: 0.75,
      strokeWeight: 10,
      fillOpacity: 0,
      zIndex: 1,
      map,
    });

    polygonRef.current = new google.maps.Polygon({
      paths: path,
      strokeColor: stroke,
      strokeOpacity: 0.92,
      strokeWeight: 3,
      fillColor: fill,
      fillOpacity: fillOpacity,
      zIndex: 2,
      map,
    });

    const bounds = new google.maps.LatLngBounds();
    path.forEach(pt => bounds.extend(pt));
    map.fitBounds(bounds, 60);
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return '—';
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const handleRecenter = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(18);
      if (!onBuildingClick && !solarPotentialData) {
        fetchSolarData(userLocation.lat, userLocation.lng);
      }
    }
  };

  const hasValidData = potentialLevel && (solarData?.solarPotential || solarPotentialData);
  
  // 🔥 ALWAYS use hardcoded data for clear visibility
  const indicatorProps = HARDCODED_INDICATOR;

  console.log('🔍 Render check:', { 
    hasPotentialLevel: !!potentialLevel, 
    hasSolarData: !!solarData?.solarPotential,
    hasBackendData: !!solarPotentialData,
    shouldShowIndicator: true,
    usingDefaultPlaceholder: !hasValidData,
    indicatorProps
  });

  return (
    <div 
      style={{
        borderRadius: '24px',
        overflow: 'hidden',
        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
        boxShadow: darkMode 
          ? '0 4px 24px rgba(0, 0, 0, 0.4)' 
          : '0 4px 24px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div 
        style={{
          padding: '20px 24px',
          background: darkMode ? 'rgba(255, 255, 255, 0.08)' : '#F8F9FA',
          borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: darkMode ? 'rgba(91, 195, 162, 0.2)' : 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MapPin size={20} color={darkMode ? '#5FC3A2' : '#10B981'} />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: darkMode ? '#FFFFFF' : '#000000',
              margin: 0,
            }}>
              Community Network
            </h3>
          </div>
          
          <button
            onClick={handleRecenter}
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              border: 'none',
              background: darkMode ? 'rgba(107, 163, 232, 0.2)' : 'rgba(59, 130, 246, 0.1)',
              color: darkMode ? '#6BA3E8' : '#3B82F6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            <Navigation size={16} />
            My Location
          </button>
        </div>
        <p style={{
          fontSize: '13px',
          color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
          margin: 0,
        }}>
          {loading ? 'Loading solar data...' : 
           locationError ? locationError : 
           'Click any building to check solar potential'}
        </p>
      </div>

      {/* 🔥 Map Container with Proper Layering */}
      <div style={{ 
        position: 'relative',
        height: '320px',
        width: '100%',
      }}>
        {/* Google Maps Layer */}
        <div 
          ref={mapRef} 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }} 
        />
        
        {/* 🔥 Solar Indicator - White background, always visible */}
        <div 
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            padding: '16px 20px',
            borderRadius: '16px',
            background: indicatorProps.background,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.15), inset 0 0 0 2px ${indicatorProps.stroke}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1000,
            pointerEvents: 'none',  // 🔥 CRITICAL: Clicks pass through to map
          }}
        >
          <div 
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: indicatorProps.dot,
              boxShadow: `0 0 22px ${indicatorProps.glow}`,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1A1A1A',
              marginBottom: '6px',
            }}>
              {indicatorProps.label}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(26, 26, 26, 0.7)',
              lineHeight: '1.5',
              marginBottom: '4px',
            }}>
              {indicatorProps.detail}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#ff6f00',
              fontWeight: '600',
            }}>
              {formatNumber(indicatorProps.sunshineHours)} h/yr of sunshine
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div style={{
            position: 'absolute',
            top: '70px',
            left: '16px',
            right: '16px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: '600',
            color: '#1A1A1A',
            zIndex: 1001,
          }}>
            Loading solar data...
          </div>
        )}
      </div>

      {solarData?.solarPotential && (
        <div 
          style={{
            padding: '16px 24px',
            background: darkMode ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA',
            borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
          }}
        >
          <div>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
              marginBottom: '4px',
            }}>
              Max Panels
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: darkMode ? '#FFFFFF' : '#000000',
            }}>
              {formatNumber(solarData.solarPotential.maxArrayPanelsCount)}
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
              marginBottom: '4px',
            }}>
              Roof Area
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: darkMode ? '#FFFFFF' : '#000000',
            }}>
              {formatNumber(solarData.solarPotential.maxArrayAreaMeters2)} m²
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
              marginBottom: '4px',
            }}>
              CO₂ Saved
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: darkMode ? '#FFFFFF' : '#000000',
            }}>
              {(() => {
                const kwh = solarData.solarPotential.maxKwhPerYear || 0;
                const co2Factor = solarData.solarPotential.carbonOffsetFactorKgPerMwh || 417;
                const kg = (kwh / 1000) * co2Factor;
                return `${(kg / 1000).toFixed(1)} t`;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
