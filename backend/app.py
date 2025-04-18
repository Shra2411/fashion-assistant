from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

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

def scrape_amazon(query):
    try:
        search_url = f"https://www.amazon.in/s?k={query.replace(' ', '+')}"
        r = requests.get(search_url, headers=headers)
        r.raise_for_status()  # Raise an error for bad responses
        soup = BeautifulSoup(r.text, "html.parser")
        results = []

        for item in soup.select('.s-result-item[data-component-type="s-search-result"]')[:5]:
            title = item.h2.text.strip() if item.h2 else "No title"
            link_tag = item.h2.a if item.h2 and item.h2.a else None
            link = "https://www.amazon.in" + link_tag['href'] if link_tag and 'href' in link_tag.attrs else "#"
            image = item.find("img")["src"] if item.find("img") else ""
            price = item.select_one(".a-price .a-offscreen")
            price_text = price.text if price else "N/A"
            results.append({"title": title, "link": link, "image": image, "price": price_text, "site": "Amazon"})
        return results
        print(item.prettify())

    except Exception as e:
        print("Amazon scraping error:", e)
        return []

def scrape_flipkart(query):
    try:
        search_url = f"https://www.flipkart.com/search?q={query.replace(' ', '%20')}"
        r = requests.get(search_url, headers=headers)
        r.raise_for_status()  # Raise an error for bad responses
        soup = BeautifulSoup(r.text, "html.parser")
        results = []

        for item in soup.select('._1AtVbE')[:10]:
            title_tag = item.select_one('._4rR01T')
            if not title_tag:
                continue
            title = title_tag.text.strip()
            link_tag = item.find("a", href=True)
            link = "https://www.flipkart.com" + link_tag['href'] if link_tag else "#"
            image_tag = item.find("img")
            image = image_tag["src"] if image_tag else ""
            price_tag = item.select_one('._30jeq3')
            price_text = price_tag.text if price_tag else "N/A"
            results.append({"title": title, "link": link, "image": image, "price": price_text, "site": "Flipkart"})
        return results
    except Exception as e:
        print("Flipkart scraping error:", e)
        return []

def scrape_myntra(query):
    try:
        search_url = f"https://www.myntra.com/{query.replace(' ', '%20')}"
        r = requests.get(search_url, headers=headers)
        r.raise_for_status()  # Raise an error for bad responses
        soup = BeautifulSoup(r.text, "html.parser")
        results = []

        for item in soup.select('.product-base')[:5]:
            link_tag = item.find('a', href=True)
            link = "https://www.myntra.com" + link_tag['href'] if link_tag else "#"
            image_tag = item.find('img')
            image = image_tag['src'] if image_tag else ""
            title = image_tag['alt'] if image_tag else "No title"
            price_tag = item.select_one('.product-discountedPrice, .product-price')
            price_text = price_tag.text if price_tag else "N/A"
            results.append({"title": title, "link": link, "image": image, "price": price_text, "site": "Myntra"})
        return results
    except Exception as e:
        print("Myntra scraping error:", e)
        return []

def scrape_asos(query):
    try:
        search_url = f"https://www.asos.com/search/?q={query.replace(' ', '%20')}"
        r = requests.get(search_url, headers=headers)
        r.raise_for_status()  # Raise an error for bad responses
        soup = BeautifulSoup(r.text, "html.parser")
        results = []

        for item in soup.select('.product-card')[:5]:
            title_tag = item.select_one('.product-card__title')
            if not title_tag:
                continue
            title = title_tag.text.strip()
            link_tag = item.find("a", href=True)
            link = "https://www.asos.com" + link_tag['href'] if link_tag else "#"
            image_tag = item.find('img')
            image = image_tag['src'] if image_tag else ""
            price_tag = item.select_one('.product-card__price')
            price_text = price_tag.text.strip() if price_tag else "N/A"
            results.append({"title": title, "link": link, "image": image, "price": price_text, "site": "ASOS"})
        return results
    except Exception as e:
        print("ASOS scraping error:", e)
        return []

def scrape_aliexpress(query):
    try:
        search_url = f"https://www.aliexpress.com/wholesale?SearchText={query.replace(' ', '+')}"
        r = requests.get(search_url, headers=headers)
        r.raise_for_status()  # Raise an error for bad responses
        soup = BeautifulSoup(r.text, "html.parser")
        results = []

        for item in soup.select('.item')[:5]:  # Adjust the selector based on AliExpress structure
            title_tag = item.select_one('.item-title')
            if not title_tag:
                continue
            title = title_tag.text.strip()
            link_tag = item.find("a", href=True)
            link = link_tag['href'] if link_tag else "#"
            image_tag = item.find('img')
            image = image_tag['src'] if image_tag else ""
            price_tag = item.select_one('.price')
            price_text = price_tag.text.strip() if price_tag else "N/A"
            results.append({"title": title, "link": link, "image": image, "price": price_text, "site": "AliExpress"})
        return results
    except Exception as e:
        print("AliExpress scraping error:", e)
        return []

def scrape_ebay(query):
    try:
        exchange_rate = get_exchange_rate()
        search_url = f"https://www.ebay.com/sch/i.html?_nkw={query.replace(' ', '+')}"
        r = requests.get(search_url, headers=headers)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        results = []

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

            # Convert USD price to INR if price is valid
            try:
                usd_price = float(price_text.replace('$', '').replace(',', '').split()[0])
                inr_price = round(usd_price * exchange_rate, 2)
                price_text_inr = f"₹{inr_price}"
            except:
                price_text_inr = price_text  # fallback if price can't be converted

            results.append({
                "title": title,
                "link": link,
                "image": image,
                "price": price_text_inr,
                "site": "eBay"
            })

        return results

    except Exception as e:
        print("eBay scraping error:", e)
        return []


@app.route('/search', methods=['GET'])
def search_products():
    query = request.args.get('query')
    try:
        amazon_data = scrape_amazon(query)
        flipkart_data = scrape_flipkart(query)
        myntra_data = scrape_myntra(query)
        asos_data = scrape_asos(query)
        ebay_data = scrape_ebay(query)  # Include eBay data
        aliexpress_data = scrape_aliexpress(query)  # Include AliExpress data
        return jsonify({"results": amazon_data + flipkart_data + myntra_data + asos_data + ebay_data + aliexpress_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
