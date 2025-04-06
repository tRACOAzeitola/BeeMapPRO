import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type InventoryItem, type Apiary } from "@shared/schema";
import { Plus, Pencil, Trash2, Filter, Package } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Inventory() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [apiaryFilter, setApiaryFilter] = useState<number | "all">("all");

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [apiaryId, setApiaryId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  // Fetch inventory items
  const { data: inventoryItems, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory', apiaryFilter],
    queryFn: async () => {
      const url = apiaryFilter === "all" 
        ? '/api/inventory' 
        : `/api/inventory?apiaryId=${apiaryFilter}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch inventory items');
      return res.json();
    }
  });

  // Fetch apiaries for filter dropdown
  const { data: apiaries } = useQuery<Apiary[]>({
    queryKey: ['/api/apiaries'],
  });

  // Create inventory item mutation
  const createMutation = useMutation({
    mutationFn: async (item: Omit<InventoryItem, 'id'>) => {
      const res = await apiRequest('POST', '/api/inventory', item);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Item adicionado",
        description: "O item foi adicionado ao inventário com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setIsFormOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o item ao inventário",
        variant: "destructive",
      });
    },
  });

  // Update inventory item mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InventoryItem> }) => {
      const res = await apiRequest('PUT', `/api/inventory/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Item atualizado",
        description: "O item foi atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setIsFormOpen(false);
      setSelectedItem(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o item",
        variant: "destructive",
      });
    },
  });

  // Delete inventory item mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/inventory/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Item excluído",
        description: "O item foi excluído com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o item",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setCategory("");
    setQuantity(0);
    setApiaryId(null);
    setNotes("");
  };

  const handleOpenForm = (item?: InventoryItem) => {
    if (item) {
      setSelectedItem(item);
      setName(item.name);
      setCategory(item.category);
      setQuantity(item.quantity);
      setApiaryId(item.apiaryId);
      setNotes(item.notes || "");
    } else {
      setSelectedItem(null);
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      deleteMutation.mutate(selectedItem.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiaryId) {
      toast({
        title: "Erro",
        description: "Selecione um apiário para este item",
        variant: "destructive",
      });
      return;
    }

    const itemData = {
      name,
      category,
      quantity,
      apiaryId,
      notes,
    };

    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: itemData });
    } else {
      createMutation.mutate(itemData);
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Inventário</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gerenciamento de equipamentos e materiais
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="flex items-center gap-1">
          <Plus size={16} /> Novo Item
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

      <Card className="p-4 bg-white dark:bg-card">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !inventoryItems?.length ? (
          <div className="text-center p-8">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum item no inventário</h3>
            <p className="text-gray-500 mt-2">
              {apiaryFilter === "all" 
                ? "Adicione seu primeiro item para começar a gerenciar seu inventário" 
                : "Não há itens cadastrados para este apiário"}
            </p>
            <Button onClick={() => handleOpenForm()} className="mt-4">
              Adicionar Item
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Apiário</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{getApiaryName(item.apiaryId)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {item.notes || 'Sem observações'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenForm(item)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item)}
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
              {selectedItem ? "Editar Item" : "Adicionar Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Equipamento">Equipamento</SelectItem>
                    <SelectItem value="Ferramenta">Ferramenta</SelectItem>
                    <SelectItem value="Proteção">Proteção</SelectItem>
                    <SelectItem value="Alimentação">Alimentação</SelectItem>
                    <SelectItem value="Medicamento">Medicamento</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiaryId">Apiário</Label>
                <Select
                  value={apiaryId?.toString() || ""}
                  onValueChange={(value) => setApiaryId(parseInt(value))}
                >
                  <SelectTrigger id="apiaryId">
                    <SelectValue placeholder="Selecione um apiário" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiaries?.map((apiary) => (
                      <SelectItem key={apiary.id} value={apiary.id.toString()}>
                        {apiary.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
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
                ) : selectedItem ? (
                  "Atualizar Item"
                ) : (
                  "Adicionar Item"
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
            <AlertDialogTitle>Excluir Item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item "{selectedItem?.name}"? Esta ação não pode ser desfeita.
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
