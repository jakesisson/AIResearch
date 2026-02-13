# Frontend - Motor de Vendas Conversacional

Interface do usuário para o chatbot de IA e-commerce construído com React, TypeScript, Vite e Tailwind CSS.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool rápido e moderno
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes de interface modernos
- **Axios** - Cliente HTTP para requisições
- **Lucide React** - Ícones SVG otimizados

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🔧 Configuração

### Variáveis de Ambiente

Copie `.env.example` para `.env.local` e configure:

```bash
# API Configuration
VITE_API_URL=http://localhost:8000

# Environment
VITE_ENV=development

# App Configuration
VITE_APP_NAME=Motor de Vendas Conversacional
VITE_APP_VERSION=1.0.0
```

### Desenvolvimento

```bash
# Executar em modo desenvolvimento
npm run dev

# Executar com host específico
npm run dev -- --host 0.0.0.0

# Executar em porta específica
npm run dev -- --port 3000
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes shadcn/ui
│   └── layout/         # Componentes de layout
├── hooks/              # Hooks customizados
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
├── types/              # Tipos TypeScript
├── utils/              # Utilitários
└── lib/                # Configurações e helpers
```

## 🎨 Design System

O projeto utiliza **shadcn/ui** com **Tailwind CSS** para um design consistente:

- **Tema**: Suporte a modo claro/escuro
- **Componentes**: Totalmente customizáveis
- **Responsivo**: Mobile-first design
- **Acessibilidade**: Padrões ARIA implementados

## 📱 Features Implementadas

- ✅ **Interface moderna** com Tailwind CSS
- ✅ **Configuração shadcn/ui** pronta
- ✅ **Estrutura de pastas** organizada
- ✅ **Serviços de API** configurados
- ✅ **Hooks customizados** para chat
- ✅ **TypeScript** completo
- ✅ **Responsive design** mobile-first

## 🔄 Próximas Implementações

- 🔄 **Interface do chatbot** interativa
- 🔄 **Catálogo de produtos** com busca
- 🔄 **Carrinho de compras** funcional
- 🔄 **Autenticação** de usuários
- 🔄 **Histórico de conversas**
- 🔄 **Temas personalizados**

## 📊 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento

# Build
npm run build            # Build de produção
npm run preview          # Preview do build

# Qualidade
npm run lint             # Executar linting
npm run type-check       # Verificar tipos TypeScript
```

## 🌐 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Outras Opções

- **Netlify**: Deploy automático via GitHub
- **GitHub Pages**: Para sites estáticos
- **Docker**: Containerização para deploy

## 🤝 Desenvolvimento

### Adicionando Componentes shadcn/ui

```bash
# Adicionar componente (quando disponível)
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
```

### Estrutura de Commits

```bash
# Exemplos de commits
feat: add chat interface component
fix: resolve api connection issue
style: update button styling
docs: update README with deployment info
```

## 📋 Checklist de Desenvolvimento

- ✅ Configuração inicial do projeto
- ✅ Estrutura de pastas
- ✅ Configuração Tailwind CSS
- ✅ Configuração shadcn/ui
- ✅ Serviços de API
- ✅ Hooks customizados
- ✅ Interface base
- ⏳ Componentes do chatbot
- ⏳ Integração com backend
- ⏳ Testes automatizados

## 📄 Licença

Este projeto foi desenvolvido como portfólio e demonstração técnica.
