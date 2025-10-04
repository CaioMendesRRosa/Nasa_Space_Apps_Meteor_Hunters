from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

sentryUrl = "https://ssd-api.jpl.nasa.gov/sentry.api"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/140.0.0.0 Safari/537.36"
}


@app.route('/')
def home():
    return jsonify({"message": "Servidor Flask rodando com sucesso!"})


@app.route('/api/meteor', methods=['GET'])
def ApiSentry():
    des = request.args.get('des')

    if not des:
        return jsonify({"error": "Parâmetro 'des' é obrigatório"}), 400

    params = {"des": des}

    response = requests.get(sentryUrl, params=params, headers=headers)

    respMeteor = response.json()

    print(respMeteor["summary"])

    if response.status_code == 200:
        data = response.json()
        return jsonify(data)
    
    return jsonify({"error": response.status_code}), response.status_code


def craterCalc(meteorDiamenter, im):

    meteorDensity = 2600
    soilDensity = 2500
    waterDensity = 1000
    gravity = 9.8




@app.route('/api/allmeteors', methods=['GET'])
def ApiSentryAllMeteors():
    response = requests.get(sentryUrl, headers=headers)

    respMeteor = response.json()

    print(len(respMeteor["data"]))

    if response.status_code == 200:
        data = response.json()
        return jsonify(data)
    
    return jsonify({"error": response.status_code}), response.status_code



if __name__ == '__main__':
    app.run(debug=True)
