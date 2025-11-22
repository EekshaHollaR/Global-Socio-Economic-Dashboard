# Crisis Analysis Project: Research & Evaluation Work

## 1. Overview
This document details the research and evaluation module implemented for the Crisis Analysis project. The goal of this module is to provide rigorous, academic-grade analysis of the machine learning models used to predict economic and food crises. This work runs in parallel to the main production system, ensuring no interference with the user experience while offering deep insights into model behavior, data quality, and system stability.

## 2. Methodology

### 2.1. Model Performance Comparison
To ensure the reliability of our crisis prediction, we implemented a comparative analysis framework. Instead of relying on a single model, we evaluate multiple state-of-the-art algorithms on the same dataset to identify the best performer.

**Models Evaluated:**
1.  **Random Forest Regressor**: A robust ensemble method that handles non-linear relationships well and is less prone to overfitting.
2.  **XGBoost (Extreme Gradient Boosting)**: A highly efficient implementation of gradient boosting, known for winning Kaggle competitions due to its speed and performance.
3.  **LightGBM**: A gradient boosting framework that uses tree-based learning algorithms, optimized for speed and efficiency, especially on large datasets.
4.  **Linear Regression**: A baseline model to check for linear relationships in the data.

**Evaluation Metrics:**
We utilize standard regression metrics to quantify performance:
*   **RMSE (Root Mean Squared Error)**: Penalizes larger errors more heavily, useful for avoiding large misses in crisis prediction.
*   **MAE (Mean Absolute Error)**: The average magnitude of errors, providing a clear interpretation of "how far off" predictions are on average.
*   **R² Score (Coefficient of Determination)**: Indicates the proportion of variance in the dependent variable predictable from the independent variables. A score closer to 1.0 indicates a perfect fit.
*   **MAPE (Mean Absolute Percentage Error)**: Measures prediction accuracy as a percentage, making it easier to understand error relative to the scale of the target variable.

### 2.2. Feature Importance & Explainability (XAI)
Trust in AI models is critical for crisis forecasting. We employ **SHAP (SHapley Additive exPlanations)** values to explain individual predictions and global model behavior.

**Techniques Used:**
*   **SHAP Summary Plots**: Visualizes the distribution of SHAP values for each feature, showing which features are most important and how their values (high vs. low) impact the prediction (positive vs. negative).
*   **Feature Importance Bars**: A global ranking of features based on the mean absolute SHAP value.
*   **Correlation Heatmaps**: To identify multicollinearity among features, which helps in understanding redundant signals in the dataset.

### 2.3. Dataset Quality & Bias Analysis
Data quality is the foundation of any ML model. Our research module includes an automated pipeline to assess the health of the input data.

**Analysis Components:**
*   **Missing Value Detection**: Identifies columns with null values to prevent silent failures or biased imputation.
*   **Distribution Analysis**: Generates histograms and KDE plots for key features to detect skewness (e.g., are most countries clustered at low GDP?).
*   **Outlier Detection**: Uses the Interquartile Range (IQR) method to flag anomalous data points (e.g., hyperinflation events) that could skew model training.

### 2.4. Model Stability & Stress Testing
Beyond standard evaluation, we simulate "What-If" scenarios to test the model's robustness under economic stress.

**Simulation Approach:**
We use a **Shadow Model** (a copy of the best-performing production model) to run counterfactual simulations without affecting live predictions.

**Scenarios:**
*   **Inflation Shock**: We artificially increase the `Inflation` feature by 10-20% across the test set and measure the average change in predicted crisis probability.
*   **GDP Contraction**: We simulate a decrease in `GDP Growth` or `Imports` to observe the model's sensitivity to economic downturns.
*   **Sensitivity Analysis**: We plot the model's response curve over a range of changes (e.g., 0.8x to 1.2x of the original value) to ensure the model behaves monotonically and logically (i.e., higher inflation should generally increase crisis risk).

## 3. Implementation Details

### 3.1. Architecture
The research module is isolated in the `supabase/research/` directory to maintain separation of concerns.
*   `evaluation.py`: Handles data loading, preprocessing, and model training/comparison.
*   `explainability.py`: Generates SHAP plots and correlation matrices.
*   `dataset_analysis.py`: Performs statistical checks and generates distribution plots.
*   `stress_test.py`: Runs the simulation scenarios.
*   `report_generator.py`: Compiles all results into a PDF.
*   `run_research.py`: The main orchestrator script.

### 3.2. Output
The pipeline generates two types of artifacts:
1.  **Visualizations**: Saved in `supabase/research/outputs/` (e.g., `shap_summary.png`, `stress_test_inflation.png`).
2.  **Research Report**: A comprehensive PDF saved in `supabase/research/reports/` containing all tables, charts, and summary statistics.

## 4. Conclusion
This research framework provides a comprehensive view of the crisis analysis system. By combining rigorous performance metrics with explainability and stress testing, we ensure that the models are not only accurate but also robust, transparent, and reliable for decision-making.
