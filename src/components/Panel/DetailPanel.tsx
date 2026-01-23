import { useState } from 'react';
import { X, ChevronRight, ArrowLeft, TreePine, MapPin, Building, Layers, Wind, Loader2, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Arrondissement, Quartier, EspaceVert, ViewLevel } from '@/types/paris';
import { usePollutionData, getPollutionLevel, getPollutionLevelByValue } from '@/hooks/usePollutionData';
import { PlantingRecommendation } from './PlantingRecommendation';
interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  level: ViewLevel;
  selectedArrondissement?: Arrondissement;
  selectedQuartier?: Quartier;
  selectedEspaceVert?: EspaceVert;
  quartiers: Quartier[];
  espacesVerts: EspaceVert[];
  onSelectQuartier: (q: Quartier) => void;
  onSelectEspaceVert: (ev: EspaceVert) => void;
  onGoBack: () => void;
}

export function DetailPanel({
  isOpen,
  onClose,
  level,
  selectedArrondissement,
  selectedQuartier,
  selectedEspaceVert,
  quartiers,
  espacesVerts,
  onSelectQuartier,
  onSelectEspaceVert,
  onGoBack,
}: DetailPanelProps) {
  // Single date state for pollution data - default to today
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Format date for API (use same date for start and end to get single day data)
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Fetch pollution data for selected date
  const { data: pollutionData, isLoading: isLoadingPollution } = usePollutionData(dateStr, dateStr);

  // Filter based on selection
  const filteredQuartiers = selectedArrondissement
    ? quartiers.filter(q =>
      q.arrondissement_id === selectedArrondissement.id ||
      q.arrondissement === selectedArrondissement.nom
    )
    : [];

  const filteredEspacesVerts = selectedQuartier
    ? espacesVerts.filter(ev =>
      ev.quartier_id === selectedQuartier.id ||
      ev.quartier === selectedQuartier.nom
    )
    : [];

  const renderBreadcrumb = () => {
    const items = [];

    if (selectedArrondissement) {
      items.push(
        <span key="arr" className="text-muted-foreground">
          {selectedArrondissement.nom || `${selectedArrondissement.code}ème`}
        </span>
      );
    }

    if (selectedQuartier) {
      items.push(
        <ChevronRight key="sep1" className="h-4 w-4 text-muted-foreground mx-1" />
      );
      items.push(
        <span key="q" className="text-muted-foreground">
          {selectedQuartier.nom}
        </span>
      );
    }

    if (selectedEspaceVert) {
      items.push(
        <ChevronRight key="sep2" className="h-4 w-4 text-muted-foreground mx-1" />
      );
      items.push(
        <span key="ev" className="text-foreground font-medium">
          {selectedEspaceVert.nom}
        </span>
      );
    }

    return items.length > 0 ? (
      <div className="flex items-center text-sm mb-4 flex-wrap">
        {items}
      </div>
    ) : null;
  };

  const renderContent = () => {
    // Show espace vert details
    if (level === 'espaces-verts' && selectedEspaceVert) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <TreePine className="h-5 w-5" />
            <span className="text-sm font-medium">Espace Vert</span>
          </div>

          <h2 className="text-xl font-bold text-foreground">
            {selectedEspaceVert.nom}
          </h2>

          <div className="space-y-3 pt-4 border-t border-border">
            {selectedEspaceVert.type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{selectedEspaceVert.type}</span>
              </div>
            )}
            {selectedEspaceVert.adresse && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Adresse</span>
                <span className="font-medium text-right max-w-[200px]">{selectedEspaceVert.adresse}</span>
              </div>
            )}
            {selectedEspaceVert.superficie && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Superficie</span>
                <span className="font-medium">{selectedEspaceVert.superficie.toLocaleString()} m²</span>
              </div>
            )}
            {selectedEspaceVert.horaires && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horaires</span>
                <span className="font-medium text-right max-w-[200px]">{selectedEspaceVert.horaires}</span>
              </div>
            )}
          </div>

          {/* Display all other properties */}
          <div className="space-y-2 pt-4 border-t border-border">
            <h3 className="font-semibold text-sm text-muted-foreground mb-3">Informations complémentaires</h3>
            {Object.entries(selectedEspaceVert)
              .filter(([key]) => !['id', 'nom', 'type', 'adresse', 'superficie', 'horaires', 'quartier_id', 'quartier', 'geometry', 'geom'].includes(key))
              .map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-medium text-right max-w-[180px] break-words">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))
            }
          </div>


        </div>
      );
    }

    // Show espaces verts list for selected quartier
    if (level === 'espaces-verts' && selectedQuartier) {
      // Get pollution level from average PM10 value
      const pollutionLevel = pollutionData?.average
        ? getPollutionLevelByValue(pollutionData.average.PM10)
        : null;

      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Layers className="h-5 w-5" />
            <span className="text-sm font-medium">Quartier</span>
          </div>

          <h2 className="text-xl font-bold text-foreground">
            {selectedQuartier.nom}
          </h2>

          {/* Pollution Section */}
          <div className="p-4 rounded-lg border border-border bg-secondary/50">
            <div className="flex items-center gap-2 mb-3">
              <Wind className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Qualité de l'Air</h3>
              {isLoadingPollution && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            {/* Date Picker Section */}
            <div className="flex flex-col gap-2 mb-4 p-3 bg-background rounded-lg border border-border">
              <span className="text-xs text-muted-foreground font-medium">Date</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    locale={fr}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {pollutionData && pollutionLevel ? (
              <div className="space-y-3">
                {/* Main Pollution Display - using average indice_urbain */}
                <div className="flex items-center gap-3">
                  <div className={cn("px-3 py-1.5 rounded-full font-bold text-lg", pollutionLevel.bgColor, pollutionLevel.color)}>
                    {pollutionData.average.indice_urbain.toFixed(2)}
                  </div>
                  <div>
                    <div className={cn("font-semibold", pollutionLevel.color)}>{pollutionLevel.label}</div>
                    <div className="text-xs text-muted-foreground">Indice Urbain</div>
                  </div>
                </div>

                {/* Pollutant Details - using available data */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div className="p-2 rounded bg-background">
                    <div className="text-xs text-muted-foreground">PM10</div>
                    <div className="font-semibold">{pollutionData.average.PM10.toFixed(1)} <span className="text-xs font-normal">µg/m³</span></div>
                  </div>
                  <div className="p-2 rounded bg-background">
                    <div className="text-xs text-muted-foreground">NO₂</div>
                    <div className="font-semibold">{pollutionData.average.NO2.toFixed(1)} <span className="text-xs font-normal">µg/m³</span></div>
                  </div>
                </div>

                {/* Period Info */}
                <div className="text-xs text-muted-foreground text-right">
                  Période: {pollutionData.periode}
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  Source: {pollutionData.source}
                </div>
              </div>
            ) : !isLoadingPollution ? (
              <p className="text-sm text-muted-foreground">Données non disponibles</p>
            ) : null}
          </div>

          {/* Planting Recommendation Button */}
          <PlantingRecommendation
            quartier={selectedQuartier}
          />

          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TreePine className="h-4 w-4 text-leaf" />
              Espaces Verts ({filteredEspacesVerts.length})
            </h3>

            {filteredEspacesVerts.length > 0 ? (
              <div className="space-y-2">
                {filteredEspacesVerts.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => onSelectEspaceVert(ev)}
                    className="w-full p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-leaf" />
                      <div>
                        <div className="font-medium text-secondary-foreground">{ev.nom}</div>
                        {ev.type && (
                          <div className="text-sm text-muted-foreground">{ev.type}</div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucun espace vert trouvé dans ce quartier.</p>
            )}
          </div>
        </div>
      );
    }

    // Show quartiers list for selected arrondissement
    if (level === 'quartiers' && selectedArrondissement) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Building className="h-5 w-5" />
            <span className="text-sm font-medium">Arrondissement</span>
          </div>

          <h2 className="text-xl font-bold text-foreground">
            {selectedArrondissement.nom || `${selectedArrondissement.code}ème Arrondissement`}
          </h2>

          {selectedArrondissement.population && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Population</span>
              <span className="font-medium">{selectedArrondissement.population.toLocaleString()}</span>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              Quartiers ({filteredQuartiers.length})
            </h3>

            {filteredQuartiers.length > 0 ? (
              <div className="space-y-2">
                {filteredQuartiers.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => onSelectQuartier(q)}
                    className="w-full p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      <span className="font-medium text-secondary-foreground">{q.nom}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucun quartier trouvé pour cet arrondissement.</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Sélectionnez un arrondissement sur la carte</p>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full w-[380px] bg-card border-l border-border shadow-xl transition-transform duration-300 ease-out z-[1000]",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="nature-gradient px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {level !== 'arrondissements' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onGoBack}
              className="text-primary-foreground hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="font-bold text-lg text-primary-foreground">
            {level === 'arrondissements' && 'Paris'}
            {level === 'quartiers' && 'Quartiers'}
            {level === 'espaces-verts' && 'Espaces Verts'}
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-primary-foreground hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100%-64px)]">
        <div className="p-4">
          {renderBreadcrumb()}
          {renderContent()}
        </div>
      </ScrollArea>
    </div>
  );
}
