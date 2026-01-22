export interface Arrondissement {
  id: string;
  nom: string;
  code: string;
  zipcode?: string;
  population?: number;
  superficie?: number;
  [key: string]: unknown;
}

export interface Quartier {
  id: string;
  nom: string;
  arrondissement_id?: string;
  arrondissement?: string;
  [key: string]: unknown;
}

export interface EspaceVert {
  id: string;
  nom: string;
  quartier_id?: string;
  quartier?: string;
  type?: string;
  adresse?: string;
  superficie?: number;
  horaires?: string;
  geometry?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  [key: string]: unknown;
}

export type ViewLevel = 'arrondissements' | 'quartiers' | 'espaces-verts';

export interface NavigationState {
  level: ViewLevel;
  selectedArrondissement?: Arrondissement;
  selectedQuartier?: Quartier;
  selectedEspaceVert?: EspaceVert;
}
