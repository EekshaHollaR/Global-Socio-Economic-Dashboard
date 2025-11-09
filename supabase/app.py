from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import json
import os
import numpy as np

# =====================================================================
# Import analysis functions
# =====================================================================
try:
    from crisisAnalysis import analyze_economic_crisis, analyze_food_crisis
    print("✅ Successfully imported analysis functions")
except ImportError as e:
    print(f"❌ Import Error: {e}")
    sys.exit(1)

# =====================================================================
# Flask App Setup
# =====================================================================
app = Flask(__name__)

# Enable CORS
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:8081",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:8081",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000"
        ],
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# =====================================================================
# JSON Encoder for NumPy types
# =====================================================================
class NumpyJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.bool_):
            return bool(obj)
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)

app.json_encoder = NumpyJSONEncoder

def to_json_serializable(result):
    if isinstance(result, dict):
        return {k: to_json_serializable(v) for k, v in result.items()}
    elif isinstance(result, list):
        return [to_json_serializable(item) for item in result]
    elif isinstance(result, np.bool_):
        return bool(result)
    elif isinstance(result, np.integer):
        return int(result)
    elif isinstance(result, np.floating):
        return float(result)
    elif isinstance(result, np.ndarray):
        return result.tolist()
    else:
        return result

# =====================================================================
# Health Check
# =====================================================================
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Crisis Analysis API (Pickle-Based Models)',
        'models': 'loaded',
        'cors_enabled': True
    }), 200

# =====================================================================
# Economic Crisis Endpoint - UPDATED FOR NEW MODEL
# =====================================================================
@app.route('/api/analyze/economic', methods=['POST', 'OPTIONS'])
def analyze_economic():
    """
    Analyze economic crisis using NEW pickle-based model
    
    Expected JSON:
    {
        "country": "Haiti",
        "gdpGrowth": -4.17,
        "inflation": 26.95,
        "unemployment": 15.06,
        "domesticCredit": 32.5,
        "exports": 3.40,
        "imports": 45.0,
        "gdpPerCapita": 1234.56,        // NEW - Required
        "grossFixedCapital": 25.3       // NEW - Required
    }
    
    NOTE: Lag parameters REMOVED - new model doesn't use them
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.get_json()

        # Required fields for NEW model
        required_fields = [
            'country', 'gdpGrowth', 'inflation', 'unemployment',
            'domesticCredit', 'exports', 'imports',
            'gdpPerCapita', 'grossFixedCapital'  # NEW
        ]

        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                'error': 'Missing required fields',
                'missing': missing,
                'required': required_fields
            }), 400

        print(f"\n📊 Analyzing {data['country']} (Economic Crisis - New Model)")
        print(f"   GDP Growth: {data['gdpGrowth']}")
        print(f"   Inflation: {data['inflation']}")
        print(f"   Unemployment: {data['unemployment']}")
        print(f"   Domestic Credit: {data['domesticCredit']}")
        print(f"   Exports: {data['exports']}")
        print(f"   Imports: {data['imports']}")
        print(f"   GDP Per Capita: {data['gdpPerCapita']}")
        print(f"   Gross Fixed Capital: {data['grossFixedCapital']}")

        # Call analysis function with NEW parameters
        result = analyze_economic_crisis(
            country=data['country'],
            gdp_growth=float(data['gdpGrowth']),
            inflation=float(data['inflation']),
            unemployment=float(data['unemployment']),
            domestic_credit=float(data['domesticCredit']),
            exports=float(data['exports']),
            imports=float(data['imports']),
            gdp_per_capita=float(data['gdpPerCapita']),
            gross_fixed_capital=float(data['grossFixedCapital']),
        )

        result = to_json_serializable(result)
        print(f"   ✅ Result: {result['probability']}% - {result['classification']}\n")

        return jsonify(result), 200

    except ValueError as e:
        print(f"❌ ValueError: {str(e)}")
        return jsonify({
            'error': 'Invalid input values',
            'message': str(e)
        }), 400

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Analysis failed',
            'message': str(e)
        }), 500

# =====================================================================
# Food Crisis Endpoint - UPDATED FOR NEW MODEL
# =====================================================================
@app.route('/api/analyze/food', methods=['POST', 'OPTIONS'])
def analyze_food():
    """
    Analyze food crisis using NEW pickle-based model
    
    Expected JSON:
    {
        "country": "Yemen",
        "cerealYield": 801.1,
        "foodImports": 18.41,
        "foodProductionIndex": 89.88,
        "gdpGrowth": -3.89,
        "gdpPerCapita": 633.89,
        "inflation": 13.42,
        "populationGrowth": 2.98,
        "gdpCurrent": 26.8e9              // NEW - Required (GDP in current US$)
    }
    
    NOTE: Lag parameters REMOVED - new model doesn't use them
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.get_json()

        # Required fields for NEW model
        required_fields = [
            'country', 'cerealYield', 'foodImports', 'foodProductionIndex',
            'gdpGrowth', 'gdpPerCapita', 'inflation', 'populationGrowth',
            'gdpCurrent'  # NEW
        ]

        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                'error': 'Missing required fields',
                'missing': missing,
                'required': required_fields
            }), 400

        print(f"\n🍽️ Analyzing {data['country']} (Food Crisis - New Model)")
        print(f"   Cereal Yield: {data['cerealYield']}")
        print(f"   Food Imports: {data['foodImports']}")
        print(f"   Food Production Index: {data['foodProductionIndex']}")
        print(f"   GDP Growth: {data['gdpGrowth']}")
        print(f"   GDP Per Capita: {data['gdpPerCapita']}")
        print(f"   Inflation: {data['inflation']}")
        print(f"   Population Growth: {data['populationGrowth']}")
        print(f"   GDP Current: {data['gdpCurrent']}")

        # Call analysis function with NEW parameters
        result = analyze_food_crisis(
            country=data['country'],
            cereal_yield=float(data['cerealYield']),
            food_imports=float(data['foodImports']),
            food_production_index=float(data['foodProductionIndex']),
            gdp_growth=float(data['gdpGrowth']),
            gdp_per_capita=float(data['gdpPerCapita']),
            inflation=float(data['inflation']),
            population_growth=float(data['populationGrowth']),
            gdp_current=float(data['gdpCurrent']),
        )

        result = to_json_serializable(result)
        print(f"   ✅ Result: {result['probability']}% - {result['classification']}\n")

        return jsonify(result), 200

    except ValueError as e:
        print(f"❌ ValueError: {str(e)}") 
        return jsonify({
            'error': 'Invalid input values',
            'message': str(e)
        }), 400

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Analysis failed',
            'message': str(e)
        }), 500

# =====================================================================
# Error Handlers
# =====================================================================
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# =====================================================================
# Main
# =====================================================================
if __name__ == '__main__':
    print("""
╔═════════════════════════════════════════════════════════╗
║   Crisis Analysis API - Pickle-Based Models (NEW)      ║
║   Running on http://localhost:3001                      ║
╚═════════════════════════════════════════════════════════╝

📋 IMPORTANT CHANGES:
  • Using NEW pickle-based models (economic_model.pkl, food_model.pkl)
  • Lag parameters REMOVED (models don't use them)
  • NEW required parameters:
    - Economic: gdpPerCapita, grossFixedCapital
    - Food: gdpCurrent
  • Feature order automatically loaded from pickle

Endpoints:
  POST /api/analyze/economic
  POST /api/analyze/food
  GET  /health

Status: ✅ Ready for pickle-based inference
""")
    app.run(
        host='0.0.0.0',
        port=3001,
        debug=True,
        use_reloader=False
    )