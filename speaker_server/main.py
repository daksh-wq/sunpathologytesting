from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import torch
import torchaudio
from speechbrain.inference.speaker import EncoderClassifier
import numpy as np
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading ECAPA-TDNN Model...")
classifier = None
try:
    classifier = EncoderClassifier.from_hparams(
        source="speechbrain/spkrec-ecapa-voxceleb", 
        savedir="tmpdir"
    )
    print("ECAPA-TDNN Model loaded successfully.")
except Exception as e:
    print(f"Warning: Failed to load speechbrain model: {e}")
    print("Speaker verification will return mock data.")

baseline_embeddings = {}

import subprocess
import os
import uuid

def get_embedding(audio_bytes):
    if classifier is None:
        return np.ones(192)
        
    temp_id = str(uuid.uuid4())
    webm_path = f"temp_{temp_id}.webm"
    wav_path = f"temp_{temp_id}.wav"
    
    try:
        with open(webm_path, "wb") as f:
            f.write(audio_bytes)
            
        # Convert webm to 16kHz wav for speechbrain
        subprocess.run(
            ["ffmpeg", "-y", "-i", webm_path, "-ar", "16000", "-ac", "1", wav_path], 
            stdout=subprocess.DEVNULL, 
            stderr=subprocess.DEVNULL,
            check=True
        )
        
        signal, fs = torchaudio.load(wav_path)
        with torch.no_grad():
            embedding = classifier.encode_batch(signal)
            
        return embedding.squeeze().numpy()
    finally:
        # Cleanup
        if os.path.exists(webm_path): os.remove(webm_path)
        if os.path.exists(wav_path): os.remove(wav_path)

@app.post("/register_caller")
async def register_caller(call_id: str = Form(...), file: UploadFile = File(...)):
    print(f"Registering baseline voice for call: {call_id}")
    try:
        audio_bytes = await file.read()
        embedding = get_embedding(audio_bytes)
        baseline_embeddings[call_id] = embedding
        return {"status": "success"}
    except Exception as e:
        print("Registration Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/verify_chunk")
async def verify_chunk(call_id: str = Form(...), file: UploadFile = File(...)):
    if call_id not in baseline_embeddings:
        print(f"Warning: Baseline for {call_id} not found. Defaulting to high similarity to maintain call flow.")
        return {"status": "success", "similarity_score": 1.0}
        
    try:
        audio_bytes = await file.read()
        chunk_embedding = get_embedding(audio_bytes)
        
        baseline = baseline_embeddings[call_id]
        
        # Cosine similarity
        cos_sim = np.dot(baseline, chunk_embedding) / (np.linalg.norm(baseline) * np.linalg.norm(chunk_embedding))
        print(f"[{call_id}] Voice Similarity Score: {cos_sim:.2f}")
        return {"status": "success", "similarity_score": float(cos_sim)}
    except Exception as e:
        print("Verification Error:", e)
        # In case of short/corrupt chunk error, return 0.0 to reject
        return {"status": "success", "similarity_score": 0.0, "error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
