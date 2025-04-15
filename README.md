# BeeMap Pro

Plataforma integrada de gestão e análise para apicultura de precisão.

## Sobre o Projeto

BeeMap Pro é uma plataforma abrangente para gerenciamento e análise de apicultura que combina dados geoespaciais, análise climática, monitorização de colmeias e rastreamento de flora melífera. Desenvolvida para revolucionar a prática apícola com tecnologia de ponta, a nossa aplicação ajuda apicultores a otimizar as suas operações, melhorar a saúde das colmeias e contribuir para a conservação das abelhas.

## Missão

Revolucionar a apicultura através de uma plataforma integrada que combina geolocalização, dados climáticos, e análise de vegetação para maximizar a produção de mel e apoiar a conservação das abelhas.

## Funcionalidades Principais

### 1. Gestão de Apiários ✓
- ✓ Cadastro e monitorização de apiários com dados geoespaciais
- ✓ Visualização em mapa interativo de todos os apiários
- ✓ Análise de adequação do terreno e microclima

### 2. Monitorização de Colmeias ✓
- ✓ Registo detalhado de cada colmeia com histórico de inspeções
- ✓ Acompanhamento de saúde e produtividade
- ✓ Alertas para inspeções e intervenções necessárias

### 3. Análise Climática ✓
- ✓ Integração com dados climáticos em tempo real
- ✓ Previsões específicas para locais de apiários
- ✓ Alertas de condições adversas para maneio

### 4. Mapeamento de Flora Melífera ✓
- ✓ Catálogo de plantas importantes para apicultura
- ✓ Análise geoespacial de concentração de flora melífera
- ✓ Deteção de rosmaninho e outras plantas via seleção de área no mapa
- ✓ Análise detalhada com visualização de resultados por área selecionada
- ✓ Upload e identificação de imagens de flora

### 5. Gestão de Inventário ✓
- ✓ Controlo de equipamentos e consumíveis
- ✓ Cronograma de manutenção
- ✓ Previsão de necessidades baseada no crescimento do apiário

### 6. Painel de Controlo Avançado ✓
- ✓ Visualizações interativas com métricas e gráficos
- ✓ Gráficos de produção mensal de mel
- ✓ Análise de correlação entre atividade das colmeias e temperatura
- ✓ Composição da vegetação e distribuição da flora melífera
- ✓ Gráfico radar de indicadores de saúde das colmeias
- ✓ Sistema preditivo com projeções semanais e recomendações

## Painel de Controlo Aprimorado

O painel de controlo do BeeMap Pro foi atualizado com novas visualizações avançadas, proporcionando uma visão ainda mais completa da operação apícola, sem comprometer o layout e estilo original da aplicação.

### Gráficos de Produção e Atividade ✓
- ✓ **Gráfico de Produção de Mel**: Representação mensal da produção anual de mel, permitindo identificar padrões sazonais
- ✓ **Gráfico de Atividade vs. Temperatura**: Correlação entre a atividade das colmeias e a temperatura nos últimos 7 dias

### Análise de Flora e Saúde das Colmeias ✓
- ✓ **Gráfico de Composição da Vegetação (Gráfico Circular)**: Apresenta a distribuição das fontes de flora melífera identificadas na zona
- ✓ **Gráfico Radar de Saúde das Colmeias**: Mostra múltiplos indicadores de saúde das colmeias de forma clara e visual
- ✓ **Previsão de Produção e Recomendações Semanais**: Sistema preditivo com projeções semanais de produção e sugestões práticas para melhorar a eficiência e saúde do apiário

### Visão Global Aprimorada ✓
O painel de controlo agora oferece:
- ✓ Métricas de produção e previsões futuras
- ✓ Condições ambientais em tempo real
- ✓ Indicadores de saúde das colmeias
- ✓ Informação detalhada sobre a composição da flora
- ✓ Correlações entre atividade apícola e clima
- ✓ Recomendações específicas baseadas em dados e padrões históricos

