import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Arrondissement, Quartier, EspaceVert, ViewLevel } from '@/types/paris';
import { useArrondissementsGeoJSON, useQuartiersGeoJSON, useEspacesVertsGeoJSON, type GeoJSONFeature } from '@/hooks/useParisGeoJSON';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Paris coordinates
const PARIS_CENTER: L.LatLngExpression = [48.8566, 2.3522];
const PARIS_ZOOM = 12;

// Arrondissement approximate coordinates (center points)
const ARRONDISSEMENT_COORDS: Record<string, [number, number]> = {
  '1': [48.8605, 2.3426],
  '2': [48.8683, 2.3431],
  '3': [48.8654, 2.3612],
  '4': [48.8543, 2.3574],
  '5': [48.8448, 2.3493],
  '6': [48.8495, 2.3324],
  '7': [48.8577, 2.3119],
  '8': [48.8743, 2.3099],
  '9': [48.8765, 2.3372],
  '10': [48.8764, 2.3603],
  '11': [48.8603, 2.3793],
  '12': [48.8406, 2.3888],
  '13': [48.8322, 2.3561],
  '14': [48.8313, 2.3254],
  '15': [48.8412, 2.2989],
  '16': [48.8638, 2.2769],
  '17': [48.8872, 2.3048],
  '18': [48.8924, 2.3444],
  '19': [48.8817, 2.3825],
  '20': [48.8639, 2.3985],
};

// Custom marker icons
const createCustomIcon = (color: string, size: number = 24) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const primaryIcon = createCustomIcon('hsl(152, 60%, 35%)', 28);
const secondaryIcon = createCustomIcon('hsl(160, 50%, 45%)', 24);
const accentIcon = createCustomIcon('hsl(125, 50%, 45%)', 20);

// Polygon style configurations
const POLYGON_STYLES = {
  arrondissement: {
    default: {
      color: 'hsl(152, 60%, 35%)',
      weight: 2,
      opacity: 0.8,
      fillColor: 'hsl(152, 60%, 35%)',
      fillOpacity: 0.1,
    },
    selected: {
      color: 'hsl(152, 70%, 30%)',
      weight: 3,
      opacity: 1,
      fillColor: 'hsl(152, 60%, 45%)',
      fillOpacity: 0.25,
    },
    hover: {
      color: 'hsl(152, 70%, 40%)',
      weight: 3,
      opacity: 1,
      fillColor: 'hsl(152, 60%, 40%)',
      fillOpacity: 0.2,
    },
  },
  quartier: {
    default: {
      color: 'hsl(160, 50%, 45%)',
      weight: 2,
      opacity: 0.7,
      fillColor: 'hsl(160, 50%, 45%)',
      fillOpacity: 0.1,
    },
    selected: {
      color: 'hsl(160, 60%, 35%)',
      weight: 3,
      opacity: 1,
      fillColor: 'hsl(160, 50%, 50%)',
      fillOpacity: 0.3,
    },
  },
  espaceVert: {
    default: {
      color: 'hsl(125, 50%, 40%)',
      weight: 2,
      opacity: 0.8,
      fillColor: 'hsl(125, 60%, 50%)',
      fillOpacity: 0.3,
    },
    selected: {
      color: 'hsl(125, 60%, 30%)',
      weight: 3,
      opacity: 1,
      fillColor: 'hsl(125, 60%, 45%)',
      fillOpacity: 0.5,
    },
  },
};

interface ParisMapProps {
  level: ViewLevel;
  arrondissements: Arrondissement[];
  quartiers: Quartier[];
  espacesVerts: EspaceVert[];
  selectedArrondissement?: Arrondissement;
  selectedQuartier?: Quartier;
  selectedEspaceVert?: EspaceVert;
  onSelectArrondissement: (arr: Arrondissement) => void;
  onSelectQuartier: (q: Quartier) => void;
  onSelectEspaceVert: (ev: EspaceVert) => void;
}

