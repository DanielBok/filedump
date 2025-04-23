# File: app/main.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
import os
import json
from datetime import datetime
from typing import List, Optional
import aiofiles
from pydantic import BaseModel
import azure.identity
from azure.ai.openai import AsyncAzureOpenAI, ChatMessage, AsyncAzureOpenAIChatExtension

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration (should be in environment variables for production)
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create Azure OpenAI client
def get_azure_client():
    if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="Azure OpenAI credentials not configured"
        )
    
    client = AsyncAzureOpenAI(
        endpoint=AZURE_OPENAI_ENDPOINT,
        api_key=AZURE_OPENAI_API_KEY
    )
    
    return client

# Models
class Artifact(BaseModel):
    id: str
    title: str
    type: str
    content: str
    language: Optional[str] = None

class Message(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime
    artifacts: Optional[List[Artifact]] = None

class Conversation(BaseModel):
    id: str
    title: str
    messages: List[Message]
    created_at: datetime
    updated_at: datetime

# In-memory data store (should be a database in production)
conversations = {}

# Load existing conversations if available
conversation_file = "conversations.json"
try:
    if os.path.exists(conversation_file):
        with open(conversation_file, "r") as f:
            conversations_data = json.load(f)
            for conv_id, conv_data in conversations_data.items():
                # Convert string timestamps to datetime objects
                conv_data["created_at"] = datetime.fromisoformat(conv_data["created_at"])
                conv_data["updated_at"] = datetime.fromisoformat(conv_data["updated_at"])
                for msg in conv_data["messages"]:
                    msg["timestamp"] = datetime.fromisoformat(msg["timestamp"])
                conversations[conv_id] = conv_data
except Exception as e:
    print(f"Error loading conversations: {e}")

# Save conversations to file
def save_conversations():
    try:
        with open(conversation_file, "w") as f:
            # Convert datetime objects to ISO format strings
            serializable_convs = {}
            for conv_id, conv_data in conversations.items():
                serializable_conv = conv_data.copy()
                serializable_conv["created_at"] = conv_data["created_at"].isoformat()
                serializable_conv["updated_at"] = conv_data["updated_at"].isoformat()
                serializable_conv["messages"] = []
                for msg in conv_data["messages"]:
                    serializable_msg = msg.copy()
                    serializable_msg["timestamp"] = msg["timestamp"].isoformat()
                    serializable_conv["messages"].append(serializable_msg)
                serializable_convs[conv_id] = serializable_conv
            json.dump(serializable_convs, f, indent=2)
    except Exception as e:
        print(f"Error saving conversations: {e}")

# Routes
@app.get("/api/conversations")
async def get_conversations():
    return [
        {
            "id": conv_id,
            "title": conv["title"],
            "created_at": conv["created_at"].isoformat(),
            "updated_at": conv["updated_at"].isoformat(),
            "message_count": len(conv["messages"])
        }
        for conv_id, conv in conversations.items()
    ]

@app.get("/api/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conv = conversations[conversation_id]
    return {
        "id": conversation_id,
        "title": conv["title"],
        "messages": conv["messages"],
        "created_at": conv["created_at"].isoformat(),
        "updated_at": conv["updated_at"].isoformat()
    }

@app.post("/api/conversations")
async def create_conversation():
    conv_id = str(uuid.uuid4())
    now = datetime.now()
    
    conversations[conv_id] = {
        "id": conv_id,
        "title": "New conversation",
        "messages": [],
        "created_at": now,
        "updated_at": now
    }
    
    save_conversations()
    
    return {
        "id": conv_id,
        "title": "New conversation",
        "messages": [],
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }

@app.post("/api/chat/message")
async def send_message(
    message: str = Form(...),
    conversation_id: str = Form(...),
    files: List[UploadFile] = File([]),
    client: AsyncAzureOpenAI = Depends(get_azure_client)
):
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conv = conversations[conversation_id]
    now = datetime.now()
    
    # Process file uploads
    uploaded_files = []
    for file in files:
        file_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_ext}")
        
        # Save the file
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
        
        uploaded_files.append({
            "id": file_id,
            "name": file.filename,
            "path": file_path,
            "content_type": file.content_type
        })
    
    # Create user message
    user_message_id = str(uuid.uuid4())
    user_message = {
        "id": user_message_id,
        "role": "user",
        "content": message,
        "timestamp": now,
        "files": uploaded_files if uploaded_files else None
    }
    
    # Add user message to conversation
    conv["messages"].append(user_message)
    conv["updated_at"] = now
    
    # Prepare conversation history for API
    history = []
    for msg in conv["messages"]:
        if msg["role"] in ["user", "assistant"]:
            file_content = ""
            if msg["role"] == "user" and msg.get("files"):
                # Add file information for context
                file_content = "\n\nUploaded files:\n"
                for file in msg["files"]:
                    file_content += f"- {file['name']} ({file['content_type']})\n"
            
            history.append(
                ChatMessage(
                    role=msg["role"],
                    content=msg["content"] + file_content
                )
            )
    
    try:
        # Call Azure OpenAI API
        response = await client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT,
            messages=history,
            temperature=0.7,
            max_tokens=1000
        )
        
        assistant_response = response.choices[0].message.content
        
        # Process the response for artifacts
        artifacts = []
        
        # Extract artifacts from assistant response (this is a simplified example)
        # In a real system, you'd use a more robust approach to extract artifact blocks
        if "```" in assistant_response:
            code_blocks = assistant_response.split("```")
            for i in range(1, len(code_blocks), 2):
                if i < len(code_blocks):
                    code_content = code_blocks[i].strip()
                    language = ""
                    
                    # Extract language if specified
                    if " " in code_content.split("\n")[0]:
                        language = code_content.split("\n")[0].strip()
                        code_content = "\n".join(code_content.split("\n")[1:])
                    
                    artifact_id = str(uuid.uuid4())
                    artifact = {
                        "id": artifact_id,
                        "title": f"Code snippet ({language})" if language else "Code snippet",
                        "type": "application/vnd.ant.code",
                        "content": code_content,
                        "language": language
                    }
                    artifacts.append(artifact)
                    
                    # Replace code block in response with reference to artifact
                    code_blocks[i] = f"[Code artifact: {artifact_id}]"
            
            # Reconstruct the response
            assistant_response = "".join(code_blocks)
        
        # Create assistant message
        assistant_message = {
            "id": str(uuid.uuid4()),
            "role": "assistant",
            "content": assistant_response,
            "timestamp": datetime.now(),
            "artifacts": artifacts if artifacts else None
        }
        
        # Add assistant message to conversation
        conv["messages"].append(assistant_message)
        conv["updated_at"] = datetime.now()
        
        # Update conversation title if it's the first exchange
        if len(conv["messages"]) == 2:
            # Extract a title from the conversation
            title_response = await client.chat.completions.create(
                model=AZURE_OPENAI_DEPLOYMENT,
                messages=[
                    ChatMessage(
                        role="system",
                        content="Generate a short, concise title (max 6 words) for this conversation based on the user's message."
                    ),
                    ChatMessage(
                        role="user",
                        content=message
                    )
                ],
                temperature=0.7,
                max_tokens=20
            )
            
            new_title = title_response.choices[0].message.content.strip().strip('"')
            conv["title"] = new_title
        
        save_conversations()
        
        return {
            "conversation": {
                "id": conversation_id,
                "title": conv["title"],
                "messages": conv["messages"],
                "created_at": conv["created_at"].isoformat(),
                "updated_at": conv["updated_at"].isoformat()
            }
        }
        
    except Exception as e:
        # Remove user message in case of error
        conv["messages"].pop()
        save_conversations()
        raise HTTPException(status_code=500, detail=f"Error calling Azure OpenAI API: {str(e)}")

# File uploads endpoint
@app.post("/api/uploads")
async def upload_file(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_ext}")
    
    # Save the file
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    return {
        "id": file_id,
        "name": file.filename,
        "path": file_path,
        "content_type": file.content_type,
        "url": f"/api/uploads/{file_id}{file_ext}"
    }

# Serve uploaded files
@app.get("/api/uploads/{filename}")
async def get_upload(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)