Todos os componentes foram implementados com design responsivo, respeitando o estilo visual do painel de controlo original, incluindo:
- ✓ Estilo dos cartões, cores e estados de carregamento
- ✓ Coerência com temas claro e escuro
- ✓ Estrutura modular para fácil substituição de dados fictícios por chamadas reais à API, quando disponíveis

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, TailwindCSS, Framer Motion ✓
- **Backend**: Node.js, Express ✓
- **Base de Dados**: PostgreSQL com Drizzle ORM ✓
- **Mapas**: Leaflet/React-Leaflet ✓
- **Visualização de Dados**: Recharts ✓
- **Componentes UI**: Shadcn/UI com Radix UI ✓
- **Encaminhamento**: React Router DOM ✓
- **API Climática**: Integração com serviços de dados meteorológicos ✓
- **Análise Geoespacial**: Processamento de imagens Sentinel-2 (Em Desenvolvimento)
- **Sistema de Notificações**: Toast notifications com contexto global ✓

## Fases de Desenvolvimento

### Fase 1: Infraestrutura Básica e CRUD ✓
- ✓ Configuração da arquitetura base do projeto
- ✓ Implementação da base de dados PostgreSQL
- ✓ Criação das interfaces de gestão de apiários e colmeias
- ✓ Sistema de autenticação e autorização

### Fase 2: Visualização Espacial e Análise ✓
- ✓ Integração de mapas interativos
- ✓ Painel de controlo com visualizações dinâmicas
- ✓ Gráficos de saúde e produtividade de colmeias
- ✓ Integração inicial com dados climáticos

### Fase 3: Análise de Flora e Integração de IA ✓
- ✓ Desenvolvimento do módulo de deteção de flora melífera
- ✓ Implementação de análise geoespacial de áreas selecionadas
- ✓ Sistema de seleção interativa de áreas em mapa
- ✓ Análise detalhada de composição vegetal por área
- (Em Desenvolvimento) Integração de algoritmos avançados de machine learning para identificação de vegetação
- (Em Desenvolvimento) Recomendações inteligentes para posicionamento de apiários

### Fase 4: Mobile e Funcionalidades Avançadas (Em Desenvolvimento)
- (Em Desenvolvimento) Desenvolvimento de aplicação móvel para trabalho em campo
- (Em Desenvolvimento) Sincronização offline/online para áreas rurais
- (Em Desenvolvimento) Sistema avançado de alertas e notificações
- (Em Desenvolvimento) Análise preditiva para produção de mel e saúde das colmeias

## Funcionalidades Implementadas

- ✓ Sistema de cadastro e visualização de apiários
- ✓ Gestão completa de colmeias
- ✓ Painel de controlo interativo com métricas e gráficos
- ✓ Visualização geoespacial com mapas interativos
- ✓ Módulo completo de gestão de flora melífera
- ✓ Análise de flora por área geográfica via mapa interativo
- ✓ Gráficos avançados de produção, saúde e análise ambiental
- ✓ Sistema preditivo de recomendações baseadas em dados
- ✓ Sistema de gestão de inventário
- ✓ Integração com dados climáticos
- ✓ Interface responsiva para diferentes dispositivos
- ✓ Página inicial completa com animações e secções informativas
- ✓ Formulário de início de sessão com redirecionamento para o painel de controlo
- ✓ Navegação intuitiva com deslocamento suave para secções
- ✓ Sistema robusto de temas claro e escuro com integração completa
- ✓ Sistema de notificações toast com suporte a variantes visual (sucesso, erro, info)

## Melhorias Técnicas Recentes

### Sistema de Temas Aprimorado ✓
- ✓ Implementação de um sistema duplo de temas para maior flexibilidade
- ✓ Suporte para preferências do sistema e escolhas do usuário
- ✓ Transições visuais suaves entre temas
- ✓ Persistência de preferências de tema entre sessões

### Sistema de Notificações Toast ✓
- ✓ Implementação de sistema contextual de notificações
- ✓ Suporte para diferentes tipos (sucesso, erro, alerta, informação)
- ✓ Design responsivo adaptado aos temas
- ✓ Animações suaves de entrada e saída

### Melhorias de Robustez e Tipagem ✓
- ✓ Implementação de interfaces TypeScript para dados climáticos
- ✓ Melhorias na tipagem dos componentes para prevenção de erros
- ✓ Tratamento avançado de erros na comunicação com a API
- ✓ Sistema de fallback para dados climáticos quando o servidor está indisponível

