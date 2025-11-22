import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import copy
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class StressTester:
    def __init__(self, model, X_test, output_dir='supabase/research/outputs'):
        self.model = copy.deepcopy(model) # Shadow model
        self.X_test = X_test.copy()
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def run_simulation(self, feature_name, change_factor, simulation_name):
        """
        Simulate a scenario where a feature changes by a factor (e.g., 1.1 for 10% increase).
        """
        logger.info(f"Running simulation: {simulation_name} ({feature_name} * {change_factor})")
        
        if feature_name not in self.X_test.columns:
            logger.warning(f"Feature {feature_name} not found in test data. Skipping simulation.")
            return None

        # Create modified dataset
        X_modified = self.X_test.copy()
        X_modified[feature_name] = X_modified[feature_name] * change_factor
        
        # Predict with original and modified data
        original_preds = self.model.predict(self.X_test)
        modified_preds = self.model.predict(X_modified)
        
        # Calculate impact
        avg_change = np.mean(modified_preds - original_preds)
        logger.info(f"Average prediction change: {avg_change:.4f}")
        
        # Plot comparison
        plt.figure(figsize=(10, 6))
        plt.hist(original_preds, alpha=0.5, label='Original', bins=30)
        plt.hist(modified_preds, alpha=0.5, label='Simulated', bins=30)
        plt.title(f"Stress Test: {simulation_name}")
        plt.xlabel("Predicted Value")
        plt.ylabel("Frequency")
        plt.legend()
        plt.tight_layout()
        
        output_path = os.path.join(self.output_dir, f'stress_test_{simulation_name.replace(" ", "_")}.png')
        plt.savefig(output_path)
        plt.close()
        
        return output_path, avg_change

    def run_sensitivity_analysis(self, feature_name, range_factors):
        """
        Analyze sensitivity of predictions to a range of changes in a feature.
        """
        logger.info(f"Running sensitivity analysis for {feature_name}...")
        
        if feature_name not in self.X_test.columns:
             logger.warning(f"Feature {feature_name} not found. Skipping.")
             return None

        avg_preds = []
        for factor in range_factors:
            X_mod = self.X_test.copy()
            X_mod[feature_name] = X_mod[feature_name] * factor
            preds = self.model.predict(X_mod)
            avg_preds.append(np.mean(preds))
            
        plt.figure(figsize=(10, 6))
        plt.plot(range_factors, avg_preds, marker='o')
        plt.title(f"Sensitivity Analysis: {feature_name}")
        plt.xlabel("Change Factor")
        plt.ylabel("Average Prediction")
        plt.grid(True)
        plt.tight_layout()
        
        output_path = os.path.join(self.output_dir, f'sensitivity_{feature_name.replace(" ", "_")}.png')
        plt.savefig(output_path)
        plt.close()
        
        return output_path
