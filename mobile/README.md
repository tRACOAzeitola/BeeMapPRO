# BeeMap Mobile

Aplicação móvel para gestão simplificada de apiários no campo.

## Pré-requisitos

1. Node.js 18 ou superior
2. JDK 11 ou superior
3. Android Studio
4. Android SDK Platform 33 (Android 13)
5. Android SDK Build-Tools 33.0.0
6. Um dispositivo Android ou emulador

## Configuração do Ambiente

### 1. Android Studio e Android SDK

1. Baixe e instale o [Android Studio](https://developer.android.com/studio)
2. Durante a instalação, certifique-se de que os seguintes componentes estão selecionados:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
   - Performance (Intel ® HAXM)

### 2. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu ~/.bashrc ou ~/.zshrc:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 3. Configuração do Dispositivo Android

1. Ative o "Modo Desenvolvedor" no seu dispositivo Android:
   - Vá para Configurações > Sobre o telefone
   - Toque 7 vezes em "Número da versão"
   - Volte para Configurações > Sistema > Opções do desenvolvedor
   - Ative "Depuração USB"

2. Conecte seu dispositivo via USB ao computador

3. Execute `adb devices` para verificar se o dispositivo está conectado

## Instalação

1. Clone o repositório
2. Execute o script de setup:
```bash
cd mobile
chmod +x setup.sh
./setup.sh
```

## Executando o App

1. Em um terminal, inicie o Metro Bundler:
```bash
npm start
```

2. Em outro terminal, execute o app no Android:
```bash
npm run android
```

## Solução de Problemas

### Erro de SDK não encontrado
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Erro de dispositivo não encontrado
1. Verifique se o dispositivo está conectado:
```bash
adb devices
```
2. Se não aparecer nada, tente:
```bash
adb kill-server
adb start-server
```

### Erro de build
1. Limpe o cache do Metro:
```bash
npm start -- --reset-cache
```

### Erro de dependências
1. Remova node_modules e reinstale:
```bash
rm -rf node_modules
npm install
```

## Desenvolvimento

### Estrutura do Projeto
```
mobile/
├── src/
│   ├── components/    # Componentes reutilizáveis
│   ├── screens/       # Telas da aplicação
│   ├── services/      # Serviços (API, etc)
│   ├── database/      # Configuração do banco local
│   └── types/         # Tipos TypeScript
├── android/          # Configuração Android
└── ios/             # Configuração iOS
```

### Comandos Úteis

- `npm start`: Inicia o Metro Bundler
- `npm run android`: Executa no Android
- `npm run lint`: Verifica problemas de código
- `npm run test`: Executa testes
- `npm run type-check`: Verifica tipos TypeScript 