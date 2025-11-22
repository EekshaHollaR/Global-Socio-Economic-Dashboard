from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import json
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
# Economic Crisis Endpoint
# =====================================================================
@app.route('/api/analyze/economic', methods=['POST'])
def analyze_economic():
    try:
        data = request.get_json()

        required_fields = [
            'country', 'gdpGrowth', 'inflation', 'unemployment',
            'domesticCredit', 'exports', 'imports',
            'gdpPerCapita', 'grossFixedCapital'
        ]

        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                'error': 'Missing required fields',
                'missing': missing,
                'required': required_fields
            }), 400

        print(f"\n📊 Analyzing {data['country']} (Economic Crisis - New Model)")
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
        return jsonify({'error': 'Invalid input values', 'message': str(e)}), 400
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': 'Analysis failed', 'message': str(e)}), 500

# =====================================================================
# Food Crisis Endpoint
# =====================================================================
@app.route('/api/analyze/food', methods=['POST'])
def analyze_food():
    try:
        data = request.get_json()

        required_fields = [
            'country', 'cerealYield', 'foodImports', 'foodProductionIndex',
            'gdpGrowth', 'gdpPerCapita', 'inflation',
            'populationGrowth', 'gdpCurrent'
        ]

        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                'error': 'Missing required fields',
                'missing': missing,
                'required': required_fields
            }), 400

        print(f"\n🍽️ Analyzing {data['country']} (Food Crisis - New Model)")
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
        return jsonify({'error': 'Invalid input values', 'message': str(e)}), 400
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': 'Analysis failed', 'message': str(e)}), 500

# =====================================================================
# News API Endpoints
# =====================================================================
try:
    from newsAPI import fetch_crisis_news, fetch_latest_crisis_news
    print("✅ Successfully imported news API functions")
except ImportError as e:
    print(f"⚠️ News API not available: {e}")
    # Define fallback functions to prevent NameError
    def fetch_crisis_news(*args, **kwargs):
        return {'status': 'error', 'message': 'News API module not loaded'}
    def fetch_latest_crisis_news(*args, **kwargs):
        return {'status': 'error', 'message': 'News API module not loaded'}

@app.route('/api/news', methods=['GET', 'OPTIONS'])
def get_crisis_news():

    if request.method == 'OPTIONS':
        return '', 204

    try:
        country = request.args.get('country')
        crisis_type = request.args.get('type')
        page_size = request.args.get('pageSize', 20, type=int)

        if not country:
            return jsonify({'error': 'Missing required parameter', 'message': 'country is required'}), 400
        if not crisis_type:
            return jsonify({'error': 'Missing required parameter', 'message': 'type is required'}), 400
        if crisis_type not in ['economic', 'food']:
            return jsonify({'error': 'Invalid crisis type', 'message': 'type must be "economic" or "food"'}), 400

        print(f"\n📰 Fetching news: {country} - {crisis_type}")
        result = fetch_crisis_news(country, crisis_type, page_size)

        return jsonify(result), 200

    except Exception as e:
        print(f"❌ Error fetching news: {str(e)}")
        import traceback; traceback.print_exc()
        return jsonify({'error': 'Failed to fetch news', 'message': str(e)}), 500

@app.route('/api/news/latest', methods=['GET', 'OPTIONS'])
def get_latest_news():

    if request.method == 'OPTIONS':
        return '', 204

    try:
        crisis_type = request.args.get('type')
        page_size = request.args.get('pageSize', 30, type=int)

        if crisis_type and crisis_type not in ['economic', 'food']:
            return jsonify({'error': 'Invalid crisis type', 'message': 'type must be "economic" or "food"'}), 400

        print(f"\n📰 Fetching latest news: {crisis_type or 'all'}")
        result = fetch_latest_crisis_news(crisis_type, page_size)

        return jsonify(result), 200

    except Exception as e:
        print(f"❌ Error fetching latest news: {str(e)}")
        import traceback; traceback.print_exc()
        return jsonify({'error': 'Failed to fetch news', 'message': str(e)}), 500

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
    print(
"""
╔═════════════════════════════════════════════════════════╗
║   Crisis Analysis API - Pickle-Based Models (NEW)       ║
║   Running on http://localhost:3001                      ║
╚═════════════════════════════════════════════════════════╝

📋 IMPORTANT CHANGES:
  • Using NEW pickle-based models (economic_model.pkl, food_model.pkl)
  • Lag parameters REMOVED (models don't use them)
  • New required input fields for both endpoints
"""
    )

    app.run(
        host='0.0.0.0',
        port=3001,
        debug=True,
        use_reloader=False
    )
