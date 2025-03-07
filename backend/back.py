import uuid
from fastapi import FastAPI, HTTPException, Query
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends
from pymongo.server_api import ServerApi
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from passlib.context import CryptContext
from datetime import datetime
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta


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

@app.get("/chat-history/")
async def return_history(user_id: str = Depends(get_current_user), other_user_id: str = Query(...)):
    
    chat = chatcollection.find_one({
        "participants.userId": {"$all": [user_id, other_user_id]}
    })

    if not chat:
        raise HTTPException(status_code=404, detail="Chat history not found")

    return {
        "chatId": str(chat["_id"]),
        "messages": chat["messages"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)