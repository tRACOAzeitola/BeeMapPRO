#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando setup do BeeMap Mobile...${NC}"

# Verificar Node.js
echo -e "\n${YELLOW}Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js não encontrado. Por favor, instale o Node.js versão 18 ou superior.${NC}"
    exit 1
fi

# Verificar Java Development Kit (JDK)
echo -e "\n${YELLOW}Verificando JDK...${NC}"
if ! command -v javac &> /dev/null; then
    echo -e "${RED}JDK não encontrado. Por favor, instale o JDK 11 ou superior.${NC}"
    exit 1
fi

# Verificar Android Studio e variáveis de ambiente
echo -e "\n${YELLOW}Verificando variáveis de ambiente do Android...${NC}"
if [ -z "$ANDROID_HOME" ]; then
    echo -e "${RED}ANDROID_HOME não está configurado. Por favor, configure as variáveis de ambiente do Android.${NC}"
    echo "Adicione ao seu ~/.bashrc ou ~/.zshrc:"
    echo "export ANDROID_HOME=\$HOME/Library/Android/sdk"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin"
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    exit 1
fi

# Instalar dependências do projeto
echo -e "\n${YELLOW}Instalando dependências do projeto...${NC}"
npm install

# Instalar dependências específicas do Android
echo -e "\n${YELLOW}Configurando Android...${NC}"
cd android
./gradlew clean
cd ..

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}Criando arquivo .env...${NC}"
    cp .env.example .env
fi

echo -e "\n${GREEN}Setup concluído!${NC}"
echo -e "\nPara executar o app no Android:"
echo -e "1. Conecte um dispositivo Android via USB com depuração USB ativada"
echo -e "2. Execute: ${YELLOW}npm run android${NC}"
echo -e "\nPara verificar dispositivos conectados:"
echo -e "${YELLOW}adb devices${NC}" 