# main.py

from dns import exception
from flask import Flask
from flask import jsonify
from flask import request
from flask_pymongo import PyMongo
from flask_cors import CORS
import certifi

app = Flask(__name__)

# Stringa di connessione al DB

app.config["MONGO_URI"] = "mongodb+srv://Zane:E0ijrCeYF0724awa@cluster0.cdyyu.mongodb.net/Relab?retryWrites=true&w=majority&ssl=true&ssl_cert_reqs=CERT_NONE" #Importante qui va specificato il nome del DB

mongo = PyMongo(app)
# Per rispondere alle chiamate cross origin
CORS(app)

# Annotation that allows the function to be hit at the specific URL.
@app.route("/")
# Generic Python functino that returns "Hello world!"
def index():
    return "Hello world!"

# Questa route effettua una find() su tutto il DB (si limita ai primi 100 risultati)

@app.route('/addresses', methods=['GET'])
def get_all_addresses():
    try:
        mil4326WKT = mongo.db.Mil4326WKT
        output = []
        for s in mil4326WKT.find().limit(100):
            output.append(s['INDIRIZZO'])
        return jsonify({'result': output})
    except ValueError:
        print(ValueError)
       

# Checks to see if the name of the package is the run as the main package.
if __name__ == "__main__":
    # Runs the Flask application only if the main.py file is being run.
    app.run(debug=True)