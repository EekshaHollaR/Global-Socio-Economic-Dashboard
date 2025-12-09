USE CASE DIAGRAM

```mermaid
graph TB
    subgraph Actors["System Actors"]
        PM["👤 Policy Maker / Analyst"]
        NGO["👤 NGO Director"]
        DEV["👤 Developer"]
        SYS["⚙️ System/Backend"]
    end

    subgraph UseCases["Use Cases"]
        UC1["View Global Heat Map"]
        UC2["Analyze Economic Crisis"]
        UC3["Analyze Food Crisis"]
        UC4["View SHAP Factors"]
        UC5["Generate PDF Report"]
        UC6["Export Data"]
        UC7["View News Feed"]
        UC8["Compare Countries"]
        UC9["Access REST API"]
        UC10["Update Models"]
        UC11["Monitor Performance"]
    end

    PM --> UC1
    PM --> UC2
    PM --> UC3
    PM --> UC4
    PM --> UC5
    PM --> UC6
    PM --> UC7

    NGO --> UC1
    NGO --> UC8
    NGO --> UC5
    NGO --> UC6

    DEV --> UC9
    DEV --> UC10
    DEV --> UC11

    SYS --> UC1
    SYS --> UC2
    SYS --> UC3

    style PM fill:#e1f5ff
    style NGO fill:#f3e5f5
    style DEV fill:#e8f5e9
    style SYS fill:#fff3e0
```

USE CASE DIAGRAM DETAILED VERSION:

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
Activity flow diagram

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

Class diagram

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

component architecture diagram

```mermaid
graph TB
    subgraph Frontend["PRESENTATION TIER (Frontend - React)"]
        Dashboard["Dashboard"]
        Analyzer["Crisis Analyzer"]
        Explorer["Data Explorer"]
        Reports["Report Generator"]
        News["News Feed"]
    end

    subgraph APIGateway["API GATEWAY & MIDDLEWARE (Flask)"]
        CORS["CORS Handler"]
        Auth["Auth Middleware"]
        Router["Request Router"]
        Validator["Input Validator"]
        ErrorHandler["Error Handler"]
    end

    subgraph DataService["DATA SERVICE LAYER"]
        DataLoader["DataLoader<br/>- Load CSV<br/>- Load Excel<br/>- Cache mgmt"]
        DataPreproc["DataPreprocessor<br/>- Normalize<br/>- Impute<br/>- Validate"]
        CacheService["CacheService<br/>- In-memory<br/>- Redis<br/>- TTL"]
    end

    subgraph AnalysisService["ANALYSIS SERVICE LAYER"]
        EconModel["Economic Model<br/>XGBoost<br/>Random Forest"]
        FoodModel["Food Model<br/>Random Forest<br/>XGBoost"]
        ShapEngine["SHAP Explainer<br/>- Calculate SHAP<br/>- Top 3 Factors<br/>- Confidence"]
    end

    subgraph IntegrationService["INTEGRATION SERVICE LAYER"]
        NewsAgg["NewsAggregator<br/>- RSS Parser<br/>- Caching<br/>- Filtering"]
        ReportGen["ReportGenerator<br/>- PDF Gen<br/>- CSV Export<br/>- Excel Export"]
    end

    subgraph MLModels["ML MODELS LAYER"]
        EconEnsemble["Economic Ensemble<br/>RF + XGB + LGB<br/>Accuracy: 97.24%<br/>ROC-AUC: 99.53%"]
        FoodEnsemble["Food Ensemble<br/>RF + XGB + LGB<br/>Accuracy: 96.87%<br/>ROC-AUC: 99.70%"]
    end

    subgraph DataTier["DATA TIER (Storage)"]
        CSV["CSV Files<br/>Economic<br/>Food Data"]
        Excel["Excel Files<br/>Historical Data"]
        Models["Pickle Models<br/>Scalers<br/>Mappings"]
        Cache["Cache Layer<br/>In-Memory<br/>Redis"]
    end

    Frontend --> APIGateway
    APIGateway --> DataService
    APIGateway --> AnalysisService
    APIGateway --> IntegrationService
    
    DataService --> DataTier
    AnalysisService --> MLModels
    AnalysisService --> DataService
    IntegrationService --> DataTier
    
    style Frontend fill:#e3f2fd
    style APIGateway fill:#f3e5f5
    style DataService fill:#e8f5e9
    style AnalysisService fill:#fff3e0
    style IntegrationService fill:#fce4ec
    style MLModels fill:#f1f8e9
    style DataTier fill:#eceff1
```

