import pickle
import numpy as np
import pandas as pd
import shap
from typing import Dict
import os
import warnings
import logging

warnings.filterwarnings('ignore')

# Setup logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =====================================================================
# Load NEW Pickle-Based Models
# =====================================================================
economic_model_data = None
food_model_data = None

# Try to load ECONOMIC model
economic_paths = [
    'models/economic_model.pkl',
    './models/economic_model.pkl',
    'backend/models/economic_model.pkl',
]

for path in economic_paths:
    if os.path.exists(path):
        try:
            with open(path, 'rb') as f:
                economic_model_data = pickle.load(f)
            
            logger.info(f"✅ Economic model loaded from: {path}")
            
            # Verify structure
            if isinstance(economic_model_data, dict):
                logger.info(f"   Model type: {type(economic_model_data.get('model'))}")
                logger.info(f"   Feature count: {len(economic_model_data.get('feature_order', []))}")
                logger.info(f"   Features: {economic_model_data.get('feature_order')}")
            else:
                logger.warning(f"   ⚠️ Model is not a dict, might be old format")
            
            break
        except Exception as e:
            logger.warning(f"⚠️ Failed to load from {path}: {e}")

# Try to load FOOD model
food_paths = [
    'models/food_model.pkl',
    './models/food_model.pkl',
    'backend/models/food_model.pkl',
]

for path in food_paths:
    if os.path.exists(path):
        try:
            with open(path, 'rb') as f:
                food_model_data = pickle.load(f)
            
            logger.info(f"✅ Food model loaded from: {path}")
            
            # Verify structure
            if isinstance(food_model_data, dict):
                logger.info(f"   Model type: {type(food_model_data.get('model'))}")
                logger.info(f"   Feature count: {len(food_model_data.get('feature_order', []))}")
                logger.info(f"   Features: {food_model_data.get('feature_order')}")
            else:
                logger.warning(f"   ⚠️ Model is not a dict, might be old format")
            
            break
        except Exception as e:
            logger.warning(f"⚠️ Failed to load from {path}: {e}")

# =====================================================================
# ECONOMIC CRISIS ANALYSIS - NEW VERSION (NO LAGS)
# =====================================================================

