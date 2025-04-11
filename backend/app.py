from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This allows React to communicate with Flask

@app.route('/api/prompt', methods=['POST'])
def handle_prompt():
    data = request.json
    prompt = data.get('prompt', '').lower()
    print(f"Received prompt: {prompt}")

    if "black" in prompt:
        products = [
            {'name': 'Black T-Shirt', 'price': '₹599', 'link': 'https://amzn.in/d/0DXkEou'},
            {'name': 'Black Hoodie', 'price': '₹1099', 'link': 'https://myntra.com/black-hoodie'}
        ]
    elif "white" in prompt:
        products = [
            {'name': 'White Shirt', 'price': '₹799', 'link': 'https://flipkart.com/white-shirt'},
            {'name': 'White Kurta', 'price': '₹1199', 'link': 'https://amzn.in/d/amQwoQb'}
        ]
    elif "jeans" in prompt:
        products = [
            {'name': 'Blue Jeans', 'price': '₹999', 'link': 'https://myntra.com/blue-jeans'},
            {'name': 'Black Jeans', 'price': '₹1299', 'link': 'https://flipkart.com/black-jeans'}
        ]
    else:
        products = [
            {'name': 'Red T-Shirt', 'price': '₹499', 'link': 'https://example.com/red-tshirt'},
            {'name': 'Blue Shirt', 'price': '₹899', 'link': 'https://example.com/blue-shirt'}
        ]

    return jsonify({'products': products})

if __name__ == '__main__':
    app.run(debug=True)
