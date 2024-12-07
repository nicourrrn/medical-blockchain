from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from web3 import Web3
import random
import string
import time

app = FastAPI()

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
    address = Web3.to_checksum_address(address)  # Перевірка валідності адреси
    nonce = generate_nonce()
    nonces[address] = {"nonce": nonce, "timestamp": time.time()}
    return {"nonce": nonce}

# Роут для перевірки підпису
@app.post("/auth/verify")
def verify_signature(request: VerifyRequest):
    address = Web3.to_checksum_address(request.address)

    # Перевірка чи існує nonce
    if address not in nonces:
        raise HTTPException(status_code=400, detail="Invalid nonce")

    # Перевірка терміну дії nonce
    nonce_data = nonces[address]
    if time.time() - nonce_data["timestamp"] > 300:  # Nonce дійсний 5 хвилин
        del nonces[address]
        raise HTTPException(status_code=400, detail="Nonce expired")

    # Повідомлення, яке користувач мав підписати
    message = f"Login request: {nonce_data['nonce']}"
    message_hash = Web3.solidityKeccak(["string"], [message])  # Хеш повідомлення

    # Відновлення адреси з підпису
    try:
        signer_address = Web3.eth.account.recover_message(
            message_hash,
            signature=request.signature
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Перевірка, чи співпадає адреса
    if signer_address.lower() == address.lower():
        del nonces[address]  # Видалити використаний nonce
        return {"message": "Login successful", "address": signer_address}
    else:
        raise HTTPException(status_code=401, detail="Invalid signature")
