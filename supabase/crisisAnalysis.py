import joblib
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
# Load models with verification
# =====================================================================
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
            logger.info(f"✅ Economic model loaded from: {path}")
            # VERIFY MODEL
            logger.info(f"   Model type: {type(economic_model)}")
            if hasattr(economic_model, 'n_features_in_'):
                logger.info(f"   Model expects {economic_model.n_features_in_} features")
            break
        except Exception as e:
            logger.warning(f"⚠️ Failed to load from {path}: {e}")

food_paths = [
    'models/food_crisis_model.pkl',
    './models/food_crisis_model.pkl',
    'backend/models/food_crisis_model.pkl',
]

for path in food_paths:
    if os.path.exists(path):
        try:
            food_model = joblib.load(path)
            logger.info(f"✅ Food model loaded from: {path}")
            # VERIFY MODEL
            logger.info(f"   Model type: {type(food_model)}")
            if hasattr(food_model, 'n_features_in_'):
                logger.info(f"   Model expects {food_model.n_features_in_} features")
            break
        except Exception as e:
            logger.warning(f"⚠️ Failed to load from {path}: {e}")

# =====================================================================
# EXACT ECONOMIC CRISIS - MATCHING NOTEBOOK EXACTLY
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
    Uses 8 features in THIS EXACT ORDER
    """
    
    if economic_model is None:
        logger.error("Economic model not loaded!")
        return {
            'country': country,
            'probability': 0,
            'classification': 'Error: Model not loaded',
            'topIndicators': [],
        }

    try:
        # ===== DEBUG INPUT VALUES =====
        logger.debug(f"Economic Input for {country}:")
        logger.debug(f"  gdp_growth: {gdp_growth}")
        logger.debug(f"  inflation: {inflation}")
        logger.debug(f"  unemployment: {unemployment}")
        logger.debug(f"  domestic_credit: {domestic_credit}")
        logger.debug(f"  exports: {exports}")
        logger.debug(f"  imports: {imports}")
        logger.debug(f"  gdp_growth_lag: {gdp_growth_lag}")
        logger.debug(f"  inflation_lag: {inflation_lag}")

        # Use lagged values if provided, otherwise use current
        lag1_gdp = gdp_growth_lag if gdp_growth_lag is not None else gdp_growth
        lag1_inf = inflation_lag if inflation_lag is not None else inflation

        logger.debug(f"  Using lag1_gdp: {lag1_gdp} (lag provided: {gdp_growth_lag is not None})")
        logger.debug(f"  Using lag1_inf: {lag1_inf} (lag provided: {inflation_lag is not None})")

        # EXACT Feature vector order from notebook
        # [GDP growth, Inflation, Unemployment, Credit, Exports, Imports, GDP lag, Inflation lag]
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

        logger.debug(f"Feature vector shape: {feature_vector.shape}")
        logger.debug(f"Feature vector: {feature_vector}")

        # Check if feature count matches model expectation
        if hasattr(economic_model, 'n_features_in_'):
            expected_features = economic_model.n_features_in_
            actual_features = feature_vector.shape[1]
            if expected_features != actual_features:
                logger.error(f"❌ FEATURE MISMATCH! Expected {expected_features}, got {actual_features}")
                logger.error(f"   This is why probability differs from notebook!")

        # EXACT predict_proba from notebook
        if hasattr(economic_model, 'predict_proba'):
            probability_raw = economic_model.predict_proba(feature_vector)[0][1]
            logger.debug(f"Raw probability from model: {probability_raw}")
        else:
            probability_raw = economic_model.predict(feature_vector)[0]
            logger.debug(f"Raw prediction from model: {probability_raw}")

        # Convert to PERCENTAGE (NOTEBOOK DOES THIS)
        # CHECK: Is this multiplication causing the difference?
        probability = probability_raw * 100
        logger.info(f"Final probability: {probability:.2f}% (raw: {probability_raw:.4f})")

        # Classification (matching your notebook thresholds)
        if probability >= 80:
            classification = 'High Risk'
        elif probability >= 50:
            classification = 'Moderate Risk'
        else:
            classification = 'Low Risk'

        logger.info(f"Classification: {classification}")

        # SHAP - EXACT like your notebook
        try:
            explainer = shap.TreeExplainer(economic_model)
            shapvalues = explainer.shap_values(feature_vector)

            # Select positive class
            if isinstance(shapvalues, list) and len(shapvalues) > 1:
                shapvaluespositive = shapvalues[1]
            else:
                shapvaluespositive = shapvalues

            # Flatten if 3D
            if hasattr(shapvaluespositive, 'ndim') and shapvaluespositive.ndim == 3:
                shapvaluespositive = shapvaluespositive[:, :, 1]

            # Get instance SHAP
            instanceshap = shapvaluespositive[0]

            # Feature names
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

            # Pair features with SHAP values and actual values
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
# EXACT FOOD CRISIS - MATCHING NOTEBOOK EXACTLY
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
    Uses 8 features in THIS EXACT ORDER
    """
    
    if food_model is None:
        logger.error("Food model not loaded!")
        return {
            'country': country,
            'probability': 0,
            'classification': 'Error: Model not loaded',
            'topIndicators': [],
        }

    try:
        # ===== DEBUG INPUT VALUES =====
        logger.debug(f"Food Input for {country}:")
        logger.debug(f"  cereal_yield: {cereal_yield}")
        logger.debug(f"  food_imports: {food_imports}")
        logger.debug(f"  food_production_index: {food_production_index}")
        logger.debug(f"  gdp_growth: {gdp_growth}")
        logger.debug(f"  gdp_per_capita: {gdp_per_capita}")
        logger.debug(f"  inflation: {inflation}")
        logger.debug(f"  population_growth: {population_growth}")
        logger.debug(f"  cereal_yield_lag: {cereal_yield_lag}")
        logger.debug(f"  food_imports_lag: {food_imports_lag}")
        logger.debug(f"  food_production_lag: {food_production_lag}")
        logger.debug(f"  gdp_growth_lag: {gdp_growth_lag}")

        # Use lagged values if provided, otherwise use current
        lag_cereal = cereal_yield_lag if cereal_yield_lag is not None else cereal_yield
        lag_imports = food_imports_lag if food_imports_lag is not None else food_imports
        lag_prod = food_production_lag if food_production_lag is not None else food_production_index
        lag_gdp = gdp_growth_lag if gdp_growth_lag is not None else gdp_growth

        logger.debug(f"  Using lag_cereal: {lag_cereal} (lag provided: {cereal_yield_lag is not None})")
        logger.debug(f"  Using lag_imports: {lag_imports} (lag provided: {food_imports_lag is not None})")
        logger.debug(f"  Using lag_prod: {lag_prod} (lag provided: {food_production_lag is not None})")
        logger.debug(f"  Using lag_gdp: {lag_gdp} (lag provided: {gdp_growth_lag is not None})")

        # EXACT Feature vector order from notebook
        # [cereal_yield, food_imports, food_production_index, gdp_growth, gdp_per_capita, inflation, population_growth, lag_cereal]
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

        logger.debug(f"Feature vector shape: {feature_vector.shape}")
        logger.debug(f"Feature vector: {feature_vector}")

        # Check if feature count matches model expectation
        if hasattr(food_model, 'n_features_in_'):
            expected_features = food_model.n_features_in_
            actual_features = feature_vector.shape[1]
            if expected_features != actual_features:
                logger.error(f"❌ FEATURE MISMATCH! Expected {expected_features}, got {actual_features}")
                logger.error(f"   This is why probability differs from notebook!")

        # EXACT predict_proba from notebook
        if hasattr(food_model, 'predict_proba'):
            probability_raw = food_model.predict_proba(feature_vector)[0][1]
            logger.debug(f"Raw probability from model: {probability_raw}")
        else:
            probability_raw = food_model.predict(feature_vector)[0]
            logger.debug(f"Raw prediction from model: {probability_raw}")

        # Convert to PERCENTAGE (NOTEBOOK DOES THIS)
        probability = probability_raw * 100
        logger.info(f"Final probability: {probability:.2f}% (raw: {probability_raw:.4f})")

        # Classification (matching your notebook)
        if probability >= 85:
            classification = 'Critical'
        elif probability >= 70:
            classification = 'High Risk'
        elif probability >= 50:
            classification = 'Moderate Risk'
        else:
            classification = 'Low Risk'

        logger.info(f"Classification: {classification}")

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