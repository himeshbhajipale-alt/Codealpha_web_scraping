# API Verification Script for ScrapeAnalytics Studio
import requests

def test_endpoints():
    print("--- TESTING API ENDPOINTS ---")
    base_url = "http://127.0.0.1:5000"
    
    # 1. Test GET /api/presets
    try:
        r_presets = requests.get(f"{base_url}/api/presets", timeout=5)
        print(f"GET /api/presets: Status {r_presets.status_code}")
        presets_data = r_presets.json()
        print(f"Presets found: {[p['id'] for p in presets_data]}")
        assert len(presets_data) == 5, "Should have 5 presets loaded."
    except Exception as e:
        print(f"Failed GET /api/presets: {e}")
        return

    # 2. Test POST /api/scrape - Preset gdp_wiki (Table Mode)
    try:
        payload = {
            "url": "https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(nominal)",
            "mode": "table",
            "tableIndex": 2,
            "presetId": "gdp_wiki"
        }
        r_scrape = requests.post(f"{base_url}/api/scrape", json=payload, timeout=8)
        print(f"POST /api/scrape (gdp_wiki): Status {r_scrape.status_code}")
        scrape_data = r_scrape.json()
        print(f"Title: {scrape_data.get('title')}")
        print(f"Mode: {scrape_data.get('mode')}")
        print(f"Headers: {scrape_data.get('headers')[:3]}")
        print(f"Rows count: {len(scrape_data.get('rows'))}")
        assert scrape_data.get("success") is True, "Scraping should succeed."
        assert len(scrape_data.get("headers")) > 0, "Headers should not be empty."
        assert len(scrape_data.get("rows")) > 0, "Rows should not be empty."
    except Exception as e:
        print(f"Failed POST /api/scrape (gdp_wiki): {e}")
        return

    # 3. Test POST /api/scrape - Preset retail_catalog (Selector Mode)
    try:
        payload = {
            "url": "https://www.example-store-catalog.com/products",
            "mode": "selector",
            "selector": "div.product-card",
            "presetId": "retail_catalog"
        }
        r_scrape = requests.post(f"{base_url}/api/scrape", json=payload, timeout=8)
        print(f"POST /api/scrape (retail_catalog): Status {r_scrape.status_code}")
        scrape_data = r_scrape.json()
        print(f"Title: {scrape_data.get('title')}")
        print(f"Mode: {scrape_data.get('mode')}")
        print(f"Headers: {scrape_data.get('headers')}")
        print(f"Rows count: {len(scrape_data.get('rows'))}")
        assert scrape_data.get("success") is True, "Scraping should succeed."
        assert len(scrape_data.get("rows")) == 10, "Should contain 10 mock catalog rows."
    except Exception as e:
        print(f"Failed POST /api/scrape (retail_catalog): {e}")
        return

    # 4. Test POST /api/export/excel
    try:
        payload = {
            "headers": ["Rank", "Country", "GDP"],
            "rows": [
                ["1", "USA", "25000000"],
                ["2", "China", "18000000"]
            ]
        }
        r_excel = requests.post(f"{base_url}/api/export/excel", json=payload, timeout=15)
        print(f"POST /api/export/excel: Status {r_excel.status_code}, Length: {len(r_excel.content)} bytes")
        assert r_excel.status_code == 200, "Excel export should return status 200."
        assert len(r_excel.content) > 100, "Excel file should contain workbook content."
        assert "spreadsheetml" in r_excel.headers.get("Content-Type", "").lower(), "Should have Excel mime-type."
    except Exception as e:
        print(f"Failed POST /api/export/excel: {e}")
        return

    # 5. Test POST /api/export/database
    try:
        payload = {
            "headers": ["Rank", "Country", "GDP"],
            "rows": [
                ["1", "USA", "25000000"],
                ["2", "China", "18000000"]
            ]
        }
        r_db = requests.post(f"{base_url}/api/export/database", json=payload, timeout=8)
        print(f"POST /api/export/database: Status {r_db.status_code}, Length: {len(r_db.content)} bytes")
        assert r_db.status_code == 200, "Database export should return status 200."
        assert len(r_db.content) > 1000, "Database file should contain SQLite content."
        assert "sqlite" in r_db.headers.get("Content-Type", "").lower(), "Should have SQLite mime-type."
    except Exception as e:
        print(f"Failed POST /api/export/database: {e}")
        return

    print("\n--- ALL VERIFICATIONS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_endpoints()
