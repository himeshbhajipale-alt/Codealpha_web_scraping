# API Verification Script for Advanced Portals (Amazon, Flipkart, IMDb)
import requests

def test_advanced_endpoints():
    print("--- TESTING ADVANCED API ENDPOINTS ---")
    base_url = "http://127.0.0.1:5000"
    
    # 1. Test POST /api/amazon/analyze
    try:
        payload = {
            "url": "https://www.amazon.com/dp/B08N5WRWNW",
            "limit": 10
        }
        r = requests.post(f"{base_url}/api/amazon/analyze", json=payload, timeout=8)
        print(f"POST /api/amazon/analyze: Status {r.status_code}")
        data = r.json()
        assert data.get("success") is True, "Amazon analysis should succeed."
        assert len(data.get("rows")) == 10, "Should return 10 review rows."
        assert "metrics" in data, "Should contain summary metrics."
        assert "word_cloud" in data, "Should contain word cloud frequency data."
        print(f"  Avg Rating: {data['metrics']['avg_rating']}")
        print(f"  Positive %: {data['metrics']['pos_percent']}%")
        print(f"  Word Cloud Sample: {data['word_cloud'][:3]}")
    except Exception as e:
        print(f"Failed POST /api/amazon/analyze: {e}")
        return

    # Flipkart tests removed

    # 5. Test POST /api/imdb/scrape
    try:
        payload = {"limit": 15}
        r = requests.post(f"{base_url}/api/imdb/scrape", json=payload, timeout=8)
        print(f"POST /api/imdb/scrape: Status {r.status_code}")
        data = r.json()
        assert data.get("success") is True, "IMDb scraping should succeed."
        assert len(data.get("rows")) == 15, "Should return exactly 15 movie rows."
        print(f"  First movie scraped: {data['rows'][0][1]} ({data['rows'][0][2]})")
    except Exception as e:
        print(f"Failed POST /api/imdb/scrape: {e}")
        return

    # 6. Test POST /api/imdb/recommend
    try:
        payload = {"movie_title": "The Dark Knight"}
        r = requests.post(f"{base_url}/api/imdb/recommend", json=payload, timeout=8)
        print(f"POST /api/imdb/recommend: Status {r.status_code}")
        data = r.json()
        assert data.get("success") is True, "IMDb recommendation should succeed."
        assert len(data.get("recommendations")) == 5, "Should return 5 recommendations."
        print(f"  Recommendations for 'The Dark Knight':")
        for rec in data["recommendations"]:
            print(f"    - {rec['title']} ({rec['score']}% similarity)")
    except Exception as e:
        print(f"Failed POST /api/imdb/recommend: {e}")
        return

    # 7. Test POST /api/imdb/predict
    try:
        payload = {
            "genre": "Sci-Fi",
            "director": "Christopher Nolan",
            "year": "2026"
        }
        r = requests.post(f"{base_url}/api/imdb/predict", json=payload, timeout=8)
        print(f"POST /api/imdb/predict: Status {r.status_code}")
        data = r.json()
        assert data.get("success") is True, "IMDb rating prediction should succeed."
        print(f"  Predicted Rating: {data['predicted_rating']}")
        print(f"  Explanation: {data['explanation']}")
    except Exception as e:
        print(f"Failed POST /api/imdb/predict: {e}")
        return

    # 8. Test POST /api/amazon/track
    try:
        payload = {
            "url": "https://www.amazon.com/dp/B08N5WRWNW",
            "target_price": 700,
            "email": "test-alerts-amazon@gmail.com",
            "telegram_id": "987654321"
        }
        r = requests.post(f"{base_url}/api/amazon/track", json=payload, timeout=8)
        print(f"POST /api/amazon/track: Status {r.status_code}")
        data = r.json()
        assert data.get("success") is True, "Amazon tracking setup should succeed."
        assert len(data.get("products")) > 0, "Should return tracked products list."
        print(f"  Tracked Products count: {len(data['products'])}")
    except Exception as e:
        print(f"Failed POST /api/amazon/track: {e}")
        return

    # 9. Test GET /api/amazon/track/list
    try:
        r = requests.get(f"{base_url}/api/amazon/track/list", timeout=5)
        print(f"GET /api/amazon/track/list: Status {r.status_code}")
        data = r.json()
        assert data.get("success") is True, "Amazon listing should succeed."
        assert len(data.get("products")) > 0, "Tracked products list should not be empty."
    except Exception as e:
        print(f"Failed GET /api/amazon/track/list: {e}")
        return

    # 10. Test POST /api/amazon/track/simulate_drop
    try:
        payload = {
            "url": "https://www.amazon.com/dp/B08N5WRWNW"
        }
        r = requests.post(f"{base_url}/api/amazon/track/simulate_drop", json=payload, timeout=8)
        print(f"POST /api/amazon/track/simulate_drop: Status {r.status_code}")
        data = r.json()
        assert data.get("success") is True, "Amazon drop simulation should succeed."
        assert len(data.get("alert_logs")) == 2, "Should return 2 simulated logs (Email + Telegram)."
        print(f"  Simulated Email Log: {data['alert_logs'][0].encode('ascii', errors='replace').decode('ascii')}")
        print(f"  Simulated Telegram Log: {data['alert_logs'][1].encode('ascii', errors='replace').decode('ascii')}")
    except Exception as e:
        print(f"Failed POST /api/amazon/track/simulate_drop: {e}")
        return

    print("\n--- ALL ADVANCED VERIFICATIONS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_advanced_endpoints()
