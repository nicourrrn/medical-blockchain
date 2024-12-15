import jwt
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from ai import make_prediction
from crypto import InvalidNonce, InvalidSignature, NonceExpired
from crypto import get_nonce as c_get_nonce
from crypto import verify_signature as c_verify
from models import Sex, User, create_user, get_all_users, get_user, update_user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def encode_jwt(payload: dict) -> str:
    return jwt.encode(payload, "secret", algorithm="HS256")


def decode_jwt(token: str) -> dict:
    return jwt.decode(token, "secret", algorithms=["HS256"])
    # raise HTTPException(status_code=401, detail="Invalid token")


# Роут для отримання nonce
@app.get("/auth/nonce/{address}")
def get_nonce(address: str):
    return {"nonce": c_get_nonce(address)}


class VerifyRequest(BaseModel):
    address: str
    signature: str


@app.post("/auth/verify")
def verify_signature(request: VerifyRequest):
    try:
        # Verify the signature and retrieve the address
        address = c_verify(request.address, request.signature)
        
        # Check if the user already exists
        if not get_user(address):
            user = User(address=address)
            create_user(user)
        
        # Generate a token with the user's address and a new nonce
        return {
            "token": encode_jwt({"address": address, "nonce": c_get_nonce(address)})
        }
    except InvalidNonce:
        raise HTTPException(status_code=400, detail="Invalid nonce")
    except NonceExpired:
        raise HTTPException(status_code=400, detail="Nonce expired")
    except InvalidSignature:
        raise HTTPException(status_code=400, detail="Invalid signature")




@app.post("/auth/info")
async def post_user_info(user: User, authorization: str = Header(None)):
    if (payload := decode_jwt(authorization)) is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    update_user(payload["address"], user)

    return {
        "message": "User info saved successfully",
        "payment": make_prediction(
            user.age, user.bmi, user.smoker, user.children, user.sex == Sex.male
        ),
    }


@app.get("/auth/info")
async def get_user_info(authorization: str = Header(None)):
    payload = decode_jwt(authorization)
    user = get_user(payload["address"])
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert contract to proper format if exists
    if hasattr(user, 'contract') and user.contract:
        if isinstance(user.contract, dict):
            contract_data = user.contract
        else:
            contract_data = None
    else:
        contract_data = None

    user_data = user.dict()
    user_data['contract'] = contract_data
        
    return {
        "user": user_data,
        "payment": make_prediction(
            user.age, user.bmi, user.smoker, user.children, user.sex == Sex.male
        ),
    }

class Contract(BaseModel):
    address: str
    tokenId: Optional[str] = None


@app.post("/auth/upload_contract")
async def upload_contract(contract: Contract, authorization: str = Header(None)):
    try:
        wallet_address = decode_jwt(authorization)["address"]
        
        if (user := get_user(wallet_address)) is None:
            raise HTTPException(status_code=404, detail="User not found")

        # Store contract as a dictionary
        contract_data = {
            "address": contract.address,
            "tokenId": contract.tokenId
        }
        
        user.contract = contract_data
        update_user(wallet_address, user)
        
        return {
            "message": "Contract uploaded successfully",
            "contract": contract_data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/auth/info/feedback")
async def get_feedback():
    return get_all_users()
