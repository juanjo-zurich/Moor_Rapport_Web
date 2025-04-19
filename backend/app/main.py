from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from typing import List, Optional # Importar Optional

from . import crud, models, schemas, auth, database
from .init_db import init_db

# Crea las tablas en la base de datos (si no existen)
# En producción, es mejor usar Alembic para migraciones
models.Base.metadata.create_all(bind=database.engine)

# Inicializar la base de datos con usuario administrador por defecto
init_db()

app = FastAPI(title="Mi App con Auth", version="0.1.0")

# Configuración de CORS
# Ajusta origins según tus necesidades ( '*' es inseguro para producción)
origins = [
    "http://localhost:5173", # Puerto por defecto de Vite para Vue
    "http://127.0.0.1:5173",
    # Añade la URL de tu frontend desplegado en Netlify aquí
    # "https://tu-app-frontend.netlify.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Permite estos orígenes
    allow_credentials=True,
    allow_methods=["*"], # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"], # Permite todas las cabeceras
)

# --- Rutas de Autenticación ---

@app.post("/api/v1/auth/register", response_model=schemas.UserPublic, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_employee_number(db, employee_number=user.employee_number)
    if db_user:
        raise HTTPException(status_code=400, detail="Número de empleado ya registrado")
    # Aquí podrías añadir más validaciones (ej. complejidad contraseña)
    created_user = crud.create_user(db=db, user=user)
    return created_user

@app.post("/api/v1/auth/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # OAuth2PasswordRequestForm espera 'username' y 'password'
    # Mapeamos 'username' a nuestro 'employee_number'
    user = crud.get_user_by_employee_number(db, employee_number=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Número de empleado o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
         raise HTTPException(status_code=400, detail="Usuario inactivo")

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.employee_number}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Rutas Protegidas ---

@app.get("/api/v1/users/me", response_model=schemas.UserPublic)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    # La dependencia get_current_active_user ya valida el token y retorna el usuario
    return current_user

# Nuevo endpoint para que el usuario actualice su perfil
@app.put("/api/v1/users/me", response_model=schemas.UserPublic)
async def update_current_user_profile(
    user_data: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    updated_user = crud.update_user_profile(db, user_id=current_user.id, user_data=user_data)
    if not updated_user:
        # Esto no debería ocurrir si el token es válido, pero por si acaso
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return updated_user

# Ruta de ejemplo adicional (opcional)
@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}

# --- Rutas de Administración ---

@app.get("/api/v1/admin/users", response_model=List[schemas.UserPublic])
async def get_all_users(current_admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(database.get_db)):
    users = crud.get_users(db)
    return users

@app.get("/api/v1/admin/users/{user_id}", response_model=schemas.UserPublic)
async def get_user_by_id(user_id: int, current_admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(database.get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@app.put("/api/v1/admin/users/{user_id}", response_model=schemas.UserPublic)
async def update_user(user_id: int, user_data: schemas.UserBase, current_admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(database.get_db)):
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Actualizar campos del usuario
    for key, value in user_data.dict().items():
        if key != "password":  # No actualizamos la contraseña aquí
            setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/api/v1/admin/users/{user_id}", response_model=dict)
async def delete_user(user_id: int, current_admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(database.get_db)):
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # No permitir eliminar al propio administrador
    if db_user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="No puede eliminar su propio usuario")
    
    db.delete(db_user)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}

# --- Rutas para Obras (Usuarios Autenticados) ---

@app.post("/api/v1/obras/", response_model=schemas.Work)
def create_work(
    work: schemas.WorkCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Verificar si el número de obra ya existe
    db_work = db.query(models.Work).filter(models.Work.work_number == work.work_number).first()
    if db_work:
        raise HTTPException(status_code=400, detail="El número de obra ya existe")
    
    # Crear la obra asociada al usuario actual
    db_work = models.Work(**work.dict(), user_id=current_user.id)
    db.add(db_work)
    db.commit()
    db.refresh(db_work)
    return db_work

@app.get("/api/v1/obras/", response_model=List[schemas.Work])
def read_works(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Obtener solo las obras del usuario actual
    works = db.query(models.Work).filter(models.Work.user_id == current_user.id).offset(skip).limit(limit).all()
    return works

@app.get("/api/v1/obras/{obra_id}", response_model=schemas.Obras)
def read_user_obra(obra_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Obtiene una obra específica si pertenece al usuario autenticado."""
    db_obra = crud.get_obra(db, obra_id=obra_id)
    if db_obra is None:
        raise HTTPException(status_code=404, detail="Obra not found")
    if db_obra.user_id != current_user.id:
        # Aunque el admin podría tener acceso, esta ruta es para usuarios normales
        raise HTTPException(status_code=403, detail="Not authorized to access this obra")
    return db_obra

@app.put("/api/v1/obras/{obra_id}", response_model=schemas.Obras)
def update_user_obra(obra_id: int, obra: schemas.ObrasCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Actualiza una obra si pertenece al usuario autenticado."""
    # crud.update_obra ya verifica la pertenencia
    db_obra = crud.update_obra(db, obra_id=obra_id, obra_data=obra, user_id=current_user.id)
    if db_obra is None:
        # Verificar si no se encontró o no está autorizado
        check_obra = crud.get_obra(db, obra_id)
        if check_obra is None:
             raise HTTPException(status_code=404, detail="Obra not found")
        else:
             # La obra existe pero no pertenece al usuario
             raise HTTPException(status_code=403, detail="Not authorized to update this obra")
    return db_obra

@app.delete("/api/v1/obras/{obra_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_obra(obra_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Elimina una obra si pertenece al usuario autenticado."""
    # crud.delete_obra ya verifica la pertenencia
    deleted = crud.delete_obra(db, obra_id=obra_id, user_id=current_user.id)
    if not deleted:
        # Verificar si no se encontró o no está autorizado
        check_obra = crud.get_obra(db, obra_id)
        if check_obra is None:
             raise HTTPException(status_code=404, detail="Obra not found")
        else:
             # La obra existe pero no pertenece al usuario
             raise HTTPException(status_code=403, detail="Not authorized to delete this obra")
    # No devolver contenido en un 204
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Rutas de Administración para Obras ---

@app.get("/api/v1/admin/obras", response_model=List[schemas.Work])
async def get_all_obras(
    skip: int = 0,
    limit: int = 100,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(database.get_db)
):
    works = db.query(models.Work).offset(skip).limit(limit).all()
    return works

@app.post("/api/v1/admin/obras", response_model=schemas.Work)
async def create_obra_admin(
    work: schemas.WorkCreate,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(database.get_db)
):
    # Verificar si el número de obra ya existe
    db_work = db.query(models.Work).filter(models.Work.work_number == work.work_number).first()
    if db_work:
        raise HTTPException(status_code=400, detail="El número de obra ya existe")
    
    # Crear la obra
    db_work = models.Work(**work.dict(), status="active")
    db.add(db_work)
    db.commit()
    db.refresh(db_work)
    return db_work

@app.get("/api/v1/admin/obras/{work_id}", response_model=schemas.Work)
async def get_obra_by_id(
    work_id: int,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(database.get_db)
):
    work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    return work

@app.put("/api/v1/admin/obras/{work_id}", response_model=schemas.Work)
async def update_obra_admin(
    work_id: int,
    work_data: schemas.WorkCreate,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(database.get_db)
):
    work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    
    for key, value in work_data.dict().items():
        setattr(work, key, value)
    
    db.commit()
    db.refresh(work)
    return work

@app.delete("/api/v1/admin/obras/{work_id}", response_model=dict)
async def delete_obra_admin(
    work_id: int,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(database.get_db)
):
    work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    
    db.delete(work)
    db.commit()
    return {"message": "Obra eliminada correctamente"}

# Endpoints para obras
@app.post("/works/", response_model=schemas.Work)
def create_work(work: schemas.WorkCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Verificar si el número de obra ya existe
    db_work = db.query(models.Work).filter(models.Work.work_number == work.work_number).first()
    if db_work:
        raise HTTPException(status_code=400, detail="El número de obra ya existe")
    
    db_work = models.Work(**work.dict())
    db.add(db_work)
    db.commit()
    db.refresh(db_work)
    return db_work

@app.get("/works/", response_model=List[schemas.Work])
def read_works(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    works = db.query(models.Work).offset(skip).limit(limit).all()
    return works

# Puedes añadir más routers aquí para organizar mejor si la app crece
# from .routers import items, users
# app.include_router(users.router)
# app.include_router(items.router)

# Endpoints para administración de usuarios
@app.post("/api/v1/admin/users/", response_model=schemas.UserPublic)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    # Verificar si el número de empleado ya existe
    db_user = db.query(models.User).filter(models.User.employee_number == user.employee_number).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El número de empleado ya existe")
    
    # Crear el nuevo usuario
    db_user = models.User(
        employee_number=user.employee_number,
        first_name=user.first_name,
        last_name=user.last_name,
        contact=user.contact,
        hashed_password=user.password,  # En producción, esto debería estar hasheado
        isAdmin=user.isAdmin if hasattr(user, 'isAdmin') else False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/v1/admin/users/", response_model=List[schemas.UserPublic])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users