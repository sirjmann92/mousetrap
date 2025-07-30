from flask import Flask, jsonify, send_file
import os

app = Flask(__name__)

@app.route('/status')
def status():
    json_path = "/data/mamapi.json"
    if os.path.exists(json_path):
        return send_file(json_path, mimetype='application/json')
    else:
        return jsonify({"error": "Status file not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
