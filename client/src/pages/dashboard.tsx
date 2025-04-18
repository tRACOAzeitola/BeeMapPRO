import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import StatsCard from '@/components/dashboard/stats-card';
import MapOverview from '@/components/dashboard/map-overview';
import HealthChart from '@/components/dashboard/health-chart';
import HoneyProductionChart from '@/components/dashboard/honey-production-chart';
import ActivityTemperatureChart from '@/components/dashboard/activity-temperature-chart';
import VegetationComposition from '@/components/dashboard/vegetation-composition';
import ProductionForecast from '@/components/dashboard/production-forecast';
import ClimateWidget from '@/components/dashboard/climate-widget';
import ApiaryList from '@/components/dashboard/apiary-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fetchApiaries } from '@/lib/apiary-service';
import { fetchWeatherForLocation } from '@/lib/weather-service';
import { Weather } from '@/types/weather';

// Tipos necessários para os componentes
interface DashboardData {
  apiaryCount: number;
  hiveCount: number;
  healthRate: number;
  alertCount: number;
  hiveStatus: {
    good: number;
    weak: number;
    dead: number;
  };
}

interface Apiary {
  id: number;
  name: string;
  location: string;
  coordinates: string;
  floraTypes: string[] | null;
  floraDensity: string | null;
  createdAt: Date | null;
}

interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  percentageChange: number;
  description: string;
}

interface HealthChartProps {
  good: number;
  weak: number;
  dead: number;
  isLoading: boolean;
}

interface MapOverviewProps {
  apiaries: Apiary[];
}

// Tipos de cards disponíveis no dashboard
const CARD_TYPES = {
  STATS: 'stats',
  MAP_HEALTH: 'map_health',
  PRODUCTION_ACTIVITY: 'production_activity',
  VEGETATION_FORECAST: 'vegetation_forecast',
  CLIMATE_APIARIES: 'climate_apiaries',
};

// Interface para os itens de card
interface CardItem {
  id: string;
  type: string;
  content: React.ReactNode;
}

// Componente para card ordenável
interface SortableCardProps {
  id: string;
  children: React.ReactNode;
}

const SortableCard: React.FC<SortableCardProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: '1rem',
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...attributes} 
      {...listeners}
    >
      <Card className="p-4 cursor-move">
        {children}
      </Card>
    </div>
  );
};

export default function Dashboard() {
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [cards, setCards] = useState<CardItem[]>([]);
  
  // Configure os sensores para reconhecer eventos de arrastar
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });

  // Fetch apiaries for the list
  const { data: apiaries } = useQuery<Apiary[]>({
    queryKey: ['/api/apiaries'],
  });

  // Fetch weather data
  const { data: weather } = useQuery<Weather>({ 
    queryKey: ['weather'], 
    queryFn: () => fetchWeatherForLocation(39.7436, -8.8071),
    enabled: activeTab === 'overview'
  });

  // Função para lidar com o final do arrastar
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Salvar a nova ordem no localStorage
        const orderIds = newItems.map(card => card.id);
        localStorage.setItem('dashboardCardOrder', JSON.stringify(orderIds));
        
        return newItems;
      });
    }
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Inicialização dos cards
  useEffect(() => {
    // Tentar carregar a ordem dos cards do localStorage
    const savedOrder = localStorage.getItem('dashboardCardOrder');
    
    // Cards padrão se não houver ordem salva
    const defaultCards: CardItem[] = [
      {
        id: '1',
        type: CARD_TYPES.STATS,
        content: (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Colmeias Ativas"
              value="85%"
              icon="th-large"
              trend="up"
              trendType="positive"
              color="primary"
            />
            <StatsCard
              title="Produção Mensal"
              value="156kg"
              icon="archive"
              trend="up"
              trendType="positive"
              color="success"
            />
            <StatsCard
              title="Saúde Média"
              value="93%"
              icon="heartbeat"
              trend="up"
              trendType="positive"
              color="info"
            />
            <StatsCard
              title="Alerta de Apiários"
              value="2"
              icon="exclamation-triangle"
              trend="down"
              trendType="negative"
              color="danger"
            />
          </div>
        )
      },
      {
        id: '2',
        type: CARD_TYPES.MAP_HEALTH,
        content: (
          <div className="grid gap-4 md:grid-cols-2">
            <MapOverview apiaries={apiaries} />
            <HealthChart good={25} weak={5} dead={2} isLoading={false} />
          </div>
        )
      },
      {
        id: '3',
        type: CARD_TYPES.PRODUCTION_ACTIVITY,
        content: (
          <div className="grid gap-4 md:grid-cols-2">
            <HoneyProductionChart />
            <ActivityTemperatureChart />
          </div>
        )
      },
      {
        id: '4',
        type: CARD_TYPES.VEGETATION_FORECAST,
        content: (
          <div className="grid gap-4 md:grid-cols-3">
            <VegetationComposition />
            <div className="md:col-span-2">
              <ProductionForecast />
            </div>
          </div>
        )
      },
      {
        id: '5',
        type: CARD_TYPES.CLIMATE_APIARIES,
        content: (
          <div className="grid gap-4 md:grid-cols-2">
            <ClimateWidget weather={weather} />
            <ApiaryList apiaries={apiaries || []} isLoading={false} />
          </div>
        )
      }
    ];
    
    if (savedOrder) {
      try {
        // Carregar ordem salva
        const orderIds = JSON.parse(savedOrder);
        const orderedCards = orderIds.map((id: string) => 
          defaultCards.find(card => card.id === id)
        ).filter(Boolean);
        
        // Verificar se há novos cards que não estão na ordem salva
        const newCards = defaultCards.filter(
          card => !orderIds.includes(card.id)
        );
        
        setCards([...orderedCards, ...newCards]);
      } catch (e) {
        console.error("Erro ao carregar ordem dos cards:", e);
        setCards(defaultCards);
      }
    } else {
      setCards(defaultCards);
    }
  }, [weather, apiaries]);

  return (
    <main className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline">Exportar Dados</Button>
          <Button>Adicionar Apiário</Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="production">Produção</TabsTrigger>
          <TabsTrigger value="health">Saúde</TabsTrigger>
          <TabsTrigger value="vegetation">Vegetação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={cards.map(card => card.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {cards.map(card => (
                  <SortableCard key={card.id} id={card.id}>
                    {card.content}
                  </SortableCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </TabsContent>
        
        <TabsContent value="production">
          {/* Conteúdo da aba de produção */}
          <div className="grid gap-4">
            <HoneyProductionChart />
            <ProductionForecast />
          </div>
        </TabsContent>
        
        <TabsContent value="health">
          {/* Conteúdo da aba de saúde */}
          <div className="grid gap-4">
            <HealthChart />
            <ActivityTemperatureChart />
          </div>
        </TabsContent>
        
        <TabsContent value="vegetation">
          {/* Conteúdo da aba de vegetação */}
          <div className="grid gap-4">
            <VegetationComposition />
            <MapOverview />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
