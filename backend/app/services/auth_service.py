import uuid
from fastapi import HTTPException, status
from app.core.database import get_db
from app.core.security import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    create_refresh_token,
    encrypt_field,
    decrypt_field,
    get_deterministic_hash
)
from app.schemas.auth import UserRegisterRequest, UserResponse, LoginRequest, TokenResponse
from app.core.logger import log

def authenticate_user(login_data: LoginRequest) -> TokenResponse:
    db = get_db()
    users_collection = db["users"]

    email_hash = get_deterministic_hash(login_data.email)
    user = users_collection.find_one({"email_hash": email_hash})
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        log.warning(f"Failed login attempt for email hash: {email_hash}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Reconstruct decrypted email for claims if necessary, though user provided it
    user_email = login_data.email

    # Generate JWT tokens
    access_token = create_access_token(data={"sub": user_email, "role": user["role"], "id": user["_id"]})
    refresh_token = create_refresh_token(data={"sub": user_email})

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
    email_hash = get_deterministic_hash(user_data.email)
    if users_collection.find_one({"email_hash": email_hash}):
        log.warning(f"Registration failed: Email hash already exists ({email_hash})")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    # 2. Map constraints and hash passwords internally (never expose plain text)
    # Encrypt sensitive fields: email, phone, address
    user_dict = {
        "_id": str(uuid.uuid4()),
        "name": user_data.name,
        "email_encrypted": encrypt_field(user_data.email),
        "email_hash": email_hash,
        "phone_encrypted": encrypt_field(user_data.phone) if user_data.phone else None,
        "address_encrypted": encrypt_field(user_data.address) if user_data.address else None,
        "hashed_password": get_password_hash(user_data.password),
        "role": "user"  # Basic RBAC configuration defaults to standard 'user'
    }
    
    # 3. Save into Mongo and output to standard logging without bleeding PII internals
    users_collection.insert_one(user_dict)
    log.info(f"New user registered successfully: ID={user_dict['_id']}")
    
    return UserResponse(
        id=user_dict["_id"],
        name=user_dict["name"],
        email=decrypt_field(user_dict["email_encrypted"]),
        phone=decrypt_field(user_dict["phone_encrypted"]) if user_dict.get("phone_encrypted") else None,
        address=decrypt_field(user_dict["address_encrypted"]) if user_dict.get("address_encrypted") else None,
        role=user_dict["role"]
    )

