import { useQuery } from '@tanstack/react-query';

const PARIS_OPENDATA_BASE = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets';

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// Fetch arrondissements GeoJSON boundaries
export function useArrondissementsGeoJSON() {
  return useQuery<GeoJSONCollection>({
    queryKey: ['arrondissements-geojson'],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${PARIS_OPENDATA_BASE}/arrondissements/exports/geojson`
        );
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      } catch (error) {
        console.info('Using fallback arrondissements GeoJSON');
        return FALLBACK_ARRONDISSEMENTS_GEOJSON;
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - boundaries don't change
  });
}

// Fetch quartiers GeoJSON boundaries
export function useQuartiersGeoJSON() {
  return useQuery<GeoJSONCollection>({
    queryKey: ['quartiers-geojson'],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${PARIS_OPENDATA_BASE}/quartier_paris/exports/geojson`
        );
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      } catch (error) {
        console.info('Using fallback quartiers GeoJSON');
        return FALLBACK_QUARTIERS_GEOJSON;
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

// Fetch espaces verts GeoJSON boundaries
export function useEspacesVertsGeoJSON() {
  return useQuery<GeoJSONCollection>({
    queryKey: ['espaces-verts-geojson'],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${PARIS_OPENDATA_BASE}/espaces_verts/exports/geojson`
        );
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      } catch (error) {
        console.info('Using fallback espaces verts GeoJSON');
        return FALLBACK_ESPACES_VERTS_GEOJSON;
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

// Simplified fallback GeoJSON with approximate boundaries for Paris arrondissements
const FALLBACK_ARRONDISSEMENTS_GEOJSON: GeoJSONCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.327, 48.855], [2.347, 48.855], [2.357, 48.862], [2.347, 48.868], [2.327, 48.868], [2.317, 48.862], [2.327, 48.855]]]
      },
      properties: { c_ar: 1, c_arinsee: 75101, l_ar: '1er Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.327, 48.862], [2.347, 48.862], [2.357, 48.872], [2.347, 48.878], [2.327, 48.878], [2.317, 48.872], [2.327, 48.862]]]
      },
      properties: { c_ar: 2, c_arinsee: 75102, l_ar: '2ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.347, 48.858], [2.370, 48.858], [2.375, 48.868], [2.370, 48.875], [2.347, 48.875], [2.342, 48.868], [2.347, 48.858]]]
      },
      properties: { c_ar: 3, c_arinsee: 75103, l_ar: '3ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.340, 48.845], [2.370, 48.845], [2.375, 48.855], [2.370, 48.862], [2.340, 48.862], [2.335, 48.855], [2.340, 48.845]]]
      },
      properties: { c_ar: 4, c_arinsee: 75104, l_ar: '4ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.330, 48.838], [2.360, 48.838], [2.365, 48.848], [2.360, 48.855], [2.330, 48.855], [2.325, 48.848], [2.330, 48.838]]]
      },
      properties: { c_ar: 5, c_arinsee: 75105, l_ar: '5ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.315, 48.842], [2.340, 48.842], [2.345, 48.852], [2.340, 48.858], [2.315, 48.858], [2.310, 48.852], [2.315, 48.842]]]
      },
      properties: { c_ar: 6, c_arinsee: 75106, l_ar: '6ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.290, 48.850], [2.320, 48.850], [2.325, 48.860], [2.320, 48.868], [2.290, 48.868], [2.285, 48.860], [2.290, 48.850]]]
      },
      properties: { c_ar: 7, c_arinsee: 75107, l_ar: '7ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.290, 48.865], [2.325, 48.865], [2.330, 48.875], [2.325, 48.885], [2.290, 48.885], [2.285, 48.875], [2.290, 48.865]]]
      },
      properties: { c_ar: 8, c_arinsee: 75108, l_ar: '8ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.325, 48.868], [2.350, 48.868], [2.355, 48.878], [2.350, 48.885], [2.325, 48.885], [2.320, 48.878], [2.325, 48.868]]]
      },
      properties: { c_ar: 9, c_arinsee: 75109, l_ar: '9ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.350, 48.868], [2.380, 48.868], [2.385, 48.878], [2.380, 48.885], [2.350, 48.885], [2.345, 48.878], [2.350, 48.868]]]
      },
      properties: { c_ar: 10, c_arinsee: 75110, l_ar: '10ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.365, 48.850], [2.395, 48.850], [2.400, 48.865], [2.395, 48.875], [2.365, 48.875], [2.360, 48.865], [2.365, 48.850]]]
      },
      properties: { c_ar: 11, c_arinsee: 75111, l_ar: '11ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.370, 48.825], [2.420, 48.825], [2.430, 48.845], [2.420, 48.860], [2.370, 48.860], [2.360, 48.845], [2.370, 48.825]]]
      },
      properties: { c_ar: 12, c_arinsee: 75112, l_ar: '12ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.340, 48.818], [2.390, 48.818], [2.400, 48.835], [2.390, 48.848], [2.340, 48.848], [2.330, 48.835], [2.340, 48.818]]]
      },
      properties: { c_ar: 13, c_arinsee: 75113, l_ar: '13ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.305, 48.818], [2.345, 48.818], [2.350, 48.835], [2.345, 48.848], [2.305, 48.848], [2.300, 48.835], [2.305, 48.818]]]
      },
      properties: { c_ar: 14, c_arinsee: 75114, l_ar: '14ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.265, 48.830], [2.310, 48.830], [2.320, 48.848], [2.310, 48.860], [2.265, 48.860], [2.255, 48.848], [2.265, 48.830]]]
      },
      properties: { c_ar: 15, c_arinsee: 75115, l_ar: '15ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.240, 48.845], [2.290, 48.845], [2.295, 48.865], [2.290, 48.885], [2.240, 48.885], [2.235, 48.865], [2.240, 48.845]]]
      },
      properties: { c_ar: 16, c_arinsee: 75116, l_ar: '16ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.280, 48.878], [2.330, 48.878], [2.340, 48.895], [2.330, 48.908], [2.280, 48.908], [2.270, 48.895], [2.280, 48.878]]]
      },
      properties: { c_ar: 17, c_arinsee: 75117, l_ar: '17ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.330, 48.880], [2.370, 48.880], [2.380, 48.895], [2.370, 48.905], [2.330, 48.905], [2.320, 48.895], [2.330, 48.880]]]
      },
      properties: { c_ar: 18, c_arinsee: 75118, l_ar: '18ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.370, 48.870], [2.410, 48.870], [2.420, 48.888], [2.410, 48.900], [2.370, 48.900], [2.360, 48.888], [2.370, 48.870]]]
      },
      properties: { c_ar: 19, c_arinsee: 75119, l_ar: '19ème Ardt' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[2.385, 48.850], [2.420, 48.850], [2.430, 48.868], [2.420, 48.880], [2.385, 48.880], [2.375, 48.868], [2.385, 48.850]]]
      },
      properties: { c_ar: 20, c_arinsee: 75120, l_ar: '20ème Ardt' }
    }
  ]
};

// Fallback quartiers - simplified boundaries
const FALLBACK_QUARTIERS_GEOJSON: GeoJSONCollection = {
  type: 'FeatureCollection',
  features: [] // Will use arrondissement boundaries subdivided when no real data
};

// Fallback espaces verts - simplified
const FALLBACK_ESPACES_VERTS_GEOJSON: GeoJSONCollection = {
  type: 'FeatureCollection',
  features: [] // Will use circle approximations when no real data
};
