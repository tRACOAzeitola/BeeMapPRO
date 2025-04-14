# Docker Setup for BeeMap Pro

Este diretório contém a configuração Docker para executar a plataforma BeeMap Pro. A configuração inclui:

- Aplicação principal Node.js (API + frontend)
- Serviços Python para análise de dados e IA
- Base de dados PostgreSQL
- Interface pgAdmin para gestão da base de dados

## Requisitos

- Docker
- Docker Compose

## Instruções para Execução

### 1. Construir e Iniciar os Serviços

Da raiz do projeto, execute:

```bash
docker-compose -f docker/docker-compose.yml up -d
```

Este comando iniciará todos os serviços em modo desvinculado (background).

### 2. Verificar os Serviços

```bash
docker-compose -f docker/docker-compose.yml ps
```

### 3. Aplicar Migrações da Base de Dados

Após os contentores estarem em execução:

```bash
docker-compose -f docker/docker-compose.yml exec app npm run db:push
```

### 4. Aceder aos Serviços

- **Aplicação Web:** http://localhost:5000
- **pgAdmin (gestão da BD):** http://localhost:5050
  - Email: admin@beemap.pro
  - Password: admin

### 5. Parar os Serviços

```bash
docker-compose -f docker/docker-compose.yml down
```

Para remover também os volumes (dados da BD):

```bash
docker-compose -f docker/docker-compose.yml down -v
```

## Configuração dos Serviços

### Variáveis de Ambiente

Para ambiente de desenvolvimento, altere as variáveis no ficheiro `docker-compose.yml`. 
Para produção, recomenda-se usar segredos ou variáveis de ambiente do sistema de orquestração.

### Persistência de Dados

Os dados da base de dados PostgreSQL são armazenados num volume Docker para persistência.

## Desenvolvimento com Docker

Para desenvolvimento, monte volumes para ver as alterações de código em tempo real:

```bash
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up
``` 