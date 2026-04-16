from pydantic import BaseModel, EmailStr, Field

from typing import Optional

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="Full name of the user, no PII leak in output.")
    email: EmailStr = Field(..., description="Valid email address for login.")
    password: str = Field(..., min_length=8, description="Raw password, must be strictly hashed before storing.")
    phone: Optional[str] = Field(None, description="Optional phone number, will be encrypted at rest.")
    address: Optional[str] = Field(None, description="Optional address, will be encrypted at rest.")

class UserResponse(BaseModel):
    id: str
    name: str = Field(..., exclude=True, description="Excluded as PII")
    email: EmailStr = Field(..., exclude=True, description="Excluded as PII")
    phone: Optional[str] = Field(None, exclude=True, description="Excluded as PII")
    address: Optional[str] = Field(None, exclude=True, description="Excluded as PII")
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


