# Frontend HackMeridian  

# 🛥️ Capys Club - Frontend

**Uma plataforma exclusiva para proprietários de iates com autenticação blockchain e gestão de comunidades VIP.**

Este é o frontend da aplicação Capys Club, desenvolvido com Next.js 14, TypeScript e Tailwind CSS, oferecendo uma experiência premium para membros exclusivos.

---

## 🚀 Tecnologias Principais

- **Next.js 14** – Framework React com App Router
- **TypeScript** – Tipagem estática para JavaScript
- **Tailwind CSS** – Framework CSS utility-first
- **Stellar SDK** – Integração com blockchain Stellar
- **Soroban** – Smart contracts na rede Stellar
- **Freighter Wallet** – Carteira Stellar para autenticação

---

## 🏗️ Arquitetura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── admin/             # Painel administrativo
│   ├── cadastro/          # Página de registro
│   ├── dashboard/         # Dashboard do usuário
│   ├── login/             # Página de login
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de interface
│   ├── forms/            # Formulários
│   ├── Header.tsx        # Cabeçalho da aplicação
│   ├── ConnectButton.tsx # Botão de conexão de carteira
│   └── WalletModal.tsx   # Modal de seleção de carteira
├── contexts/             # Contextos React
│   ├── AuthContext.tsx   # Contexto de autenticação
│   ├── CommunityContext.tsx
│   └── ContentContext.tsx
├── hooks/                # Custom hooks
│   ├── useAuth.ts        # Hook de autenticação
│   ├── useWallet.ts      # Hook de carteira
│   └── useCommunity.ts   # Hook de comunidade
├── lib/                  # Bibliotecas e utilitários
│   ├── stellar.ts        # Configuração Stellar
│   ├── soroban.ts        # Configuração Soroban
│   ├── api.ts            # Cliente API
│   └── utils.ts          # Funções utilitárias
├── services/             # Serviços de API
│   └── clubService.ts    # Serviço de clubes
└── types/                # Definições de tipos
    ├── community.ts
    ├── content.ts
    └── freighter.d.ts
```

---

## ✨ Funcionalidades Principais

### 🔐 **Autenticação Blockchain**
- Conexão com carteiras Stellar (Freighter)
- Autenticação baseada em NFTs de membership
- Token gating para acesso exclusivo
- Modo demo para testes

### 👥 **Gestão de Comunidades**
- Dashboard personalizado para membros
- Sistema de clubes e comunidades
- Badges de conquista (NFTs ERC-1155)
- Conteúdo exclusivo para membros verificados

### 🛠️ **Painel Administrativo**
- Gestão de usuários e membros
- Distribuição de recompensas e badges
- Analytics e métricas da comunidade
- Controle de acesso e permissões

### 🎨 **Design Premium**
- Interface moderna com tema dourado
- Animações e efeitos visuais sofisticados
- Design responsivo para todos os dispositivos
- Experiência de usuário otimizada

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Carteira Freighter instalada no navegador

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd Frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações

# Execute em modo de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Scripts Disponíveis

```bash
npm run dev      # Executa em modo de desenvolvimento
npm run build    # Gera build de produção
npm run start    # Executa build de produção
npm run lint     # Executa linter ESLint
```

---

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` baseado no `.env.example`:

```env
# Configurações da rede Stellar
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org

# Configurações do Soroban
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Configurações da API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Configuração do Tailwind

O projeto utiliza um design system customizado com cores premium:

```javascript
// tailwind.config.js
colors: {
  'premium-dark': '#0f172a',
  'premium-gold': '#d4af37',
  'premium-gold-light': '#ffd700',
  // ... outras cores
}
```

---

## 🔗 Integração Blockchain

### Stellar Network
- **Rede:** Testnet (desenvolvimento) / Mainnet (produção)
- **Carteiras suportadas:** Freighter, Albedo
- **Smart Contracts:** Soroban para lógica de negócio

### NFTs e Tokens
- **Membership NFTs:** ERC-721 para acesso exclusivo
- **Achievement Badges:** ERC-1155 para recompensas
- **Token Gating:** Verificação automática de posse de NFTs

---

## 📱 Páginas e Rotas

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Página inicial | Público |
| `/cadastro` | Registro de novos usuários | Público |
| `/login` | Login de usuários | Público |
| `/dashboard` | Dashboard do usuário | Membros |
| `/admin` | Painel administrativo | Administradores |

---

## 🎨 Design System

### Cores Principais
- **Premium Dark:** `#0f172a` - Fundo principal
- **Premium Gold:** `#d4af37` - Cor de destaque
- **Premium Gold Light:** `#ffd700` - Variação clara

### Tipografia
- **Títulos:** Impact, Bebas Neue, Oswald
- **Corpo:** Poppins, Inter
- **Classes:** `.premium-title`, `.premium-subtitle`

### Componentes
- **Botões:** `.premium-button` com gradientes dourados
- **Cards:** `.premium-card` com efeitos de hover
- **Animações:** Partículas flutuantes e efeitos de brilho

---

## 🧪 Modo Demo

Para facilitar testes e demonstrações, a aplicação oferece um modo demo:

```typescript
// Acesso via URL
/dashboard?demo=true
/admin?demo=true

// Ou via botão "Demo Account" no header
```

---

## 🔒 Segurança

- **Autenticação:** Baseada em assinatura de carteira
- **Autorização:** Token gating com NFTs
- **Validação:** Zod para validação de dados
- **Sanitização:** DOMPurify para conteúdo HTML

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
# Dockerfile incluído no projeto
docker build -t capys-club-frontend .
docker run -p 3000:3000 capys-club-frontend
```

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---


