import uuid
from fastapi import HTTPException, status
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.schemas.auth import UserRegisterRequest, UserResponse, LoginRequest, TokenResponse
from app.core.logger import log

def authenticate_user(login_data: LoginRequest) -> TokenResponse:
    db = get_db()
    users_collection = db["users"]

    user = users_collection.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        log.warning(f"Failed login attempt for email: {login_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT tokens
    access_token = create_access_token(data={"sub": user["email"], "role": user["role"], "id": user["_id"]})
    refresh_token = create_refresh_token(data={"sub": user["email"]})

    log.info(f"User logged in successfully: {user['_id']}")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

def register_new_user(user_data: UserRegisterRequest) -> UserResponse:
    db = get_db()
    users_collection = db["users"]
    
    # 1. Check if user already exists
    if users_collection.find_one({"email": user_data.email}):
        log.warning(f"Registration failed: Email already exists ({user_data.email})")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    # 2. Map constraints and hash passwords internally (never expose plain text)
    user_dict = {
        "_id": str(uuid.uuid4()),
        "name": user_data.name,
        "email": user_data.email,
        "hashed_password": get_password_hash(user_data.password),
        "role": "user"  # Basic RBAC configuration defaults to standard 'user'
    }
    
    # 3. Save into Mongo and output to standard logging without bleeding PII internals
    users_collection.insert_one(user_dict)
    log.info(f"New user registered successfully: ID={user_dict['_id']}")
    
    return UserResponse(
        id=user_dict["_id"],
        name=user_dict["name"],
        email=user_dict["email"],
        role=user_dict["role"]
    )

