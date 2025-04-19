import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from . import schemas, models, crud, database

load_dotenv()

# Configuración de Seguridad
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Contexto para Hashing de Contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Esquema OAuth2 para el endpoint de login
# Apunta a la URL donde el cliente puede obtener el token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        employee_number: str = payload.get("sub") # 'sub' es el campo estándar para el sujeto del token
        if employee_number is None:
            raise credentials_exception
        token_data = schemas.TokenData(employee_number=employee_number)
    except JWTError:
        raise credentials_exception

    user = crud.get_user_by_employee_number(db, employee_number=token_data.employee_number)
    if user is None:
        raise credentials_exception
    if not user.is_active:
         raise HTTPException(status_code=400, detail="Inactive user")
    return user

# Dependencia para obtener el usuario activo actual (simplifica las rutas protegidas)
async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    # Podrías añadir más chequeos aquí si fuera necesario (ej. roles)
    return current_user

# Dependencia para verificar si el usuario es administrador
async def get_current_admin_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.isAdmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos de administrador",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user