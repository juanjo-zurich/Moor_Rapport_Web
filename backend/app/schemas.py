import re
from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, Union
from datetime import datetime

# Regex simple para validar teléfono (ajustar según necesidad)
# Este ejemplo busca formatos como + prefijo y luego 9 o más dígitos
PHONE_REGEX = r"^\+?[1-9]\d{1,14}$" # E.164 format simplified
# Regex para email
EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

class UserBase(BaseModel):
    employee_number: str
    first_name: str
    last_name: str
    contact: str
    isAdmin: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
     employee_number: str
     password: str

class UserPublic(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

# Nuevo esquema para actualizar el perfil del usuario
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact: Optional[str] = None
    image_url: Optional[str] = None

    @validator('contact', pre=True, always=True)
    def contact_must_be_email_or_phone_if_provided(cls, v):
        if v is None:
            return v # Permitir no actualizar el contacto
        is_email = re.fullmatch(EMAIL_REGEX, v)
        is_phone = re.fullmatch(PHONE_REGEX, v)
        if not is_email and not is_phone:
            raise ValueError('El contacto debe ser un email o número de teléfono válido')
        return v

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    employee_number: Optional[str] = None

class WorkBase(BaseModel):
    work_number: str
    title: str
    description: str

class WorkCreate(WorkBase):
    pass

class Work(WorkBase):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: int

    class Config:
        from_attributes = True

