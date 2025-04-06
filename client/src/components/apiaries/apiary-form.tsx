import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type Apiary } from "@shared/schema";
import { insertApiarySchema } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { type FloraType } from "@shared/schema";
import { MultiSelect } from "@/components/ui/multi-select";

// Extend the insert schema to add validation
const formSchema = insertApiarySchema
  .extend({
    floraTypes: z.array(z.string()).optional(),
    floraDensity: z.string().optional(),
  })
  .refine((data) => {
    // Check if coordinates are in valid format
    if (!data.coordinates) return true;
    const coordPattern = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    return coordPattern.test(data.coordinates);
  }, {
    message: "Coordenadas devem estar no formato 'latitude, longitude'",
    path: ["coordinates"],
  });

type ApiaryFormValues = z.infer<typeof formSchema>;

type ApiaryFormProps = {
  apiary?: Apiary | null;
  onSubmit: (data: ApiaryFormValues) => void;
  isLoading: boolean;
};

const ApiaryForm: React.FC<ApiaryFormProps> = ({ apiary, onSubmit, isLoading }) => {
  // Fetch available flora types for dropdown
  const { data: floraTypes } = useQuery<FloraType[]>({
    queryKey: ['/api/flora-types'],
  });

  // Initialize form with default values or existing apiary data
  const form = useForm<ApiaryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: apiary?.name || "",
      location: apiary?.location || "",
      coordinates: apiary?.coordinates || "",
      floraTypes: apiary?.floraTypes || [],
      floraDensity: apiary?.floraDensity || "",
    },
  });

  // Handle form submission
  const handleSubmit = (values: ApiaryFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Apiário</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Apiário Lousã" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Localização</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Serra da Lousã" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coordinates"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coordenadas</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 40.1021, -8.2266" {...field} />
              </FormControl>
              <FormDescription>
                Formato: latitude, longitude (ex: 40.1021, -8.2266)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="floraTypes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipos de Flora</FormLabel>
              <FormControl>
                <MultiSelect
                  placeholder="Selecione os tipos de flora"
                  selected={field.value || []}
                  options={
                    floraTypes?.map(flora => ({
                      label: flora.name,
                      value: flora.name
                    })) || []
                  }
                  onChange={(selected) => field.onChange(selected)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="floraDensity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Densidade da Flora</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a densidade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Alta densidade">Alta densidade</SelectItem>
                  <SelectItem value="Média densidade">Média densidade</SelectItem>
                  <SelectItem value="Baixa densidade">Baixa densidade</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : apiary ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ApiaryForm;
