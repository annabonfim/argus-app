<p align="center">
  <img src="assets/images/logo-horizontal.png" alt="Argus" width="420" />
</p>

<p align="center"><i>O vigia de cem olhos — sistema operacional de combate a incêndios florestais.</i></p>

<p align="center">
  <b>Global Solution 2026/1 · FIAP</b> · 2º ano de Análise e Desenvolvimento de Sistemas<br/>
  Disciplina: <b>Mobile Application Development</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo&logoColor=white" alt="Expo SDK 56" />
  <img src="https://img.shields.io/badge/React%20Native-0.85-61DAFB?logo=react&logoColor=black" alt="React Native 0.85" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Expo%20Router-tipado-1B1F23?logo=expo&logoColor=white" alt="Expo Router" />
  <img src="https://img.shields.io/badge/Axios-API%20.NET-5A29E4?logo=axios&logoColor=white" alt="Axios" />
</p>

---

# Argus Mobile 🔥

App **React Native + Expo** que é a **ferramenta de campo do brigadista** dentro do
ecossistema Argus — uma solução de ponta a ponta que conecta a **economia espacial**
(dados de satélite) ao combate a **incêndios florestais** aqui na Terra.

O Argus é composto por **três camadas**, cada uma sendo um domínio próprio (e uma
entrega da GS): a **detecção** (Java, lê o satélite e gera alertas), as **operações**
(.NET, coordena a resposta) e o **campo** (este app, onde o brigadista age).

## 🛰️ A solução (Global Solution 2026/1)

> *"O espaço é a nova fronteira."* — Satélites monitoram o clima e evitam desastres.
> O Argus usa os dados abertos de satélite da **NASA FIRMS** para detectar focos de
> calor, priorizá-los por risco e coordenar a resposta de brigadas florestais.

| Camada | Stack | Papel |
|---|---|---|
| 🛰️ **Detecção** | Java + Spring + IA | Ingere dados da **NASA FIRMS**, filtra os focos de calor, calcula score de risco e gera **alertas** com recomendação operacional. |
| ⚙️ **Operações** | .NET 9 + Oracle | Coordena a resposta humana: brigadas, brigadistas, recursos, ocorrências e registros de campo. Expõe a **API REST** e faz **proxy** dos alertas/focos do Java. |
| 📱 **Campo** *(este repo)* | React Native + Expo | O brigadista em campo: tria alertas, promove ocorrências, atualiza status, registra ações com GPS e gerencia a equipe. |

**ODS atendidos:** 13 (Ação climática), 15 (Vida terrestre), 11 (Cidades sustentáveis), 9 (Inovação).

## 🎯 Para o avaliador — em 4 passos

