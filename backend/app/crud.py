from sqlalchemy.orm import Session
from typing import Optional
from . import models, schemas, auth
from datetime import datetime

# Funciones CRUD para usuarios
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_employee_number(db: Session, employee_number: str):
    return db.query(models.User).filter(models.User.employee_number == employee_number).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        employee_number=user.employee_number,
        first_name=user.first_name,
        last_name=user.last_name,
        contact=user.contact,
        image_url=user.image_url,
        hashed_password=hashed_password
        # isAdmin se puede establecer en una ruta de admin separada si es necesario
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Nueva función para que un usuario actualice su propio perfil
def update_user_profile(db: Session, user_id: int, user_data: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if not db_user:
        return None # O lanzar excepción si se prefiere

    update_data = user_data.dict(exclude_unset=True) # Obtener solo los campos proporcionados

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user

# Funciones CRUD para Works
def get_works(db: Session, user_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Work)
    if user_id is not None:
        query = query.filter(models.Work.user_id == user_id)
    return query.offset(skip).limit(limit).all()

def get_work(db: Session, work_id: int):
    return db.query(models.Work).filter(models.Work.id == work_id).first()

def create_work(db: Session, work: schemas.WorkCreate, user_id: int):
    # Validar unicidad por número de obra
    existe = db.query(models.Work).filter(models.Work.work_number == work.work_number).first()
    if existe:
        raise Exception("Ya existe una obra con ese número")
    
    db_work = models.Work(
        work_number=work.work_number,
        title=work.title,
        description=work.description,
        user_id=user_id,
        status="active"
    )
    db.add(db_work)
    db.commit()
    db.refresh(db_work)
    return db_work

def update_work(db: Session, work_id: int, work_data: schemas.WorkCreate, user_id: int):
    db_work = get_work(db, work_id)
    if db_work and db_work.user_id == user_id:
        for key, value in work_data.dict().items():
            setattr(db_work, key, value)
        db_work.updated_at = datetime.now()
        db.commit()
        db.refresh(db_work)
    return db_work

def delete_work(db: Session, work_id: int, user_id: int):
    db_work = get_work(db, work_id)
    if db_work and db_work.user_id == user_id:
        db.delete(db_work)
        db.commit()
        return True
    return False


