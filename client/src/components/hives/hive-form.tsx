import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Hive, type Apiary } from "@shared/schema";
import { insertHiveSchema } from "@shared/schema";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Extend the insert schema to add validation
const formSchema = insertHiveSchema.extend({
  lastInspectionDate: z.date().optional(),
});

type HiveFormValues = z.infer<typeof formSchema>;

type HiveFormProps = {
  hive?: Hive | null;
  apiaries: Apiary[];
  onSubmit: (data: HiveFormValues) => void;
  isLoading: boolean;
};

const HiveForm: React.FC<HiveFormProps> = ({ hive, apiaries, onSubmit, isLoading }) => {
  // Initialize form with default values or existing hive data
  const form = useForm<HiveFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: hive?.name || "",
      apiaryId: hive?.apiaryId || (apiaries[0]?.id || 0),
      status: hive?.status || "good",
      notes: hive?.notes || "",
      lastInspectionDate: hive?.lastInspectionDate ? new Date(hive.lastInspectionDate) : undefined,
    },
  });

  // Handle form submission
  const handleSubmit = (values: HiveFormValues) => {
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
              <FormLabel>Nome da Colmeia</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Colmeia 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiaryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apiário</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um apiário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {apiaries.map((apiary) => (
                    <SelectItem key={apiary.id} value={apiary.id.toString()}>
                      {apiary.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="good">Boa</SelectItem>
                  <SelectItem value="weak">Fraca</SelectItem>
                  <SelectItem value="dead">Morta</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastInspectionDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data da Última Inspeção</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações adicionais sobre a colmeia" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : hive ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default HiveForm;
