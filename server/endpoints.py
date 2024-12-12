import jwt
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
        return {
            "token": encode_jwt(
                {"address": c_verify(request.address, request.signature)}
            )
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
        "paymant": make_prediction(
            user.age, user.bmi, user.smoker, user.children, user.sex == Sex.male
        ),
    }


@app.get("/auth/info")
async def get_user_info(authorization: str = Header(None)):
    payload = decode_jwt(authorization)
    user = get_user(payload["address"])
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user": user,
        "paymant": make_prediction(
            user.age, user.bmi, user.smoker, user.children, user.sex == Sex.male
        ),
    }


class Contract(BaseModel):
    address: str


@app.get("/auth/upload_contract")
async def upload_contract(contract: Contract, authorization: str = Header(None)):
    contract_address = contract.address

    address = decode_jwt(authorization)["address"]

    if (user := get_user(address)) is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.contract = contract_address
    update_user(address, user)
    return {"message": "Contract uploaded successfully"}


@app.get("/auth/info/feedback")
async def get_feedback():
    return get_all_users()
