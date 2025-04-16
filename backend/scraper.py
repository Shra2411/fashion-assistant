import requests
from bs4 import BeautifulSoup

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"
}

def scrape_amazon(query):
    query = query.replace(" ", "+")
    url = f"https://www.amazon.in/s?k={query}"
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')
    
    try:
        title = soup.select_one("span.a-size-medium").get_text(strip=True)
        price = soup.select_one("span.a-price-whole").get_text(strip=True)
        link = "https://www.amazon.in" + soup.select_one("h2 a")["href"]
        return {"site": "Amazon", "name": title, "price": price, "link": link}
    except:
        return None

def scrape_flipkart(query):
    query = query.replace(" ", "+")
    url = f"https://www.flipkart.com/search?q={query}"
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')

    try:
        title = soup.select_one("._4rR01T, .s1Q9rs").get_text(strip=True)
        price = soup.select_one("._30jeq3").get_text(strip=True)
        link = "https://www.flipkart.com" + soup.select_one("a")["href"]
        return {"site": "Flipkart", "name": title, "price": price, "link": link}
    except:
        return None

def scrape_myntra(query):
    query = query.replace(" ", "%20")
    url = f"https://www.myntra.com/{query}"
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')

    try:
        title = soup.select_one("h3.product-brand").get_text(strip=True)
        price = soup.select_one("span.product-discountedPrice").get_text(strip=True)
        link = url
        return {"site": "Myntra", "name": title, "price": price, "link": link}
    except:
        return None