### Melhorias na Seleção de Área no Mapa ✓
- ✓ Correção de falhas na seleção de polígonos e retângulos no mapa
- ✓ Melhorias na detecção de tipo de área desenhada
- ✓ Tratamento robusto para formas não reconhecidas
- ✓ Feedback visual aprimorado durante o processo de seleção e análise

## Página Inicial (Landing Page)

A nossa página inicial foi completamente redesenhada com:

### 1. Design Moderno e Responsivo ✓
- ✓ Interface moderna e intuitiva usando Tailwind CSS
- ✓ Layout completamente responsivo para todos os dispositivos
- ✓ Experiência de utilizador aprimorada com feedback visual

### 2. Secções Informativas ✓
- ✓ **Como Funciona**: Apresentação do processo em 4 passos com círculos numerados e descrições detalhadas
- ✓ **Benefícios**: Destaque de 6 vantagens principais com ícones de emoji e descrições detalhadas
- ✓ **Sobre Nós**: Apresentação da missão da empresa e os nossos três pilares tecnológicos principais
- ✓ **Testemunhos**: Depoimentos de utilizadores reais da plataforma
- ✓ **Preços**: Planos e opções para diferentes perfis de apicultores

### 3. Elementos Interativos ✓
- ✓ Animações suaves utilizando Framer Motion
- ✓ Menu de navegação com deslocamento suave para secções
- ✓ Formulário de início de sessão que redireciona para o painel de controlo
- ✓ Cartões animados na secção de preços e benefícios
- ✓ Efeitos de hover em elementos interativos

### 4. Sistema de Temas Claro e Escuro ✓
- ✓ Alternância entre temas claro e escuro com um botão na navegação
- ✓ Cores e estilos adaptados para cada tema
- ✓ Persistência da preferência do tema
- ✓ Deteção automática do tema do sistema
- ✓ Transições suaves entre os temas
- ✓ Todas as secções (navegação, hero, início de sessão, etc.) respeitam o tema selecionado e mantêm a consistência visual com o resto da aplicação

## Próximos Desenvolvimentos

- (Em Desenvolvimento) Aprimoramento do módulo de análise de imagens de satélite
- (Em Desenvolvimento) Implementação de machine learning funcional para deteção de flora
- (Em Desenvolvimento) Funcionalidades de previsão e alerta
- (Em Desenvolvimento) Aplicação móvel para uso em campo
- (Em Desenvolvimento) Análise avançada de fatores climáticos
- (Em Desenvolvimento) Ferramentas de colaboração para equipas de apicultores
- (Em Desenvolvimento) Expansão das funcionalidades do painel de controlo com mais métricas e visualizações
- (Em Desenvolvimento) Implementação completa de todos os planos de preços

## Como Executar o Projeto

### Opção 1: Execução Local

#### Pré-requisitos
- Node.js v18+ ✓
- PostgreSQL 14+ ✓

#### Instalação

1. Clone o repositório
2. Instale as dependências
   ```
   npm install
   ```
3. Configure as variáveis de ambiente (copie o ficheiro .env.example para .env)
   ```
   cp .env.example .env
   ```
4. Execute as migrações da base de dados
   ```
   npm run db:push
   ```
5. Inicie o servidor de desenvolvimento
   ```
   npm run dev
   ```
6. Aceda à aplicação em http://localhost:5000

### Opção 2: Execução com Docker

#### Pré-requisitos
- Docker
- Docker Compose

#### Instalação e Execução

1. Clone o repositório
2. Execute a plataforma com Docker Compose:
   ```
   docker-compose -f docker/docker-compose.yml up -d
   ```
3. Execute as migrações da base de dados:
   ```
   docker-compose -f docker/docker-compose.yml exec app npm run db:push
   ```
4. Aceda à aplicação em http://localhost:5000
5. Para parar a aplicação:
   ```
   docker-compose -f docker/docker-compose.yml down
   ```

Consulte o ficheiro [docker/README.md](docker/README.md) para mais detalhes sobre a configuração Docker.

### Credenciais de Demonstração
- Email: demo@beemap.pro
- Palavra-passe: demo123

---

## Licença

Este projeto está licenciado sob a licença MIT - veja o ficheiro LICENSE para detalhes.

## Contacto

Email: contato@beemappro.com
Website: https://beemappro.com
Redes sociais: [@beemappro](https://twitter.com/beemappro)