from flask import Flask, request, jsonify
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time
import requests

app = Flask(__name__)
CORS(app)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

def get_exchange_rate():
    try:
        response = requests.get("https://api.exchangerate-api.com/v4/latest/USD")
        data = response.json()
        return data['rates']['INR']
    except Exception as e:
        print("Error fetching exchange rate:", e)
        return 1  # Default to 1 if there's an error

CHROME_PATH = "C:\chromedriver\chromedriver-win64\chromedriver-win64\chromedriver.exe"  # <== update with your correct path

def create_driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    service = Service(CHROME_PATH)
    return webdriver.Chrome(service=service, options=options)

# ----------------- AMAZON -----------------
def scrape_amazon(query):
    driver = create_driver()
    driver.get(f"https://www.amazon.in/s?k={query.replace(' ', '+')}")
    time.sleep(4)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()

    items = []
    for result in soup.select(".s-result-item")[:20]:
        title = result.select_one("h2 span")
        link = result.select_one("a.a-link-normal")
        image = result.select_one("img")
        price = result.select_one(".a-price-whole")
        if title and link and image and price:
            items.append({
                "title": title.text.strip(),
                "link": "https://www.amazon.in" + link['href'],
                "image": image['src'],
                "price": f"₹{price.text.strip()}",
                "site": "Amazon"
            })
    return items


# ----------------- EBAY -----------------
def scrape_ebay(query):
        exchange_rate = get_exchange_rate()
        search_url = f"https://www.ebay.com/sch/i.html?_nkw={query.replace(' ', '+')}"
        r = requests.get(search_url, headers=headers)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        items = []

        for item in soup.select('.s-item')[2:22]:
            title_tag = item.select_one('.s-item__title')
            if not title_tag:
                continue
            title = title_tag.text.strip()
            link_tag = item.find("a", href=True)
            link = link_tag['href'] if link_tag else "#"
            image_tag = item.find('img')
            image = image_tag['src'] if image_tag else ""
            price_tag = item.select_one('.s-item__price')
            price_text = price_tag.text.strip() if price_tag else "N/A"

            # Convert USD price to INR if price is valid
            try:
                usd_price = float(price_text.replace('$', '').replace(',', '').split()[0])
                inr_price = round(usd_price * exchange_rate, 2)
                price_text_inr = f"₹{inr_price}"
            except:
                price_text_inr = price_text  # fallback if price can't be converted

            items.append({
                "title": title,
                "link": link,
                "image": image,
                "price": price_text_inr,
                "site": "eBay"
            })

        return items


# ----------------- MAIN ROUTE -----------------
@app.route("/search")
def search():
    query = request.args.get("query", "")
    if not query:
        return jsonify({"results": []})

    results = []

    try:
        print("Scraping Amazon...")
        results += scrape_amazon(query)
    except Exception as e:
        print("Amazon scrape failed:", e)

    try:
        print("Scraping eBay...")
        results += scrape_ebay(query)
    except Exception as e:
        print("eBay scrape failed:", e)


    return jsonify({"results": results})


if __name__ == "__main__":
    app.run(debug=True)
