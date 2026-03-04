# Global Socio-Economic Crisis Dashboard (GSECD) 🚨🌍

[![Python](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![Node/npm](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![License: Add a LICENSE](https://img.shields.io/badge/license-ADD--LICENSE-yellow)](#license--acknowledgements)

**A comprehensive web platform to visualize, analyze, and forecast economic and food security crises worldwide.**

> Quick Start: `npm install && npm run dev` (frontend) and `cd supabase && python -m pip install -r requirements.txt && python app.py` (backend)


---

## Table of Contents 🧭

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture & Diagrams](#architecture--diagrams)
- [Quick Start](#quick-start)
  - [Frontend (Dev)](#frontend-dev)
  - [Backend (Flask API)](#backend-flask-api)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [Data Sources & Models](#data-sources--models)
- [Testing & Validation](#testing--validation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License & Acknowledgements](#license--acknowledgements)

---

## Project Overview ✨

GSECD (Global Socio-Economic Crisis Dashboard) is a Single Page Application (SPA) that aggregates global socio-economic and food-security indicators, visualizes them on interactive maps and charts, and provides ML-powered risk predictions and explainability (SHAP). The app aims to help policymakers, NGOs, and researchers monitor, analyze, and act on emerging crisis risks.

Key outcomes:
- Intuitive **Global Heat Map** for at-a-glance risk monitoring
- **Crisis Analyzer** with probabilistic risk scores and SHAP explanations
- **Latest News** feed (RSS-based) for situational awareness
- Exportable **PDF/CSV** reports and multi-country comparisons

---

## Features ✅

- Interactive map-based visualization (React + react-simple-maps)
- Crisis analysis endpoints (Flask API) using ensemble ML models
- SHAP-based factor explanations for model predictions
- News aggregation via Google News RSS (fallback demo data available)
- PDF and CSV export functionality
- Responsive design, dark mode, and accessible UI

---

## Architecture & Diagrams 🏗️

The project follows a classic presentation → API → analysis pipeline:

- Frontend: React (Vite) — UI, maps, charts, routing
- Backend: Flask — API endpoints, model inference, news aggregation
- Models / Research: Python scripts, pickle models, SHAP explainers
- Data: Local CSV datasets, Supabase DB for storage and auth

For detailed diagrams, see `Diagrams.md` (includes Mermaid diagrams):

- Use Case Diagram
- Activity & User Flow
- Class, Component, and Data Model Diagrams

Quick architecture (Mermaid):

```mermaid
graph TD;
    subgraph Frontend
        UI[User Interface] -->|Input Data| State[React State]
        State -->|JSON Request| API_Client[Axios/Fetch]
    end
    
    subgraph Backend_API
        API_Client -->|POST /api/analyze| Flask[Flask Server]
        Flask -->|Extract Features| Preprocessor[Data Preprocessor]
    end
    
    subgraph AI_Engine
        Preprocessor -->|Feature Vector| Model[ML Model Pickle]
        Model -->|Predict Probability| Probability[Risk Score]
        Model -->|Explain Prediction| SHAP[SHAP Explainer]
    end
    
    Probability -->|Result| Flask
    SHAP -->|Top Factors| Flask
    Flask -->|JSON Response| UI
```

---

## Quick Start ⚡

### Prerequisites
- Node.js (v18+ recommended) and npm
- Python 3.10+ (virtualenv recommended)
- Git

### Frontend (Development)

```bash
# from project root
npm install
npm run dev
# open http://localhost:5173
```

Type check & tests (frontend):

```bash
npx tsc --noEmit
npm run test      # runs vitest
```

### Backend (Flask API)

```powershell
# Windows PowerShell example
# activate venv if present
& .\venv\Scripts\Activate.ps1
cd supabase
python -m pip install -r requirements.txt
python app.py
# Flask will run on http://localhost:3001
```

Endpoints of interest:
- `GET /health` — health & module status (includes `news` status)
- `POST /api/analyze/economic` — economic analysis (JSON input)
- `POST /api/analyze/food` — food analysis (JSON input)
- `GET /api/news/latest` — latest global crisis news

---

## Configuration & Environment Variables 🔧

- Frontend
  - `VITE_API_URL` — base URL for the API (default `http://localhost:3001`)
- Backend/News
  - No API key required for the RSS-based news integration (uses Google News RSS). If you later integrate a 3rd-party provider, add `NEWS_API_KEY` as needed.

Note: The news module may fall back to demo data when RSS fetch fails; check `/health` `news` field and server logs for `News API module not loaded` or related errors.

---

## Data Sources & Models 📚

- Data: `supabase/data` and `data/` contain CSV datasets used for training and display.
- Models: `supabase/models/` contains pickled model artifacts and research notebooks (`model1.ipynb`, `model2.ipynb`).
- Research scripts: `supabase/research/` contains evaluation, explainability, and report generation utilities.

---

## Testing & Validation ✅

- Frontend: `npm run test` (Vitest) and `npx tsc --noEmit` for type checking
- Backend: `supabase/test_api.py` is a simple script to exercise endpoints (run while Flask is active)

---

## Troubleshooting 🛠️

- News returns `status: 'error'` with message `News API module not loaded`:
  - Ensure `feedparser` is installed in the backend venv: `python -m pip install feedparser`
  - Restart the Flask server and check `/health` — `news` should be `loaded`
  - Server logs will print either `✅ Successfully imported news API functions` or a detailed ImportError
- If Google News RSS returns 0 articles often, the RSS feed may be rate-limited or filtered; the system will return demo data in that case.

---

## Diagrams & Reports 📄

- `Diagrams.md` — full collection of Mermaid diagrams (use case, activity flow, class diagram, component architecture, ER diagram)
- `PROJECT_REPORT.md` and `Reports/PROJECT_REPORT.md` — detailed project reports and results

### Diagrams Gallery 🖼️

Below are the main architecture diagrams. For more, open the files directly or view `Diagrams.md` for the raw Mermaid definitions.

**Workflow Overview**

```mermaid
graph TD
    User((User))
    
    subgraph Frontend [Frontend Application]
        UI[React UI Router]
        Dash[Dashboard Page]
        Rep[Reports Page]
        Count[Countries Page]
        
        UI --> Dash
        UI --> Rep
        UI --> Count
    end
    
    User -->|Interacts| UI
    
    subgraph Backend [Backend System]
        API[Flask API Server]
        
        subgraph Core_Modules [Core Modules]
            CA[Crisis Analyzer]
            NA[News Aggregator]
        end
        
        subgraph Data_Layer [Data Layer]
            DB[(Supabase DB)]
            Local[Local Data / Models]
        end
    end
    
    UI -->|HTTP Request| API
    API -->|Invoke| CA
    API -->|Invoke| NA
    
    CA -->|Load| Local
    CA -->|Predict Risk| Risk[Risk Score]
    
    NA -->|Fetch| ExtNews[External News APIs]
    
    API -->|Query| DB
    
    Risk --> API
    ExtNews --> NA
    DB --> API
    
    API -->|JSON Response| UI
```

**Activity Flow**

```mermaid
graph TD
    A["🟢 Start: Open Dashboard"] --> B["View Global Heat Map"]
    B --> C{"User Action"}
    
    C -->|Select Country| D["Show Country Details"]
    D --> E{"Choose Analysis Type"}
    
    E -->|Economic| F["Enter Economic Indicators<br/>GDP, Inflation, Unemployment,<br/>Domestic Credit, etc."]
    E -->|Food Security| F2["Enter Food Indicators<br/>Cereal Yield, Food Imports,<br/>Production Index, etc."]
    E -->|Both| F3["Enter All Indicators"]
    
    F --> G["Validate Input Data"]
    F2 --> G
    F3 --> G
    
    G -->|Invalid| H["Show Error Message"]
    H --> G
    
    G -->|Valid| I["Send HTTP POST to API"]
    
    I --> J["Backend: Process Data"]
    J --> K["Load ML Models"]
    K --> L["Run Predictions"]
    L --> M["Calculate SHAP Values"]
    M --> N["Format JSON Response"]
    
    N --> O["Receive Response"]
    O --> P["Display Risk Gauge"]
    P --> Q["Show Contributing Factors"]
    Q --> R["Display Summary Text"]
    
    R --> S{"User Next Action"}
    
    S -->|Export PDF| T["Generate & Download PDF"]
    S -->|Export CSV| U["Export Data to CSV"]
    S -->|View News| V["Show Crisis News Feed"]
    S -->|Compare| W["Multi-Country Comparison"]
    S -->|Exit| X["🔴 End Session"]
    
    T --> X
    U --> X
    V --> X
    W --> C
    
    style A fill:#90ee90
    style X fill:#ff6b6b
    style J fill:#87ceeb
    style P fill:#ffd700
    style Q fill:#ffd700
```

**Class Diagram**

```mermaid
classDiagram
    class CrisisAnalysisEngine {
        -economic_model: XGBoostClassifier
        -food_model: RandomForestClassifier
        -scalers: Dict[StandardScaler]
        -shap_explainers: Dict[TreeExplainer]
        +analyze_economic_crisis(indicators): AnalysisResult
        +analyze_food_security(indicators): AnalysisResult
        +calculate_shap_values(features): Dict
        +classify_risk(probability): String
        +load_models(path): void
    }
    
    class DataLoader {
        -economic_data: DataFrame
        -food_data: DataFrame
        -cache: Dict
        -last_updated: datetime
        +load_economic_data(): DataFrame
        +load_food_data(): DataFrame
        +merge_datasets(key): DataFrame
        +validate_data(): ValidationReport
        +refresh_cache(ttl): void
        +get_countries(): List
    }
    
    class DataPreprocessor {
        -scaler: StandardScaler
        -imputer: SimpleImputer
        +normalize(X): ndarray
        +impute(X): ndarray
        +handle_outliers(): void
        +validate(X): boolean
    }
    
    class ShapExplainer {
        -explainer: TreeExplainer
        -feature_names: List
        +explain(prediction): Dict
        +get_force_plot(): Plot
        +extract_top_factors(n): List
        +generate_explanation(): String
    }
    
    class NewsAggregator {
        -cache: Dict
        -cache_ttl: int
        +fetch_news(country, type): List
        +parse_rss_feed(url): List
        +cache_results(key, data): void
        +is_cache_valid(key): boolean
        +clear_cache(): void
    }
    
    class ReportGenerator {
        -template_dir: String
        -output_dir: String
        +generate_pdf(data): bytes
        +export_csv(data): bytes
        +export_excel(data): bytes
        +create_summary_report(): String
        +batch_export(countries): List
    }
    
    class AnalysisResult {
        -country: String
        -probability: float
        -classification: String
        -top_indicators: List
        -confidence: float
        -created_at: datetime
    }
    
    class ContributingFactor {
        -name: String
        -value: float
        -shap_value: float
        -direction: String
        -impact_percentage: float
    }
    
    CrisisAnalysisEngine --> DataPreprocessor
    CrisisAnalysisEngine --> ShapExplainer
    CrisisAnalysisEngine --> AnalysisResult
    AnalysisResult --> ContributingFactor
    DataLoader --> DataPreprocessor
    NewsAggregator --> AnalysisResult
    ReportGenerator --> AnalysisResult
```

**Data Flow**

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Flask API
    participant Model as ML Service
    participant Data as Data Layer

    User->>Frontend: Selects Country & Indicators
    Frontend->>Frontend: Validates Input
    Frontend->>API: POST /api/analyze/economic (JSON)
    API->>Model: analyze_economic_crisis(data)
    Model->>Data: Load Economic Model (Pickle)
    Data-->>Model: Model Object
    Model->>Model: Preprocess & Predict Prob.
    Model->>Model: Calculate SHAP Values
    Model-->>API: Result {risk: "High", prob: 85%}
    API-->>Frontend: JSON Response
    Frontend->>User: Display Risk Score & Charts
```

**Use Case Diagram**

```mermaid
graph LR
    subgraph Dashboard["Dashboard/Frontend"]
        USER["👤 User"]
    end

    subgraph Analysis["Analysis Use Cases"]
        GlobalMap["🗺️ View Global Heat Map"]
        EconAnalysis["📊 Analyze Economic Crisis"]
        FoodAnalysis["🍚 Analyze Food Security"]
        ViewFactors["🔍 View SHAP Factors"]
    end

    subgraph Reporting["Reporting & Export"]
        PDF["📄 Generate PDF Report"]
        CSV["📊 Export CSV Data"]
        Excel["📈 Export Excel Data"]
        Share["🔗 Share Results"]
    end

    subgraph Admin["Admin/Developer"]
        API["🔌 Access REST API"]
        Monitor["📡 Monitor System"]
        UpdateModels["🤖 Update ML Models"]
    end

    USER --> GlobalMap
    USER --> EconAnalysis
    USER --> FoodAnalysis
    USER --> ViewFactors
    USER --> PDF
    USER --> CSV
    USER --> Excel
    USER --> Share
    USER --> API

    API --> UpdateModels
    UpdateModels --> Monitor

    style USER fill:#bbdefb
    style GlobalMap fill:#c8e6c9
    style EconAnalysis fill:#c8e6c9
    style FoodAnalysis fill:#c8e6c9
    style ViewFactors fill:#ffe0b2
    style PDF fill:#f8bbd0
    style CSV fill:#f8bbd0
    style API fill:#d1c4e9
```

---

## Contributing 🤝

We welcome contributions. Suggested workflow:

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Implement and add tests
4. Open a pull request with a clear description

Please follow the repository coding style and add unit tests for new functionality.

---

## License & Acknowledgements 🧾

This project does not include a License file yet. If you want to make this open source, consider adding an `MIT` or `Apache-2.0` LICENSE file.

Thanks to the research team and contributors for data collection and model design.

---


