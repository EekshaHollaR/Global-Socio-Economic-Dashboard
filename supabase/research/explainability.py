import shap
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ExplainabilityAnalyzer:
    def __init__(self, output_dir='supabase/research/outputs'):
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def generate_shap_plots(self, model, X_test, model_name='Model'):
        try:
            logger.info(f"Generating SHAP plots for {model_name}...")
            
            # Create explainer
            # TreeExplainer is optimized for tree-based models (RF, XGB, LGBM)
            # LinearExplainer for Linear Regression
            # KernelExplainer for generic
            
            explainer = None
            if 'RandomForest' in str(type(model)) or 'XGB' in str(type(model)) or 'LGBM' in str(type(model)):
                 explainer = shap.TreeExplainer(model)
            elif 'LinearRegression' in str(type(model)):
                 explainer = shap.LinearExplainer(model, X_test)
            else:
                 explainer = shap.KernelExplainer(model.predict, X_test.iloc[:50]) # Slow, use subset

            shap_values = explainer.shap_values(X_test)
            
            # Handle different SHAP value shapes (e.g. for binary classification vs regression)
            if isinstance(shap_values, list):
                shap_values = shap_values[1] # Positive class for binary
            
            # 1. Summary Plot
            plt.figure(figsize=(10, 6))
            shap.summary_plot(shap_values, X_test, show=False)
            plt.title(f"SHAP Summary Plot - {model_name}")
            plt.tight_layout()
            summary_path = os.path.join(self.output_dir, f'shap_summary_{model_name.replace(" ", "_")}.png')
            plt.savefig(summary_path)
            plt.close()
            logger.info(f"Saved SHAP summary plot to {summary_path}")

            # 2. Feature Importance Bar Plot (Mean |SHAP|)
            plt.figure(figsize=(10, 6))
            shap.summary_plot(shap_values, X_test, plot_type="bar", show=False)
            plt.title(f"Feature Importance (SHAP) - {model_name}")
            plt.tight_layout()
            bar_path = os.path.join(self.output_dir, f'shap_importance_{model_name.replace(" ", "_")}.png')
            plt.savefig(bar_path)
            plt.close()
            logger.info(f"Saved SHAP importance plot to {bar_path}")

            return summary_path, bar_path

        except Exception as e:
            logger.error(f"Error generating SHAP plots: {e}")
            return None, None

    def generate_correlation_heatmap(self, data, output_name='correlation_heatmap.png'):
        try:
            logger.info("Generating correlation heatmap...")
            plt.figure(figsize=(12, 10))
            corr = data.corr()
            sns.heatmap(corr, annot=False, cmap='coolwarm', fmt=".2f")
            plt.title("Feature Correlation Heatmap")
            plt.tight_layout()
            
            output_path = os.path.join(self.output_dir, output_name)
            plt.savefig(output_path)
            plt.close()
            logger.info(f"Saved heatmap to {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Error generating heatmap: {e}")
            return None