data model

```mermaid

erDiagram
    COUNTRIES ||--o{ OBSERVATIONS : has
    INDICATORS ||--o{ OBSERVATIONS : measured_by
    COUNTRIES ||--o{ CRISIS_PREDICTIONS : "has"
    CRISIS_PREDICTIONS ||--o{ ANALYSIS_RESULTS : "includes"
    COUNTRIES ||--o{ ANALYSIS_RESULTS : "analyzed_in"

    COUNTRIES {
        int country_id PK
        string name UK
        string iso_code
        string region
        string sub_region
        float latitude
        float longitude
        bigint population
        bigint land_area_sq_km
        bigint gdp_usd
        timestamp created_at
        timestamp updated_at
    }

    INDICATORS {
        int indicator_id PK
        string name UK
        string category
        string unit
        string description
        string source
        string data_type
        float min_value
        float max_value
        timestamp created_at
    }

    OBSERVATIONS {
        bigint observation_id PK
        int country_id FK
        int indicator_id FK
        int year
        float value
        boolean is_estimated
        float data_quality_score
        string source_url
        timestamp last_updated
        timestamp created_at
    }

    CRISIS_PREDICTIONS {
        bigint prediction_id PK
        int country_id FK
        int prediction_year
        string crisis_type
        string model_version
        float probability
        string classification
        float confidence_score
        float roc_auc_score
        float precision
        float recall
        timestamp created_at
        timestamp updated_at
    }

    ANALYSIS_RESULTS {
        bigint result_id PK
        int country_id FK
        bigint prediction_id FK
        string analysis_type
        string input_parameters
        string prediction_result
        string shap_values
        string contributing_factors
        string natural_language_summary
        int user_id
        string exported_formats
        timestamp created_at
        timestamp updated_at
    }
```

Data loading diagram


```mermaid
graph TD
    A["🟢 START: Flask App Initialization"] --> B["Load Configuration<br/>Flask Settings<br/>Environment Variables"]
    
    B --> C{"Parallel Initialization"}
    
    C -->|Path 1| D["Load Economic Data<br/>CSV: economic_dataset.csv<br/>~200 countries × 8 indicators"]
    C -->|Path 2| E["Load Food Data<br/>Excel: food_dataset_new.xlsx<br/>~190 countries × 8 indicators"]
    C -->|Path 3| F["Load ML Models<br/>RF, XGB, LGB<br/>Pickle Files"]
    C -->|Path 4| G["Initialize Cache<br/>In-Memory + Redis"]
    
    D --> D1["Parse CSV Columns"]
    D1 --> D2["Handle Missing Values"]
    D2 --> D3["Validate Data Range"]
    D3 --> D4["Cache DataFrame"]
    D4 --> H["✓ Economic Data Ready"]
    
    E --> E1["Parse Excel Sheets"]
    E1 --> E2["Normalize Column Names"]
    E2 --> E3["Handle Missing Values"]
    E3 --> E4["Cache DataFrame"]
    E4 --> I["✓ Food Data Ready"]
    
    F --> F1["Load RF Model"]
    F1 --> F2["Load XGBoost Model"]
    F2 --> F3["Load LightGBM Model"]
    F3 --> F4["Load StandardScaler"]
    F4 --> F5["Initialize SHAP Explainer"]
    F5 --> J["✓ Models Ready"]
    
    G --> G1["Create In-Memory Cache Dict"]
    G1 --> G2["Set TTL Timers"]
    G2 --> G3["Connect Redis Optional"]
    G3 --> K["✓ Cache Ready"]
    
    H --> L["Merge Data<br/>Economic + Food<br/>by Country & Year"]
    I --> L
    J --> M["Validation & Health Check"]
    K --> M
    
    L --> N["Create Combined DataFrame<br/>~4000 merged records"]
    N --> M
    
    M --> O{"All Systems OK?"}
    
    O -->|No| P["❌ Error: Log & Exit"]
    O -->|Yes| Q["✓ Ready to Accept Requests"]
    
    Q --> R["🟢 Flask App Running<br/>Port 3001<br/>Memory: ~500MB"]
    
    style A fill:#90ee90
    style R fill:#90ee90
    style H fill:#87ceeb
    style I fill:#87ceeb
    style J fill:#ffd700
    style K fill:#ffd700
    style P fill:#ff6b6b
    style Q fill:#90ee90
```

