import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FloraDetection } from '@/components/flora/flora-detection';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, CalendarDays, Map, Loader2, Search, Upload, Flower2 } from "lucide-react";
import type { FloraType } from '@shared/schema';
import FloraAnalysis from '@/components/flora/flora-analysis';
import FloraMapSelection from '@/components/flora/flora-map-selection';

export default function FloraPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('map');

  // Fetch flora types data
  const { data: floraTypes, isLoading } = useQuery<FloraType[]>({
    queryKey: ['/api/flora-types'],
  });

  // Filter flora types based on search query
  const filteredFloraTypes = floraTypes?.filter(flora => 
    flora.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (flora.scientificName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (flora.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Flora - BeeMap Pro</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Flora Apícola</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Identificação e análise de flora melífera para otimização da produção de mel
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Importar Dados</span>
            </Button>
            <Button className="flex items-center gap-2">
              <Flower2 className="w-4 h-4" />
              <span>Nova Análise</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              <span>Seleção no Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Flower2 className="w-4 h-4" />
              <span>Análise de Flora</span>
            </TabsTrigger>
            <TabsTrigger value="detection" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Upload de Imagem</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map">
            <FloraMapSelection />
          </TabsContent>

          <TabsContent value="analysis">
            <FloraAnalysis />
          </TabsContent>

          <TabsContent value="detection">
            <Card>
              <CardContent className="pt-6">
                <FloraDetection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}