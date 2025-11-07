"""
Simple test script for the Flask API
Test both economic and food crisis analysis endpoints
"""

import requests
import json

API_URL = "http://localhost:3001"

def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("Testing Health Endpoint")
    print("="*60)
    try:
        response = requests.get(f"{API_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_economic_crisis():
    """Test economic crisis analysis"""
    print("\n" + "="*60)
    print("Testing Economic Crisis Analysis")
    print("="*60)
    
    data = {
        "country": "Haiti",
        "gdpGrowth": -4.17,
        "inflation": 26.95,
        "unemployment": 15.06,
        "domesticCredit": 32.5,
        "exports": 3.40,
        "imports": 45.0
    }
    
    print(f"Input: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/analyze/economic",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        print(f"\nStatus: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_food_crisis():
    """Test food crisis analysis"""
    print("\n" + "="*60)
    print("Testing Food Crisis Analysis")
    print("="*60)
    
    data = {
        "country": "Yemen",
        "cerealYield": 801.1,
        "foodImports": 18.41,
        "foodProductionIndex": 89.88,
        "gdpGrowth": -3.89,
        "gdpPerCapita": 633.89,
        "inflation": 13.42,
        "populationGrowth": 2.98
    }
    
    print(f"Input: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/analyze/food",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        print(f"\nStatus: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_usa_low_risk():
    """Test low-risk country"""
    print("\n" + "="*60)
    print("Testing Low-Risk Country (USA)")
    print("="*60)
    
    data = {
        "country": "United States",
        "gdpGrowth": 2.5,
        "inflation": 3.2,
        "unemployment": 4.1,
        "domesticCredit": 197.9,
        "exports": 10.9,
        "imports": 15.2
    }
    
    print(f"Input: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/analyze/economic",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        print(f"\nStatus: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("""
    ╔════════════════════════════════════════╗
    ║   Crisis Analysis API Tests           ║
    ║   Make sure API is running first!     ║
    ║   python app.py                       ║
    ╚════════════════════════════════════════╝
    """)
    
    results = {
        'health': test_health(),
        'economic': test_economic_crisis(),
        'food': test_food_crisis(),
        'usa_low_risk': test_usa_low_risk()
    }
    
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + ("="*60))
    if all_passed:
        print("✅ All tests passed!")
    else:
        print("❌ Some tests failed. Check the output above.")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())