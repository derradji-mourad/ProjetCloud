import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Arrondissement, Quartier, EspaceVert } from '@/types/paris';

interface SearchBarProps {
  arrondissements: Arrondissement[];
  quartiers: Quartier[];
  espacesVerts: EspaceVert[];
  onSelectArrondissement: (arr: Arrondissement) => void;
  onSelectQuartier: (q: Quartier) => void;
  onSelectEspaceVert: (ev: EspaceVert) => void;
}

export function SearchBar({
  arrondissements,
  quartiers,
  espacesVerts,
  onSelectArrondissement,
  onSelectQuartier,
  onSelectEspaceVert,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const normalizeString = (str: string) => 
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filteredResults = query.length > 1 ? {
    arrondissements: arrondissements.filter(arr => 
      normalizeString(arr.nom || '').includes(normalizeString(query)) ||
      (arr.code && arr.code.includes(query))
    ).slice(0, 3),
    quartiers: quartiers.filter(q => 
      normalizeString(q.nom || '').includes(normalizeString(query))
    ).slice(0, 3),
    espacesVerts: espacesVerts.filter(ev => 
      normalizeString(ev.nom || '').includes(normalizeString(query))
    ).slice(0, 5),
  } : { arrondissements: [], quartiers: [], espacesVerts: [] };

  const hasResults = 
    filteredResults.arrondissements.length > 0 ||
    filteredResults.quartiers.length > 0 ||
    filteredResults.espacesVerts.length > 0;

  const handleSelect = (type: 'arr' | 'q' | 'ev', item: any) => {
    setQuery('');
    setIsFocused(false);
    if (type === 'arr') onSelectArrondissement(item);
    else if (type === 'q') onSelectQuartier(item);
    else onSelectEspaceVert(item);
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] w-80">
      <div className={cn(
        "relative bg-card rounded-xl shadow-lg border border-border transition-all",
        isFocused && hasResults && "rounded-b-none"
      )}>
        <div className="flex items-center px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Rechercher..."
            className="flex-1 bg-transparent px-3 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Results dropdown */}
      {isFocused && hasResults && (
        <div className="bg-card border border-t-0 border-border rounded-b-xl shadow-lg max-h-80 overflow-auto">
          {filteredResults.arrondissements.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                Arrondissements
              </div>
              {filteredResults.arrondissements.map((arr) => (
                <button
                  key={arr.id}
                  onClick={() => handleSelect('arr', arr)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{arr.nom || `${arr.code}ème Arrondissement`}</span>
                </button>
              ))}
            </div>
          )}

          {filteredResults.quartiers.length > 0 && (
            <div className="p-2 border-t border-border">
              <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                Quartiers
              </div>
              {filteredResults.quartiers.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleSelect('q', q)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>{q.nom}</span>
                </button>
              ))}
            </div>
          )}

          {filteredResults.espacesVerts.length > 0 && (
            <div className="p-2 border-t border-border">
              <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                Espaces Verts
              </div>
              {filteredResults.espacesVerts.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => handleSelect('ev', ev)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-leaf" />
                  <span>{ev.nom}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
