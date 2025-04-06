import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Map, 
  Layers, 
  Download, 
  Upload, 
  Satellite, 
  ShieldCheck, 
  Database, 
  Scan, 
  Sparkles, 
  AlertTriangle 
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function FloraAnalysis() {
  const [activeTab, setActiveTab] = useState("overview");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [targetFlora, setTargetFlora] = useState("rosmaninho");
  const [modelType, setModelType] = useState("randomForest");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Simula o processo de análise quando o botão é clicado
  const startAnalysis = () => {
    if (!selectedRegion) {
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulação do progresso
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          return 100;
        }
        return next;
      });
    }, 500);
  };
  
  return (
    <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800 dark:text-white">
              Análise de Flora por Sensoriamento Remoto
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
              Detecção de plantas melíferas usando imagens de satélite e inteligência artificial
            </CardDescription>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md border border-amber-200 dark:border-amber-800/30">
            <span className="text-amber-800 dark:text-amber-300 text-xs flex items-center">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Característica Experimental
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="data">Coleta de Dados</TabsTrigger>
            <TabsTrigger value="model">Modelo</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                  <Satellite className="h-5 w-5 mr-2 text-amber-500" />
                  <h3 className="font-medium">Imagens de Satélite</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Utilizamos imagens Sentinel-2 com 10m de resolução para detectar áreas com plantas melíferas importantes para a apicultura.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                  <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
                  <h3 className="font-medium">Ground Truth</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Coletamos dados de campo com localizações GPS precisas de áreas onde crescem plantas como o rosmaninho.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                  <Database className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-medium">Pré-processamento</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aplicamos correções atmosféricas e criamos índices como NDVI para melhorar a qualidade dos dados antes da análise.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                  <h3 className="font-medium">Inteligência Artificial</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Treinamos modelos de Random Forest e Redes Neurais para identificar as plantas melíferas automaticamente.
                </p>
              </div>
            </div>
            
            <div className="mt-6 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4 border border-amber-100 dark:border-amber-800/30">
              <h3 className="font-medium text-amber-800 dark:text-amber-400 mb-2">Como isso ajuda na apicultura?</h3>
              <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                <li className="flex items-start">
                  <span className="bg-amber-500/20 rounded-full p-1 text-amber-600 dark:text-amber-400 mr-2 mt-0.5">
                    <Map className="h-3 w-3" />
                  </span>
                  <span>Identifica as melhores áreas para colocação de colmeias perto de recursos florais</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-amber-500/20 rounded-full p-1 text-amber-600 dark:text-amber-400 mr-2 mt-0.5">
                    <Layers className="h-3 w-3" />
                  </span>
                  <span>Estima a densidade de plantas melíferas em diferentes regiões</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-amber-500/20 rounded-full p-1 text-amber-600 dark:text-amber-400 mr-2 mt-0.5">
                    <Scan className="h-3 w-3" />
                  </span>
                  <span>Monitora mudanças na disponibilidade de flora ao longo das estações</span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">Selecione a Região</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Selecione uma região em Portugal para análise de flora melífera
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Região</Label>
                    <Select 
                      value={selectedRegion} 
                      onValueChange={setSelectedRegion}
                    >
                      <SelectTrigger id="region">
                        <SelectValue placeholder="Selecione uma região" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alentejo">Alentejo</SelectItem>
                        <SelectItem value="algarve">Algarve</SelectItem>
                        <SelectItem value="centro">Centro</SelectItem>
                        <SelectItem value="norte">Norte</SelectItem>
                        <SelectItem value="lisboa">Lisboa e Vale do Tejo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="flora">Tipo de Flora</Label>
                    <Select 
                      value={targetFlora} 
                      onValueChange={setTargetFlora}
                    >
                      <SelectTrigger id="flora">
                        <SelectValue placeholder="Selecione um tipo de flora" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rosmaninho">Rosmaninho</SelectItem>
                        <SelectItem value="alecrim">Alecrim</SelectItem>
                        <SelectItem value="eucalipto">Eucalipto</SelectItem>
                        <SelectItem value="laranjeira">Laranjeira</SelectItem>
                        <SelectItem value="medronheiro">Medronheiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeframe">Período</Label>
                    <Select defaultValue="2023">
                      <SelectTrigger id="timeframe">
                        <SelectValue placeholder="Selecione um período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="2020">2020</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      onClick={() => {}} 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Carregar Dados de Validação (GPS)
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg h-80 flex items-center justify-center">
                <div className="text-center">
                  <Satellite className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">
                    {selectedRegion 
                      ? `Imagem de satélite para ${selectedRegion}` 
                      : "Selecione uma região para visualizar imagens de satélite"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <Button
                variant="outline"
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Dados Brutos
              </Button>
              
              <Button
                disabled={!selectedRegion}
                onClick={() => setActiveTab("model")}
              >
                Próximo Passo
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="model" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">Configuração do Modelo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Configure as opções do modelo de detecção de flora melífera
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelType">Tipo de Modelo</Label>
                    <Select 
                      value={modelType} 
                      onValueChange={setModelType}
                    >
                      <SelectTrigger id="modelType">
                        <SelectValue placeholder="Selecione o tipo de modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="randomForest">Random Forest</SelectItem>
                        <SelectItem value="cnn">Rede Neural Convolucional (CNN)</SelectItem>
                        <SelectItem value="svm">Support Vector Machine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="indices">Índices Vegetação</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="indices">
                        <SelectValue placeholder="Selecione os índices" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos (NDVI, EVI, SAVI)</SelectItem>
                        <SelectItem value="ndvi">Apenas NDVI</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resolution">Resolução Espacial</Label>
                    <Select defaultValue="10m">
                      <SelectTrigger id="resolution">
                        <SelectValue placeholder="Selecione a resolução" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10m">10m (Original)</SelectItem>
                        <SelectItem value="20m">20m</SelectItem>
                        <SelectItem value="30m">30m</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="splitRatio">Proporção Treino/Teste</Label>
                    <Select defaultValue="80_20">
                      <SelectTrigger id="splitRatio">
                        <SelectValue placeholder="Proporção de treino/teste" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="70_30">70% / 30%</SelectItem>
                        <SelectItem value="80_20">80% / 20%</SelectItem>
                        <SelectItem value="90_10">90% / 10%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-medium text-gray-800 dark:text-white mb-4">Detalhes do Modelo</h4>
                
                {modelType === "randomForest" && (
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Random Forest</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Algoritmo de aprendizado de máquina que usa múltiplas árvores de decisão para classificação.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="trees" className="text-xs">Número de Árvores</Label>
                        <span className="text-xs text-gray-500">100</span>
                      </div>
                      <Input
                        id="trees"
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        defaultValue="100"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="depth" className="text-xs">Profundidade Máxima</Label>
                        <span className="text-xs text-gray-500">15</span>
                      </div>
                      <Input
                        id="depth"
                        type="range"
                        min="5"
                        max="30"
                        step="1"
                        defaultValue="15"
                      />
                    </div>
                  </div>
                )}
                
                {modelType === "cnn" && (
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Rede Neural Convolucional</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Modelo de deep learning especializado em processamento de imagens usando camadas de convolução.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="epochs" className="text-xs">Épocas</Label>
                        <span className="text-xs text-gray-500">50</span>
                      </div>
                      <Input
                        id="epochs"
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        defaultValue="50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="batchSize" className="text-xs">Batch Size</Label>
                        <span className="text-xs text-gray-500">32</span>
                      </div>
                      <Input
                        id="batchSize"
                        type="range"
                        min="8"
                        max="128"
                        step="8"
                        defaultValue="32"
                      />
                    </div>
                  </div>
                )}
                
                {modelType === "svm" && (
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Support Vector Machine</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Algoritmo que encontra um hiperplano que separa os dados em classes com a máxima margem.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="kernel" className="text-xs">Kernel</Label>
                      <Select defaultValue="rbf">
                        <SelectTrigger id="kernel">
                          <SelectValue placeholder="Selecione o kernel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rbf">RBF</SelectItem>
                          <SelectItem value="linear">Linear</SelectItem>
                          <SelectItem value="poly">Polinomial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="c" className="text-xs">Parâmetro C</Label>
                        <span className="text-xs text-gray-500">1.0</span>
                      </div>
                      <Input
                        id="c"
                        type="range"
                        min="0.1"
                        max="10"
                        step="0.1"
                        defaultValue="1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setActiveTab("data")}
              >
                Voltar
              </Button>
              
              <Button
                disabled={!selectedRegion}
                onClick={() => {
                  startAnalysis();
                  setActiveTab("results");
                }}
              >
                Executar Análise
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {isAnalyzing ? (
              <div className="space-y-6 py-8">
                <h3 className="text-lg font-medium text-center text-gray-800 dark:text-white">
                  Processando Análise...
                </h3>
                <div className="space-y-2">
                  <Progress value={analysisProgress} className="h-2 w-full" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Análise em andamento</span>
                    <span>{analysisProgress}%</span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>• Carregando imagens de satélite para {selectedRegion}</p>
                  <p>• Aplicando correções atmosféricas</p>
                  <p>• Calculando índices de vegetação</p>
                  {analysisProgress > 30 && <p>• Selecionando dados de treinamento</p>}
                  {analysisProgress > 50 && <p>• Treinando modelo {modelType}</p>}
                  {analysisProgress > 70 && <p>• Aplicando modelo na área selecionada</p>}
                  {analysisProgress > 90 && <p>• Finalizando resultados</p>}
                </div>
              </div>
            ) : analysisProgress === 100 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4">
                      Detecção de {targetFlora} em {selectedRegion}
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Área total detectada</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">127.5 km²</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Densidade média</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Média (42%)</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Precisão do modelo</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">87.4%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recall</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">84.2%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">F1-Score</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">85.8%</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white">Recomendações:</h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>As maiores concentrações estão no sul da região selecionada.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>Ideal para apiários nas áreas destacadas em verde escuro no mapa.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>Densidade suficiente para sustentar aproximadamente 12-15 colmeias por km².</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg h-96 flex items-center justify-center">
                    <div className="text-center">
                      <Map className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                      <p className="text-gray-400">
                        Mapa de distribuição de {targetFlora} em {selectedRegion}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Verde: alta densidade | Amarelo: média densidade | Vermelho: baixa densidade
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <Button variant="outline" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Relatório
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setAnalysisProgress(0);
                      setActiveTab("data");
                    }}
                  >
                    Nova Análise
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  Nenhuma análise realizada
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure os parâmetros e execute uma análise para visualizar os resultados
                </p>
                <Button onClick={() => setActiveTab("data")}>
                  Iniciar Análise
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}