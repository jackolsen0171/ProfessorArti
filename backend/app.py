import os
import re
from openai import OpenAI
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
client = OpenAI();

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# ------------------ Custom Logic ------------------
def create_custom_prompt(user_input: str) -> str:
    """
    Check if user wants a practice exam, parse the number of questions via regex,
    and build a custom prompt. Otherwise, return the user_input as-is.
    """
    if "practice exam" in user_input.lower():
        match = re.search(r"\b(\d+)\b", user_input)
        if match:
            number_of_questions = int(match.group(1))
            custom_prompt = (
                f"Please create a {number_of_questions}-question practice exam. "
                f"The user specifically wrote: '{user_input}'. "
                "Make sure your response includes exactly that many questions."
            )
        else:
            custom_prompt = (
                f"Please create a practice exam. The user wrote: '{user_input}'. "
                "No specific number of questions was found, so use your best judgment."
            )
        return custom_prompt
    else:
        return user_input

# ------------------ Routes ------------------
@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.form.get("user_input", "").strip()
    if not user_input:
        return jsonify({"error": "No user input provided"}), 400

    prompt_to_send = create_custom_prompt(user_input)
    
    try:
        
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant."},
                {"role": "user", "content": prompt_to_send}
            ],
            temperature=0.7
        )

        print(completion.choices[0].message)

        response_text = completion.choices[0].message.content
        print("response_text: " + response_text)
        
        return jsonify({"response": response_text})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
