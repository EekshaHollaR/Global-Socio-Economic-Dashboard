import joblib
import numpy as np
import pandas as pd
import shap
from typing import Dict
import os
import warnings
warnings.filterwarnings('ignore')

# Load models
economic_model = None
food_model = None

model_paths = [
    'models/economic_crisis_model.pkl',
    './models/economic_crisis_model.pkl',
    'backend/models/economic_crisis_model.pkl',
]

for path in model_paths:
    if os.path.exists(path):
        try:
            economic_model = joblib.load(path)
            print(f"✅ Economic model loaded from: {path}")
            break
        except Exception as e:
            print(f"⚠️  Failed: {e}")

food_paths = [
    'models/food_crisis_model.pkl',
    './models/food_crisis_model.pkl',
    'backend/models/food_crisis_model.pkl',
]

for path in food_paths:
    if os.path.exists(path):
        try:
            food_model = joblib.load(path)
            print(f"✅ Food model loaded from: {path}")
            break
        except Exception as e:
            print(f"⚠️  Failed: {e}")

# =====================================================================
# EXACT ECONOMIC CRISIS CODE FROM YOUR NOTEBOOK
# =====================================================================

def analyze_economic_crisis(
    country: str,
    gdp_growth: float,
    inflation: float,
    unemployment: float,
    domestic_credit: float,
    exports: float,
    imports: float,
    gdp_growth_lag: float = None,
    inflation_lag: float = None,
) -> Dict:
    """
    EXACT matching your notebook model1.ipynb
    Uses lagged features: [current_features, gdp_lag, inflation_lag]
    """
    
    if economic_model is None:
        return {
            'country': country,
            'probability': 0,
            'classification': 'Error: Model not loaded',
            'topIndicators': [],
        }
    
    try:
        # Use lagged values if provided, otherwise use current
        lag1_gdp = gdp_growth_lag if gdp_growth_lag is not None else gdp_growth
        lag1_inf = inflation_lag if inflation_lag is not None else inflation
        
        # Feature vector - EXACT order from your notebook
        feature_vector = np.array([
            gdp_growth,
            inflation,
            unemployment,
            domestic_credit,
            exports,
            imports,
            lag1_gdp,
            lag1_inf,
        ]).reshape(1, -1)
        
        # EXACT like your notebook: predict_proba(...)[0][1]
        if hasattr(economic_model, 'predict_proba'):
            probability_raw = economic_model.predict_proba(feature_vector)[0][1]
        else:
            probability_raw = economic_model.predict(feature_vector)[0]
        
        # Convert to PERCENTAGE (YOUR NOTEBOOK DOES THIS)
        probability = probability_raw * 100
        
        # Classification (matching your notebook thresholds)
        if probability >= 80:
            classification = 'High Risk'
        elif probability >= 50:
            classification = 'Moderate Risk'
        else:
            classification = 'Low Risk'
        
        # SHAP - EXACT like your notebook
        try:
            explainer = shap.TreeExplainer(economic_model)
            shapvalues = explainer.shap_values(feature_vector)
            
            # Select positive class (EXACT like notebook)
            if isinstance(shapvalues, list) and len(shapvalues) > 1:
                shapvaluespositive = shapvalues[1]
            else:
                shapvaluespositive = shapvalues
            
            # Flatten if 3D (EXACT like notebook)
            if hasattr(shapvaluespositive, 'ndim') and shapvaluespositive.ndim == 3:
                shapvaluespositive = shapvaluespositive[:, :, 1]
            
            # Get instance SHAP
            instanceshap = shapvaluespositive[0]
            
            # Feature names (matching your notebook exactly)
            featnames = [
                'GDP growth annual %',
                'Inflation, consumer prices annual %',
                'Unemployment, total % of labor force',
                'Domestic credit to private sector %',
                'Exports of goods and services %',
                'Imports of goods and services %',
                'GDP growth lag1',
                'Inflation lag1'
            ]
            
            # Pair features with SHAP values and actual values (EXACT like notebook)
            featurecontribs = sorted(
                zip(
                    featnames,
                    instanceshap,
                    [gdp_growth, inflation, unemployment, domestic_credit, exports, imports, lag1_gdp, lag1_inf]
                ),
                key=lambda x: abs(x[1]),
                reverse=True
            )[:3]
            
            top_indicators = [
                {
                    'name': name,
                    'impact': float(contrib),
                    'value': float(val)
                }
                for name, contrib, val in featurecontribs
            ]
        except Exception as shap_error:
            print(f"⚠️  SHAP failed: {shap_error}")
            top_indicators = []
        
        result = {
            'country': country,
            'probability': round(probability, 2),
            'classification': classification,
            'topIndicators': top_indicators,
            'isHighRisk': bool(probability >= 80)
        }
        
        print(f"✅ {country}: {probability:.2f}% - {classification}")
        return result
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {
            'country': country,
            'probability': 0,
            'classification': 'Error',
            'topIndicators': [],
        }

