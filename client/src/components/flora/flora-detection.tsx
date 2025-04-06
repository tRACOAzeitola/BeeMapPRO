import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FloraDetectionResult {
  success: boolean;
  image_preview: string;
  stats: {
    rosemary_coverage_percent: number;
    class_distribution: Record<string, number>;
  };
  metadata: {
    image_size: [number, number, number];
    ndvi_range: [number, number];
  };
  error?: string;
}

export function FloraDetection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<FloraDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError(null);
    
    if (file) {
      // Only process image files
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem válido.');
        return;
      }
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Por favor, selecione uma imagem para análise.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        // Extract base64 data (remove data:image/jpeg;base64, prefix)
        const base64Data = (reader.result as string).split(',')[1];

        // Send to API
        try {
          const response = await apiRequest<FloraDetectionResult>('/api/flora/detect', 'POST', {
            image_data: base64Data
          });
          
          setResult(response);
        } catch (err: any) {
          console.error('Error during flora detection:', err);
          setError(err.message || 'Ocorreu um erro durante o processamento da imagem.');
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (err: any) {
      console.error('Error reading file:', err);
      setError('Erro ao ler o arquivo. Por favor, tente novamente.');
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detecção de Rosmaninho</CardTitle>
        <CardDescription>
          Faça upload de uma imagem de satélite para detectar a presença de rosmaninho (Lavandula stoechas L.)
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload de Imagem</TabsTrigger>
            <TabsTrigger value="results" disabled={!result}>Resultados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid w-full gap-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    {preview ? (
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="h-16 w-16 object-cover rounded-full" 
                      />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">
                      {selectedFile ? selectedFile.name : 'Selecione uma imagem'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Imagens de satélite (Sentinel-2 preferencialmente) para melhor detecção
                    </p>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    onClick={handleButtonClick}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Escolher Imagem</span>
                  </Button>
                </div>
              </div>
              
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Processando imagem...</Label>
                    <span className="text-sm text-muted-foreground">
                      Por favor, aguarde
                    </span>
                  </div>
                  <Progress value={50} className="w-full" />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {result && result.success ? (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-2/3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Visualização</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <img 
                          src={`data:image/png;base64,${result.image_preview}`} 
                          alt="Análise de vegetação" 
                          className="w-full rounded-md"
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="w-full md:w-1/3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Estatísticas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Cobertura de Rosmaninho</Label>
                          <div className="mt-2 space-y-2">
                            <Progress 
                              value={result.stats.rosemary_coverage_percent} 
                              className="h-3"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>0%</span>
                              <span>{result.stats.rosemary_coverage_percent.toFixed(2)}%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <Label className="text-sm font-medium">Índices de Vegetação</Label>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>NDVI Min:</div>
                            <div className="text-right font-medium">
                              {result.metadata.ndvi_range[0].toFixed(2)}
                            </div>
                            <div>NDVI Max:</div>
                            <div className="text-right font-medium">
                              {result.metadata.ndvi_range[1].toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <Label className="text-sm font-medium">Tamanho da Imagem</Label>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>Dimensões:</div>
                            <div className="text-right font-medium">
                              {result.metadata.image_size[1]} × {result.metadata.image_size[0]}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetForm}>
                    Nova Análise
                  </Button>
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro nos Resultados</AlertTitle>
                <AlertDescription>
                  {result?.error || 'Ocorreu um erro ao processar os resultados.'}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={resetForm} disabled={isProcessing}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={!selectedFile || isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando
            </>
          ) : (
            'Analisar Imagem'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}