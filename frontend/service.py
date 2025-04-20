from flask import Flask, jsonify, request
from flask_cors import CORS
import time  # For simulating processing time

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

@app.route('/api/process-users', methods=['POST'])
def process_users():
    try:
        users = request.json.get('users', [])
        
        # Python loop implementation (main requirement)
        processed_users = []
        for idx, user in enumerate(users, start=1):
            # Example processing:
            processed_user = {
                **user,
                "processed_by_python": True,
                "processing_order": idx,
                "processing_timestamp": time.time()
            }
            
            # Add some Python-specific data manipulation
            if "email" in user:
                processed_user["email_domain"] = user["email"].split("@")[-1]
            
            processed_users.append(processed_user)
        
        return jsonify({
            "success": True,
            "message": f"Processed {len(processed_users)} users",
            "users": processed_users,
            "stats": {
                "started_at": time.time(),
                "processing_time": f"{len(processed_users) * 0.1:.2f}ms (simulated)"
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "python_version": "3.x"  # Demonstrate Python execution
        }), 500

if __name__ == '__main__':
    app.run(port=5001)  # Different port from your Node.js server