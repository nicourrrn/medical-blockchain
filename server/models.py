from enum import Enum

from pydantic import BaseModel


class Sex(Enum):
    male = 1
    female = 2


class Region(Enum):
    southwest = "southwest"
    southeast = "southeast"
    northwest = "northwest"
    northeast = "northeast"


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
    region: Region


users: dict[str, User] = {}


def create_user(user: User):
    address = user.address
    if address not in users:
        users[address] = user


def get_user(address: str) -> User | None:
    return users.get(address, None)


def update_user(address: str, user: User):
    users[address] = user


def get_all_users():
    return users