export function ParisMap({
  level,
  arrondissements,
  quartiers,
  espacesVerts,
  selectedArrondissement,
  selectedQuartier,
  selectedEspaceVert,
  onSelectArrondissement,
  onSelectQuartier,
  onSelectEspaceVert,
}: ParisMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const polygonsRef = useRef<L.LayerGroup | null>(null);

  // Fetch GeoJSON data
  const { data: arrondissementsGeoJSON } = useArrondissementsGeoJSON();
  const { data: quartiersGeoJSON } = useQuartiersGeoJSON();
  const { data: espacesVertsGeoJSON } = useEspacesVertsGeoJSON();

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current).setView(PARIS_CENTER, PARIS_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    polygonsRef.current = L.layerGroup().addTo(mapRef.current);
    markersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Determine map center based on level
  const mapCenter = useMemo((): [number, number] => {
    if (level === 'espaces-verts' && selectedQuartier && selectedArrondissement) {
      const arrCode = selectedArrondissement.code || selectedArrondissement.id;
      if (arrCode && ARRONDISSEMENT_COORDS[arrCode]) {
        return ARRONDISSEMENT_COORDS[arrCode];
      }
    }
    if ((level === 'quartiers' || level === 'espaces-verts') && selectedArrondissement) {
      const code = selectedArrondissement.code || selectedArrondissement.id;
      if (ARRONDISSEMENT_COORDS[code]) {
        return ARRONDISSEMENT_COORDS[code];
      }
    }
    return [48.8566, 2.3522];
  }, [level, selectedArrondissement, selectedQuartier]);

  const zoom = useMemo(() => {
    if (level === 'espaces-verts') return 15;
    if (level === 'quartiers') return 14;
    return PARIS_ZOOM;
  }, [level]);

  // Filter data based on current selection
  const filteredQuartiers = useMemo(() => {
    if (!selectedArrondissement) return quartiers;
    return quartiers.filter(q =>
      q.arrondissement_id === selectedArrondissement.id ||
      q.arrondissement === selectedArrondissement.nom
    );
  }, [quartiers, selectedArrondissement]);

  const filteredEspacesVerts = useMemo(() => {
    if (!selectedQuartier) return espacesVerts;
    return espacesVerts.filter(ev =>
      ev.quartier_id === selectedQuartier.id ||
      ev.quartier === selectedQuartier.nom
    );
  }, [espacesVerts, selectedQuartier]);

  // Update map center and zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo(mapCenter, zoom, { duration: 0.5 });
    }
  }, [mapCenter, zoom]);

  // Helper: Find arrondissement code from data
  const getArrondissementCode = (arr: Arrondissement): number => {
    const code = arr.code || arr.id;
    return parseInt(code.replace(/\D/g, ''), 10);
  };

  // Helper: Match GeoJSON feature to arrondissement
  const findArrondissementFeature = (arr: Arrondissement): GeoJSONFeature | undefined => {
    if (!arrondissementsGeoJSON?.features) return undefined;
    const code = getArrondissementCode(arr);
    return arrondissementsGeoJSON.features.find(f => {
      const featureCode = f.properties.c_ar || f.properties.code_arr || f.properties.c_arinsee;
      if (typeof featureCode === 'number') return featureCode === code;
      if (typeof featureCode === 'string') {
        const parsed = parseInt(featureCode.replace(/\D/g, ''), 10);
        return parsed === code || parsed === (75100 + code);
      }
      return false;
    });
  };

  // Helper: Match GeoJSON feature to quartier
  const findQuartierFeature = (q: Quartier): GeoJSONFeature | undefined => {
    if (!quartiersGeoJSON?.features) return undefined;
    return quartiersGeoJSON.features.find(f => {
      const rawName = f.properties.l_qu || f.properties.nom || '';
      const featureName = typeof rawName === 'string' ? rawName.toLowerCase() : '';
      return featureName === q.nom.toLowerCase();
    });
  };

  // Helper: Match GeoJSON feature to espace vert
  const findEspaceVertFeature = (ev: EspaceVert): GeoJSONFeature | undefined => {
    if (!espacesVertsGeoJSON?.features) return undefined;
    return espacesVertsGeoJSON.features.find(f => {
      const rawName = f.properties.nom || f.properties.nom_ev || '';
      const featureName = typeof rawName === 'string' ? rawName.toLowerCase() : '';
      return featureName.includes(ev.nom.toLowerCase()) || ev.nom.toLowerCase().includes(featureName);
    });
  };

  // Generate coordinates for items
  const getQuartierCoords = (index: number): [number, number] => {
    const baseCoords = selectedArrondissement
      ? ARRONDISSEMENT_COORDS[selectedArrondissement.code || selectedArrondissement.id] || [48.8566, 2.3522]
      : [48.8566, 2.3522];

    const offset = 0.005;
    const angle = (index * 137.5) * (Math.PI / 180);
    const radius = Math.sqrt(index + 1) * offset * 0.5;

    return [
      baseCoords[0] + Math.cos(angle) * radius,
      baseCoords[1] + Math.sin(angle) * radius,
    ];
  };

  const getEspaceVertCoords = (index: number): [number, number] => {
    const baseCoords = selectedQuartier && selectedArrondissement
      ? ARRONDISSEMENT_COORDS[selectedArrondissement.code || selectedArrondissement.id] || [48.8566, 2.3522]
      : [48.8566, 2.3522];

    const offset = 0.003;
    const angle = (index * 137.5) * (Math.PI / 180);
    const radius = Math.sqrt(index + 1) * offset * 0.5;

    return [
      baseCoords[0] + Math.cos(angle) * radius,
      baseCoords[1] + Math.sin(angle) * radius,
    ];
  };

  // Update polygons when selection changes
  useEffect(() => {
    if (!polygonsRef.current || !mapRef.current) return;

    polygonsRef.current.clearLayers();

    // Show all arrondissement boundaries at arrondissements level
    if (level === 'arrondissements' && arrondissementsGeoJSON?.features) {
      arrondissementsGeoJSON.features.forEach((feature) => {
        const geoJsonLayer = L.geoJSON(feature as any, {
          style: POLYGON_STYLES.arrondissement.default,
        });

        geoJsonLayer.on('mouseover', () => {
          geoJsonLayer.setStyle(POLYGON_STYLES.arrondissement.hover);
        });

        geoJsonLayer.on('mouseout', () => {
          geoJsonLayer.setStyle(POLYGON_STYLES.arrondissement.default);
        });

        geoJsonLayer.on('click', () => {
          const code = feature.properties.c_ar || feature.properties.code_arr;
          const arr = arrondissements.find(a => getArrondissementCode(a) === code);
          if (arr) onSelectArrondissement(arr);
        });

        polygonsRef.current?.addLayer(geoJsonLayer);
      });
    }

    // Show selected arrondissement boundary at quartiers level
    if (level === 'quartiers' && selectedArrondissement) {
      const feature = findArrondissementFeature(selectedArrondissement);
      if (feature) {
        const geoJsonLayer = L.geoJSON(feature as any, {
          style: POLYGON_STYLES.arrondissement.selected,
        });
        polygonsRef.current?.addLayer(geoJsonLayer);
      }

      // Show quartier boundaries within selected arrondissement
      if (quartiersGeoJSON?.features) {
        const arrCode = getArrondissementCode(selectedArrondissement);
        quartiersGeoJSON.features
          .filter(f => {
            const featureArrCode = f.properties.c_ar || f.properties.code_arr;
            return featureArrCode === arrCode;
          })
          .forEach((feature) => {
            const geoJsonLayer = L.geoJSON(feature as any, {
              style: POLYGON_STYLES.quartier.default,
            });

            geoJsonLayer.on('click', () => {
              const rawName = feature.properties.l_qu || feature.properties.nom;
              const quartierName = typeof rawName === 'string' ? rawName : '';
              const q = filteredQuartiers.find(qu => qu.nom.toLowerCase() === quartierName?.toLowerCase());
              if (q) onSelectQuartier(q);
            });

            polygonsRef.current?.addLayer(geoJsonLayer);
          });
      }
    }

    // Show selected quartier boundary at espaces-verts level
    if (level === 'espaces-verts' && selectedQuartier) {
      // Keep arrondissement boundary visible but faded
      if (selectedArrondissement) {
        const arrFeature = findArrondissementFeature(selectedArrondissement);
        if (arrFeature) {
          const geoJsonLayer = L.geoJSON(arrFeature as any, {
            style: { ...POLYGON_STYLES.arrondissement.default, fillOpacity: 0.05 },
          });
          polygonsRef.current?.addLayer(geoJsonLayer);
        }
      }

      const quartierFeature = findQuartierFeature(selectedQuartier);
      if (quartierFeature) {
        const geoJsonLayer = L.geoJSON(quartierFeature as any, {
          style: POLYGON_STYLES.quartier.selected,
        });
        polygonsRef.current?.addLayer(geoJsonLayer);
      }

      // Show espace vert boundaries
      filteredEspacesVerts.forEach((ev) => {
        let feature: GeoJSONFeature | undefined;

        if (ev.geometry) {
          feature = {
            type: 'Feature',
            geometry: ev.geometry,
            properties: { ...ev }
          } as unknown as GeoJSONFeature;
        } else if (espacesVertsGeoJSON?.features) {
          feature = findEspaceVertFeature(ev);
        }

        if (feature) {
          const isSelected = selectedEspaceVert?.id === ev.id;
          const geoJsonLayer = L.geoJSON(feature as any, {
            style: isSelected ? POLYGON_STYLES.espaceVert.selected : POLYGON_STYLES.espaceVert.default,
          });

          geoJsonLayer.on('click', () => onSelectEspaceVert(ev));
          polygonsRef.current?.addLayer(geoJsonLayer);
        }
      });
    }
  }, [
    level,
    selectedArrondissement,
    selectedQuartier,
    selectedEspaceVert,
    arrondissementsGeoJSON,
    quartiersGeoJSON,
    espacesVertsGeoJSON,
    arrondissements,
    filteredQuartiers,
    filteredEspacesVerts,
    onSelectArrondissement,
    onSelectQuartier,
    onSelectEspaceVert,
  ]);

  // Update markers when data changes
  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add arrondissements markers (only if no GeoJSON available)
    if (level === 'arrondissements' && !arrondissementsGeoJSON?.features?.length) {
      arrondissements.forEach((arr) => {
        const code = arr.code || arr.id;
        const coords = ARRONDISSEMENT_COORDS[code];
        if (!coords) return;

        const marker = L.marker(coords, { icon: primaryIcon });
        marker.bindPopup(`<div class="font-semibold">${arr.nom || `${code}ème arrondissement`}</div>`);
        marker.on('click', () => onSelectArrondissement(arr));
        markersRef.current?.addLayer(marker);
      });
    }

    // Add quartiers markers
    if (level === 'quartiers') {
      filteredQuartiers.forEach((quartier, index) => {
        const feature = findQuartierFeature(quartier);
        let coords: [number, number];

        if (feature) {
          try {
            // Calculate centroid from GeoJSON
            const bounds = L.geoJSON(feature as any).getBounds();
            if (bounds.isValid()) {
              const center = bounds.getCenter();
              coords = [center.lat, center.lng];
            } else {
              coords = getQuartierCoords(index);
            }
          } catch {
            coords = getQuartierCoords(index);
          }
        } else {
          coords = getQuartierCoords(index);
        }

        const marker = L.marker(coords, { icon: secondaryIcon });
        marker.bindPopup(`<div class="font-semibold">${quartier.nom}</div>`);
        marker.on('click', () => onSelectQuartier(quartier));
        markersRef.current?.addLayer(marker);
      });
    }

    // Add espaces verts markers
    if (level === 'espaces-verts') {
      filteredEspacesVerts.forEach((ev, index) => {
        let feature: GeoJSONFeature | undefined;

        if (ev.geometry) {
          feature = {
            type: 'Feature',
            geometry: ev.geometry,
            properties: { ...ev }
          } as unknown as GeoJSONFeature;
        } else {
          feature = findEspaceVertFeature(ev);
        }

        let coords: [number, number];

        if (feature) {
          try {
            const bounds = L.geoJSON(feature as any).getBounds();
            if (bounds.isValid()) {
              const center = bounds.getCenter();
              coords = [center.lat, center.lng];
            } else {
              coords = getEspaceVertCoords(index);
            }
          } catch {
            coords = getEspaceVertCoords(index);
          }
        } else if (typeof (ev as any).lat === 'number' && typeof (ev as any).lng === 'number') {
          coords = [(ev as any).lat, (ev as any).lng];
        } else {
          coords = getEspaceVertCoords(index);
        }

        const marker = L.marker(coords, { icon: accentIcon });
        marker.bindPopup(`<div class="font-semibold">${ev.nom}</div>${ev.type ? `<div>${ev.type}</div>` : ''}`);
        marker.on('click', () => onSelectEspaceVert(ev));
        markersRef.current?.addLayer(marker);
      });
    }
  }, [
    level,
    arrondissements,
    filteredQuartiers,
    filteredEspacesVerts,
    arrondissementsGeoJSON,
    quartiersGeoJSON,
    espacesVertsGeoJSON,
    onSelectArrondissement,
    onSelectQuartier,
    onSelectEspaceVert
  ]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ minHeight: '100vh' }}
    />
  );
}