complete data analysis diagram


```mermaid
graph TD
    A["👤 User Inputs Data<br/>8 Indicators"]
    A --> B["🔍 Frontend Validation"]
    
    B --> C["📤 HTTP POST Request<br/>/api/analyze/economic"]
    C --> D["✅ Backend Receives"]
    
    D --> E["🔧 Data Preprocessing<br/>- Extract Features<br/>- Normalize Values<br/>- Create Vector"]
    
    E --> F["🤖 Model Inference<br/>- Load ML Model<br/>- Run Prediction<br/>- Get Probability"]
    
    F --> G["📊 Ensemble Voting<br/>RF + XGB + LGB<br/>Weighted Average"]
    
    G --> H["🔍 SHAP Explanation<br/>- Calculate Values<br/>- Top 3 Factors<br/>- Impact Direction"]
    
    H --> I["📋 Format Response<br/>- Probability<br/>- Classification<br/>- Contributing Factors<br/>- Confidence"]
    
    I --> J["📤 HTTP Response<br/>JSON with Results"]
    
    J --> K["🎨 Frontend Receives"]
    K --> L["Update React State"]
    
    L --> M["Display Components<br/>- Risk Gauge<br/>- Factor Table<br/>- Summary Text"]
    
    M --> N["✅ User Sees Results<br/>Understands Risk Drivers"]
    
    N --> O{"User Action"}
    
    O -->|Export PDF| P["📄 Generate PDF Report"]
    O -->|Export CSV| Q["📊 Download CSV Data"]
    O -->|View News| R["📰 Show News Feed"]
    O -->|Compare| S["🔄 Compare Countries"]
    
    P --> T["🟢 Complete"]
    Q --> T
    R --> T
    S --> T
    
    style A fill:#bbdefb
    style B fill:#c8e6c9
    style E fill:#ffe0b2
    style F fill:#f8bbd0
    style H fill:#d1c4e9
    style M fill:#ffd700
    style N fill:#90ee90
    style T fill:#90ee90
```

Data analysis diagram ( detailed)
```mermaid
sequenceDiagram
    participant User as User/Frontend
    participant FrontEnd as React Component
    participant API as Flask API
    participant DataPrep as DataPreprocessor
    participant ML as ML Engine
    participant SHAP as SHAP Explainer
    participant Backend as Response Handler

    User->>FrontEnd: Enters 8 economic indicators
    FrontEnd->>FrontEnd: Validate input data
    FrontEnd->>API: POST /api/analyze/economic (JSON)
    
    API->>API: Parse JSON request
    API->>API: Validate schema & types
    
    API->>DataPrep: Extract features
    DataPrep->>DataPrep: Create feature vector (1×8)
    DataPrep->>DataPrep: Apply StandardScaler
    DataPrep-->>API: Normalized features
    
    API->>ML: Load economic model
    ML->>ML: Run prediction
    ML->>ML: Get probability
    ML-->>API: Crisis probability (0-1)
    
    API->>ML: Run ensemble voting
    ML->>ML: RF prediction
    ML->>ML: XGB prediction
    ML->>ML: LGB prediction
    ML->>ML: Weighted average
    ML-->>API: Ensemble probability + confidence
    
    API->>SHAP: Calculate SHAP values
    SHAP->>SHAP: TreeExplainer.shap_values()
    SHAP->>SHAP: Compute feature importance
    SHAP->>SHAP: Extract top 3 factors
    SHAP-->>API: Top factors with SHAP values
    
    API->>Backend: Format response
    Backend->>Backend: Create JSON
    Backend->>Backend: Handle NumPy types
    Backend->>Backend: Add metadata
    Backend-->>API: JSON response object
    
    API->>User: HTTP 200 + JSON response
    User->>FrontEnd: Receive response
    FrontEnd->>FrontEnd: Parse JSON
    FrontEnd->>FrontEnd: Update React state
    FrontEnd->>FrontEnd: Render components
    FrontEnd->>User: Display risk gauge + factors
    User->>User: Views results
```

system architecture 

