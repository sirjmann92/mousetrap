import requests

cookies = {"mam_id": "i2hcGDYAipgnTEIZ9xnsv3rDggvtB2KcP1UurGjrNdT6fyP6umhJ6HtmHH2QhM15tJmjk27Vd1D%2F2CLKxrchpyLqFPb6T%2Fh1LgWNoOOhT5cxCUQtEwwfK3JR7H%2F75Ck3ap008ZHxSpCLDExBj6lpcS4Un8ttI74N%2B4NPVaxCpXTzjbbN9uYuGZXw4MJJkt%2BgEkwr4sQ%2B38XSKRMGtbYPL0a1t8dfboYTwcHwQClHfmSKW1sUuBHK9Wi1KZSmHoM5A7gBZ0xEjJQRrESr0SfemwZYRtBx8su76%2BR4"}
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://t.myanonamouse.net/"
}
resp = requests.get("https://t.myanonamouse.net/store.php", cookies=cookies, headers=headers, timeout=30)
print(f"Status: {resp.status_code}, Length: {len(resp.text)}")
with open("store_page.html", "w", encoding="utf-8") as f:
    f.write(resp.text)
