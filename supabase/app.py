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

# Enable CORS for Vite port 8081
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
# JSON Encoder Fix - Handle NumPy types
# =====================================================================
class NumpyJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles NumPy types"""
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

# =====================================================================
# Helper function to convert result to JSON-serializable
# =====================================================================
def to_json_serializable(result):
    """Convert all NumPy types to Python native types"""
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
    """Check if API and models are running"""
    return jsonify({
        'status': 'healthy',
        'service': 'Crisis Analysis API',
        'models': 'loaded',
        'cors_enabled': True
    }), 200

@app.route('/api/analyze/economic', methods=['POST', 'OPTIONS'])
def analyze_economic():
    """
    Analyze economic crisis for a country
    
    Expected JSON:
    {
        "country": "Haiti",
        "gdpGrowth": -4.17,
        "inflation": 26.95,
        "unemployment": 15.06,
        "domesticCredit": 32.5,
        "exports": 3.40,
        "imports": 45.0,
        "gdpGrowthLag": -2.15,      // (Optional) Previous year value
        "inflationLag": 25.50        // (Optional) Previous year value
    }
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.get_json()

        # Required fields
        required_fields = ['country', 'gdpGrowth', 'inflation', 'unemployment',
                          'domesticCredit', 'exports', 'imports']

        if not all(field in data for field in required_fields):
            return jsonify({
                'error': 'Missing required fields',
                'required': required_fields
            }), 400

        print(f"\n📊 Analyzing {data['country']} (Economic Crisis)")
        print(f"   GDP Growth: {data['gdpGrowth']}")
        print(f"   GDP Growth Lag: {data.get('gdpGrowthLag', 'NOT PROVIDED - will use current')}")
        print(f"   Inflation: {data['inflation']}")
        print(f"   Inflation Lag: {data.get('inflationLag', 'NOT PROVIDED - will use current')}")

        # Call analysis function
        result = analyze_economic_crisis(
            country=data['country'],
            gdp_growth=float(data['gdpGrowth']),
            inflation=float(data['inflation']),
            unemployment=float(data['unemployment']),
            domestic_credit=float(data['domesticCredit']),
            exports=float(data['exports']),
            imports=float(data['imports']),
            gdp_growth_lag=float(data.get('gdpGrowthLag', data['gdpGrowth'])),
            inflation_lag=float(data.get('inflationLag', data['inflation'])),
        )

        # Convert to JSON-serializable format
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
# Food Crisis Endpoint - FIXED VERSION
# =====================================================================
@app.route('/api/analyze/food', methods=['POST', 'OPTIONS'])
def analyze_food():
    """
    Analyze food crisis for a country
    
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
        "cerealYieldLag": 795.5,              // (Optional) Previous year
        "foodImportsLag": 17.85,              // (Optional) Previous year
        "foodProductionLag": 88.45,           // (NEW - CRITICAL) Previous year
        "gdpGrowthLag": -2.15                 // (NEW - IMPORTANT) Previous year
    }
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.get_json()

        # Required fields
        required_fields = ['country', 'cerealYield', 'foodImports', 'foodProductionIndex',
                          'gdpGrowth', 'gdpPerCapita', 'inflation', 'populationGrowth']

        if not all(field in data for field in required_fields):
            return jsonify({
                'error': 'Missing required fields',
                'required': required_fields
            }), 400

        print(f"\n🍽️ Analyzing {data['country']} (Food Crisis)")
        print(f"   Cereal Yield: {data['cerealYield']}")
        print(f"   Cereal Yield Lag: {data.get('cerealYieldLag', 'NOT PROVIDED - will use current')}")
        print(f"   Food Production Index: {data['foodProductionIndex']}")
        print(f"   Food Production Lag: {data.get('foodProductionLag', '❌ MISSING - CRITICAL!')}")
        print(f"   Food Imports: {data['foodImports']}")
        print(f"   Food Imports Lag: {data.get('foodImportsLag', 'NOT PROVIDED - will use current')}")
        print(f"   GDP Growth Lag: {data.get('gdpGrowthLag', 'NOT PROVIDED - will use current')}")

        # Call analysis function
        result = analyze_food_crisis(
            country=data['country'],
            cereal_yield=float(data['cerealYield']),
            food_imports=float(data['foodImports']),
            food_production_index=float(data['foodProductionIndex']),
            gdp_growth=float(data['gdpGrowth']),
            gdp_per_capita=float(data['gdpPerCapita']),
            inflation=float(data['inflation']),
            population_growth=float(data['populationGrowth']),
            cereal_yield_lag=float(data.get('cerealYieldLag', data['cerealYield'])),
            food_imports_lag=float(data.get('foodImportsLag', data['foodImports'])),
            food_production_lag=float(data.get('foodProductionLag', data['foodProductionIndex'])),  # ← FIXED
            gdp_growth_lag=float(data.get('gdpGrowthLag', data['gdpGrowth'])),  # ← FIXED
        )

        # Convert to JSON-serializable format
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
╔═══════════════════════════════════════════════════╗
║ Crisis Analysis API (FIXED VERSION) ║
║ Running on http://localhost:3001 ║
╚═══════════════════════════════════════════════════╝

Endpoints:
  POST /api/analyze/economic
  POST /api/analyze/food
  GET /health

Status: ✅ Lag features now properly handled
Note: Food endpoint now extracts foodProductionLag and gdpGrowthLag
""")
    app.run(
        host='0.0.0.0',
        port=3001,
        debug=True,
        use_reloader=False
    )