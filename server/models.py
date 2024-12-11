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
    contract: str | None = None
    mail: str = ""
    name: str = ""
    age: int = 0
    sex: Sex = Sex.male
    bmi: float = 0.0
    children: int = 0
    smoker: bool = False
    region: Region = Region.southwest


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
