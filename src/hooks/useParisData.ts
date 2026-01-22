import { useQuery } from '@tanstack/react-query';
import type { Arrondissement, Quartier, EspaceVert } from '@/types/paris';
import { toast } from '@/hooks/use-toast';

const API_BASE = 'https://0ywkwjo2v9.execute-api.eu-west-3.amazonaws.com';

// Fallback data for the 20 arrondissements
const FALLBACK_ARRONDISSEMENTS: Arrondissement[] = [
  { id: '1', code: '1', nom: '1er Arrondissement' },
  { id: '2', code: '2', nom: '2ème Arrondissement' },
  { id: '3', code: '3', nom: '3ème Arrondissement' },
  { id: '4', code: '4', nom: '4ème Arrondissement' },
  { id: '5', code: '5', nom: '5ème Arrondissement' },
  { id: '6', code: '6', nom: '6ème Arrondissement' },
  { id: '7', code: '7', nom: '7ème Arrondissement' },
  { id: '8', code: '8', nom: '8ème Arrondissement' },
  { id: '9', code: '9', nom: '9ème Arrondissement' },
  { id: '10', code: '10', nom: '10ème Arrondissement' },
  { id: '11', code: '11', nom: '11ème Arrondissement' },
  { id: '12', code: '12', nom: '12ème Arrondissement' },
  { id: '13', code: '13', nom: '13ème Arrondissement' },
  { id: '14', code: '14', nom: '14ème Arrondissement' },
  { id: '15', code: '15', nom: '15ème Arrondissement' },
  { id: '16', code: '16', nom: '16ème Arrondissement' },
  { id: '17', code: '17', nom: '17ème Arrondissement' },
  { id: '18', code: '18', nom: '18ème Arrondissement' },
  { id: '19', code: '19', nom: '19ème Arrondissement' },
  { id: '20', code: '20', nom: '20ème Arrondissement' },
];

