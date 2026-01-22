import { useQuery } from '@tanstack/react-query';

export interface PlantingPlan {
  plan_type: string;
  params?: {
    w_deficit?: number;
    w_capacity?: number;
    max_species_share?: number;
    top_species?: number;
  };
  count?: number;
  recommendations: PlantRecommendation[];
  total_impact?: number;
  biodiversity_score?: number;
}

export interface PlantRecommendation {
  target_type: string;
  target_id: string;
  target_name: string;
  zipcode?: string;
  trees_count?: number;
  nb_arbres_possible?: number | null;
  features?: {
    deficit?: number;
    capacity_norm?: number;
  };
  score_priorite: number;
  nb_arbres_recommande: number;
  // Legacy fields for backward compatibility
  species?: string;
  location?: string;
  road_name?: string;
  quantity?: number;
}

export interface PlantingSimulationData {
  zone_type: string;
  zone_id: string | number;
  generated_at?: string;
  plans: PlantingPlan[];
  summary?: {
    total_trees: number;
    total_locations: number;
    average_priority_score: number;
  };
}

const PLANTING_API = 'https://0ywkwjo2v9.execute-api.eu-west-3.amazonaws.com/planting_simulation';

export interface PlantingSimulationParams {
  zoneType: 'arrondissement' | 'quartier' | 'espace_vert';
  zoneId: string | number;
  includeRoads?: boolean;
  useSpeciesPerEv?: boolean;
  topK?: number;
  maxPerRoad?: number;
  plans?: string;
}

export function usePlantingSimulation(params: PlantingSimulationParams | null) {
  return useQuery<PlantingSimulationData | null>({
    queryKey: ['planting-simulation', params],
    queryFn: async () => {
      if (!params) return null;

      try {
        const queryParams = new URLSearchParams({
          zone_type: params.zoneType,
          zone_id: String(params.zoneId),
          include_roads: String(params.includeRoads ?? true),
          use_species_per_ev: String(params.useSpeciesPerEv ?? false),
          top_k: String(params.topK ?? 20),
          max_per_road: String(params.maxPerRoad ?? 8),
          plans: params.plans ?? 'impact_max,biodiversite',
        });

        const response = await fetch(`${PLANTING_API}?${queryParams}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Parse API response
        const plans: PlantingPlan[] = [];

        // Handle the actual API response format: { plans: [{plan_id, results: [...]}] }
        if (Array.isArray(data.plans)) {
          for (const planData of data.plans) {
            const results = planData.results || planData.recommendations || [];
            const recommendations: PlantRecommendation[] = Array.isArray(results)
              ? results.map((r: any) => ({
                target_type: r.target_type || 'unknown',
                target_id: r.target_id || 'unknown',
                target_name: r.target_name || 'Unknown Location',
                zipcode: r.zipcode,
                trees_count: r.trees_count,
                nb_arbres_possible: r.nb_arbres_possible,
                features: r.features,
                score_priorite: r.score_priorite || 0,
                nb_arbres_recommande: r.nb_arbres_recommande || 1,
                // Legacy mapping
                species: 'TBD',
                location: r.target_name,
                quantity: r.nb_arbres_recommande || 1,
              }))
              : [];

            plans.push({
              plan_type: planData.plan_id || 'unknown',
              params: planData.params,
              count: planData.count,
              recommendations,
              total_impact: 0,
              biodiversity_score: 0,
            });
          }
        }

        // Calculate summary
        const allRecommendations = plans.flatMap(p => p.recommendations);
        const totalTrees = allRecommendations.reduce((sum, r) => sum + (r.nb_arbres_recommande || 0), 0);
        const uniqueLocations = new Set(allRecommendations.map(r => r.target_id));

        return {
          zone_type: params.zoneType,
          zone_id: params.zoneId,
          generated_at: data.generated_at,
          plans,
          summary: {
            total_trees: totalTrees,
            total_locations: uniqueLocations.size,
            average_priority_score: allRecommendations.length > 0
              ? allRecommendations.reduce((sum, r) => sum + (r.score_priorite || 0), 0) / allRecommendations.length
              : 0,
          },
        };
      } catch (error) {
        console.error('Planting Simulation API Error:', error);
        return null;
      }
    },
    enabled: !!params,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
