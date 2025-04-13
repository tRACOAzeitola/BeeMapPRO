# BeeMap Mobile App - Documentação Técnica

## Visão Geral
Aplicação móvel para gestão simplificada de apiários no campo, com foco em funcionamento offline e sincronização com BeeMap Pro.

## Requisitos Funcionais

### Sistema de Classificação de Colmeias
- 🪨 1 pedra ao meio: Colmeia boa
- 🪨🪨 2 pedras ao meio: Colmeia forte
- ↖️🪨 1 pedra à esquerda: Colmeia fraca
- 🥢 1 pau ao meio: Colmeia morta

### Funcionalidades Core
1. **Gestão Offline**
   - Armazenamento local completo dos dados
   - Sincronização automática quando houver conexão
   - Indicador de status de sincronização
   - Timestamp da última sincronização

2. **Gestão de Apiários**
   - Lista de apiários sincronizada com webapp
   - Visualização de detalhes do apiário
   - Contadores por categoria de colmeia
   - Botões de incremento/decremento por categoria

3. **Interface de Usuário**
   - Design minimalista e intuitivo
   - Botões grandes para fácil uso no campo
   - Feedback visual claro das ações
   - Indicadores de status de sincronização

## Arquitetura Técnica

### Frontend (React Native)
- React Native CLI
- TypeScript
- Styled Components
- React Navigation
- React Query (para cache e sincronização)

### Armazenamento Local
- SQLite para dados estruturados
- AsyncStorage para configurações
- Watermelon DB para sincronização offline

### Sincronização
- Sistema de filas para operações offline
- Resolução de conflitos baseada em timestamps
- Retry automático de sincronização
- Merge inteligente de dados

### Estado da Aplicação
```typescript
interface ApiaryState {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  hives: {
    good: number;     // 1 pedra ao meio
    strong: number;   // 2 pedras ao meio
    weak: number;     // 1 pedra à esquerda
    dead: number;     // 1 pau ao meio
  };
  lastSync: Date;
  pendingChanges: boolean;
}
```

## Fluxo de Dados
1. **Inicialização**
   ```mermaid
   graph TD
   A[App Inicia] --> B[Carrega Dados Locais]
   B --> C{Internet Disponível?}
   C -->|Sim| D[Sincroniza com Backend]
   C -->|Não| E[Modo Offline]
   ```

2. **Atualização de Colmeias**
   ```mermaid
   graph TD
   A[Usuário Atualiza Contagem] --> B[Salva Localmente]
   B --> C{Internet Disponível?}
   C -->|Sim| D[Sincroniza com Backend]
   C -->|Não| E[Marca para Sincronização Futura]
   ```

## Interface do Usuário

### Telas Principais
1. **Lista de Apiários**
   - Lista scrollável com cards de apiários
   - Indicador de status de sincronização por apiário
   - Pull-to-refresh para sincronização manual

2. **Detalhes do Apiário**
   - Contadores grandes por categoria
   - Botões +/- para cada categoria
   - Mapa offline da localização
   - Histórico de alterações local

3. **Status de Sincronização**
   - Overlay com status detalhado
   - Log de alterações pendentes
   - Opção de forçar sincronização

## Considerações de Performance
- Otimização de renderização para listas longas
- Lazy loading de dados
- Compressão de dados offline
- Batch updates para sincronização

## Segurança
- Criptografia de dados locais
- Token de autenticação persistente
- Validação de dados offline
- Proteção contra conflitos de merge

## Próximos Passos
1. Setup inicial do projeto React Native
2. Implementação do armazenamento local
3. Desenvolvimento da UI base
4. Sistema de sincronização
5. Testes offline
6. Beta testing no campo 