import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import lightgbm as lgb
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ModelEvaluator:
    def __init__(self, data_path):
        self.data_path = data_path
        self.data = None
        self.models = {}
        self.results = {}

    def load_data(self):
        try:
            logger.info(f"Loading data from {self.data_path}")
            self.data = pd.read_csv(self.data_path)
            # Basic preprocessing: Drop non-numeric columns for simplicity in this research module
            # In a real scenario, we would handle categorical variables properly
            self.data = self.data.select_dtypes(include=[np.number])
            self.data = self.data.dropna()
            logger.info(f"Data loaded successfully. Shape: {self.data.shape}")
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise

    def train_evaluate(self, target_column='gdp_growth'): # Default target, can be changed
        if self.data is None:
            self.load_data()

        if target_column not in self.data.columns:
             # Fallback to a likely target if default doesn't exist, or raise error
             # For dataset1.csv, let's assume we are predicting 'GDP growth (annual %)' if it exists, 
             # but column names might be different. Let's check column names in a real run.
             # For now, I'll use a generic approach or try to find a suitable target.
             # Based on previous file reads, 'GDP growth (annual %)' is a feature. 
             # Let's try to predict 'GDP growth (annual %)' as a proxy for economic health, 
             # or 'Inflation, consumer prices (annual %)'
             
             possible_targets = ['GDP growth (annual %)', 'Inflation, consumer prices (annual %)', 'gdp_growth', 'inflation']
             for t in possible_targets:
                 if t in self.data.columns:
                     target_column = t
                     break
        
        if target_column not in self.data.columns:
            raise ValueError(f"Target column {target_column} not found in dataset.")

        logger.info(f"Training models to predict: {target_column}")

        X = self.data.drop(columns=[target_column])
        y = self.data[target_column]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Define models
        model_configs = {
            'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'Linear Regression': LinearRegression(),
            'XGBoost': xgb.XGBRegressor(objective='reg:squarederror', random_state=42),
            'LightGBM': lgb.LGBMRegressor(random_state=42)
        }

        for name, model in model_configs.items():
            try:
                logger.info(f"Training {name}...")
                model.fit(X_train, y_train)
                preds = model.predict(X_test)

                rmse = np.sqrt(mean_squared_error(y_test, preds))
                mae = mean_absolute_error(y_test, preds)
                r2 = r2_score(y_test, preds)
                
                # MAPE calculation (avoid division by zero)
                mape = np.mean(np.abs((y_test - preds) / (y_test + 1e-10))) * 100

                self.results[name] = {
                    'RMSE': round(rmse, 4),
                    'MAE': round(mae, 4),
                    'R2 Score': round(r2, 4),
                    'MAPE': round(mape, 4)
                }
                self.models[name] = model # Save trained model for later use (e.g. SHAP)
                
            except Exception as e:
                logger.error(f"Failed to train {name}: {e}")
                self.results[name] = {'Error': str(e)}

        return self.results, self.models, X_test, y_test, target_column

if __name__ == "__main__":
    # Test run
    evaluator = ModelEvaluator('../data/dataset1.csv')
    results, _, _, _, _ = evaluator.train_evaluate()
    print(results)
