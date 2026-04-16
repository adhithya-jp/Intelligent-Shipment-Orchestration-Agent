from fastapi import APIRouter, status
from app.schemas.auth import LoginRequest, TokenResponse, UserRegisterRequest, UserResponse
from app.services.auth_service import authenticate_user, register_new_user

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegisterRequest):
    """
    Register a new user.
    """
    return register_new_user(user_data)

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(login_data: LoginRequest):
    """
    Authenticate a user and return access and refresh tokens.
    """
    return authenticate_user(login_data)
