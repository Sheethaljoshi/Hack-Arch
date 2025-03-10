
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import random
import asyncio
from openai import OpenAI  # Added OpenAI for tone transformation
from dotenv import load_dotenv

import os
load_dotenv()


app = FastAPI()

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set OpenAI API Key

load_dotenv()

MODEL = "gpt-4o-mini"
openai = OpenAI()

# List of possible tones
tones = ["Paranoid", "Frustrated", "Sarcastic", "Shakespearean", "Sad", "Formal", "Over-the-Top Dramatic", "Fake Cheerful Madness", "Chaotic Villain", "Descriptive"]

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, username: str):
        """Accepts a new WebSocket connection."""
        await websocket.accept()
        self.active_connections[username] = websocket
        print(f"{username} joined the chat.")

    def disconnect(self, username: str):
        """Removes a user from active connections when they disconnect."""
        if username in self.active_connections:
            del self.active_connections[username]
            print(f"❌ {username} left the chat.")

    async def transform_message(self, message: str, tone: str):
            
        """Uses OpenAI to change the tone of the message correctly."""
        try:
            response = openai.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": f"Rewrite the following message in a {tone} tone without changing its meaning."},
                    {"role": "user", "content": message},
                ],
            )
            transformed_message = response.choices[0].message.content  # ✅ Corrected syntax
            print(f"🔄 Transformed Message: {transformed_message}")
            return transformed_message.strip()
        except Exception as e:
            print(f"❌ Error transforming message: {e}")
            return message  # Return original message if transformation fails


    async def send_private_message(self, sender: str, message: str):
        """Sends a private message from sender to a randomly selected recipient with a transformed tone."""
        recipient = self.get_random_user(sender)
        if not recipient:
            await self.active_connections[sender].send_text("❌ No other users available to receive the message.")
            print(f"❌ No other users available for {sender}. Message not sent.")
            return
        
        # Randomly decide whether to change the tone
        change_tone = random.choice([True, False])
        tone = random.choice(tones) if change_tone else "Normal"
        transformed_message = await self.transform_message(message, tone) if change_tone else message

        print(f"📩 Sending message from {sender} to {recipient} with tone '{tone}': {transformed_message}")
        
        try:
            # Ensure the recipient exists in active connections before sending
            if recipient in self.active_connections:
                await self.active_connections[recipient].send_text(f"[Received] {sender}: {transformed_message}")
                print(f"✅ Message sent to {recipient}")
            
            # Ensure sender also sees their sent message
            if sender in self.active_connections:
                await self.active_connections[sender].send_text(f"[Sent to {recipient}] {transformed_message}")  
                print(f"✅ Sender {sender} confirmed message sent.")

        except Exception as e:
            print(f"❌ Error sending message: {e}")

    def get_random_user(self, sender_username: str):
        """Selects a truly random user from active connections excluding the sender."""
        users = [user for user in self.active_connections.keys() if user != sender_username]
        if users:
            selected = random.choice(users)
            print(f"🎯 Randomly selected recipient: {selected}")
            return selected
        return None

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await manager.connect(websocket, username)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_private_message(username, data)
    except WebSocketDisconnect:
        manager.disconnect(username)

manager = ConnectionManager()
