from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

def scrape_amazon(query):
    search_url = f"https://www.amazon.in/s?k={query.replace(' ', '+')}"
    r = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(r.text, "html.parser")
    results = []

    for item in soup.select('.s-result-item[data-component-type="s-search-result"]')[:5]:
        title_tag = item.h2
        link_tag = title_tag.a if title_tag and title_tag.a else None
        title = title_tag.text.strip() if title_tag else "No title"
        link = "https://www.amazon.in" + link_tag['href'] if link_tag else "#"
        image_tag = item.find("img")
        image = image_tag["src"] if image_tag else ""
        price_tag = item.select_one(".a-price .a-offscreen")
        price_text = price_tag.text if price_tag else "N/A"
        results.append({
            "title": title,
            "link": link,
            "image": image,
            "price": price_text,
            "site": "Amazon"
        })
    return results

def scrape_flipkart(query):
    search_url = f"https://www.flipkart.com/search?q={query.replace(' ', '%20')}"
    r = requests.get(search_url, headers=headers)
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
        results.append({
            "title": title,
            "link": link,
            "image": image,
            "price": price_text,
            "site": "Flipkart"
        })
    return results

def scrape_myntra(query):
    search_url = f"https://www.myntra.com/{query.replace(' ', '%20')}"
    r = requests.get(search_url, headers=headers)
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
        results.append({
            "title": title,
            "link": link,
            "image": image,
            "price": price_text,
            "site": "Myntra"
        })
    return results

@app.route('/search', methods=['GET'])
def search_products():
    query = request.args.get('query')
    try:
        amazon_data = scrape_amazon(query)
        flipkart_data = scrape_flipkart(query)
        myntra_data = scrape_myntra(query)

        # Optional: print to debug in terminal
        if amazon_data:
            print("Amazon Link:", amazon_data[0]['link'])

        return jsonify({"results": amazon_data + flipkart_data + myntra_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
