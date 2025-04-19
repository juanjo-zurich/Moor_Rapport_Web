from sqlalchemy.orm import Session
from . import models, schemas, auth, crud, database

def init_db():
    # Crear una sesión de base de datos
    db = database.SessionLocal()
    try:
        # Verificar si ya existe algún usuario en la base de datos
        users = db.query(models.User).all()
        if not users:
            print("Inicializando base de datos con usuario administrador por defecto...")
            
            # Crear usuario administrador por defecto
            admin_user = schemas.UserCreate(
                employee_number="00admin",
                first_name="Gestor",
                last_name="Sistema",
                contact="gestor@sistema.com",
                password="gestor"
            )
            
            # Crear el usuario en la base de datos
            db_user = crud.create_user(db=db, user=admin_user)
            
            # Establecer como administrador
            db_user.isAdmin = True
            db.commit()
            
            print(f"Usuario administrador creado: {db_user.employee_number}")

            # Crear algunas obras de ejemplo
            example_works = [
                schemas.WorkCreate(
                    work_number="OBRA001",
                    title="Proyecto de Ejemplo 1",
                    description="Esta es una obra de ejemplo para mostrar la funcionalidad del sistema."
                ),
                schemas.WorkCreate(
                    work_number="OBRA002",
                    title="Proyecto de Ejemplo 2",
                    description="Segunda obra de ejemplo con diferentes características."
                )
            ]

            for work in example_works:
                try:
                    crud.create_work(db=db, work=work, user_id=db_user.id)
                    print(f"Obra de ejemplo creada: {work.work_number}")
                except Exception as e:
                    print(f"Error al crear obra {work.work_number}: {str(e)}")

        else:
            print("La base de datos ya contiene usuarios, no se inicializará.")
    finally:
        db.close()