```mermaid
graph TB
    subgraph L1["LAYER 1: PRESENTATION"]
        L1A["React Components"]
        L1B["TypeScript Types"]
        L1C["Tailwind CSS"]
        L1D["Recharts + Maps"]
    end

    subgraph L2["LAYER 2: API GATEWAY"]
        L2A["Flask Router"]
        L2B["Request Validation"]
        L2C["CORS Handler"]
        L2D["Error Handler"]
    end

    subgraph L3["LAYER 3: BUSINESS LOGIC"]
        L3A["Crisis Analysis Service"]
        L3B["Data Service"]
        L3C["Report Service"]
        L3D["News Service"]
    end

    subgraph L4["LAYER 4: ML & PROCESSING"]
        L4A["XGBoost Model"]
        L4B["Random Forest Model"]
        L4C["LightGBM Model"]
        L4D["SHAP Explainer"]
    end

    subgraph L5["LAYER 5: DATA ACCESS"]
        L5A["CSV Loader"]
        L5B["Excel Loader"]
        L5C["Cache Manager"]
        L5D["Data Validator"]
    end

    subgraph L6["LAYER 6: STORAGE"]
        L6A["CSV Files"]
        L6B["Excel Files"]
        L6C["Pickle Models"]
        L6D["In-Memory Cache"]
        L6E["Redis Cache"]
        L6F["PostgreSQL DB"]
    end

    L1 --> L2
    L2 --> L3
    L3 --> L4
    L3 --> L5
    L5 --> L6

    style L1 fill:#e3f2fd
    style L2 fill:#f3e5f5
    style L3 fill:#e8f5e9
    style L4 fill:#fff3e0
    style L5 fill:#fce4ec
    style L6 fill:#eceff1
```

model performance comparsion

```mermaid
graph LR
    subgraph Economic["Economic Model"]
        E1["XGBoost<br/>Accuracy: 97.24%<br/>ROC-AUC: 99.53%"]
        E2["Random Forest<br/>Accuracy: 96.89%<br/>ROC-AUC: 99.41%"]
        E3["LightGBM<br/>Accuracy: 96.78%<br/>ROC-AUC: 99.35%"]
    end

    subgraph Food["Food Security Model"]
        F1["Random Forest<br/>Accuracy: 96.87%<br/>ROC-AUC: 99.70%"]
        F2["XGBoost<br/>Accuracy: 96.45%<br/>ROC-AUC: 99.58%"]
        F3["LightGBM<br/>Accuracy: 96.23%<br/>ROC-AUC: 99.42%"]
    end

    subgraph Ensemble["Ensemble"]
        ENS["Weighted Voting<br/>40% Primary<br/>35% Secondary<br/>25% Tertiary<br/>Final Accuracy: >96%"]
    end

    E1 --> ENS
    E2 --> ENS
    E3 --> ENS
    F1 --> ENS
    F2 --> ENS
    F3 --> ENS

    style E1 fill:#c8e6c9
    style F1 fill:#c8e6c9
    style ENS fill:#ffd700
```

end points overview

```mermaid

graph TB
    API["🔌 REST API<br/>Flask Server<br/>Port: 3001"]
    
    API --> EP1["POST /api/analyze/economic"]
    API --> EP2["POST /api/analyze/food"]
    API --> EP3["GET /api/news"]
    API --> EP4["GET /api/countries"]
    API --> EP5["GET /api/data"]
    API --> EP6["POST /api/report/generate"]
    API --> EP7["GET /health"]
    
    EP1 --> R1["✓ Returns:<br/>probability<br/>classification<br/>topIndicators<br/>confidence"]
    
    EP2 --> R2["✓ Returns:<br/>probability<br/>classification<br/>topIndicators<br/>confidence"]
    
    EP3 --> R3["✓ Returns:<br/>articles[]<br/>source<br/>timestamp"]
    
    EP4 --> R4["✓ Returns:<br/>countries[]<br/>regions[]"]
    
    EP5 --> R5["✓ Returns:<br/>indicators[]<br/>observations[]"]
    
    EP6 --> R6["✓ Returns:<br/>PDF bytes<br/>or CSV bytes"]
    
    EP7 --> R7["✓ Returns:<br/>status: ok<br/>timestamp"]
    
    style API fill:#bbdefb
    style EP1 fill:#c8e6c9
    style EP2 fill:#c8e6c9
    style EP3 fill:#ffe0b2
    style R1 fill:#f8bbd0
    style R2 fill:#f8bbd0
```
