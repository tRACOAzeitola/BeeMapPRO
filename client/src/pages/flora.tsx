import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type FloraType } from "@shared/schema";
import { Plus, Pencil, Trash2, Leaf, Layers, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FloraAnalysis from "@/components/flora/flora-analysis";

export default function Flora() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFlora, setSelectedFlora] = useState<FloraType | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [bloomingSeason, setBloomingSeason] = useState("");
  const [nectarQuality, setNectarQuality] = useState("");

  // Fetch flora types
  const { data: floraTypes, isLoading } = useQuery<FloraType[]>({
    queryKey: ['/api/flora-types'],
  });

  // Create flora type mutation
  const createMutation = useMutation({
    mutationFn: async (floraType: Omit<FloraType, 'id'>) => {
      const res = await apiRequest('POST', '/api/flora-types', floraType);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Flora adicionada",
        description: "O tipo de flora foi adicionado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/flora-types'] });
      setIsFormOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o tipo de flora",
        variant: "destructive",
      });
    },
  });

  // Update flora type mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<FloraType> }) => {
      const res = await apiRequest('PUT', `/api/flora-types/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Flora atualizada",
        description: "O tipo de flora foi atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/flora-types'] });
      setIsFormOpen(false);
      setSelectedFlora(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tipo de flora",
        variant: "destructive",
      });
    },
  });

  // Delete flora type mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/flora-types/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Flora excluída",
        description: "O tipo de flora foi excluído com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/flora-types'] });
      setIsDeleteDialogOpen(false);
      setSelectedFlora(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o tipo de flora",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setBloomingSeason("");
    setNectarQuality("");
  };

  const handleOpenForm = (flora?: FloraType) => {
    if (flora) {
      setSelectedFlora(flora);
      setName(flora.name);
      setBloomingSeason(flora.bloomingSeason);
      setNectarQuality(flora.nectarQuality);
    } else {
      setSelectedFlora(null);
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleDelete = (flora: FloraType) => {
    setSelectedFlora(flora);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedFlora) {
      deleteMutation.mutate(selectedFlora.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const floraData = {
      name,
      bloomingSeason,
      nectarQuality,
    };

    if (selectedFlora) {
      updateMutation.mutate({ id: selectedFlora.id, data: floraData });
    } else {
      createMutation.mutate(floraData);
    }
  };

  // Helper function to get color based on nectar quality
  const getNectarQualityColor = (quality: string) => {
    switch (quality) {
      case "High":
        return "text-green-500 bg-green-100 dark:bg-green-900/20";
      case "Medium":
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20";
      case "Low":
        return "text-orange-500 bg-orange-100 dark:bg-orange-900/20";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800";
    }
  };

  // Helper function to get color based on blooming season
  const getSeasonColor = (season: string) => {
    switch (season) {
      case "Spring":
        return "text-pink-500 bg-pink-100 dark:bg-pink-900/20";
      case "Summer":
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20";
      case "Fall":
        return "text-orange-500 bg-orange-100 dark:bg-orange-900/20";
      case "Winter":
        return "text-blue-500 bg-blue-100 dark:bg-blue-900/20";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800";
    }
  };

  const [activeTab, setActiveTab] = useState("catalog");

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Flora Melífera</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gerenciamento de tipos de plantas e floras para apicultura
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => handleOpenForm()} 
            className="flex items-center gap-1"
          >
            <Plus size={16} /> Novo Tipo de Flora
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Leaf size={16} />
            <span>Catálogo de Flora</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Layers size={16} />
            <span>Análise Geográfica</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="catalog">
          <Card className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !floraTypes?.length ? (
              <div className="text-center p-8">
                <Leaf size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum tipo de flora cadastrado</h3>
                <p className="text-gray-500 mt-2">
                  Adicione informações sobre plantas melíferas para melhorar seu planejamento apícola
                </p>
                <Button onClick={() => handleOpenForm()} className="mt-4">
                  Adicionar Tipo de Flora
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Época de Floração</TableHead>
                    <TableHead>Qualidade do Néctar</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {floraTypes.map((flora) => (
                    <TableRow key={flora.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Leaf size={16} className="text-green-500" />
                        {flora.name}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeasonColor(flora.bloomingSeason)}`}>
                          {flora.bloomingSeason === "Spring" && "Primavera"}
                          {flora.bloomingSeason === "Summer" && "Verão"}
                          {flora.bloomingSeason === "Fall" && "Outono"}
                          {flora.bloomingSeason === "Winter" && "Inverno"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNectarQualityColor(flora.nectarQuality)}`}>
                          {flora.nectarQuality === "High" && "Alta"}
                          {flora.nectarQuality === "Medium" && "Média"}
                          {flora.nectarQuality === "Low" && "Baixa"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenForm(flora)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(flora)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4 border border-amber-100 dark:border-amber-800/30 mb-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-400">Ferramenta de Análise Geográfica</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Utilize o sensoriamento remoto e aprendizado de máquina para detectar áreas com alta concentração de plantas melíferas para apicultura
                </p>
              </div>
            </div>
          </div>
          
          <FloraAnalysis />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedFlora ? "Editar Tipo de Flora" : "Adicionar Tipo de Flora"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloomingSeason">Época de Floração</Label>
              <Select
                value={bloomingSeason}
                onValueChange={setBloomingSeason}
              >
                <SelectTrigger id="bloomingSeason">
                  <SelectValue placeholder="Selecione a época" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spring">Primavera</SelectItem>
                  <SelectItem value="Summer">Verão</SelectItem>
                  <SelectItem value="Fall">Outono</SelectItem>
                  <SelectItem value="Winter">Inverno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nectarQuality">Qualidade do Néctar</Label>
              <Select
                value={nectarQuality}
                onValueChange={setNectarQuality}
              >
                <SelectTrigger id="nectarQuality">
                  <SelectValue placeholder="Selecione a qualidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">Alta</SelectItem>
                  <SelectItem value="Medium">Média</SelectItem>
                  <SelectItem value="Low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  "Salvando..."
                ) : selectedFlora ? (
                  "Atualizar"
                ) : (
                  "Adicionar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tipo de Flora</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{selectedFlora?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
