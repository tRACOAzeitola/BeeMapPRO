import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apiary } from "@shared/schema";
import { Grid, Filter, Plus, ExternalLink } from "lucide-react";
import { Link } from "wouter";

type ApiaryListProps = {
  apiaries: Apiary[];
  isLoading: boolean;
};

const ApiaryList: React.FC<ApiaryListProps> = ({ apiaries, isLoading }) => {
  // Helper function to get status badge class
  const getStatusBadge = (apiaryId: number) => {
    // In a real implementation, we would determine status based on hive data
    // For now, we'll use a simple rule based on apiary ID to match the design
    switch (apiaryId) {
      case 1:
        return {
          label: "Saudável",
          class: "px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500 rounded-md",
        };
      case 2:
        return {
          label: "Atenção",
          class: "px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-500 rounded-md",
        };
      default:
        return {
          label: "Saudável",
          class: "px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500 rounded-md",
        };
    }
  };

  // Helper function to get hive status counts
  const getHiveStatusCount = (apiaryId: number) => {
    switch (apiaryId) {
      case 1:
        return { good: 20, weak: 4, dead: 0 };
      case 2:
        return { good: 12, weak: 4, dead: 2 };
      case 3:
        return { good: 12, weak: 0, dead: 0 };
      default:
        return { good: 0, weak: 0, dead: 0 };
    }
  };

  return (
    <Card className="col-span-2 p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-800 dark:text-white">Apiários Recentes</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
            <Filter className="h-3.5 w-3.5 mr-1" /> Filtrar
          </Button>
          <Link href="/apiaries">
            <Button size="sm" className="h-8 px-3 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> Novo Apiário
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-3 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-3 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Colmeias
                </th>
                <th className="px-3 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Flora
                </th>
                <th className="px-3 py-3 bg-gray-50 dark:bg-gray-700"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {apiaries.slice(0, 3).map((apiary) => {
                const status = getStatusBadge(apiary.id);
                const hiveCounts = getHiveStatusCount(apiary.id);
                const totalHives = hiveCounts.good + hiveCounts.weak + hiveCounts.dead;
                
                return (
                  <tr key={apiary.id}>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-amber-100/20 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                          <Grid className="w-4 h-4" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {apiary.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Criado há{" "}
                            {Math.floor(
                              (new Date().getTime() - new Date(apiary.createdAt).getTime()) /
                                (1000 * 60 * 60 * 24 * 30)
                            )}{" "}
                            meses
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {apiary.location}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {apiary.coordinates}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {totalHives} colmeias
                      </div>
                      <div className="flex items-center mt-1">
                        {hiveCounts.good > 0 && (
                          <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                            {hiveCounts.good} boas
                          </span>
                        )}
                        {hiveCounts.weak > 0 && (
                          <span className="ml-1 text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                            {hiveCounts.weak} fracas
                          </span>
                        )}
                        {hiveCounts.dead > 0 && (
                          <span className="ml-1 text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                            {hiveCounts.dead} mortas
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={status.class}>{status.label}</span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {apiary.floraTypes?.join(", ") || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {apiary.floraDensity || "Desconhecida"}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300">
                        Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Mostrando {Math.min(apiaries.length, 3)} de {apiaries.length} apiários
        </div>
        <div>
          <Link href="/apiaries" className="text-sm text-amber-500 dark:text-amber-400 hover:underline flex items-center">
            Ver Todos <ExternalLink className="ml-1 w-3 h-3" />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ApiaryList;
