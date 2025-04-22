from flask import Flask, request, jsonify, send_file
from util import get_location, estimate_price, load_details
import os

app = Flask(__name__)

def add_cors_headers(response):
    """Add CORS headers to the response."""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

@app.route('/')
def serve_html():
    """Serve the frontend HTML."""
    try:
        response = send_file('app.html')
        return add_cors_headers(response)
    except Exception as e:
        return add_cors_headers(jsonify({'error': str(e)})), 500

@app.route("/get_location")
def getloc():
    """Return available locations."""
    try:
        response = jsonify({'locations': get_location()})
        return add_cors_headers(response)
    except Exception as e:
        return add_cors_headers(jsonify({'error': str(e)})), 500

@app.route("/predict", methods=['POST'])
def predict_price():
    """Predict house price based on input parameters."""
    try:
        total_sqft = float(request.form['total_sqft'])
        location = request.form['location']
        bhk = int(request.form['bhk'])
        bath = int(request.form['bath'])
        estimated_price = estimate_price(location, total_sqft, bhk, bath)
        if estimated_price is not None:
            response = jsonify({'estimated_price': estimated_price})
            return add_cors_headers(response)
        return add_cors_headers(jsonify({'error': 'Invalid input or prediction failed'})), 400
    except KeyError as e:
        return add_cors_headers(jsonify({'error': f'Missing parameter: {str(e)}'})), 400
    except ValueError as e:
        return add_cors_headers(jsonify({'error': f'Invalid parameter value: {str(e)}'})), 400
    except Exception as e:
        return add_cors_headers(jsonify({'error': str(e)})), 500

@app.route("/predict", methods=['OPTIONS'])
def predict_options():
    """Handle CORS preflight requests."""
    response = jsonify({'status': 'OK'})
    return add_cors_headers(response)

if __name__ == "__main__":
    print("Starting Flask server...")
    if not os.path.exists(r'home_prices_model_new.pickle') or not os.path.exists(r'columns_new.json'):
        print("Error: Model or columns file missing. Run train.py first.")
    else:
        load_details()
        app.run(debug=True, port=5000)