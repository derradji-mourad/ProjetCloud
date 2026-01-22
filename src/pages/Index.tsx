import { useState, useCallback } from 'react';
import { ParisMap } from '@/components/Map/ParisMap';
import { DetailPanel } from '@/components/Panel/DetailPanel';
import { SearchBar } from '@/components/Search/SearchBar';
import { useArrondissements, useQuartiers, useEspacesVerts } from '@/hooks/useParisData';
import type { Arrondissement, Quartier, EspaceVert, ViewLevel } from '@/types/paris';
import { Loader2, TreePine } from 'lucide-react';

const Index = () => {
  const [level, setLevel] = useState<ViewLevel>('arrondissements');
  const [selectedArrondissement, setSelectedArrondissement] = useState<Arrondissement | undefined>();
  const [selectedQuartier, setSelectedQuartier] = useState<Quartier | undefined>();
  const [selectedEspaceVert, setSelectedEspaceVert] = useState<EspaceVert | undefined>();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { data: arrondissements = [], isLoading: loadingArr } = useArrondissements();
  const { data: quartiers = [], isLoading: loadingQ } = useQuartiers();
  const { data: espacesVerts = [], isLoading: loadingEV } = useEspacesVerts();

  const isLoading = loadingArr || loadingQ || loadingEV;

  const handleSelectArrondissement = useCallback((arr: Arrondissement) => {
    setSelectedArrondissement(arr);
    setSelectedQuartier(undefined);
    setSelectedEspaceVert(undefined);
    setLevel('quartiers');
    setIsPanelOpen(true);
  }, []);

  const handleSelectQuartier = useCallback((q: Quartier) => {
    setSelectedQuartier(q);
    setSelectedEspaceVert(undefined);
    setLevel('espaces-verts');
    setIsPanelOpen(true);
  }, []);

  const handleSelectEspaceVert = useCallback((ev: EspaceVert) => {
    setSelectedEspaceVert(ev);
    setIsPanelOpen(true);
  }, []);

  const handleGoBack = useCallback(() => {
    if (selectedEspaceVert) {
      setSelectedEspaceVert(undefined);
    } else if (level === 'espaces-verts') {
      setLevel('quartiers');
      setSelectedQuartier(undefined);
    } else if (level === 'quartiers') {
      setLevel('arrondissements');
      setSelectedArrondissement(undefined);
    }
  }, [level, selectedEspaceVert]);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    // Reset to arrondissements view when closing panel
    setLevel('arrondissements');
    setSelectedArrondissement(undefined);
    setSelectedQuartier(undefined);
    setSelectedEspaceVert(undefined);
  }, []);

  // For search: navigate directly to the item
  const handleSearchSelectArrondissement = useCallback((arr: Arrondissement) => {
    setSelectedArrondissement(arr);
    setSelectedQuartier(undefined);
    setSelectedEspaceVert(undefined);
    setLevel('quartiers');
    setIsPanelOpen(true);
  }, []);

  const handleSearchSelectQuartier = useCallback((q: Quartier) => {
    // Find parent arrondissement if possible
    const parentArr = arrondissements.find(a => 
      a.id === q.arrondissement_id || a.nom === q.arrondissement
    );
    if (parentArr) setSelectedArrondissement(parentArr);
    setSelectedQuartier(q);
    setSelectedEspaceVert(undefined);
    setLevel('espaces-verts');
    setIsPanelOpen(true);
  }, [arrondissements]);

  const handleSearchSelectEspaceVert = useCallback((ev: EspaceVert) => {
    // Find parent quartier and arrondissement
    const parentQ = quartiers.find(q => 
      q.id === ev.quartier_id || q.nom === ev.quartier
    );
    if (parentQ) {
      const parentArr = arrondissements.find(a => 
        a.id === parentQ.arrondissement_id || a.nom === parentQ.arrondissement
      );
      if (parentArr) setSelectedArrondissement(parentArr);
      setSelectedQuartier(parentQ);
    }
    setSelectedEspaceVert(ev);
    setLevel('espaces-verts');
    setIsPanelOpen(true);
  }, [arrondissements, quartiers]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0" style={{ height: '100vh', width: '100vw' }}>
        <ParisMap
          level={level}
          arrondissements={arrondissements}
          quartiers={quartiers}
          espacesVerts={espacesVerts}
          selectedArrondissement={selectedArrondissement}
          selectedQuartier={selectedQuartier}
          selectedEspaceVert={selectedEspaceVert}
          onSelectArrondissement={handleSelectArrondissement}
          onSelectQuartier={handleSelectQuartier}
          onSelectEspaceVert={handleSelectEspaceVert}
        />
      </div>

      {/* Search */}
      <SearchBar
        arrondissements={arrondissements}
        quartiers={quartiers}
        espacesVerts={espacesVerts}
        onSelectArrondissement={handleSearchSelectArrondissement}
        onSelectQuartier={handleSearchSelectQuartier}
        onSelectEspaceVert={handleSearchSelectEspaceVert}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 right-4 z-[1000] bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-border flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Chargement...</span>
        </div>
      )}

      {/* Level indicator */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-border">
        <div className="flex items-center gap-2 text-sm">
          <TreePine className="h-4 w-4 text-primary" />
          <span className="text-foreground font-medium">
            {isLoading ? 'Paris' : (
              <>
                {level === 'arrondissements' && `${arrondissements.length} Arrondissements`}
                {level === 'quartiers' && `${quartiers.filter(q => q.arrondissement_id === selectedArrondissement?.id || q.arrondissement === selectedArrondissement?.nom).length} Quartiers`}
                {level === 'espaces-verts' && `${espacesVerts.filter(ev => ev.quartier_id === selectedQuartier?.id || ev.quartier === selectedQuartier?.nom).length} Espaces Verts`}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Detail Panel */}
      <DetailPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        level={level}
        selectedArrondissement={selectedArrondissement}
        selectedQuartier={selectedQuartier}
        selectedEspaceVert={selectedEspaceVert}
        quartiers={quartiers}
        espacesVerts={espacesVerts}
        onSelectQuartier={handleSelectQuartier}
        onSelectEspaceVert={handleSelectEspaceVert}
        onGoBack={handleGoBack}
      />
    </div>
  );
};

export default Index;
