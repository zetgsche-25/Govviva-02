from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    # O container do AI Studio exige que o app rode na 0.0.0.0:3000
    app.run(host='0.0.0.0', port=3000, debug=True)
