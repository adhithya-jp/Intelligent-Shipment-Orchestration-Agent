from pydantic import BaseModel, EmailStr, Field

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="Full name of the user, no PII leak in output.")
    email: EmailStr = Field(..., description="Valid email address for login.")
    password: str = Field(..., min_length=8, description="Raw password, must be strictly hashed before storing.")

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


