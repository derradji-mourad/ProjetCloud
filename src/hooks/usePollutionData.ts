import { useQuery } from '@tanstack/react-query';

// Matches the API response structure per arrondissement
export interface ArrondissementPollution {
  zipcode: string;
  NO2_moyenne: number;
  PM10_moyenne: number;
  indice_urbain: number;
  niveau: string;
}

// API response structure
export interface PollutionApiResponse {
  periode: string;
  source_arrondissements: string;
  source_pollution: string;
  nb_arrondissements: number;
  resultats: ArrondissementPollution[];
}

// Normalized record for internal use
export interface PollutionRecord {
  zipcode: string;
  NO2: number;
  PM10: number;
  indice_urbain: number;
  niveau: string;
}

export interface PollutionData {
  periode: string;
  source: string;
  records: PollutionRecord[];
  average: {
    NO2: number;
    PM10: number;
    indice_urbain: number;
  };
}

export interface PollutionLevel {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

// Based on the 'niveau' field from API
export function getPollutionLevel(niveau: string): PollutionLevel {
  switch (niveau.toLowerCase()) {
    case 'faible':
      return { label: 'Faible', color: 'text-green-600', bgColor: 'bg-green-100', description: 'Qualité de l\'air excellente' };
    case 'modéré':
    case 'modere':
      return { label: 'Modéré', color: 'text-yellow-600', bgColor: 'bg-yellow-100', description: 'Qualité de l\'air modérée' };
    case 'élevé':
    case 'eleve':
      return { label: 'Élevé', color: 'text-orange-600', bgColor: 'bg-orange-100', description: 'Qualité de l\'air médiocre' };
    case 'très élevé':
    case 'tres eleve':
      return { label: 'Très élevé', color: 'text-red-600', bgColor: 'bg-red-100', description: 'Qualité de l\'air mauvaise' };
    default:
      return { label: niveau, color: 'text-gray-600', bgColor: 'bg-gray-100', description: 'Niveau inconnu' };
  }
}

// Helper to get level from numeric value (for backward compatibility)
export function getPollutionLevelByValue(pm10: number): PollutionLevel {
  if (pm10 <= 20) {
    return { label: 'Faible', color: 'text-green-600', bgColor: 'bg-green-100', description: 'Qualité de l\'air excellente' };
  } else if (pm10 <= 40) {
    return { label: 'Modéré', color: 'text-yellow-600', bgColor: 'bg-yellow-100', description: 'Qualité de l\'air modérée' };
  } else if (pm10 <= 60) {
    return { label: 'Élevé', color: 'text-orange-600', bgColor: 'bg-orange-100', description: 'Qualité de l\'air médiocre' };
  } else {
    return { label: 'Très élevé', color: 'text-red-600', bgColor: 'bg-red-100', description: 'Qualité de l\'air mauvaise' };
  }
}

const POLLUTION_API = 'https://nx1hao3rlc.execute-api.eu-west-3.amazonaws.com/pollution';

export function usePollutionData(startDate?: string, endDate?: string) {
  // Default to last 6 months of data
  const defaultEnd = new Date().toISOString().split('T')[0];
  const defaultStart = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const start = startDate || defaultStart;
  const end = endDate || defaultEnd;

  return useQuery<PollutionData | null>({
    queryKey: ['pollution', start, end],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${POLLUTION_API}?start_date=${start}&end_date=${end}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PollutionApiResponse = await response.json();

        // Map API response to normalized records
        const records: PollutionRecord[] = (data.resultats || []).map((item) => ({
          zipcode: item.zipcode,
          NO2: item.NO2_moyenne,
          PM10: item.PM10_moyenne,
          indice_urbain: item.indice_urbain,
          niveau: item.niveau,
        }));

        // Calculate averages across all arrondissements
        const average = records.length > 0 ? {
          NO2: records.reduce((sum, r) => sum + r.NO2, 0) / records.length,
          PM10: records.reduce((sum, r) => sum + r.PM10, 0) / records.length,
          indice_urbain: records.reduce((sum, r) => sum + r.indice_urbain, 0) / records.length,
        } : { NO2: 0, PM10: 0, indice_urbain: 0 };

        return {
          periode: data.periode,
          source: data.source_pollution,
          records,
          average,
        };
      } catch (error) {
        console.error('Pollution API Error:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes
  });
}
