# ---- app.py (Merged Backend) ----
from flask import Flask, request, jsonify, session, g, render_template, flash
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import datetime
import requests

app = Flask(__name__)
app.secret_key = 'abcdef12345!@#$%'
CORS(app)


CHROME_PATH = "D:\chromedriver-win64\chromedriver.exe"

# Headers
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
    
def create_driver():
    options = Options()
    
    # Basic browser options
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")

    # SSL / insecure content fix
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--ignore-ssl-errors")
    options.add_argument("--allow-running-insecure-content")

    # Anti-bot detection evasion
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")

    # Page load and JS rendering tolerance
    options.page_load_strategy = 'eager'  # Load faster, may skip some JS-heavy elements

    service = Service(CHROME_PATH)
    driver = webdriver.Chrome(service=service, options=options)

    # Set timeouts
    driver.set_page_load_timeout(10)
    driver.implicitly_wait(10)

    return driver


def scrape_amazon(query):
    driver = create_driver()
    driver.get(f"https://www.amazon.in/s?k={query.replace(' ', '+')}")
    
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".s-result-item"))
        )
    except Exception as e:
        print("Amazon loading failed:", e)
        driver.quit()
        return []

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()

    items = []
    for result in soup.select(".s-result-item")[:5]:
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

    for item in soup.select('.s-item')[2:7]:
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

        try:
            usd_price = float(price_text.replace('$', '').replace(',', '').split()[0])
            inr_price = round(usd_price * exchange_rate, 2)
            price_text_inr = f"₹{inr_price}"
        except:
            price_text_inr = price_text

        items.append({
            "title": title,
            "link": link,
            "image": image,
            "price": price_text_inr,
            "site": "eBay"
        })

    return items

# ----------------- AJIO -----------------
def scrape_ajio(query):
    driver = create_driver()
    driver.get(f"https://www.ajio.com/search/?text={query.replace(' ', '%20')}")

    try:
        WebDriverWait(driver, 40).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".item"))
        )
    except Exception as e:
        print("AJIO loading failed:", e)
        driver.quit()
        return []

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()

    items = []
    product_cards = soup.find_all("div", class_="item")
    print(f"AJIO found {len(product_cards)} product cards.")

    for product in product_cards[:5]:
        brand_tag = product.find("div", class_="brand")
        name_tag = product.find("div", class_="nameCls")
        price_tag = product.select_one("span.price strong")
        link_tag = product.find("a", href=True)
        image_tag = product.find("img")

        if not (brand_tag and name_tag and price_tag and link_tag and image_tag):
            continue

        title = f"{brand_tag.text.strip()} - {name_tag.text.strip()}"
        try:
            price_clean = price_tag.text.strip().replace('₹', '').replace(',', '')
            price = f"₹{int(float(price_clean))}"
        except:
            price = "N/A"

        image_src = image_tag.get('src') or image_tag.get('data-src') or ""
        link = "https://www.ajio.com" + link_tag['href']

        item = {
            "title": title,
            "link": link,
            "image": image_src,
            "price": price,
            "site": "AJIO"
        }

        items.append(item)

    print(f"AJIO scraped {len(items)} items.")
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

    try:
        print("Scraping AJIO...")
        ajio_results = scrape_ajio(query)
        print(f"AJIO scraped {len(ajio_results)} items.")
        results += ajio_results
    except Exception as e:
        print("AJIO scrape failed:", e)

    return jsonify({"results": results})



if __name__ == '__main__':
    app.run(debug=True)