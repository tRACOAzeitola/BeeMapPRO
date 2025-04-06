import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import HiveForm from "@/components/hives/hive-form";
import HiveStatus from "@/components/hives/hive-status";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Hive, type Apiary } from "@shared/schema";
import { Plus, Pencil, Trash2, Filter } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Hives() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
  const [apiaryFilter, setApiaryFilter] = useState<number | "all">("all");

  // Fetch hives
  const { data: hives, isLoading } = useQuery<Hive[]>({
    queryKey: ['/api/hives', apiaryFilter],
    queryFn: async () => {
      const url = apiaryFilter === "all" 
        ? '/api/hives' 
        : `/api/apiaries/${apiaryFilter}/hives`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch hives');
      return res.json();
    }
  });

  // Fetch apiaries for filter dropdown
  const { data: apiaries } = useQuery<Apiary[]>({
    queryKey: ['/api/apiaries'],
  });

  // Create hive mutation
  const createMutation = useMutation({
    mutationFn: async (hive: Omit<Hive, 'id'>) => {
      const res = await apiRequest('POST', '/api/hives', hive);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Colmeia criada",
        description: "A colmeia foi criada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hives'] });
      setIsFormOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a colmeia",
        variant: "destructive",
      });
    },
  });

  // Update hive mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Hive> }) => {
      const res = await apiRequest('PUT', `/api/hives/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Colmeia atualizada",
        description: "A colmeia foi atualizada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hives'] });
      setIsFormOpen(false);
      setSelectedHive(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a colmeia",
        variant: "destructive",
      });
    },
  });

  // Delete hive mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/hives/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Colmeia excluída",
        description: "A colmeia foi excluída com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hives'] });
      setIsDeleteDialogOpen(false);
      setSelectedHive(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a colmeia",
        variant: "destructive",
      });
    },
  });

  const handleOpenForm = (hive?: Hive) => {
    setSelectedHive(hive || null);
    setIsFormOpen(true);
  };

  const handleDelete = (hive: Hive) => {
    setSelectedHive(hive);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedHive) {
      deleteMutation.mutate(selectedHive.id);
    }
  };

  const handleSubmit = (data: Omit<Hive, 'id'>) => {
    if (selectedHive) {
      updateMutation.mutate({ id: selectedHive.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Get apiary name by id
  const getApiaryName = (apiaryId: number) => {
    const apiary = apiaries?.find(a => a.id === apiaryId);
    return apiary ? apiary.name : 'Desconhecido';
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gestão de Colmeias</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Acompanhe e gerencie suas colmeias
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="flex items-center gap-1">
          <Plus size={16} /> Nova Colmeia
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtrar por apiário:</span>
          <Select
            value={apiaryFilter.toString()}
            onValueChange={(value) => setApiaryFilter(value === "all" ? "all" : parseInt(value))}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecionar apiário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os apiários</SelectItem>
              {apiaries?.map((apiary) => (
                <SelectItem key={apiary.id} value={apiary.id.toString()}>
                  {apiary.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !hives?.length ? (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium">Nenhuma colmeia encontrada</h3>
            <p className="text-gray-500 mt-2">
              {apiaryFilter === "all" 
                ? "Adicione sua primeira colmeia para começar" 
                : "Não há colmeias cadastradas para este apiário"}
            </p>
            <Button onClick={() => handleOpenForm()} className="mt-4">
              Adicionar Colmeia
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Apiário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Inspeção</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hives.map((hive) => (
                <TableRow key={hive.id}>
                  <TableCell className="font-medium">{hive.name}</TableCell>
                  <TableCell>{getApiaryName(hive.apiaryId)}</TableCell>
                  <TableCell>
                    <HiveStatus status={hive.status} />
                  </TableCell>
                  <TableCell>
                    {hive.lastInspectionDate 
                      ? new Date(hive.lastInspectionDate).toLocaleDateString('pt-BR')
                      : 'Nunca inspecionada'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {hive.notes || 'Sem observações'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenForm(hive)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(hive)}
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

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {selectedHive ? "Editar Colmeia" : "Adicionar Colmeia"}
            </DialogTitle>
          </DialogHeader>
          <HiveForm 
            hive={selectedHive} 
            onSubmit={handleSubmit} 
            isLoading={createMutation.isPending || updateMutation.isPending}
            apiaries={apiaries || []}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Colmeia</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a colmeia "{selectedHive?.name}"? Esta ação não pode ser desfeita.
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
