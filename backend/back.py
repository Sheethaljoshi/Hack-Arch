import os
import random
import uuid
import cv2
import openai
from fastapi import BackgroundTasks, FastAPI, HTTPException, File, Query, UploadFile, Form
from pymongo import MongoClient
from io import BytesIO
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends
from pymongo.server_api import ServerApi
import base64
from fastapi.responses import JSONResponse, StreamingResponse
import requests
from typing import Optional
from pydantic import BaseModel
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from passlib.context import CryptContext
from datetime import datetime
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
import json
from io import BytesIO
from pymongo import MongoClient
from openai import OpenAI


SECRET_KEY = "secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


uri = "mongodb+srv://sh33thal24:kFe6Pba9pECA1vly@cluster0.o8pfg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(uri, server_api=ServerApi('1'))


try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)


db = client["ChatDB"] 
chatcollection = db["Chats"] 
usercollection = db["Users"]

app= FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (use ["http://localhost:3000"] for security)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Helper Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")


# Register Endpoint (Query Parameters)
@app.post("/register")
async def register(name: str, email: str, password: str):
    existing_user = usercollection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already created with this email")
    
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(password)
    user_doc = {
        "name": name,
        "email": email,
        "passwordHash": hashed_password,
        "userId": user_id,
        "createdAt": datetime.utcnow()
    }

    usercollection.insert_one(user_doc)
    return {"message": "User registered successfully", "userId": user_id}


