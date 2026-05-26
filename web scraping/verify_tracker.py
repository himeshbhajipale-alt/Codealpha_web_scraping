# Verification script for Real-Time Amazon Price Tracker
import requests
import os
import pandas as pd

def verify_tracker():
    print("--- VERIFYING AMAZON PRICE TRACKER API ---")
    base_url = "http://127.0.0.1:5000"

    # 1. Check list of seeded products
    try:
        r = requests.get(f"{base_url}/api/products", timeout=5)
        print(f"GET /api/products: Status {r.status_code}")
        data = r.json()
        assert data["success"] is True, "Seeded product list query should succeed"
        print(f"  Total Tracked Products in DB: {len(data['products'])}")
        for p in data["products"]:
            currency_safe = p['currency'] if p['currency'] != '₹' else 'INR '
            print(f"    - ID {p['id']}: {p['name'][:30]}... (Price: {currency_safe}{p['current_price']})")
    except Exception as e:
        print(f"Failed seeded list check: {e}")
        return False

    # 2. Track a new product URL
    try:
        payload = {
            "url": "https://www.amazon.com/dp/B08N5WRWNW",
            "target_price": 750.00,
            "email": "alert-test@gmail.com",
            "telegram_id": "999888777"
        }
        r = requests.post(f"{base_url}/api/track", json=payload, timeout=15)
        print(f"POST /api/track: Status {r.status_code}")
        data = r.json()
        assert data["success"] is True, "Adding tracker should succeed"
        product_id = data["product_id"]
        print(f"  Successfully added tracker. ID assigned: {product_id}")
    except Exception as e:
        print(f"Failed adding new tracker: {e}")
        return False

    # 3. Retrieve product details & verify Plotly JSON presence
    try:
        r = requests.get(f"{base_url}/api/product/{product_id}", timeout=5)
        print(f"GET /api/product/{product_id}: Status {r.status_code}")
        data = r.json()
        assert data["success"] is True, "Fetching product details should succeed"
        assert "graph_json" in data, "Details must contain interactive Plotly graph JSON"
        print("  Plotly Graph JSON found.")
        print(f"  History Points Count: {len(data['history'])}")
    except Exception as e:
        print(f"Failed retrieving details/graph: {e}")
        return False

    # 4. Simulate Price Drop and evaluate alerts dispatch
    try:
        r = requests.post(f"{base_url}/api/product/{product_id}/simulate_drop", timeout=8)
        print(f"POST /api/product/{product_id}/simulate_drop: Status {r.status_code}")
        data = r.json()
        assert data["success"] is True, "Simulate price drop should succeed"
        print("  Alerts logs returned:")
        for log in data["alerts"]:
            log_safe = "".join(c if ord(c) < 128 else "?" for c in log)
            print(f"    {log_safe}")
    except Exception as e:
        print(f"Failed drop alerts simulation: {e}")
        return False

    # 5. Export tracked database as CSV
    try:
        r = requests.get(f"{base_url}/api/export/csv", timeout=10)
        print(f"GET /api/export/csv: Status {r.status_code}, length: {len(r.content)} bytes")
        assert r.status_code == 200, "CSV export should return HTTP 200"
        
        # Verify file creation and read format using pandas
        csv_path = "c:/web scraping/files/price_alerts_export.csv"
        assert os.path.exists(csv_path), "Exported CSV file must be saved in files directory"
        df = pd.read_csv(csv_path)
        print(f"  CSV columns: {list(df.columns)}")
        print(f"  CSV row count: {len(df)}")
    except Exception as e:
        print(f"Failed CSV export verification: {e}")
        return False

    # 6. Retrieve active logs console
    try:
        r = requests.get(f"{base_url}/api/logs", timeout=5)
        print(f"GET /api/logs: Status {r.status_code}")
        data = r.json()
        assert len(data["logs"]) > 0, "System log console should not be empty"
        latest_log = data["logs"][-1]
        latest_log_safe = "".join(c if ord(c) < 128 else "?" for c in latest_log)
        print(f"  Latest Console Log Line: {latest_log_safe}")
    except Exception as e:
        print(f"Failed logs console check: {e}")
        return False

    print("\n--- ALL TRACKER COMPLIANCE VERIFICATIONS PASSED SUCCESSFULLY! ---")
    return True

if __name__ == "__main__":
    verify_tracker()
