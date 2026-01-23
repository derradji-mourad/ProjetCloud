import { useState } from 'react';
import { Sprout, Loader2, Trees, Leaf, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePlantingSimulation, type PlantingSimulationParams, type PlantingPlan } from '@/hooks/usePlantingSimulation';
import type { EspaceVert, Arrondissement, Quartier } from '@/types/paris';

interface PlantingRecommendationProps {
  arrondissement?: Arrondissement;
  quartier?: Quartier;

}

export function PlantingRecommendation({ arrondissement, quartier }: PlantingRecommendationProps) {
  const [showPrediction, setShowPrediction] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedQuartier, setExpandedQuartier] = useState<string | null>(null);

  // Determine zone parameters - use topK: 20 to limit results
  const params: PlantingSimulationParams | null = showPrediction
    ? quartier
      ? {
        zoneType: 'quartier',
        zoneId: quartier.id, // e.g. "32"
        includeRoads: true,
        useSpeciesPerEv: false,
        topK: 20,
        maxPerRoad: 10,
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
          maxPerRoad: 10,
          plans: 'impact_max,biodiversite',
        }
        : null
    : null;

  const { data: simulation, isLoading, error } = usePlantingSimulation(params);

  // Group recommendations by quartier/zipcode
  const groupByQuartier = (recommendations: typeof simulation.plans[0]['recommendations']) => {
    const groups: Record<string, typeof recommendations> = {};
    recommendations.forEach(rec => {
      const key = rec.zipcode || 'Autre';
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
    });
    return groups;
  };

  const togglePlan = (planType: string) => {
    setExpandedPlan(expandedPlan === planType ? null : planType);
    setExpandedQuartier(null); // Reset quartier expansion when changing plans
  };

  const toggleQuartier = (quartierKey: string) => {
    setExpandedQuartier(expandedQuartier === quartierKey ? null : quartierKey);
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

          {/* Timestamp */}
          {simulation.generated_at && (
            <div className="text-xs text-muted-foreground text-center">
              Généré le: {new Date(simulation.generated_at).toLocaleString('fr-FR')}
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
                  {(() => {
                    const grouped = groupByQuartier(plan.recommendations);
                    return Object.entries(grouped).map(([quartierKey, recs]) => (
                      <div key={quartierKey} className="border border-border/50 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleQuartier(`${plan.plan_type}-${quartierKey}`)}
                          className="w-full p-2 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-primary" />
                            <span className="text-sm font-medium">{quartierKey}</span>
                            <span className="text-xs text-muted-foreground">
                              ({recs.length} lieux)
                            </span>
                          </div>
                          {expandedQuartier === `${plan.plan_type}-${quartierKey}` ? (
                            <ChevronUp className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>

                        {expandedQuartier === `${plan.plan_type}-${quartierKey}` && (
                          <div className="p-2 space-y-2 bg-background">
                            {recs.map((rec, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-secondary/20 border border-border/30 shadow-sm"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{rec.target_name}</div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {rec.category && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded border border-border">
                                          {rec.category}
                                        </span>
                                      )}
                                      {rec.type && rec.type !== rec.category && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                                          {rec.type}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    {rec.nb_arbres_recommande && rec.nb_arbres_recommande > 0 && (
                                      <span className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      )}>
                                        +{rec.nb_arbres_recommande} arbres
                                      </span>
                                    )}
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                      Score: {rec.score_priorite}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                                  {rec.usable_m2 !== undefined && rec.usable_m2 > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium text-foreground">{rec.usable_m2.toLocaleString()} m²</span>
                                      <span>utilisables</span>
                                    </div>
                                  )}
                                </div>

                                {rec.tree_species_reco && rec.tree_species_reco.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-border/50">
                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Espèces recommandées</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {rec.tree_species_reco.map((spec, i) => (
                                        <span
                                          key={i}
                                          className="text-xs px-2 py-1 bg-primary/5 text-primary rounded-md flex items-center gap-1"
                                          title={`Ratio recommandé: ${Math.round(spec.ratio * 100)}%`}
                                        >
                                          {spec.spece}
                                          <span className="text-[10px] opacity-60">
                                            {Math.round(spec.ratio * 100)}%
                                          </span>
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Technical Details - Compact */}
                                <div className="mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                                  <span>Densité: <span className="font-mono">{rec.density_per_ha ? rec.density_per_ha.toFixed(1) : 0}/ha</span></span>
                                  <span>Existants: <span className="font-mono">{rec.trees_count}</span></span>
                                  <span>Capacité: <span className="font-mono">{rec.nb_arbres_possible}</span></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
