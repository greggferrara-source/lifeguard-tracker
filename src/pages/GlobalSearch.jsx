import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader, FileText, Settings, Shield, AlertCircle, Zap, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

const MODULE_ICONS = {
  Asset: Settings,
  Document: FileText,
  'Compliance Assessment': Shield,
  'Pool Test': Zap,
  Incident: AlertCircle,
  Report: BarChart2
};

const MODULES = [
  { key: 'assets', label: 'Assets' },
  { key: 'documents', label: 'Documents' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'pool_tests', label: 'Pool Tests' },
  { key: 'incidents', label: 'Incidents' }
];

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (query.trim().length < 2) return;

    setLoading(true);
    setHasSearched(true);

    const { data } = await base44.functions.invoke('globalSearch', {
      query: query,
      modules: selectedModules.length > 0 ? selectedModules : [],
      limit: 50
    });

    setResults(data.results || []);
    setLoading(false);
  };

  const toggleModule = (moduleKey) => {
    setSelectedModules(prev =>
      prev.includes(moduleKey)
        ? prev.filter(m => m !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Global Search</h1>
          <p className="text-lg text-gray-600">Search across all your facility data instantly</p>
        </div>

        {/* Search Box */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search assets, documents, compliance data, incidents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-12 h-12 text-lg"
              />
              <Button
                onClick={handleSearch}
                disabled={loading || query.trim().length < 2}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#1a9c5b] hover:bg-[#158a4e]"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Module Filters */}
          <div className="flex flex-wrap gap-3">
            {MODULES.map(module => (
              <label key={module.key} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedModules.includes(module.key)}
                  onCheckedChange={() => toggleModule(module.key)}
                />
                <span className="text-sm text-gray-700">{module.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Results */}
        {hasSearched && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin mx-auto text-[#1a9c5b] mb-4" />
                <p className="text-gray-600">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-600 mb-4">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
                {results.map((result, idx) => {
                  const Icon = MODULE_ICONS[result.type] || Search;
                  return (
                    <Link
                      key={idx}
                      to={createPageUrl(result.module)}
                      className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-[#1a9c5b] hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#1a9c5b]/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-[#1a9c5b]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{result.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{result.type}</Badge>
                            {result.subtitle && (
                              <span className="text-xs text-gray-500">{result.subtitle}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">→</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No results found for "{query}"</p>
                  <p className="text-sm text-gray-500 mt-2">Try different keywords or adjust your filters</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!hasSearched && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Enter a search term to get started</p>
              <p className="text-sm text-gray-500 mt-2">Search across assets, documents, compliance assessments, pool tests, and incidents</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}