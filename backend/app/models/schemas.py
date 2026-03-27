from pydantic import BaseModel
from typing import Optional


class RegisterRequest(BaseModel):
    phone_number: str
    name: Optional[str]


class LoginRequest(BaseModel):
    phone_number: str


class CaseCreate(BaseModel):
    case_id: str
    claim_type: str
    user_id: str


class InterviewStart(BaseModel):
    case_uuid: str
    category: Optional[str]
    language: str