export function useArrondissements() {
  return useQuery<Arrondissement[]>({
    queryKey: ['arrondissements'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE}/arrondissements`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json = await response.json();
        const data = Array.isArray(json) ? json : (json.data || []);

        if (Array.isArray(data) && data.length > 0) {
          // Transform API field names to expected structure
          const transformedData: Arrondissement[] = data.map((item: Record<string, unknown>) => ({
            id: String(item.id || item.zipcode || item.c_ar || ''),
            nom: String(item.zonename || item.nom || item.l_ar || `${item.c_ar}ème Arrondissement`),
            code: String(item.zipcode?.toString().slice(-2) || item.code || item.c_ar || ''),
            population: item.population as number | undefined,
            superficie: (item.superficie || item.area) as number | undefined,
            ...item,
          }));
          toast({
            title: "Connected to Live Data",
            description: "Successfully loaded arrondissements from API",
          });
          return transformedData;
        }
        throw new Error('Empty data received');
      } catch (error) {
        console.error('API Error:', error);
        toast({
          title: "Offline Mode (Arrondissements)",
          description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
        return FALLBACK_ARRONDISSEMENTS;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Fallback data for quartiers (4 quartiers per arrondissement = 80 total)
const FALLBACK_QUARTIERS: Quartier[] = [
  // 1er Arrondissement
  { id: 'q1', nom: 'Saint-Germain-l\'Auxerrois', arrondissement_id: '1', arrondissement: '1er Arrondissement' },
  { id: 'q2', nom: 'Halles', arrondissement_id: '1', arrondissement: '1er Arrondissement' },
  { id: 'q3', nom: 'Palais-Royal', arrondissement_id: '1', arrondissement: '1er Arrondissement' },
  { id: 'q4', nom: 'Place Vendôme', arrondissement_id: '1', arrondissement: '1er Arrondissement' },
  // 2ème Arrondissement
  { id: 'q5', nom: 'Gaillon', arrondissement_id: '2', arrondissement: '2ème Arrondissement' },
  { id: 'q6', nom: 'Vivienne', arrondissement_id: '2', arrondissement: '2ème Arrondissement' },
  { id: 'q7', nom: 'Mail', arrondissement_id: '2', arrondissement: '2ème Arrondissement' },
  { id: 'q8', nom: 'Bonne-Nouvelle', arrondissement_id: '2', arrondissement: '2ème Arrondissement' },
  // 3ème Arrondissement
  { id: 'q9', nom: 'Arts-et-Métiers', arrondissement_id: '3', arrondissement: '3ème Arrondissement' },
  { id: 'q10', nom: 'Enfants-Rouges', arrondissement_id: '3', arrondissement: '3ème Arrondissement' },
  { id: 'q11', nom: 'Archives', arrondissement_id: '3', arrondissement: '3ème Arrondissement' },
  { id: 'q12', nom: 'Sainte-Avoye', arrondissement_id: '3', arrondissement: '3ème Arrondissement' },
  // 4ème Arrondissement
  { id: 'q13', nom: 'Saint-Merri', arrondissement_id: '4', arrondissement: '4ème Arrondissement' },
  { id: 'q14', nom: 'Saint-Gervais', arrondissement_id: '4', arrondissement: '4ème Arrondissement' },
  { id: 'q15', nom: 'Arsenal', arrondissement_id: '4', arrondissement: '4ème Arrondissement' },
  { id: 'q16', nom: 'Notre-Dame', arrondissement_id: '4', arrondissement: '4ème Arrondissement' },
  // 5ème Arrondissement
  { id: 'q17', nom: 'Saint-Victor', arrondissement_id: '5', arrondissement: '5ème Arrondissement' },
  { id: 'q18', nom: 'Jardin des Plantes', arrondissement_id: '5', arrondissement: '5ème Arrondissement' },
  { id: 'q19', nom: 'Val-de-Grâce', arrondissement_id: '5', arrondissement: '5ème Arrondissement' },
  { id: 'q20', nom: 'Sorbonne', arrondissement_id: '5', arrondissement: '5ème Arrondissement' },
  // 6ème Arrondissement
  { id: 'q21', nom: 'Monnaie', arrondissement_id: '6', arrondissement: '6ème Arrondissement' },
  { id: 'q22', nom: 'Odéon', arrondissement_id: '6', arrondissement: '6ème Arrondissement' },
  { id: 'q23', nom: 'Notre-Dame-des-Champs', arrondissement_id: '6', arrondissement: '6ème Arrondissement' },
  { id: 'q24', nom: 'Saint-Germain-des-Prés', arrondissement_id: '6', arrondissement: '6ème Arrondissement' },
  // 7ème Arrondissement
  { id: 'q25', nom: 'Saint-Thomas-d\'Aquin', arrondissement_id: '7', arrondissement: '7ème Arrondissement' },
  { id: 'q26', nom: 'Invalides', arrondissement_id: '7', arrondissement: '7ème Arrondissement' },
  { id: 'q27', nom: 'École Militaire', arrondissement_id: '7', arrondissement: '7ème Arrondissement' },
  { id: 'q28', nom: 'Gros-Caillou', arrondissement_id: '7', arrondissement: '7ème Arrondissement' },
  // 8ème Arrondissement
  { id: 'q29', nom: 'Champs-Élysées', arrondissement_id: '8', arrondissement: '8ème Arrondissement' },
  { id: 'q30', nom: 'Faubourg du Roule', arrondissement_id: '8', arrondissement: '8ème Arrondissement' },
  { id: 'q31', nom: 'Madeleine', arrondissement_id: '8', arrondissement: '8ème Arrondissement' },
  { id: 'q32', nom: 'Europe', arrondissement_id: '8', arrondissement: '8ème Arrondissement' },
  // 9ème Arrondissement
  { id: 'q33', nom: 'Saint-Georges', arrondissement_id: '9', arrondissement: '9ème Arrondissement' },
  { id: 'q34', nom: 'Chaussée-d\'Antin', arrondissement_id: '9', arrondissement: '9ème Arrondissement' },
  { id: 'q35', nom: 'Faubourg Montmartre', arrondissement_id: '9', arrondissement: '9ème Arrondissement' },
  { id: 'q36', nom: 'Rochechouart', arrondissement_id: '9', arrondissement: '9ème Arrondissement' },
  // 10ème Arrondissement
  { id: 'q37', nom: 'Saint-Vincent-de-Paul', arrondissement_id: '10', arrondissement: '10ème Arrondissement' },
  { id: 'q38', nom: 'Porte Saint-Denis', arrondissement_id: '10', arrondissement: '10ème Arrondissement' },
  { id: 'q39', nom: 'Porte Saint-Martin', arrondissement_id: '10', arrondissement: '10ème Arrondissement' },
  { id: 'q40', nom: 'Hôpital Saint-Louis', arrondissement_id: '10', arrondissement: '10ème Arrondissement' },
  // 11ème Arrondissement
  { id: 'q41', nom: 'Folie-Méricourt', arrondissement_id: '11', arrondissement: '11ème Arrondissement' },
  { id: 'q42', nom: 'Saint-Ambroise', arrondissement_id: '11', arrondissement: '11ème Arrondissement' },
  { id: 'q43', nom: 'Roquette', arrondissement_id: '11', arrondissement: '11ème Arrondissement' },
  { id: 'q44', nom: 'Sainte-Marguerite', arrondissement_id: '11', arrondissement: '11ème Arrondissement' },
  // 12ème Arrondissement
  { id: 'q45', nom: 'Bel-Air', arrondissement_id: '12', arrondissement: '12ème Arrondissement' },
  { id: 'q46', nom: 'Picpus', arrondissement_id: '12', arrondissement: '12ème Arrondissement' },
  { id: 'q47', nom: 'Bercy', arrondissement_id: '12', arrondissement: '12ème Arrondissement' },
  { id: 'q48', nom: 'Quinze-Vingts', arrondissement_id: '12', arrondissement: '12ème Arrondissement' },
  // 13ème Arrondissement
  { id: 'q49', nom: 'Salpêtrière', arrondissement_id: '13', arrondissement: '13ème Arrondissement' },
  { id: 'q50', nom: 'Gare', arrondissement_id: '13', arrondissement: '13ème Arrondissement' },
  { id: 'q51', nom: 'Maison-Blanche', arrondissement_id: '13', arrondissement: '13ème Arrondissement' },
  { id: 'q52', nom: 'Croulebarbe', arrondissement_id: '13', arrondissement: '13ème Arrondissement' },
  // 14ème Arrondissement
  { id: 'q53', nom: 'Montparnasse', arrondissement_id: '14', arrondissement: '14ème Arrondissement' },
  { id: 'q54', nom: 'Parc de Montsouris', arrondissement_id: '14', arrondissement: '14ème Arrondissement' },
  { id: 'q55', nom: 'Petit-Montrouge', arrondissement_id: '14', arrondissement: '14ème Arrondissement' },
  { id: 'q56', nom: 'Plaisance', arrondissement_id: '14', arrondissement: '14ème Arrondissement' },
  // 15ème Arrondissement
  { id: 'q57', nom: 'Saint-Lambert', arrondissement_id: '15', arrondissement: '15ème Arrondissement' },
  { id: 'q58', nom: 'Necker', arrondissement_id: '15', arrondissement: '15ème Arrondissement' },
  { id: 'q59', nom: 'Grenelle', arrondissement_id: '15', arrondissement: '15ème Arrondissement' },
  { id: 'q60', nom: 'Javel', arrondissement_id: '15', arrondissement: '15ème Arrondissement' },
  // 16ème Arrondissement
  { id: 'q61', nom: 'Auteuil', arrondissement_id: '16', arrondissement: '16ème Arrondissement' },
  { id: 'q62', nom: 'Muette', arrondissement_id: '16', arrondissement: '16ème Arrondissement' },
  { id: 'q63', nom: 'Porte Dauphine', arrondissement_id: '16', arrondissement: '16ème Arrondissement' },
  { id: 'q64', nom: 'Chaillot', arrondissement_id: '16', arrondissement: '16ème Arrondissement' },
  // 17ème Arrondissement
  { id: 'q65', nom: 'Ternes', arrondissement_id: '17', arrondissement: '17ème Arrondissement' },
  { id: 'q66', nom: 'Plaine de Monceaux', arrondissement_id: '17', arrondissement: '17ème Arrondissement' },
  { id: 'q67', nom: 'Batignolles', arrondissement_id: '17', arrondissement: '17ème Arrondissement' },
  { id: 'q68', nom: 'Épinettes', arrondissement_id: '17', arrondissement: '17ème Arrondissement' },
  // 18ème Arrondissement
  { id: 'q69', nom: 'Grandes-Carrières', arrondissement_id: '18', arrondissement: '18ème Arrondissement' },
  { id: 'q70', nom: 'Clignancourt', arrondissement_id: '18', arrondissement: '18ème Arrondissement' },
  { id: 'q71', nom: 'Goutte-d\'Or', arrondissement_id: '18', arrondissement: '18ème Arrondissement' },
  { id: 'q72', nom: 'Chapelle', arrondissement_id: '18', arrondissement: '18ème Arrondissement' },
  // 19ème Arrondissement
  { id: 'q73', nom: 'Villette', arrondissement_id: '19', arrondissement: '19ème Arrondissement' },
  { id: 'q74', nom: 'Pont-de-Flandre', arrondissement_id: '19', arrondissement: '19ème Arrondissement' },
  { id: 'q75', nom: 'Amérique', arrondissement_id: '19', arrondissement: '19ème Arrondissement' },
  { id: 'q76', nom: 'Combat', arrondissement_id: '19', arrondissement: '19ème Arrondissement' },
  // 20ème Arrondissement
  { id: 'q77', nom: 'Belleville', arrondissement_id: '20', arrondissement: '20ème Arrondissement' },
  { id: 'q78', nom: 'Saint-Fargeau', arrondissement_id: '20', arrondissement: '20ème Arrondissement' },
  { id: 'q79', nom: 'Père-Lachaise', arrondissement_id: '20', arrondissement: '20ème Arrondissement' },
  { id: 'q80', nom: 'Charonne', arrondissement_id: '20', arrondissement: '20ème Arrondissement' },
];

// Fallback data for espaces verts (sample green spaces across Paris)
const FALLBACK_ESPACES_VERTS: EspaceVert[] = [
  // 1er Arrondissement
  { id: 'ev1', nom: 'Jardin des Tuileries', quartier_id: 'q3', quartier: 'Palais-Royal', type: 'Jardin', adresse: 'Place de la Concorde', superficie: 254000, horaires: '7h-21h' },
  { id: 'ev2', nom: 'Jardin du Palais Royal', quartier_id: 'q3', quartier: 'Palais-Royal', type: 'Jardin', adresse: '8 Rue de Montpensier', superficie: 20850, horaires: '8h-20h30' },
  // 4ème Arrondissement
  { id: 'ev3', nom: 'Square du Vert-Galant', quartier_id: 'q16', quartier: 'Notre-Dame', type: 'Square', adresse: 'Place du Pont Neuf', superficie: 2000, horaires: '24h/24' },
  // 5ème Arrondissement
  { id: 'ev4', nom: 'Jardin des Plantes', quartier_id: 'q18', quartier: 'Jardin des Plantes', type: 'Jardin', adresse: '57 Rue Cuvier', superficie: 235000, horaires: '7h30-20h' },
  { id: 'ev5', nom: 'Arènes de Lutèce', quartier_id: 'q17', quartier: 'Saint-Victor', type: 'Square', adresse: '49 Rue Monge', superficie: 5500, horaires: '8h-21h' },
  // 6ème Arrondissement
  { id: 'ev6', nom: 'Jardin du Luxembourg', quartier_id: 'q23', quartier: 'Notre-Dame-des-Champs', type: 'Jardin', adresse: 'Rue de Médicis', superficie: 224500, horaires: '7h30-21h30' },
  // 7ème Arrondissement
  { id: 'ev7', nom: 'Champ de Mars', quartier_id: 'q27', quartier: 'École Militaire', type: 'Parc', adresse: 'Quai Branly', superficie: 248000, horaires: '24h/24' },
  { id: 'ev8', nom: 'Esplanade des Invalides', quartier_id: 'q26', quartier: 'Invalides', type: 'Esplanade', adresse: 'Esplanade des Invalides', superficie: 50000, horaires: '24h/24' },
  // 8ème Arrondissement
  { id: 'ev9', nom: 'Parc Monceau', quartier_id: 'q32', quartier: 'Europe', type: 'Parc', adresse: '35 Boulevard de Courcelles', superficie: 82500, horaires: '7h-22h' },
  // 11ème Arrondissement
  { id: 'ev10', nom: 'Square Maurice Gardette', quartier_id: 'q42', quartier: 'Saint-Ambroise', type: 'Square', adresse: '2 Rue du Général Blaise', superficie: 8300, horaires: '8h-20h' },
  // 12ème Arrondissement
  { id: 'ev11', nom: 'Bois de Vincennes', quartier_id: 'q45', quartier: 'Bel-Air', type: 'Bois', adresse: 'Route de la Pyramide', superficie: 9950000, horaires: '24h/24' },
  { id: 'ev12', nom: 'Parc de Bercy', quartier_id: 'q47', quartier: 'Bercy', type: 'Parc', adresse: '128 Quai de Bercy', superficie: 140000, horaires: '8h-21h' },
  { id: 'ev13', nom: 'Coulée Verte René-Dumont', quartier_id: 'q45', quartier: 'Bel-Air', type: 'Promenade', adresse: '1 Coulée Verte René-Dumont', superficie: 65000, horaires: '8h-21h' },
  // 14ème Arrondissement
  { id: 'ev14', nom: 'Parc Montsouris', quartier_id: 'q54', quartier: 'Parc de Montsouris', type: 'Parc', adresse: '2 Rue Gazan', superficie: 155000, horaires: '7h-21h' },
  // 16ème Arrondissement
  { id: 'ev15', nom: 'Bois de Boulogne', quartier_id: 'q63', quartier: 'Porte Dauphine', type: 'Bois', adresse: 'Route de Suresnes', superficie: 8460000, horaires: '24h/24' },
  { id: 'ev16', nom: 'Jardin du Ranelagh', quartier_id: 'q62', quartier: 'Muette', type: 'Jardin', adresse: 'Avenue du Ranelagh', superficie: 60000, horaires: '8h-21h' },
  // 17ème Arrondissement
  { id: 'ev17', nom: 'Square des Batignolles', quartier_id: 'q67', quartier: 'Batignolles', type: 'Square', adresse: '147 Rue Cardinet', superficie: 16800, horaires: '8h-20h' },
  // 18ème Arrondissement
  { id: 'ev18', nom: 'Square Louise Michel', quartier_id: 'q69', quartier: 'Grandes-Carrières', type: 'Square', adresse: 'Place Saint-Pierre', superficie: 5000, horaires: '8h-21h' },
  // 19ème Arrondissement
  { id: 'ev19', nom: 'Parc des Buttes-Chaumont', quartier_id: 'q76', quartier: 'Combat', type: 'Parc', adresse: '1 Rue Botzaris', superficie: 247000, horaires: '7h-22h' },
  { id: 'ev20', nom: 'Parc de la Villette', quartier_id: 'q73', quartier: 'Villette', type: 'Parc', adresse: '211 Avenue Jean Jaurès', superficie: 550000, horaires: '24h/24' },
  // 20ème Arrondissement
  { id: 'ev21', nom: 'Cimetière du Père-Lachaise', quartier_id: 'q79', quartier: 'Père-Lachaise', type: 'Cimetière paysager', adresse: '16 Rue du Repos', superficie: 440000, horaires: '8h-18h' },
  { id: 'ev22', nom: 'Parc de Belleville', quartier_id: 'q77', quartier: 'Belleville', type: 'Parc', adresse: '47 Rue des Couronnes', superficie: 45000, horaires: '7h30-21h' },
];

export function useQuartiers() {
  return useQuery<Quartier[]>({
    queryKey: ['quartiers'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE}/quartiers`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json = await response.json();
        const data = Array.isArray(json) ? json : (json.data || []);

        if (Array.isArray(data) && data.length > 0) {
          const transformedData: Quartier[] = data.map((item: Record<string, unknown>) => ({
            id: String(item.id || item.c_qu || ''),
            nom: String(item.nom || item.l_qu || item.name || ''),
            arrondissement_id: String(item.arrondissement_id || item.c_ar || ''),
            arrondissement: String(item.arrondissement || item.l_ar || `${item.c_ar}ème Arrondissement`),
            ...item,
          }));
          toast({
            title: "Connected to Live Data",
            description: "Successfully loaded quartiers from API",
          });
          return transformedData;
        }
        throw new Error('Empty data received');
      } catch (error) {
        console.error('API Error (Quartiers):', error);
        toast({
          title: "Offline Mode (Quartiers)",
          description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
        return FALLBACK_QUARTIERS;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

import { isPointInPolygon } from '@/lib/utils';
import type { GeoJSONCollection } from './useParisGeoJSON';

export function useEspacesVerts() {
  return useQuery<EspaceVert[]>({
    queryKey: ['espaces-verts'],
    queryFn: async () => {
      try {
        // Fetch both Espaces Verts and Quartiers GeoJSON in parallel
        const [response, geojResponse] = await Promise.all([
          fetch(`${API_BASE}/espaces-verts`),
          fetch('https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/quartier_paris/exports/geojson')
        ]);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const json = await response.json();
        const data = Array.isArray(json) ? json : (json.data || []);

        // Parse GeoJSON if available
        let quartiersFeatures: any[] = [];
        try {
          if (geojResponse.ok) {
            const geojson: GeoJSONCollection = await geojResponse.json();
            quartiersFeatures = geojson.features || [];
          }
        } catch (e) {
          console.warn('Failed to load Quartiers GeoJSON for mapping', e);
        }

        if (Array.isArray(data) && data.length > 0) {
          const transformedData: EspaceVert[] = data.map((item: Record<string, unknown>) => {
            const lat = parseFloat(String(item.lat || 0));
            const lng = parseFloat(String(item.lng || 0));

            // Try to find quartier by point-in-polygon if not provided
            let quartierId = String(item.quartier_id || item.c_qu || '');
            let quartierName = String(item.quartier || item.l_qu || '');

            if ((!quartierId || !quartierName) && quartiersFeatures.length > 0 && lat && lng) {
              const found = quartiersFeatures.find(f => {
                if (f.geometry.type === 'Polygon') {
                  const coords = f.geometry.coordinates[0];
                  return isPointInPolygon([lng, lat], coords);
                } else if (f.geometry.type === 'MultiPolygon') {
                  return f.geometry.coordinates.some((poly: any[]) =>
                    isPointInPolygon([lng, lat], poly[0])
                  );
                }
                return false;
              });

              if (found) {
                quartierId = String(found.properties.c_qu || found.properties.c_quinsee || '');
                quartierName = String(found.properties.l_qu || found.properties.l_qu || '');
                // Attempt to derive arrondissement if missing, using quartier code
                // Quartier codes: 751xx usually imply 1st to 19th etc depending on structure but 
                // typically c_qu is 1-80. 
              }
            }

            let geometry = undefined;
            try {
              if (item.geom && typeof item.geom === 'string') {
                const parsedGeom = JSON.parse(item.geom);
                if (parsedGeom && (parsedGeom.type === 'Polygon' || parsedGeom.type === 'MultiPolygon')) {
                  geometry = parsedGeom;
                }
              }
            } catch (e) {
              // Ignore parsing errors for geometry
            }

            return {
              id: String(item.id || item.nsq_espace_vert || ''),
              nom: String(item.nom || item.nom_ev || item.name || ''),
              quartier_id: quartierId,
              quartier: quartierName,
              type: String(item.type || item.type_ev || item.categorie || 'Espace vert'),
              adresse: String(item.adresse || item.adresse_codepostal || ''),
              superficie: (item.superficie || item.surface_totale_reelle || item.total_area) as number | undefined,
              horaires: String(item.horaires || item.horaires_ouverture || ''),
              geometry,
              ...item,
            };
          });

          toast({
            title: "Connected to Live Data",
            description: `Loaded ${transformedData.length} espaces verts`,
          });
          return transformedData;
        }
        throw new Error('Empty data received');
      } catch (error) {
        console.error('API Error (Espaces Verts):', error);
        toast({
          title: "Offline Mode (Espaces Verts)",
          description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
        return FALLBACK_ESPACES_VERTS;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