def analyze_economic_crisis(
    country: str,
    gdp_growth: float,
    inflation: float,
    unemployment: float,
    domestic_credit: float,
    exports: float,
    imports: float,
    gdp_per_capita: float = 0.0,  # NEW - required by new model
    gross_fixed_capital: float = 0.0,  # NEW - required by new model
) -> Dict:
    """
    Economic crisis analysis using NEW pickle-based model
    
    NEW MODEL FEATURES (8 total, NO lags):
    1. Domestic credit to private sector (% of GDP)
    2. Exports of goods and services (% of GDP)
    3. GDP growth (annual %)
    4. GDP per capita (current US$)
    5. Gross fixed capital formation (% of GDP)
    6. Imports of goods and services (% of GDP)
    7. Inflation, consumer prices (annual %)
    8. Unemployment, total (% of total labor force)
    """
    
    if economic_model_data is None:
        logger.error("Economic model not loaded!")
        return {
            'country': country,
            'probability': 0,
            'classification': 'Error: Model not loaded',
            'topIndicators': [],
        }

    try:
        # Extract model and feature order
        model = economic_model_data.get('model')
        feature_order = economic_model_data.get('feature_order', [])
        
        if model is None or not feature_order:
            logger.error("Model or feature_order missing from pickle!")
            return {
                'country': country,
                'probability': 0,
                'classification': 'Error: Invalid model structure',
                'topIndicators': [],
            }

        logger.debug(f"Economic Analysis for {country}:")
        logger.debug(f"  GDP Growth: {gdp_growth}")
        logger.debug(f"  Inflation: {inflation}")
        logger.debug(f"  Unemployment: {unemployment}")
        logger.debug(f"  Domestic Credit: {domestic_credit}")
        logger.debug(f"  Exports: {exports}")
        logger.debug(f"  Imports: {imports}")
        logger.debug(f"  GDP per Capita: {gdp_per_capita}")
        logger.debug(f"  Gross Fixed Capital: {gross_fixed_capital}")

        # Create feature dictionary matching training data
        features_dict = {
            'Domestic credit to private sector (% of GDP)': domestic_credit,
            'Exports of goods and services (% of GDP)': exports,
            'GDP growth (annual %)': gdp_growth,
            'GDP per capita (current US$)': gdp_per_capita,
            'Gross fixed capital formation (% of GDP)': gross_fixed_capital,
            'Imports of goods and services (% of GDP)': imports,
            'Inflation, consumer prices (annual %)': inflation,
            'Unemployment, total (% of total labor force) (modeled ILO estimate)': unemployment,
        }

        # Build feature vector in EXACT order from training
        feature_vector = np.array([features_dict[feat] for feat in feature_order]).reshape(1, -1)

        logger.debug(f"Feature vector shape: {feature_vector.shape}")
        logger.debug(f"Feature vector: {feature_vector}")

        # Verify feature count
        if hasattr(model, 'n_features_in_'):
            expected = model.n_features_in_
            actual = feature_vector.shape[1]
            if expected != actual:
                logger.error(f"❌ FEATURE MISMATCH! Expected {expected}, got {actual}")
                return {
                    'country': country,
                    'probability': 0,
                    'classification': 'Error: Feature count mismatch',
                    'topIndicators': [],
                }

        # Predict probability
        if hasattr(model, 'predict_proba'):
            probability_raw = model.predict_proba(feature_vector)[0][1]
        else:
            probability_raw = model.predict(feature_vector)[0]

        probability = probability_raw * 100
        logger.info(f"Final probability: {probability:.2f}% (raw: {probability_raw:.4f})")

        # Classification
        if probability >= 80:
            classification = 'High Risk'
        elif probability >= 50:
            classification = 'Moderate Risk'
        else:
            classification = 'Low Risk'

        # SHAP values for top indicators
        try:
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(feature_vector)

            if isinstance(shap_values, list) and len(shap_values) > 1:
                shap_positive = shap_values[1]
            else:
                shap_positive = shap_values

            if hasattr(shap_positive, 'ndim') and shap_positive.ndim == 3:
                shap_positive = shap_positive[:, :, 1]

            instance_shap = shap_positive[0]

            # Pair with actual values
            feature_contribs = sorted(
                zip(feature_order, instance_shap, feature_vector[0]),
                key=lambda x: abs(x[1]),
                reverse=True
            )[:3]

            top_indicators = [
                {
                    'name': name,
                    'impact': float(contrib),
                    'value': float(val)
                }
                for name, contrib, val in feature_contribs
            ]

        except Exception as shap_error:
            logger.warning(f"⚠️ SHAP failed: {shap_error}")
            top_indicators = []

        result = {
            'country': country,
            'probability': round(probability, 2),
            'classification': classification,
            'topIndicators': top_indicators,
            'isHighRisk': bool(probability >= 80)
        }

        logger.info(f"✅ {country}: {probability:.2f}% - {classification}")
        return result

    except Exception as e:
        logger.error(f"❌ Error analyzing {country}: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {
            'country': country,
            'probability': 0,
            'classification': 'Error',
            'topIndicators': [],
        }

