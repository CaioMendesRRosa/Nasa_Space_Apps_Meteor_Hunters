from flask import Flask, jsonify, request
import requests
import math

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

    craterCalc(float(respMeteor["summary"]["diameter"]), float(respMeteor["summary"]["v_imp"]))

    EarthQuakeCalc(float(respMeteor["summary"]["energy"]))

    print(respMeteor["summary"])

    if response.status_code == 200:
        data = response.json()
        return jsonify(data)
    
    return jsonify({"error": response.status_code}), response.status_code


def craterCalc(meteorDiameter, v_imp, isSoil=True):

    meteorDensity = 2600
    soilDensity = 2500
    waterDensity = 1000
    gravity = 9.8

    v_imp *= 1000
    meteorDiameter *= 1000

    soilConstant = 1.161
    waterConstant = 1.365

    auxConstant = soilConstant if isSoil else waterConstant
    auxDensity = soilDensity if isSoil else waterDensity

    
    craterDiameter = auxConstant * math.pow((meteorDensity / auxDensity), (1.0 / 3.0)) * \
    math.pow(meteorDiameter, 0.78) * math.pow(v_imp, 0.44) * math.pow(gravity, -0.22)

    finalCraterDiameter = 1.25 * craterDiameter if craterDiameter < 3200 else \
    ( math.pow(craterDiameter, 1.13) / ( math.pow(3200, 0.13 ) )) * 1.17

    print(craterDiameter, finalCraterDiameter)

    TsunamiCalc(craterDiameter)


def EarthQuakeCalc (energy):

    energy = energy * 4.74 * math.pow(10, 15)

    Epicenter = 0.67 * math.log(energy, 10) - 5.87

    print(Epicenter)


def TsunamiCalc (craterDiameter):

    tsunamiHeight = min(craterDiameter / 14.1, 4000)

    print(tsunamiHeight, 10 * craterDiameter)


@app.route('/api/allmeteors', methods=['GET'])
def ApiSentryAllMeteors():
    response = requests.get(sentryUrl, headers=headers)

    respMeteor = response.json()

    print(len(respMeteor["data"]))

    for i in respMeteor["data"]:
        if float(i["diameter"]) > 1.2:
            print(i["des"])

    if response.status_code == 200:
        data = response.json()
        return jsonify(data)
    
    return jsonify({"error": response.status_code}), response.status_code



if __name__ == '__main__':
    app.run(debug=True)
