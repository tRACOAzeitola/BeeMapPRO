# BeeMap Pro

Plataforma integrada de gestão e análise para apicultura de precisão.

## Sobre o Projeto

BeeMap Pro é uma plataforma abrangente para gerenciamento e análise de apicultura que combina dados geoespaciais, análise climática, monitoramento de colmeias e rastreamento de flora melífera. Desenvolvida para revolucionar a prática apícola com tecnologia de ponta, nossa aplicação ajuda apicultores a otimizar suas operações, melhorar a saúde das colmeias e contribuir para a conservação das abelhas.

## Missão

Revolucionar a apicultura através de uma plataforma integrada que combina geolocalização, dados climáticos, e análise de vegetação para maximizar a produção de mel e apoiar a conservação das abelhas.

## Funcionalidades Principais

### 1. Gestão de Apiários
- Cadastro e monitoramento de apiários com dados geoespaciais
- Visualização em mapa interativo de todos os apiários
- Análise de adequação do terreno e microclima

### 2. Monitoramento de Colmeias
- Registro detalhado de cada colmeia com histórico de inspeções
- Acompanhamento de saúde e produtividade
- Alertas para inspeções e intervenções necessárias

### 3. Análise Climática
- Integração com dados climáticos em tempo real
- Previsões específicas para locais de apiários
- Alertas de condições adversas para manejo

### 4. Mapeamento de Flora Melífera
- Catálogo de plantas importantes para apicultura
- Análise geoespacial de concentração de flora melífera
- Detecção de rosmaninho e outras plantas via sensoriamento remoto

### 5. Gestão de Inventário
- Controle de equipamentos e suprimentos
- Cronograma de manutenção
- Previsão de necessidades baseada no crescimento do apiário

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **Mapas**: Leaflet/React-Leaflet
- **Visualização de Dados**: Recharts
- **UI Components**: Shadcn/UI com Radix UI
- **Roteamento**: React Router DOM
- **API Climática**: Integração com serviços de dados meteorológicos
- **Análise Geoespacial**: Processamento de imagens Sentinel-2

## Fases de Desenvolvimento

### Fase 1: Infraestrutura Básica e CRUD ✓
- Configuração da arquitetura base do projeto
- Implementação do banco de dados PostgreSQL
- Criação das interfaces de gestão de apiários e colmeias
- Sistema de autenticação e autorização

### Fase 2: Visualização Espacial e Análise ✓
- Integração de mapas interativos
- Dashboard com visualizações dinâmicas
- Gráficos de saúde e produtividade de colmeias
- Integração inicial com dados climáticos

### Fase 3: Análise de Flora e Integração de IA (Em Andamento) ⟶
- Desenvolvimento do módulo de detecção de flora melífera
- Implementação de análise geoespacial com imagens de satélite
- Integração de algoritmos de machine learning para identificação de vegetação
- Recomendações inteligentes para posicionamento de apiários

### Fase 4: Mobile e Funcionalidades Avançadas (Planejado)
- Desenvolvimento de aplicação móvel para trabalho em campo
- Sincronização offline/online para áreas rurais
- Sistema avançado de alertas e notificações
- Análise preditiva para produção de mel e saúde das colmeias

## Funcionalidades Implementadas

- ✓ Sistema de cadastro e visualização de apiários
- ✓ Gerenciamento completo de colmeias
- ✓ Dashboard interativo com métricas e gráficos
- ✓ Visualização geoespacial com mapas interativos
- ✓ Módulo de gestão de flora melífera
- ✓ Análise geoespacial experimental para detecção de flora
- ✓ Sistema de gestão de inventário
- ✓ Integração com dados climáticos
- ✓ Interface responsiva para diferentes dispositivos
- ✓ Landing page completa com animações e secções informativas
- ✓ Formulário de login com redirecionamento para o dashboard
- ✓ Navegação intuitiva com rolagem suave para secções

## Página Inicial (Landing Page)

Nossa página inicial foi completamente redesenhada com:

### 1. Design Moderno e Responsivo
- Interface moderna e intuitiva usando Tailwind CSS
- Layout completamente responsivo para todos os dispositivos
- Experiência de usuário aprimorada com feedback visual

### 2. Secções Informativas
- **Como Funciona**: Apresentação do processo em 4 passos com círculos numerados e descrições detalhadas
- **Benefícios**: Destaque de 6 vantagens principais com ícones de emoji e descrições detalhadas
- **Sobre Nós**: Apresentação da missão da empresa e nossos três pilares tecnológicos principais
- **Testemunhos**: Depoimentos de usuários reais da plataforma
- **Preços**: Planos e opções para diferentes perfis de apicultores

### 3. Elementos Interativos
- Animações suaves utilizando Framer Motion
- Menu de navegação com rolagem suave para secções
- Formulário de login que redireciona para o dashboard
- Cards animados na secção de preços e benefícios
- Efeitos de hover em elementos interativos

## Próximos Desenvolvimentos

- Aprimoramento do módulo de análise de imagens de satélite
- Implementação de machine learning funcional para detecção de flora
- Funcionalidades de previsão e alerta
- Aplicativo móvel para uso em campo
- Análise avançada de fatores climáticos
- Ferramentas de colaboração para equipes de apicultores
- Expansão das funcionalidades do dashboard com mais métricas e visualizações
- Implementação completa de todos os planos de preços

---

## Como Executar o Projeto

### Pré-requisitos
- Node.js v18+
- PostgreSQL 14+

### Instalação

1. Clone o repositório
2. Instale as dependências
   ```
   npm install
   ```
3. Configure as variáveis de ambiente (copie o arquivo .env.example para .env)
   ```
   cp .env.example .env
   ```
4. Execute as migrações do banco de dados
   ```
   npm run migrate
   ```
5. Inicie o servidor de desenvolvimento
   ```
   npm run dev
   ```
6. Acesse a aplicação em http://localhost:5000

### Credenciais Demo
- Email: demo@beemap.pro
- Senha: demo123

---

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Email: contato@beemappro.com
Website: https://beemappro.com
Redes sociais: [@beemappro](https://twitter.com/beemappro)

---

Desenvolvido com ❤️ para a comunidade apícola e conservação das abelhas.