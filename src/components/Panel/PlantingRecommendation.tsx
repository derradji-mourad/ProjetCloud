import { useState } from 'react';
import { Sprout, Loader2, Trees, Leaf, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePlantingSimulation, type PlantingSimulationParams, type PlantingPlan } from '@/hooks/usePlantingSimulation';
import type { EspaceVert, Arrondissement, Quartier } from '@/types/paris';

interface PlantingRecommendationProps {
  espaceVert?: EspaceVert;
  arrondissement?: Arrondissement;
  quartier?: Quartier;
}

export function PlantingRecommendation({ espaceVert, arrondissement, quartier }: PlantingRecommendationProps) {
  const [showPrediction, setShowPrediction] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  // Determine zone parameters
  const params: PlantingSimulationParams | null = showPrediction
    ? espaceVert
      ? {
        zoneType: 'espace_vert',
        zoneId: espaceVert.id,
        includeRoads: false,
        useSpeciesPerEv: true,
        topK: 10,
        plans: 'impact_max,biodiversite',
      }
      : quartier
        ? {
          zoneType: 'quartier',
          zoneId: quartier.id, // e.g. "32"
          includeRoads: true,
          useSpeciesPerEv: false,
          topK: 20,
          maxPerRoad: 8,
          plans: 'impact_max,biodiversite',
        }
        : arrondissement
          ? {
            zoneType: 'arrondissement',
            // API requires 5-digit zipcode (e.g. 75012), not the 2-digit code
            zoneId: arrondissement.zipcode || (arrondissement.code ? `750${arrondissement.code.padStart(2, '0')}` : arrondissement.id),
            includeRoads: true,
            useSpeciesPerEv: false,
            topK: 20,
            maxPerRoad: 8,
            plans: 'impact_max,biodiversite',
          }
          : null
    : null;

  const { data: simulation, isLoading, error } = usePlantingSimulation(params);

  const togglePlan = (planType: string) => {
    setExpandedPlan(expandedPlan === planType ? null : planType);
  };

  const getPlanDisplayName = (planType: string) => {
    switch (planType) {
      case 'impact_max':
        return 'Impact Maximum';
      case 'biodiversite':
        return 'Biodiversité';
      default:
        return planType.replace(/_/g, ' ');
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'impact_max':
        return <Trees className="h-4 w-4" />;
      case 'biodiversite':
        return <Leaf className="h-4 w-4" />;
      default:
        return <Sprout className="h-4 w-4" />;
    }
  };

  if (!showPrediction) {
    return (
      <Button
        onClick={() => setShowPrediction(true)}
        className="w-full mt-4 bg-primary hover:bg-primary/90"
        size="lg"
      >
        <Sprout className="h-5 w-5 mr-2" />
        Prédiction de Plantation
      </Button>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-lg border border-border bg-secondary/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Recommandations de Plantation</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPrediction(false)}
          className="text-muted-foreground"
        >
          Fermer
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Analyse en cours...</span>
        </div>
      ) : error ? (
        <p className="text-sm text-muted-foreground py-4">
          Impossible de charger les recommandations. Veuillez réessayer.
        </p>
      ) : !simulation || simulation.plans.every(p => p.recommendations.length === 0) ? (
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Aucune recommandation de plantation disponible pour cette zone.
          </p>
          <p className="text-xs text-muted-foreground">
            Les données de simulation ne sont pas encore disponibles pour cet arrondissement.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          {simulation.summary && simulation.summary.total_trees > 0 && (
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-background">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{simulation.summary.total_trees}</div>
                <div className="text-xs text-muted-foreground">Arbres proposés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{simulation.summary.total_locations}</div>
                <div className="text-xs text-muted-foreground">Lieux identifiés</div>
              </div>
            </div>
          )}

          {/* Plans */}
          {simulation.plans.map((plan: PlantingPlan) => (
            <div key={plan.plan_type} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => togglePlan(plan.plan_type)}
                className="w-full p-3 flex items-center justify-between bg-background hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  {getPlanIcon(plan.plan_type)}
                  <span className="font-medium">{getPlanDisplayName(plan.plan_type)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({plan.recommendations.length} lieux)
                  </span>
                </div>
                {expandedPlan === plan.plan_type ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {expandedPlan === plan.plan_type && (
                <div className="p-3 space-y-2 border-t border-border bg-secondary/30">
                  {plan.recommendations.slice(0, 10).map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-background flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{rec.target_name}</div>
                        <div className="text-xs text-muted-foreground italic">
                          Priorité: {rec.score_priorite}/100
                        </div>
                        {rec.zipcode && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {rec.zipcode}
                          </div>
                        )}
                      </div>
                      {rec.nb_arbres_recommande && rec.nb_arbres_recommande > 0 && (
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          "bg-primary/10 text-primary"
                        )}>
                          +{rec.nb_arbres_recommande} arbres
                        </span>
                      )}
                    </div>
                  ))}
                  {plan.recommendations.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{plan.recommendations.length - 10} autres recommandations
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
