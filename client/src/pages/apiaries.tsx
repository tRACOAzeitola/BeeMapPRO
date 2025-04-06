import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ApiaryMap from "@/components/apiaries/apiary-map";
import ApiaryForm from "@/components/apiaries/apiary-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Apiary } from "@shared/schema";
import { Pencil, Trash2, MapPin, PlusCircle } from "lucide-react";
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

export default function Apiaries() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedApiary, setSelectedApiary] = useState<Apiary | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Fetch apiaries
  const { data: apiaries, isLoading } = useQuery<Apiary[]>({
    queryKey: ['/api/apiaries'],
  });

  // Create apiary mutation
  const createMutation = useMutation({
    mutationFn: async (apiary: Omit<Apiary, 'id' | 'createdAt'>) => {
      const res = await apiRequest('POST', '/api/apiaries', apiary);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Apiário criado",
        description: "O apiário foi criado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/apiaries'] });
      setIsFormOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o apiário",
        variant: "destructive",
      });
    },
  });

  // Update apiary mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Apiary> }) => {
      const res = await apiRequest('PUT', `/api/apiaries/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Apiário atualizado",
        description: "O apiário foi atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/apiaries'] });
      setIsFormOpen(false);
      setSelectedApiary(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o apiário",
        variant: "destructive",
      });
    },
  });

  // Delete apiary mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/apiaries/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Apiário excluído",
        description: "O apiário foi excluído com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/apiaries'] });
      setIsDeleteDialogOpen(false);
      setSelectedApiary(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o apiário",
        variant: "destructive",
      });
    },
  });

  const handleOpenForm = (apiary?: Apiary) => {
    setSelectedApiary(apiary || null);
    setIsFormOpen(true);
  };

  const handleDelete = (apiary: Apiary) => {
    setSelectedApiary(apiary);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedApiary) {
      deleteMutation.mutate(selectedApiary.id);
    }
  };

  const handleShowMap = () => {
    setIsMapModalOpen(true);
  };

  const handleSubmit = (data: Omit<Apiary, 'id' | 'createdAt'>) => {
    if (selectedApiary) {
      updateMutation.mutate({ id: selectedApiary.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gestão de Apiários</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gerencie todos os seus apiários em um só lugar
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleShowMap}
            className="flex items-center gap-1"
          >
            <MapPin size={16} /> Ver Mapa
          </Button>
          <Button 
            onClick={() => handleOpenForm()}
            className="flex items-center gap-1"
          >
            <PlusCircle size={16} /> Novo Apiário
          </Button>
        </div>
      </div>

      <Card className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !apiaries?.length ? (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium">Nenhum apiário encontrado</h3>
            <p className="text-gray-500 mt-2">Adicione seu primeiro apiário para começar</p>
            <Button onClick={() => handleOpenForm()} className="mt-4">
              Adicionar Apiário
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Coordenadas</TableHead>
                <TableHead>Flora</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiaries.map((apiary) => (
                <TableRow key={apiary.id}>
                  <TableCell className="font-medium">{apiary.name}</TableCell>
                  <TableCell>{apiary.location}</TableCell>
                  <TableCell>{apiary.coordinates}</TableCell>
                  <TableCell>{apiary.floraTypes?.join(', ') || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(apiary.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenForm(apiary)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(apiary)}
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
              {selectedApiary ? "Editar Apiário" : "Adicionar Apiário"}
            </DialogTitle>
          </DialogHeader>
          <ApiaryForm 
            apiary={selectedApiary} 
            onSubmit={handleSubmit} 
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Apiário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o apiário "{selectedApiary?.name}"? Esta ação não pode ser desfeita.
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

      {/* Map Modal */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Mapa de Apiários</DialogTitle>
          </DialogHeader>
          <div className="h-[70vh]">
            <ApiaryMap apiaries={apiaries || []} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
