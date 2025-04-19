import os
import sys

# Añadir el directorio raíz al path para poder importar los módulos
sys.path.append('/Users/juanjo/Desktop/Moor_Rapport_Web')

# Eliminar la base de datos existente si existe
db_path = '/Users/juanjo/Desktop/Moor_Rapport_Web/backend/sql_app.db'
if os.path.exists(db_path):
    print(f"Eliminando base de datos existente: {db_path}")
    os.remove(db_path)
    print("Base de datos eliminada con éxito.")

# Importar los módulos necesarios
from backend.app.database import Base, engine
from backend.app.init_db import init_db
from app import models

def reset_database():
    # Eliminar todas las tablas
    Base.metadata.drop_all(bind=engine)
    
    # Crear todas las tablas nuevamente
    Base.metadata.create_all(bind=engine)
    
    print("Base de datos reiniciada exitosamente")

if __name__ == "__main__":
    reset_database()