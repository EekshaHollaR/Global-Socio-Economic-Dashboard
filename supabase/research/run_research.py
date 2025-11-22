import sys
import os
import logging

# Add parent directory to path to allow imports if run from supabase/research
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from supabase.research.evaluation import ModelEvaluator
from supabase.research.explainability import ExplainabilityAnalyzer
from supabase.research.dataset_analysis import DatasetAnalyzer
from supabase.research.stress_test import StressTester
from supabase.research.report_generator import generate_report

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    logger.info("Starting Research & Evaluation Pipeline...")
    
    # Configuration
    DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/dataset1.csv'))
    OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'outputs'))
    REPORT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'reports'))
    
    if not os.path.exists(DATA_PATH):
        logger.error(f"Data file not found at {DATA_PATH}")
        return

    plots = {
        'distributions': [],
        'stress_tests': [],
        'sensitivity': []
    }

    # 1. Dataset Analysis
    logger.info("--- Step 1: Dataset Analysis ---")
    analyzer = DatasetAnalyzer(DATA_PATH, OUTPUT_DIR)
    dataset_stats, missing_plot = analyzer.analyze_quality()
    plots['missing_values'] = missing_plot
    plots['distributions'] = analyzer.analyze_distributions()
    
    outliers = analyzer.detect_outliers()
    logger.info(f"Top outliers detected in: {list(outliers.keys())[:3]}")

    # 2. Model Evaluation
    logger.info("--- Step 2: Model Evaluation ---")
    evaluator = ModelEvaluator(DATA_PATH)
    results, models, X_test, y_test, target_col = evaluator.train_evaluate()
    
    # Find best model based on R2
    best_model_name = max(results, key=lambda k: results[k].get('R2 Score', -float('inf')))
    best_model = models[best_model_name]
    logger.info(f"Best model: {best_model_name} (R2: {results[best_model_name]['R2 Score']})")

    # 3. Explainability
    logger.info("--- Step 3: Explainability Analysis ---")
    explainer = ExplainabilityAnalyzer(OUTPUT_DIR)
    summary_plot, bar_plot = explainer.generate_shap_plots(best_model, X_test, best_model_name)
    plots['shap_summary'] = summary_plot
    plots['shap_importance'] = bar_plot
    
    plots['correlation'] = explainer.generate_correlation_heatmap(evaluator.data)

    # 4. Stress Testing
    logger.info("--- Step 4: Stress Testing ---")
    stress_tester = StressTester(best_model, X_test, OUTPUT_DIR)
    
    # Simulate 10% increase in Inflation if available
    # Note: Column names depend on dataset. Using generic check.
    inflation_col = next((c for c in X_test.columns if 'inflation' in c.lower()), None)
    if inflation_col:
        plot_path, change = stress_tester.run_simulation(inflation_col, 1.1, "10% Inflation Increase")
        if plot_path: plots['stress_tests'].append(plot_path)
        
        sens_path = stress_tester.run_sensitivity_analysis(inflation_col, [0.8, 0.9, 1.0, 1.1, 1.2])
        if sens_path: plots['sensitivity'].append(sens_path)
    
    # Simulate 10% decrease in GDP Growth if available (as a feature, though it might be target)
    # If GDP growth is target, we can't stress test it as input.
    # Let's look for 'Food imports' or similar
    food_imp_col = next((c for c in X_test.columns if 'import' in c.lower()), None)
    if food_imp_col:
        plot_path, change = stress_tester.run_simulation(food_imp_col, 0.9, "10% Import Decrease")
        if plot_path: plots['stress_tests'].append(plot_path)

    # 5. Report Generation
    logger.info("--- Step 5: Generating PDF Report ---")
    report_path = generate_report(results, dataset_stats, plots, REPORT_DIR)
    
    logger.info(f"Pipeline Completed! Report saved to: {report_path}")

if __name__ == "__main__":
    main()
