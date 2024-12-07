from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from web3 import Web3
import random
from eth_account.messages import encode_defunct
import string
import time
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

w3 = Web3(Web3.HTTPProvider('https://eth-sepolia.g.alchemy.com/v2/Jqg2yAU17ZRbz5VjFoa9PfUL4BbxhCkS'))  # Replace with your provider

if not w3.is_connected():
    raise Exception("Web3 is not connected to a blockchain network!")

# Зберігання nonce для кожного гаманця
nonces = {}

# Функція для генерації випадкового nonce
def generate_nonce():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=16))

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
        signer_address = w3.eth.account.recover_message(encoded_message, signature=request.signature)
        print("Recovered Signer Address:", signer_address)
    except Exception as e:
        print("Error recovering signer address:", str(e))
        raise HTTPException(status_code=400, detail="Invalid signature")
    

    # Перевірка, чи співпадає адреса
    if signer_address.lower() == address.lower():
        del nonces[address]  # Видалити використаний nonce
        return {"message": "Login successful", "address": signer_address}
    else:
        raise HTTPException(status_code=401, detail="Invalid signature")
    