@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db_user = usercollection.find_one({"email": form_data.username})
    if not db_user or not verify_password(form_data.password, db_user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    user_id = db_user["userId"]
    access_token = create_access_token(data={"sub": user_id})

    return {"message": "Login successful" ,"access_token": access_token, "token_type": "bearer"}

@app.post("/create-chat")
def create_chat(email: str = Query(..., description="Recipient's email"),user_id: str = Depends(get_current_user)):
    recipient = usercollection.find_one({"email": email})
    
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient user does not exist.")
    
    recipient_user_id = recipient["userId"]
    
    existing_chat = chatcollection.find_one({
        "participants": {"$all": [
            {"userId": user_id},
            {"userId": recipient_user_id}
        ]}
    })
    
    if existing_chat:
        return {"message": "Chat already exists.", "chatId": str(existing_chat["_id"])}
    
    new_chat = {
        "participants": [
            {"userId": user_id},
            {"userId": recipient_user_id}
        ],
        "messages": [],
        "lastUpdated": datetime.utcnow()
    }
    
    result = chatcollection.insert_one(new_chat)
    return {"message": "Chat created successfully.", "chatId": str(result.inserted_id)}

def export_and_upload_to_vector_store(user_id_1, user_id_2):
    def export_to_json():
        # Fetch chat history only for the specified users
        data = list(chatcollection.find({
            "participants.userId": {"$all": [user_id_1, user_id_2]}
        }))

        # Convert ObjectId to string for JSON serialization
        for item in data:
            item['_id'] = str(item['_id'])  # Convert ObjectId to string

            def json_serializer(obj):
                if isinstance(obj, datetime):
                    return obj.isoformat()
                raise TypeError(f"Type {type(obj)} not serializable")

        json_bytes = json.dumps(data, default=json_serializer).encode('utf-8')
        return BytesIO(json_bytes)

    def create_file(file_contents):
        client = OpenAI()
        file3 = client.files.create(
            file=("data.json", file_contents, "application/json"),
            purpose="assistants"
        )
        return file3

    def create_and_upload_vector_store_file(file_id):
        client = OpenAI()
        
        vector_store_id = 'vs_67ca8600e3f4819181f166cbd3dbb418'  # Your vector store ID
        
        # Delete existing vector store files
        vector_store_files = client.beta.vector_stores.files.list(vector_store_id=vector_store_id)
        for vector_store_file in vector_store_files:
            deleted = client.beta.vector_stores.files.delete(
                vector_store_id=vector_store_id,
                file_id=vector_store_file.id
            )
            print("Deleted:", deleted.id)
        
        # Upload new file
        vector_store_file = client.beta.vector_stores.files.create(
            vector_store_id=vector_store_id,
            file_id=file_id
        )

        print(client.beta.vector_stores.files.list(vector_store_id=vector_store_id))

        return vector_store_file

    json_file_contents = export_to_json()
    created_file = create_file(json_file_contents)
    vector_store_file = create_and_upload_vector_store_file(created_file.id)

    print(vector_store_file)
    client = OpenAI()
    assistant = client.beta.assistants.create(
        name="Personal Helper",
        instructions="You are given  a file with the chat history of two users. Read their conversation carefully and generate a response to the last message that maintains the same tone and style but introduces an element of confusion. The response should feel natural within the context of the conversation, making the other user question whether it was genuinely sent by the original participant. It should not be random or obviously AI-generated but subtly strange enough to create confusion. The generated response should be based on the previous texts between the users. Do not include any explanations—only output the generated text.",
        model="gpt-4o",
        tools=[{"type": "file_search"}],
    )

    assistant = client.beta.assistants.update(
        assistant_id=assistant.id,
        tool_resources={"file_search": {"vector_store_ids": ['vs_67ca8600e3f4819181f166cbd3dbb418']}},
    )

    thread = client.beta.threads.create(
        messages=[
            {
                "role": "assistant",
                "content": "You are given  a file with the chat history of two users. Read their conversation carefully and generate a response to the last message that maintains the same tone and style but introduces an element of confusion. The response should feel natural within the context of the conversation, making the other user question whether it was genuinely sent by the original participant. It should not be random or obviously AI-generated but subtly strange enough to create confusion. The generated response should be based on the previous texts between the users. Do not include any explanations—only output the generated text."
            },
            {
                "role": "user",
                "content": "You are given  a file with the chat history of two users. Read their conversation carefully and generate a response to the last message that maintains the same tone and style but introduces an element of confusion. The response should feel natural within the context of the conversation, making the other user question whether it was genuinely sent by the original participant. It should not be random or obviously AI-generated but subtly strange enough to create confusion. The generated response should be based on the previous texts between the users. Do not include any explanations—only output the generated text."
            },
        ]
    )

    run = client.beta.threads.runs.create_and_poll(
        thread_id=thread.id,
        assistant_id=assistant.id,
        instructions="You are given a file with the chat history of two users. Read their conversation carefully and generate a response to the last message that maintains the same tone and style but introduces an element of confusion. The response should feel natural within the context of the conversation, making the other user question whether it was genuinely sent by the original participant. It should not be random or obviously AI-generated but subtly strange enough to create confusion. The generated response should be based on the previous texts between the users. Do not include any explanations—only output the generated text.",

    )

    if run.status == 'completed':
        messages = client.beta.threads.messages.list(
            thread_id=thread.id,
            run_id=run.id
        )
        answer = messages.data[0].content[0].text.value
        return answer


@app.post("/export_and_upload")
def export_and_upload_to_vector_store(user_id_1: str = Query(...), user_id_2: str = Query(...)):
    def export_to_json():
        data = list(chatcollection.find({
            "participants.userId": {"$all": [user_id_1, user_id_2]}
        }))

        for item in data:
            item['_id'] = str(item['_id'])

        def json_serializer(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f"Type {type(obj)} not serializable")

        json_bytes = json.dumps(data, default=json_serializer).encode('utf-8')
        return BytesIO(json_bytes)

    def create_file(file_contents):
        client = OpenAI()
        file3 = client.files.create(
            file=("data.json", file_contents, "application/json"),
            purpose="assistants"
        )
        return file3

    def create_and_upload_vector_store_file(file_id):
        client = OpenAI()
        vector_store_id = 'vs_67ca8600e3f4819181f166cbd3dbb418'
        
        vector_store_files = client.beta.vector_stores.files.list(vector_store_id=vector_store_id)
        for vector_store_file in vector_store_files:
            client.beta.vector_stores.files.delete(
                vector_store_id=vector_store_id,
                file_id=vector_store_file.id
            )
        
        vector_store_file = client.beta.vector_stores.files.create(
            vector_store_id=vector_store_id,
            file_id=file_id
        )
        return vector_store_file

    json_file_contents = export_to_json()
    created_file = create_file(json_file_contents)
    vector_store_file = create_and_upload_vector_store_file(created_file.id)

    client = OpenAI()
    assistant = client.beta.assistants.create(
        name="Personal Helper",
        instructions="You are given  a file with the chat history of two users. Read their conversation carefully and generate a response to the last message that maintains the same tone and style but introduces an element of confusion. The response should feel natural within the context of the conversation, making the other user question whether it was genuinely sent by the original participant. It should not be random or obviously AI-generated but subtly strange enough to create confusion. The generated response should be based on the previous texts between the users. Do not include any explanations—only output the generated text.",
        model="gpt-4o",
        tools=[{"type": "file_search"}],
    )

    assistant = client.beta.assistants.update(
        assistant_id=assistant.id,
        tool_resources={"file_search": {"vector_store_ids": ['vs_67ca8600e3f4819181f166cbd3dbb418']}}
    )

    thread = client.beta.threads.create(
        messages=[
            {"role": "assistant",  "content": "You are given  a file with the chat history of two users. Read their conversation carefully and generate a response to the last message that maintains the same tone and style but introduces an element of confusion. The response should feel natural within the context of the conversation, making the other user question whether it was genuinely sent by the original participant. It should not be random or obviously AI-generated but subtly strange enough to create confusion. The generated response should be based on the previous texts between the users. Do not include any explanations—only output the generated text."},
            {"role": "user",  "content": "You are given  a file with the chat history of two users. Read their conversation carefully and generate a response to the last message that maintains the same tone and style but introduces an element of confusion. The response should feel natural within the context of the conversation, making the other user question whether it was genuinely sent by the original participant. It should not be random or obviously AI-generated but subtly strange enough to create confusion. The generated response should be based on the previous texts between the users. Do not include any explanations—only output the generated text."},
        ]
    )

    run = client.beta.threads.runs.create_and_poll(
        thread_id=thread.id,
        assistant_id=assistant.id,
        instructions="You are given  a file with the chat history of two users. Read their conversation carefully and generate a response to the last message that maintains the same tone and style but introduces an element of confusion. The response should feel natural within the context of the conversation, making the other user question whether it was genuinely sent by the original participant. It should not be random or obviously AI-generated but subtly strange enough to create confusion. The generated response should be based on the previous texts between the users. Do not include any explanations—only output the generated text.",
    )

    if run.status == 'completed':
        messages = client.beta.threads.messages.list(
            thread_id=thread.id,
            run_id=run.id
        )
        answer = messages.data[0].content[0].text.value
        return {"response": answer}
    else:
        return {"error": "Run did not complete successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)