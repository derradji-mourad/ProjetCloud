import { useQuery } from '@tanstack/react-query';

export interface AirQualityData {
  european_aqi: number;
  pm10: number;
  pm2_5: number;
  ozone: number;
  nitrogen_dioxide: number;
  time: string;
}

export interface AirQualityLevel {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

// European AQI scale
export function getAQILevel(aqi: number): AirQualityLevel {
  if (aqi <= 20) {
    return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100', description: 'Air quality is excellent' };
  } else if (aqi <= 40) {
    return { label: 'Bon', color: 'text-lime-600', bgColor: 'bg-lime-100', description: 'Air quality is good' };
  } else if (aqi <= 60) {
    return { label: 'Modéré', color: 'text-yellow-600', bgColor: 'bg-yellow-100', description: 'Moderate air quality' };
  } else if (aqi <= 80) {
    return { label: 'Médiocre', color: 'text-orange-600', bgColor: 'bg-orange-100', description: 'Poor air quality' };
  } else if (aqi <= 100) {
    return { label: 'Mauvais', color: 'text-red-600', bgColor: 'bg-red-100', description: 'Very poor air quality' };
  } else {
    return { label: 'Très mauvais', color: 'text-purple-600', bgColor: 'bg-purple-100', description: 'Extremely poor air quality' };
  }
}

// Quartier approximate coordinates
const QUARTIER_COORDS: Record<string, [number, number]> = {
  // 1er Arrondissement
  'q1': [48.8597, 2.3412], // Saint-Germain-l'Auxerrois
  'q2': [48.8619, 2.3451], // Halles
  'q3': [48.8643, 2.3377], // Palais-Royal
  'q4': [48.8679, 2.3296], // Place Vendôme
  // 2ème Arrondissement
  'q5': [48.8698, 2.3344], // Gaillon
  'q6': [48.8683, 2.3399], // Vivienne
  'q7': [48.8666, 2.3465], // Mail
  'q8': [48.8695, 2.3498], // Bonne-Nouvelle
  // 3ème Arrondissement
  'q9': [48.8656, 2.3568], // Arts-et-Métiers
  'q10': [48.8634, 2.3624], // Enfants-Rouges
  'q11': [48.8621, 2.3579], // Archives
  'q12': [48.8606, 2.3561], // Sainte-Avoye
  // 4ème Arrondissement
  'q13': [48.8589, 2.3509], // Saint-Merri
  'q14': [48.8554, 2.3587], // Saint-Gervais
  'q15': [48.8503, 2.3652], // Arsenal
  'q16': [48.8534, 2.3488], // Notre-Dame
  // 5ème Arrondissement
  'q17': [48.8476, 2.3539], // Saint-Victor
  'q18': [48.8432, 2.3594], // Jardin des Plantes
  'q19': [48.8418, 2.3438], // Val-de-Grâce
  'q20': [48.8488, 2.3441], // Sorbonne
  // 6ème Arrondissement
  'q21': [48.8539, 2.3395], // Monnaie
  'q22': [48.8508, 2.3388], // Odéon
  'q23': [48.8459, 2.3281], // Notre-Dame-des-Champs
  'q24': [48.8541, 2.3324], // Saint-Germain-des-Prés
  // 7ème Arrondissement
  'q25': [48.8568, 2.3234], // Saint-Thomas-d'Aquin
  'q26': [48.8566, 2.3146], // Invalides
  'q27': [48.8545, 2.3021], // École Militaire
  'q28': [48.8605, 2.3036], // Gros-Caillou
  // 8ème Arrondissement
  'q29': [48.8698, 2.3075], // Champs-Élysées
  'q30': [48.8768, 2.3012], // Faubourg du Roule
  'q31': [48.8711, 2.3238], // Madeleine
  'q32': [48.8789, 2.3245], // Europe
  // 9ème Arrondissement
  'q33': [48.8796, 2.3356], // Saint-Georges
  'q34': [48.8729, 2.3336], // Chaussée-d'Antin
  'q35': [48.8752, 2.3442], // Faubourg Montmartre
  'q36': [48.8814, 2.3487], // Rochechouart
  // 10ème Arrondissement
  'q37': [48.8796, 2.3556], // Saint-Vincent-de-Paul
  'q38': [48.8696, 2.3549], // Porte Saint-Denis
  'q39': [48.8674, 2.3622], // Porte Saint-Martin
  'q40': [48.8742, 2.3686], // Hôpital Saint-Louis
  // 11ème Arrondissement
  'q41': [48.8652, 2.3734], // Folie-Méricourt
  'q42': [48.8608, 2.3789], // Saint-Ambroise
  'q43': [48.8567, 2.3834], // Roquette
  'q44': [48.8518, 2.3912], // Sainte-Marguerite
  // 12ème Arrondissement
  'q45': [48.8398, 2.4012], // Bel-Air
  'q46': [48.8432, 2.4134], // Picpus
  'q47': [48.8312, 2.3867], // Bercy
  'q48': [48.8456, 2.3756], // Quinze-Vingts
  // 13ème Arrondissement
  'q49': [48.8356, 2.3612], // Salpêtrière
  'q50': [48.8289, 2.3698], // Gare
  'q51': [48.8198, 2.3578], // Maison-Blanche
  'q52': [48.8365, 2.3498], // Croulebarbe
  // 14ème Arrondissement
  'q53': [48.8421, 2.3234], // Montparnasse
  'q54': [48.8198, 2.3367], // Parc de Montsouris
  'q55': [48.8267, 2.3234], // Petit-Montrouge
  'q56': [48.8312, 2.3098], // Plaisance
  // 15ème Arrondissement
  'q57': [48.8345, 2.2978], // Saint-Lambert
  'q58': [48.8456, 2.3145], // Necker
  'q59': [48.8489, 2.2934], // Grenelle
  'q60': [48.8356, 2.2756], // Javel
  // 16ème Arrondissement
  'q61': [48.8512, 2.2634], // Auteuil
  'q62': [48.8598, 2.2712], // Muette
  'q63': [48.8712, 2.2745], // Porte Dauphine
  'q64': [48.8634, 2.2889], // Chaillot
  // 17ème Arrondissement
  'q65': [48.8798, 2.2978], // Ternes
  'q66': [48.8834, 2.3089], // Plaine de Monceaux
  'q67': [48.8889, 2.3178], // Batignolles
  'q68': [48.8934, 2.3267], // Épinettes
  // 18ème Arrondissement
  'q69': [48.8912, 2.3389], // Grandes-Carrières
  'q70': [48.8956, 2.3456], // Clignancourt
  'q71': [48.8867, 2.3567], // Goutte-d'Or
  'q72': [48.8923, 2.3623], // Chapelle
  // 19ème Arrondissement
  'q73': [48.8934, 2.3856], // Villette
  'q74': [48.8989, 2.3934], // Pont-de-Flandre
  'q75': [48.8834, 2.3989], // Amérique
  'q76': [48.8756, 2.3834], // Combat
  // 20ème Arrondissement
  'q77': [48.8712, 2.3923], // Belleville
  'q78': [48.8712, 2.4078], // Saint-Fargeau
  'q79': [48.8612, 2.3989], // Père-Lachaise
  'q80': [48.8534, 2.4034], // Charonne
};

export function useAirQuality(quartierId: string | undefined) {
  return useQuery<AirQualityData | null>({
    queryKey: ['air-quality', quartierId],
    queryFn: async () => {
      if (!quartierId) return null;
      
      const coords = QUARTIER_COORDS[quartierId];
      if (!coords) {
        // Default to Paris center if quartier coords not found
        console.log(`No coords for quartier ${quartierId}, using Paris center`);
      }
      
      const [lat, lng] = coords || [48.8566, 2.3522];
      
      try {
        const response = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5,ozone,nitrogen_dioxide,european_aqi`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.current) {
          return {
            european_aqi: data.current.european_aqi ?? 0,
            pm10: data.current.pm10 ?? 0,
            pm2_5: data.current.pm2_5 ?? 0,
            ozone: data.current.ozone ?? 0,
            nitrogen_dioxide: data.current.nitrogen_dioxide ?? 0,
            time: data.current.time ?? new Date().toISOString(),
          };
        }
        
        return null;
      } catch (error) {
        console.error('Air Quality API Error:', error);
        return null;
      }
    },
    enabled: !!quartierId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
  });
}
