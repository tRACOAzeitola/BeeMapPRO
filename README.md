# BeeMap PRO

![Version](https://img.shields.io/badge/version-1.0.0--alpha-blue)
![Status](https://img.shields.io/badge/status-MVP-green)

## 📌 Introdução

BeeMap PRO é uma plataforma integrada de gestão e análise para apicultura de precisão que combina dados geoespaciais, análise climática, monitorização de colmeias e rastreamento de flora melífera. Desenvolvida para revolucionar a prática apícola com tecnologia de ponta, a nossa solução ajuda apicultores a otimizar as suas operações, melhorar a saúde das colmeias e contribuir para a conservação das abelhas.

### Problema

Os apicultores enfrentam desafios significativos na otimização da localização de apiários, monitorização da saúde das colmeias, e compreensão das condições ambientais que afetam a produtividade. Métodos tradicionais são ineficientes e não aproveitam o potencial dos dados para tomada de decisões.

### Público-Alvo

- Apicultores profissionais
- Cooperativas apícolas
- Gestores de explorações agrícolas
- Investigadores em apicultura e conservação
- Entidades governamentais ligadas à agricultura

## 🚀 Funcionalidades Principais

### Implementadas

#### Gestão de Apiários
- Cadastro e monitorização de apiários com dados geoespaciais
- Visualização em mapa interativo de todos os apiários
- Análise de adequação do terreno e microclima

#### Monitorização de Colmeias
- Registo detalhado de cada colmeia com histórico de inspeções
- Acompanhamento de saúde e produtividade
- Alertas para inspeções e intervenções necessárias

#### Análise Climática
- Integração com dados climáticos em tempo real
- Previsões específicas para locais de apiários
- Alertas de condições adversas para maneio

#### Mapeamento de Flora Melífera
- Catálogo de plantas importantes para apicultura
- Análise geoespacial de concentração de flora melífera
- Visualização em modo satélite para identificação precisa de áreas com vegetação
- Análise detalhada com visualização de resultados por área selecionada

#### Gestão de Inventário
- Controlo de equipamentos e consumíveis
- Cronograma de manutenção
- Previsão de necessidades baseada no crescimento do apiário

#### Painel de Controlo Avançado
- Visualizações interativas com métricas e gráficos
- Gráficos de produção mensal de mel
- Análise de correlação entre atividade das colmeias e temperatura
- Composição da vegetação e distribuição da flora melífera
- Gráfico radar de indicadores de saúde das colmeias
- Sistema preditivo com projeções semanais e recomendações

### Em Desenvolvimento

- Integração de algoritmos avançados de machine learning para identificação de vegetação
- Recomendações inteligentes para posicionamento de apiários
- Aplicação móvel para trabalho em campo
- Sincronização offline/online para áreas rurais
- Sistema avançado de alertas e notificações
- Análise preditiva para produção de mel e saúde das colmeias

## 🧩 Arquitetura do Projeto

### Estrutura de Pastas

```
/
├── client/                  # Frontend da aplicação
│   ├── public/              # Recursos estáticos
│   ├── src/                 # Código fonte do cliente
│       ├── components/      # Componentes React reutilizáveis
│       ├── contexts/        # Contextos React (tema, autenticação)
│       ├── hooks/           # Custom hooks
│       ├── lib/             # Utilitários e funções auxiliares
│       ├── models/          # Definições de tipos e interfaces
│       ├── pages/           # Páginas da aplicação
│       ├── services/        # Serviços (API, Firebase)
│       └── styles/          # Estilos globais
├── server/                  # Backend da aplicação
│   ├── api/                 # Rotas e controladores da API
│   ├── db/                  # Configuração e modelos da base de dados
│   ├── services/            # Serviços de negócio
│   └── utils/              # Utilitários do servidor
├── beemap-backend/          # Módulos de análise e IA
│   ├── app/                 # Aplicação Python principal
│   ├── ml/                  # Modelos de machine learning
│   └── data/                # Armazenamento de datasets
└── shared/                  # Código compartilhado entre cliente e servidor
    ├── schema/              # Esquemas de dados
    └── constants/           # Constantes compartilhadas
```

### Tecnologias Utilizadas

#### Frontend
- **Framework**: React com TypeScript
- **Estilos**: TailwindCSS
- **Componentes UI**: Shadcn/UI com Radix UI
- **Animações**: Framer Motion
- **Mapas**: Leaflet/React-Leaflet
- **Visualização de Dados**: Recharts
- **Estado Global**: Context API
- **Encaminhamento**: React Router DOM

#### Backend
- **API**: Node.js com Express
- **Base de Dados**: Firebase Firestore
- **Autenticação**: Firebase Authentication
- **Processamento de Dados**: Python (análise geoespacial e ML)
- **Armazenamento**: Firebase Storage

#### Serviços Externos
- **Dados Climáticos**: APIs de serviços meteorológicos
- **Geocodificação**: Serviços de mapeamento
- **Imagens Satélite**: Processamento de imagens Sentinel-2

## ⚙️ Instalação e Configuração Local

### Pré-requisitos

- Node.js (v16+)
- Python 3.8+ (para módulos de análise)
- Conta Firebase (para backend)
- Git

### Configuração do Frontend

1. Clone o repositório:
   ```bash
   git clone https://github.com/your-username/beemap-pro.git
   cd beemap-pro
   ```

2. Instale as dependências do cliente:
   ```bash
   cd client
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   ```
   Edite o arquivo `.env.local` com suas configurações. (Não inclua dados sensíveis)

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### Configuração do Backend

1. Instale as dependências do servidor:
   ```bash
   cd ../server
   npm install
   ```

2. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas configurações, incluindo as credenciais do Firebase.

3. Inicie o servidor:
   ```bash
   npm run dev
   ```

### Configuração dos Módulos de Análise (Opcional)

1. Configure o ambiente Python:
   ```bash
   cd ../beemap-backend
   python -m venv venv
   source venv/bin/activate  # No Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

3. Execute os serviços de análise:
   ```bash
   python -m app.main
   ```

### Integração com Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o Firestore Database
3. Configure a autenticação (Email/Password)
4. Adicione as credenciais ao arquivo `.env` (não inclua as credenciais diretamente no código)

## 🤝 Como Contribuir

Contribuições são bem-vindas! Aqui estão algumas formas de contribuir:

1. Reportar bugs ou solicitar funcionalidades através das issues
2. Submeter pull requests para correções ou novas funcionalidades
3. Melhorar a documentação
4. Compartilhar feedback sobre a usabilidade

### Processo de Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Faça commit das suas alterações (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Desenvolvido por BeeMap PRO Team © 2025