| Passo | O que fazer |
|---|---|
| 1️⃣ | Abrir o app (APK no Firebase App Distribution ou rodar localmente — ver [Como executar](#-como-executar)) |
| 2️⃣ | Logar como **`admin@argus.com` / `Admin@123`** |
| 3️⃣ | **Alertas** → filtrar por **Crítico** → abrir um alerta → **"+ Gerar ocorrência"** → preencher → criar |
| 4️⃣ | **Mapa** → ver os focos do satélite, dar zoom, buscar por região (ex.: "Pantanal") |

## 🏗️ Arquitetura

```mermaid
flowchart LR
    SAT["🛰️ NASA FIRMS<br/>satélite"]
    JAVA["Detecção<br/>Java + Spring + IA<br/>gera focos + alertas por risco"]
    NET["Operações<br/>.NET 9 + Oracle<br/>coordena a resposta · proxy do Java"]
    APP["📱 Mobile · este repo<br/>React Native + Expo<br/>ferramenta do brigadista"]

    SAT -->|focos de calor| JAVA
    JAVA -->|alertas + focos| NET
    NET <-->|REST + JWT| APP

    style APP fill:#142821,stroke:#C75B2C,stroke-width:2px,color:#F8F8ED
    style NET fill:#FBFAF1,stroke:#6A7044,color:#142821
    style JAVA fill:#FBFAF1,stroke:#6A7044,color:#142821
    style SAT fill:#FBFAF1,stroke:#6A7044,color:#142821
```

O app mobile tem **uma única origem de dados (a API .NET)**. Quem conversa com o Java é
a .NET, que repassa focos e alertas. Isso mantém o cliente simples e desacoplado da
camada de inteligência.

## 🔄 Do satélite à ação (ciclo de vida)

```mermaid
flowchart TD
    FOCO["🔥 Foco de calor<br/>detectado pelo satélite"]
    ALERTA["⚠️ Alerta<br/>Java gera, automático<br/>nível + score + recomendação"]
    TRIAGEM{"Coordenador<br/>avalia o alerta"}
    IGNORA["🚫 Não vira ocorrência<br/>(queimada legal, risco baixo…)"]
    OCORR["📋 Ocorrência<br/>resposta operacional<br/>brigada + brigadista"]
    REG["📝 Registros de campo<br/>o brigadista documenta a ação"]
    FIM["✅ Ocorrência encerrada"]

    FOCO --> ALERTA --> TRIAGEM
    TRIAGEM -->|"promove · + Gerar ocorrência"| OCORR
    TRIAGEM -->|"descarta"| IGNORA
    OCORR --> REG --> FIM

    style ALERTA fill:#FBFAF1,stroke:#C75B2C,color:#142821
    style TRIAGEM fill:#FBFAF1,stroke:#6A7044,color:#142821
    style OCORR fill:#142821,stroke:#C75B2C,stroke-width:2px,color:#F8F8ED
    style FOCO fill:#FBFAF1,stroke:#6A7044,color:#142821
    style REG fill:#FBFAF1,stroke:#6A7044,color:#142821
    style FIM fill:#FBFAF1,stroke:#5C8C3A,color:#142821
    style IGNORA fill:#FBFAF1,stroke:#C0392B,color:#142821
```

**Detecção é automática, resposta é humana:** o Java alerta, mas é o coordenador que
decide agir. **Nem todo alerta vira ocorrência** — só quando vira, a brigada responde e
documenta tudo em registros de campo até o encerramento.

## 🧠 Decisões de design

| Decisão | Por quê |
|---|---|
| **App fala só com a .NET** (não chama o Java direto) | Uma origem só, cliente desacoplado; a .NET é o *backend-for-frontend* que agrega as duas APIs. |
| **Alerta ≠ Ocorrência** | Detecção é **automática** (Java alerta); resposta é **humana** — o coordenador *promove* o alerta a ocorrência. Nem todo alerta vira ação (queimada legal, risco baixo, falso positivo). |
| **Alertas por *polling* (15s)** | Alternativa pragmática ao push/FCM: o app atualiza em segundo plano enquanto a tela está visível e dá um **toast** quando chega um alerta crítico/alto. Pausa em background pra não gastar bateria/cota. |
| **Brigada → Brigadista em cascata** | Integridade: o responsável tem que pertencer à brigada designada. O dropdown de brigadista só mostra membros da brigada escolhida. |
| **Autorização por papel** | O brigadista vê/atualiza; criar/excluir e promover são de Admin/Coordenador — escondido no app **e** validado por `403` no backend. |
| **Google Maps key via `.env`** | Mantém a chave **fora do repositório** (`app.config.js` injeta no build). |

## 👥 Perfis de usuário

| Perfil | Acesso |
|---|---|
| **Admin** | Tudo: gerencia usuários, brigadas, brigadistas, recursos; cria/exclui ocorrências; promove alertas. |
| **Coordenador** | Coordena a operação: cria ocorrências, promove alertas, gerencia equipe. |
| **Brigadista** | Em campo: vê alertas/ocorrências, atualiza status e registra ações nas ocorrências sob sua responsabilidade. |

## 📱 Telas (17 no total)

**Públicas (autenticação)**
- **Login** — autenticação JWT real
- **Cadastro** — signup com código de convite (`ARGUS-2026`)
- **Sobre o app** — versão, build e hash do commit *(acessível pelo login)*

**Início e satélite**
- **Início** — indicadores (alertas críticos, ocorrências abertas, brigadistas ativos) + atalhos
- **Mapa de focos** — focos do FIRMS no mapa, coloridos por intensidade (FRP), com zoom e busca por região
- **Alertas** + **Detalhe do alerta** — lista com filtro por criticidade; detalhe com recomendação e botão "Gerar ocorrência"

**Operações (CRUD)**
- **Ocorrências** + **Detalhe** + **Formulário** — CRUD completo
- **Formulário de registro de campo** — registros aninhados na ocorrência
- **Brigadas** + **Detalhe** + **Formulário** — gestão de equipes
- **Formulário de brigadista** — cadastro de membros
- **Recursos** — veículos e equipamentos

**Conta**
- **Perfil** — edição self-service dos próprios dados + logout

## 🔑 Credenciais de teste

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | `admin@argus.com` | `Admin@123` |
| Brigadista | `brig@argus.com` | `Brig@123` |

Código de convite para cadastro: **`ARGUS-2026`**

## 🛠️ Tecnologias

| Categoria | Tecnologia |
|---|---|
| Framework | **Expo SDK 56** · React Native 0.85 · React 19 |
| Linguagem | **TypeScript** (strict) |
| Navegação | **Expo Router** (file-based: tabs + stack + modais, rotas tipadas) |
| HTTP | **Axios** (interceptor de Bearer + tratamento de 401) |
| Auth/sessão | **expo-secure-store** (persistência do token JWT) |
| Mapa | **react-native-maps** (Google Maps) + geocoding via Nominatim |
| Localização | **expo-location** (GPS) |
| UI | **@expo/vector-icons** (Ionicons) · fontes **Oswald + Inter** |
| Datas / feedback | **date-fns** · **react-native-toast-message** |

## ✅ CRUD via API (.NET)

Operações de **Create, Read, Update e Delete** consumindo a API .NET com Axios — os
dados são sempre manipulados via API, nunca apenas no dispositivo.

| Entidade | C | R | U | D | Quem |
|---|:-:|:-:|:-:|:-:|---|
| **Ocorrências** | ✅ | ✅ | ✅ | ✅ | Coordenação cria/exclui; brigadista atualiza |
| **Registros de campo** | ✅ | ✅ | — | — | Brigadista (aninhado na ocorrência) |
| **Brigadas** | ✅ | ✅ | ✅ | ✅ | Admin/Coordenador |
| **Brigadistas** | ✅ | ✅ | ✅ | — | Admin/Coordenador |
| **Perfil** | — | ✅ | ✅ | — | O próprio usuário |
| **Alertas / Focos** | — | ✅ | — | — | Leitura (vindos do Java) + promoção a ocorrência |
| **Recursos** | — | ✅ | — | — | Leitura |

Feedback visual em tudo: **loaders**, **toasts** de sucesso/erro e mensagens
amigáveis extraídas do `ProblemDetails` do backend.

## 🚀 Como executar

### Pré-requisitos
- Node 20+ e `npx`
- A **API .NET** (Argus Operations) rodando — local ou na nuvem
- Um **development build** (o app **não roda no Expo Go**, por causa do `react-native-maps`)
- No Android, uma **Google Maps API key** (Maps SDK for Android)

### Passos
```bash
npm install

# 1. Google Maps key — copie o modelo e preencha:
cp .env.example .env
# edite .env:  GOOGLE_MAPS_API_KEY=sua_chave_aqui

# 2. URL da API (opcional):
#    iOS sim → localhost:5215 · Android emu → 10.0.2.2:5215 (padrão).
#    Para device físico / nuvem, defina:
export EXPO_PUBLIC_API_URL="https://sua-api-na-nuvem"

# 3. Dev build:
npx expo run:android   # ou run:ios
```

## 📂 Estrutura do projeto

```
src/
├── api/            # cliente axios + um serviço por recurso
│   ├── client.ts        # baseURL + interceptors (Bearer, 401→logout)
│   ├── auth.ts          # login, signup, perfil
│   ├── alertas.ts       # listar/obter alerta + promover a ocorrência
│   ├── ocorrencias.ts   # CRUD de ocorrências
│   ├── registros.ts     # registros de campo
│   ├── brigadas.ts · brigadistas.ts · recursos.ts · focos.ts
│   └── errors.ts        # getErrorMessage (ProblemDetails → texto amigável)
├── app/            # rotas (Expo Router)
│   ├── (auth)/          # login, signup
│   ├── (protected)/     # tabs: início, alertas, ocorrências, perfil, mapa…
│   ├── *-detalhe.tsx    # telas de detalhe
│   ├── *-form.tsx       # formulários de CRUD
│   └── sobre.tsx
├── components/     # UI reutilizável (Button, TextField, Select, Badge, Fab…)
├── context/        # AuthContext — estado global de sessão
├── hooks/          # useResourceList — loading/erro/refresh de listas
├── lib/            # formatação, máscaras, geolocalização, mapas, labels
├── theme/          # paleta de cores, espaçamento, tipografia
└── types/          # tipos do domínio (espelham os DTOs do backend)
```

Separação de responsabilidades: **telas** (`app/`) consomem **serviços** (`api/`); o
estado de sessão vive no **Context**; listas reaproveitam o hook `useResourceList`; e
a UI compartilhada fica em `components/`.

## 🔗 Repositórios relacionados

- ⚙️ **Operações — .NET 9 + Oracle:** [annabonfim/argus-operations-dotnet](https://github.com/annabonfim/argus-operations-dotnet)
- 🛰️ **Detecção — Java + Spring + IA:** [alanerochaa/argus-intelligence-api](https://github.com/alanerochaa/argus-intelligence-api)
  - API publicada: [argus-intelligence-api (Azure)](https://argus-intelligence-api-abe6g6facyh4fgfm.eastus-01.azurewebsites.net)

## 📹 Vídeo demonstração

🎥 **[Assista no YouTube](https://youtu.be/SEU_LINK_AQUI)** <!-- preencher com o link do vídeo -->

## 👩‍💻 Integrantes

| Nome | RM | Responsabilidades |
|---|---|---|
| Anna Beatriz de Araujo Bonfim | 559561 | Mobile (este app) · .NET (Operations API) · Compliance/TOGAF |
| Alane Rocha da Silva | 561052 | Java Advanced (Intelligence API + RabbitMQ) · PL/SQL · Compliance |
| Maria Eduarda Araujo Penas | 560944 | DevOps & Cloud (Azure Pipelines) · Disruptive Architectures (IoT) |
