import time
import yaml
import requests

def automate_millionaires_vault(config_path="config/config.yaml"):
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)
    auto_enabled = config.get("mam", {}).get("auto_purchase", {}).get("millionaires_vault", False)
    amount = config.get("mam", {}).get("millionaires_vault_amount", 2000)
    if not auto_enabled:
        return
    # Call the local API endpoint as the frontend would
    try:
        resp = requests.post(
            "http://localhost:8000/api/automation/millionaires_vault",
            json={"amount": amount},
            timeout=30
        )
        data = resp.json()
        if data.get("success"):
            print(f"[Millionaire's Vault] Donated {amount} points!")
        else:
            print(f"[Millionaire's Vault] Not donated: {data.get('error')}")
    except Exception as e:
        print(f"[Millionaire's Vault] Error: {e}")

def main():
    while True:
        automate_millionaires_vault()
        time.sleep(60 * 60 * 6)  # Check every 6 hours (adjust as needed)

if __name__ == "__main__":
    main()
