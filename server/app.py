import os
import random
import string
import time
from enum import Enum

import jwt
import numpy as np
import pandas as pd
import torch
from eth_account.messages import encode_defunct
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from torch import nn
from web3 import Web3


class Sex(Enum):
    male = 1
    female = 2


class User(BaseModel):
    address: str
    contract: str
    mail: str
    name: str
    age: int
    sex: Sex
    bmi: float
    children: int
    smoker: bool
    region: str


users: dict[str, User] = {}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

w3 = Web3(
    Web3.HTTPProvider(
        "https://eth-sepolia.g.alchemy.com/v2/Jqg2yAU17ZRbz5VjFoa9PfUL4BbxhCkS"
    )
)  # Replace with your provider

if not w3.is_connected():
    raise Exception("Web3 is not connected to a blockchain network!")

# Зберігання nonce для кожного гаманця
nonces = {}


# Функція для генерації випадкового nonce
def generate_nonce():
    return "".join(random.choices(string.ascii_letters + string.digits, k=16))


# Модель даних для запитів
class VerifyRequest(BaseModel):
    address: str
    signature: str


# Роут для отримання nonce
@app.get("/auth/nonce/{address}")
def get_nonce(address: str):
    address = w3.to_checksum_address(address)  # Перевірка валідності адреси
    nonce = generate_nonce()
    nonces[address] = {"nonce": nonce, "timestamp": time.time()}
    return {"nonce": nonce}


# Роут для перевірки підпису
@app.post("/auth/verify")
def verify_signature(request: VerifyRequest):
    address = w3.to_checksum_address(request.address)

    # Перевірка чи існує nonce
    if address not in nonces:
        raise HTTPException(status_code=400, detail="Invalid nonce")

    # Перевірка терміну дії nonce
    nonce_data = nonces[address]
    if time.time() - nonce_data["timestamp"] > 300:  # Nonce дійсний 5 хвилин
        del nonces[address]
        raise HTTPException(status_code=400, detail="Nonce expired")

    message = f"Login request: {nonce_data['nonce']}"
    message_hash = w3.solidity_keccak(["string"], [message])

    print("Message:", message)
    print("Message Hash:", message_hash.hex())

    # Create the EIP-191 encoded message
    encoded_message = encode_defunct(message_hash)

    try:
        signer_address = w3.eth.account.recover_message(
            encoded_message, signature=request.signature
        )
        print("Recovered Signer Address:", signer_address)
    except Exception as e:
        print("Error recovering signer address:", str(e))
        raise HTTPException(status_code=400, detail="Invalid signature")

    if signer_address.lower() == address.lower():
        del nonces[address]  # Видалити використаний nonce
        token = jwt.encode({"address": address}, "secret", algorithm="HS256")
        return {"message": "Login successful", "address": signer_address}
    else:
        raise HTTPException(status_code=401, detail="Invalid signature")


@app.post("/auth/info")
async def post_user_info(user: User):
    address = user.address
    if address not in users:
        users[address] = user
    return {"message": "User info saved successfully"}


@app.get("/auth/info")
async def get_user_info(authorization: str = Header(None)):
    try:
        payload = jwt.decode(
            authorization, "secret", algorithms=["HS256"]
        )  # Replace with your secret key
        address = payload["address"]
        return users[address]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


class Contract(BaseModel):
    address: str


@app.get("/auth/upload_contract")
async def upload_contract(contract: Contract, authorization: str = Header(None)):
    contract_address = contract.address

    try:
        payload = jwt.decode(authorization, "secret", algorithms=["HS256"])
        address = payload["address"]
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if address not in users:
        raise HTTPException(status_code=404, detail="User not found")

    users[address].contract = contract_address
    return {"message": "Contract uploaded successfully"}


device = (
    "cuda"
    if torch.cuda.is_available()
    else "mps" if torch.backends.mps.is_available() else "cpu"
)


class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.flatten = nn.Flatten()
        self.linear_relu_stack = nn.Sequential(
            nn.Linear(6, 36), nn.ReLU(), nn.Linear(36, 12), nn.ReLU(), nn.Linear(12, 1)
        )

    def forward(self, x):
        x = self.flatten(x)
        logits = self.linear_relu_stack(x)
        return logits


model = NeuralNetwork().to(device)
print(model)


@app.get("/auth/info/feedback")
async def get_feedback():
    return users