# =====================================================================
# EXACT FOOD CRISIS CODE FROM YOUR NOTEBOOK
# =====================================================================

def analyze_food_crisis(
    country: str,
    cereal_yield: float,
    food_imports: float,
    food_production_index: float,
    gdp_growth: float,
    gdp_per_capita: float,
    inflation: float,
    population_growth: float,
    cereal_yield_lag: float = None,
    food_imports_lag: float = None,
    food_production_lag: float = None,
    gdp_growth_lag: float = None,
) -> Dict:
    """
    EXACT matching your notebook model2.ipynb
    Uses lagged features
    """
    
    if food_model is None:
        return {
            'country': country,
            'probability': 0,
            'classification': 'Error: Model not loaded',
            'topIndicators': [],
        }
    
    try:
        # Use lagged values if provided
        lag_cereal = cereal_yield_lag if cereal_yield_lag is not None else cereal_yield
        lag_imports = food_imports_lag if food_imports_lag is not None else food_imports
        lag_prod = food_production_lag if food_production_lag is not None else food_production_index
        lag_gdp = gdp_growth_lag if gdp_growth_lag is not None else gdp_growth
        
        # Feature vector - EXACT order from your notebook
        feature_vector = np.array([
            cereal_yield,
            food_imports,
            food_production_index,
            gdp_growth,
            gdp_per_capita,
            inflation,
            population_growth,
            lag_cereal,
        ]).reshape(1, -1)
        
        # EXACT predict_proba
        if hasattr(food_model, 'predict_proba'):
            probability_raw = food_model.predict_proba(feature_vector)[0][1]
        else:
            probability_raw = food_model.predict(feature_vector)[0]
        
        # Convert to PERCENTAGE
        probability = probability_raw * 100
        
        # Classification (matching your notebook)
        if probability >= 85:
            classification = 'Critical'
        elif probability >= 70:
            classification = 'High Risk'
        elif probability >= 50:
            classification = 'Moderate Risk'
        else:
            classification = 'Low Risk'
        
        # SHAP
        try:
            explainer = shap.TreeExplainer(food_model)
            shapvalues = explainer.shap_values(feature_vector)
            
            if isinstance(shapvalues, list) and len(shapvalues) > 1:
                shapvaluespositive = shapvalues[1]
            else:
                shapvaluespositive = shapvalues
            
            if hasattr(shapvaluespositive, 'ndim') and shapvaluespositive.ndim == 3:
                shapvaluespositive = shapvaluespositive[:, :, 1]
            
            instanceshap = shapvaluespositive[0]
            
            featnames = [
                'Cereal yield kg/hectare',
                'Food imports %',
                'Food production index',
                'GDP growth %',
                'GDP per capita USD',
                'Inflation %',
                'Population growth %',
                'Cereal yield lag1'
            ]
            
            featurecontribs = sorted(
                zip(
                    featnames,
                    instanceshap,
                    [cereal_yield, food_imports, food_production_index, gdp_growth, gdp_per_capita, inflation, population_growth, lag_cereal]
                ),
                key=lambda x: abs(x[1]),
                reverse=True
            )[:3]
            
            top_indicators = [
                {
                    'name': name,
                    'impact': float(contrib),
                    'value': float(val)
                }
                for name, contrib, val in featurecontribs
            ]
        except Exception as shap_error:
            print(f"⚠️  SHAP failed: {shap_error}")
            top_indicators = []
        
        result = {
            'country': country,
            'probability': round(probability, 2),
            'classification': classification,
            'topIndicators': top_indicators,
            'isHighRisk': bool(probability >= 70)
        }
        
        print(f"✅ {country}: {probability:.2f}% - {classification}")
        return result
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {
            'country': country,
            'probability': 0,
            'classification': 'Error',
            'topIndicators': [],
        }