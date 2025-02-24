import ollama
import re
from django.http import JsonResponse
import json

def chat_batch(request):
    """
    Django API view to send a batch of 5 messages to Ollama and return only the extracted text inside square brackets.
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            messages = data.get("messages", [])

            # Ensure we are only sending 5 messages at a time
            if len(messages) > 5:
                return JsonResponse({"error": "You can send up to 5 messages per request."}, status=400)

            # Send batch request to Ollama
            response = ollama.chat("gemma:2b", messages=messages)

            # Extract response content
            full_text = response.get("message", {}).get("content", "")

            # Use regex to extract text inside square brackets
            match = re.search(r"\[(.*?)\]", full_text)

            # If found, return extracted text
            extracted_text = match.group(1) if match else "No bracketed text found."

            return JsonResponse({"extracted_text": extracted_text})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)


chat_batch('hello')