from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# API route to list files in the ./data folder
@app.route('/api/files', methods=['GET'])
def list_files():
    try:
        data_dir = os.path.join(os.getcwd(), 'data')
        files = sorted(os.listdir(data_dir))
        
        response = make_response(jsonify({'files': files}))
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API route to load the content of a specific file
@app.route('/api/files/<filename>', methods=['GET'])
def load_file(filename):
    try:
        data_dir = os.path.join(os.getcwd(), 'data')
        file_path = os.path.join(data_dir, filename)

        # Ensure the file exists
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404

        # Read the content of the file
        with open(file_path, 'r') as file:
            content = file.read()

        return jsonify({'content': content})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API route to save file content
@app.route('/api/save-file', methods=['POST'])
def save_file():
    data = request.get_json()
    file_name = data.get('fileName')
    content = data.get('content')

    try:
        # Save the file in the ./data directory
        data_dir = os.path.join(os.getcwd(), 'data')
        file_path = os.path.join(data_dir, file_name)

        # Write the content to the file
        with open(file_path, 'w') as file:
            file.write(content)

        return jsonify({'message': 'File saved successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/variables', methods=['GET'])
def get_variables():
    variables = ["alpha", "beta", '$myVar1', '$myVar2', '$count', '$userName', '$totalSum']  # Example variable names
    return jsonify(variables=variables)

@app.route('/api/create-file', methods=['POST'])
def create_file():
    data = request.get_json()
    file_name = data.get('fileName')
    
    try:
        # Directory where files are created
        data_dir = os.path.join(os.getcwd(), 'data')
        
        # Ensure the directory exists
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)

        # Full path of the file
        file_path = os.path.join(data_dir, file_name)
        
        # Check if the file already exists
        if os.path.exists(file_path):
            return jsonify(message=f'Error: File "{file_name}" already exists.'), 400  # Return error if file exists

        # Create a new file with the specified name
        with open(file_path, 'w') as f:
            f.write(f"{file_name}")  # Create an empty file

        return jsonify(message=f'File "{file_name}" created successfully!'), 200
    except Exception as e:
        return jsonify(message=f'Error creating file: {str(e)}'), 500

if __name__ == '__main__':
    app.run(debug=True)
