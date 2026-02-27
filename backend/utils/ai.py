import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

def get_spending_insights(expense_data: dict, month: str) -> str:
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        prompt = f"""
        You are a helpful personal finance advisor.
        Analyze this monthly expense breakdown for {month}: 
        {expense_data}
        Give exactly 3 specific actionable insights based on numbers.
        Mention real amounts. Be concise and friendly.
        Format: Return exactly 3 bullet points starting with an emoji.
        Max 150 words total.
        """
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            max_tokens=300
        )
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Groq error: {str(e)}")
        return f"Unable to generate insights: {str(e)}"