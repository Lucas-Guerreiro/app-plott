# 🗺️ Plott - Mapa de Locais Visitados

**Plott** é um aplicativo web interativo e responsivo ("passaporte visual" de viagens) que permite aos usuários registrar, visualizar e gerenciar os lugares do mundo que já visitaram ou sonham em conhecer, sobre um mapa-múndi interativo.

---

## ✨ Funcionalidades Principais

1. **Mapa Interativo Mundial**
   - Mapa-múndi fluido com zoom, arrastar (pan) e navegação.
   - Marcadores personalizados em SVG (`L.divIcon`) diferenciando **Visitados** (verde esmeralda com check) e **Não visitados / Quero ir** (índigo/âmbar).
   - Tooltips em hover e Popups detalhados com ações rápidas (alternar status, editar, excluir).

2. **Adicionar Locais em 3 Passos**
   - **País**: Seletor com mais de 240 países com bandeiras, códigos ISO e coordenadas automáticas.
   - **Cidade**: Autocomplete inteligente conectado à API do OpenStreetMap Nominatim sugerindo cidades reais.
   - **Ponto Específico**: Clique direto no mapa com mira e geocodificação reversa ou preenchimento manual de coordenadas (praias, monumentos, restaurantes, etc.).

3. **Status Visual & Estatísticas de Viagem**
   - Contador de resumo: "X países visitados de 195 (Y% do planeta)".
   - Filtros rápidos: *Todos* / *Visitados* / *Não visitados*.
   - Filtros por tipo: *Todos* / *Países* / *Cidades* / *Pontos*.
   - Modal de Passaporte com análise por continentes, galeria de bandeiras carimbadas e compartilhamento.

4. **Painel de Locais Registrados**
   - **Desktop**: Barra lateral esquerda elegante com busca instantânea, ordenação e cards com animação.
   - **Mobile**: *Bottom sheet* responsivo com alça de arrasto sobre o mapa.
   - Clicar em qualquer item faz o mapa viajar suavemente (*flyTo*) até o local.

5. **Edição e Exclusão Seguras**
   - Modal de edição completo (nome, tipo, país, status, notas e coordenadas).
   - Modal de confirmação para exclusão de registros.
   - Sistema de notificações flutuantes (*Toasts*) com feedback imediato.

6. **PWA & Modo Offline**
   - Suporte PWA com `manifest.webmanifest` e Service Worker para instalação como aplicativo e cache offline.
   - Tema Claro e Escuro (*Dark/Light mode*) com persistência automática.

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### 1. Instalar as dependências
```bash
npm install
```

### 2. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Abra seu navegador no endereço exibido no terminal (geralmente `http://localhost:3000` ou `http://localhost:5173`).

### 3. Gerar a versão de produção
```bash
npm run build
```

---

## 🗄️ Modelo de Dados

O modelo de dados foi estruturado com TypeScript de forma desacoplada para facilitar migração futura para Firebase/Firestore ou Supabase:

```typescript
export interface LocationItem {
  id: string;
  type: 'country' | 'city' | 'point';
  name: string;
  countryCode: string; // Ex: "BR", "FR", "JP", "US"
  coordinates: {
    lat: number;
    lng: number;
  };
  visited: boolean;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
  
  // Campos opcionais previstos
  visitDate?: string;
  notes?: string;
  photoUrl?: string;
}
```

---

## 🛠️ Tecnologias Utilizadas

- **React 18** + **TypeScript**
- **Vite**
- **Tailwind CSS v3**
- **React-Leaflet** + **Leaflet**
- **Lucide Icons**
- **Canvas-Confetti**
- **OpenStreetMap & CartoDB**

---

## ☁️ Como Conectar ao Firebase (Nuvem em Tempo Real)

O projeto já vem com a integração do **Firebase Authentication + Cloud Firestore** 100% pronta! Para ativar a sincronização na nuvem:

1. Acesse o [Firebase Console](https://console.firebase.google.com/) e crie um projeto gratuito.
2. No menu lateral:
   - Ative o **Authentication** (habilite os provedores *E-mail/senha* e *Google*).
   - Ative o **Cloud Firestore** em modo de produção/teste.
3. Vá em **Configurações do Projeto** (ícone de engrenagem) ➔ **Adicionar app Web** e copie as chaves de configuração.
4. Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como base):
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=seu-projeto
   VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
   ```
5. Reinicie o servidor (`npm run dev`). O app detectará as credenciais automaticamente e passará a gravar os usuários e locais direto no Firebase!
