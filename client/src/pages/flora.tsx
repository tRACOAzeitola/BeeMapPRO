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
import { Plus, CalendarDays, Map, Loader2, Search } from "lucide-react";
import type { FloraType } from '@shared/schema';

export default function FloraPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch flora types data
  const { data: floraTypes, isLoading } = useQuery<FloraType[]>({
    queryKey: ['/api/flora-types'],
  });

  // Filter flora types based on search query
  const filteredFloraTypes = floraTypes?.filter(flora => 
    flora.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flora.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flora.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Flora - BeeMap Pro</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Flora</h1>
            <p className="text-muted-foreground">
              Gerencie e analise as espécies de flora relevantes para apicultura.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Nova Espécie</span>
          </Button>
        </div>
        
        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="catalog">Catálogo</TabsTrigger>
            <TabsTrigger value="detection">Detecção</TabsTrigger>
          </TabsList>
          
          <TabsContent value="catalog" className="space-y-4 mt-6">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, nome científico ou descrição..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Card className="bg-white dark:bg-card">
              <CardHeader className="pb-3">
                <CardTitle>Espécies de Flora</CardTitle>
                <CardDescription>
                  Catálogo de espécies de plantas relevantes para a apicultura.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredFloraTypes && filteredFloraTypes.length > 0 ? (
                  <ScrollArea className="h-[calc(100vh-350px)] rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Nome</TableHead>
                          <TableHead className="w-[220px]">Nome Científico</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="w-[120px]">Floração</TableHead>
                          <TableHead className="w-[100px]">Tipo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFloraTypes.map((flora) => (
                          <TableRow key={flora.id}>
                            <TableCell className="font-medium">{flora.name}</TableCell>
                            <TableCell className="italic">{flora.scientificName}</TableCell>
                            <TableCell className="max-w-sm truncate">
                              {flora.description}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                <span>{flora.floweringSeason}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={flora.type === 'melífera' ? 'default' : 'secondary'}
                              >
                                {flora.type}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Map className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma espécie encontrada</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery ? 'Nenhuma espécie corresponde à sua pesquisa.' : 'Cadastre novas espécies para visualizar aqui.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="detection" className="space-y-4 mt-6">
            <FloraDetection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}