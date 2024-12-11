import random
import string
import time

from eth_account.messages import encode_defunct
from web3 import Web3

w3 = Web3(
    Web3.HTTPProvider(
        "https://eth-sepolia.g.alchemy.com/v2/Jqg2yAU17ZRbz5VjFoa9PfUL4BbxhCkS"
    )
)

if not w3.is_connected():
    raise Exception("Web3 is not connected to a blockchain network!")

nonces = {}


def generate_nonce():
    return "".join(random.choices(string.ascii_letters + string.digits, k=16))


class InvalidNonce(Exception): ...


class NonceExpired(Exception): ...


class InvalidSignature(Exception): ...


def verify_signature(address: str, signature: str) -> str:
    address = w3.to_checksum_address(address)

    if address not in nonces:
        raise InvalidNonce

    nonce_data = nonces[address]
    if time.time() - nonce_data["timestamp"] > 300:
        del nonces[address]
        raise NonceExpired

    message = f"Login request: {nonce_data['nonce']}"
    message_hash = w3.solidity_keccak(["string"], [message])

    encoded_message = encode_defunct(message_hash)

    try:
        signer_address = w3.eth.account.recover_message(
            encoded_message, signature=signature
        )
    except Exception:
        raise InvalidSignature

    if signer_address.lower() == address.lower():
        del nonces[address]
        return address
    raise InvalidSignature


def get_nonce(address: str) -> str:
    address = w3.to_checksum_address(address)
    nonce = generate_nonce()
    nonces[address] = {"nonce": nonce, "timestamp": time.time()}
    return nonce
