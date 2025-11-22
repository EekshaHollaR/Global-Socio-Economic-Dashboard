import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DatasetAnalyzer:
    def __init__(self, data_path, output_dir='supabase/research/outputs'):
        self.data_path = data_path
        self.output_dir = output_dir
        self.data = None
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def load_data(self):
        if self.data is None:
            try:
                self.data = pd.read_csv(self.data_path)
            except Exception as e:
                logger.error(f"Error loading data: {e}")
                raise

    def analyze_quality(self):
        self.load_data()
        logger.info("Analyzing dataset quality...")
        
        stats = {
            'Total Rows': len(self.data),
            'Total Columns': len(self.data.columns),
            'Missing Values': self.data.isnull().sum().sum(),
            'Duplicate Rows': self.data.duplicated().sum()
        }
        
        # Missing values plot
        plt.figure(figsize=(10, 6))
        sns.heatmap(self.data.isnull(), cbar=False, cmap='viridis')
        plt.title("Missing Values Heatmap")
        plt.tight_layout()
        missing_plot_path = os.path.join(self.output_dir, 'missing_values.png')
        plt.savefig(missing_plot_path)
        plt.close()
        
        return stats, missing_plot_path

    def analyze_distributions(self):
        self.load_data()
        logger.info("Analyzing distributions...")
        
        numeric_cols = self.data.select_dtypes(include=[np.number]).columns
        dist_plots = []
        
        # Plot top 5 numeric columns distributions
        for i, col in enumerate(numeric_cols[:5]):
            plt.figure(figsize=(8, 5))
            sns.histplot(self.data[col], kde=True)
            plt.title(f"Distribution of {col}")
            plt.tight_layout()
            path = os.path.join(self.output_dir, f'dist_{col.replace(" ", "_").replace("/", "")}.png')
            plt.savefig(path)
            plt.close()
            dist_plots.append(path)
            
        return dist_plots

    def detect_outliers(self):
        self.load_data()
        logger.info("Detecting outliers...")
        
        numeric_cols = self.data.select_dtypes(include=[np.number]).columns
        outliers_summary = {}
        
        for col in numeric_cols:
            Q1 = self.data[col].quantile(0.25)
            Q3 = self.data[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = self.data[(self.data[col] < lower_bound) | (self.data[col] > upper_bound)]
            outliers_summary[col] = len(outliers)
            
        # Sort by number of outliers
        sorted_outliers = dict(sorted(outliers_summary.items(), key=lambda item: item[1], reverse=True)[:10])
        
        return sorted_outliers