# =====================================================================
# FOOD CRISIS ANALYSIS - NEW VERSION (NO LAGS)
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
    gdp_current: float = 0.0,  # NEW - required by new model
) -> Dict:
    """
    Food crisis analysis using NEW pickle-based model
    
    NEW MODEL FEATURES (8 total, NO lags):
    1. Cereal yield (kg per hectare)
    2. Food imports (% of merchandise imports)
    3. Food production index (2014-2016 = 100)
    4. GDP (current US$)  ← NEW!
    5. GDP growth (annual %)
    6. GDP per capita (current US$)
    7. Inflation, consumer prices (annual %)
    8. Population growth (annual %)
    """
    
    if food_model_data is None:
        logger.error("Food model not loaded!")
        return {
            'country': country,
            'probability': 0,
            'classification': 'Error: Model not loaded',
            'topIndicators': [],
        }

    try:
        # Extract model and feature order
        model = food_model_data.get('model')
        feature_order = food_model_data.get('feature_order', [])
        
        if model is None or not feature_order:
            logger.error("Model or feature_order missing from pickle!")
            return {
                'country': country,
                'probability': 0,
                'classification': 'Error: Invalid model structure',
                'topIndicators': [],
            }

        logger.debug(f"Food Analysis for {country}:")
        logger.debug(f"  Cereal Yield: {cereal_yield}")
        logger.debug(f"  Food Imports: {food_imports}")
        logger.debug(f"  Food Production Index: {food_production_index}")
        logger.debug(f"  GDP Growth: {gdp_growth}")
        logger.debug(f"  GDP Per Capita: {gdp_per_capita}")
        logger.debug(f"  Inflation: {inflation}")
        logger.debug(f"  Population Growth: {population_growth}")
        logger.debug(f"  GDP Current: {gdp_current}")

        # Create feature dictionary
        features_dict = {
            'Cereal yield (kg per hectare)': cereal_yield,
            'Food imports (% of merchandise imports)': food_imports,
            'Food production index (2014-2016 = 100)': food_production_index,
            'GDP (current US$)': gdp_current,
            'GDP growth (annual %)': gdp_growth,
            'GDP per capita (current US$)': gdp_per_capita,
            'Inflation, consumer prices (annual %)': inflation,
            'Population growth (annual %)': population_growth,
        }

        # Build feature vector in EXACT order from training
        feature_vector = np.array([features_dict[feat] for feat in feature_order]).reshape(1, -1)

        logger.debug(f"Feature vector shape: {feature_vector.shape}")
        logger.debug(f"Feature vector: {feature_vector}")

        # Verify feature count
        if hasattr(model, 'n_features_in_'):
            expected = model.n_features_in_
            actual = feature_vector.shape[1]
            if expected != actual:
                logger.error(f"❌ FEATURE MISMATCH! Expected {expected}, got {actual}")
                return {
                    'country': country,
                    'probability': 0,
                    'classification': 'Error: Feature count mismatch',
                    'topIndicators': [],
                }

        # Predict probability
        if hasattr(model, 'predict_proba'):
            probability_raw = model.predict_proba(feature_vector)[0][1]
        else:
            probability_raw = model.predict(feature_vector)[0]

        probability = probability_raw * 100
        logger.info(f"Final probability: {probability:.2f}% (raw: {probability_raw:.4f})")

        # Classification
        if probability >= 85:
            classification = 'Critical'
        elif probability >= 70:
            classification = 'High Risk'
        elif probability >= 50:
            classification = 'Moderate Risk'
        else:
            classification = 'Low Risk'

        # SHAP values
        try:
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(feature_vector)

            if isinstance(shap_values, list) and len(shap_values) > 1:
                shap_positive = shap_values[1]
            else:
                shap_positive = shap_values

            if hasattr(shap_positive, 'ndim') and shap_positive.ndim == 3:
                shap_positive = shap_positive[:, :, 1]

            instance_shap = shap_positive[0]

            feature_contribs = sorted(
                zip(feature_order, instance_shap, feature_vector[0]),
                key=lambda x: abs(x[1]),
                reverse=True
            )[:3]

            top_indicators = [
                {
                    'name': name,
                    'impact': float(contrib),
                    'value': float(val)
                }
                for name, contrib, val in feature_contribs
            ]

        except Exception as shap_error:
            logger.warning(f"⚠️ SHAP failed: {shap_error}")
            top_indicators = []

        result = {
            'country': country,
            'probability': round(probability, 2),
            'classification': classification,
            'topIndicators': top_indicators,
            'isHighRisk': bool(probability >= 70)
        }

        logger.info(f"✅ {country}: {probability:.2f}% - {classification}")
        return result

    except Exception as e:
        logger.error(f"❌ Error analyzing {country}: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {
            'country': country,
            'probability': 0,
            'classification': 'Error',
            'topIndicators': [],
        }