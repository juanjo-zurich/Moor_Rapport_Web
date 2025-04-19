# Moor Rapport Web

## 📋 Descripción
Moor Rapport Web es una aplicación web moderna para la gestión de usuarios y obras. Cuenta con un panel de administración intuitivo que permite gestionar usuarios y obras de manera eficiente.

## ✨ Características
- 🔐 Sistema de autenticación completo
- 👥 Gestión de usuarios (crear, ver, administrar)
- 🏗️ Gestión de obras
- 🎨 Interfaz moderna con diseño responsivo
- 🌈 Tema personalizado con gradientes y efectos visuales
- 🔑 Control de acceso basado en roles (Administrador/Usuario)

## 🛠️ Tecnologías Utilizadas
- **Frontend:**
  - React
  - TypeScript
  - TailwindCSS
  - React Router
  - Context API para gestión de estado

- **Backend:**
  - Python (API REST)
  - FastAPI
  - SQlite

## 📦 Requisitos Previos
- Node.js (v14 o superior)
- Python 3.8 o superior
- SQlite
- npm o yarn

## 🚀 Instalación

### Frontend
```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]

# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

### Backend
```bash
# Navegar al directorio del backend
cd backend

# Crear un entorno virtual
python -m venv venv

# Activar el entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env

# Iniciar el servidor
uvicorn main:app --reload
```

## ⚙️ Configuración
1. Crear archivo `.env` en el directorio backend con las siguientes variables:
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_db
SECRET_KEY=tu_clave_secreta
```

2. Configurar la base de datos:
```bash
# Ejecutar migraciones
alembic upgrade head
```

## 🔑 Acceso al Panel de Administración
- URL: `http://localhost:3000/admin`
- Credenciales por defecto:
  - Usuario: admin
  - Contraseña: [definida en la configuración inicial]

## 📝 Uso
1. Iniciar sesión con credenciales de administrador
2. Acceder al panel de administración
3. Gestionar usuarios:
   - Crear nuevos usuarios
   - Ver listado de usuarios
   - Administrar roles y permisos
4. Gestionar obras:
   - Crear nuevas obras
   - Ver y editar obras existentes

## 🤝 Contribución
Las contribuciones son bienvenidas. Por favor, sigue estos pasos:
1. Fork el proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.


