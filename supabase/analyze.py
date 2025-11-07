"""
Wrapper script for using crisis analysis models from Next.js API routes.
Accepts command-line arguments and outputs JSON.

Usage:
python analyze.py <country> <feature1> <feature2> ... <crisisType>

Example:
python analyze.py "Haiti" -4.17 26.95 15.06 32.5 3.40 45.0 economic
python analyze.py "Yemen" 801.1 18.41 89.88 -3.89 633.89 13.42 2.98 food
"""

import sys
import json
from crisisAnalysis import analyze_economic_crisis, analyze_food_crisis

def main():
    if len(sys.argv) < 3:
        print(json.dumps({
            'error': 'Invalid arguments',
            'message': 'Usage: analyze.py <country> <features...> <crisisType>'
        }))
        sys.exit(1)
    
    try:
        country = sys.argv[1]
        crisis_type = sys.argv[-1]  # Last argument is type
        features = [float(x) for x in sys.argv[2:-1]]
        
        if crisis_type == 'economic':
            if len(features) != 6:
                raise ValueError('Economic analysis requires 6 features')
            
            result = analyze_economic_crisis(
                country=country,
                gdp_growth=features[0],
                inflation=features[1],
                unemployment=features[2],
                domestic_credit=features[3],
                exports=features[4],
                imports=features[5]
            )
        
        elif crisis_type == 'food':
            if len(features) != 7:
                raise ValueError('Food analysis requires 7 features')
            
            result = analyze_food_crisis(
                country=country,
                cereal_yield=features[0],
                food_imports=features[1],
                food_production_index=features[2],
                gdp_growth=features[3],
                gdp_per_capita=features[4],
                inflation=features[5],
                population_growth=features[6]
            )
        
        else:
            raise ValueError(f'Unknown crisis type: {crisis_type}')
        
        # Output as JSON (single line for easy parsing)
        print(json.dumps(result))
        sys.exit(0)
    
    except Exception as e:
        error_result = {
            'error': str(e),
            'country': sys.argv[1] if len(sys.argv) > 1 else 'Unknown'
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    main()