from app import create_app
import os
from flask import send_from_directory

app = create_app()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # Evita interceptar rotas de API
    if path.startswith('api'):
        return {"error": "Not Found"}, 404
        
    dist_path = os.path.join(os.getcwd(), 'dist')
    if path != "" and os.path.exists(os.path.join(dist_path, path)):
        return send_from_directory(dist_path, path)
    else:
        return send_from_directory(dist_path, 'index.html')

if __name__ == '__main__':
    # O container do AI Studio exige que o app rode na 0.0.0.0:3000
    # Nota: Certifique-se de que 'npm run build' foi executado para gerar a pasta dist
    app.run(host='0.0.0.0', port=3000, debug=True)
