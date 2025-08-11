# Bootstrap vs Zombies 🧟‍♂️

Un juego educativo tipo tower defense donde aprendes el sistema de grid y flexbox de Bootstrap ¡defendiendo tus servidores de hordas de zombies! Mueve tus torretas usando clases reales de Bootstrap, ya sea haciendo clic en botones de clase o escribiéndolas con autocompletado tipo IDE.

## 🎮 Jugabilidad

- Coloca y reposiciona torretas en una grilla de 12 columnas usando clases Bootstrap (ej: `justify-content-center`, `offset-2`).
- Defiende tus servidores de oleadas de zombies. Las torretas disparan automáticamente a los zombies en su columna.
- Usa:
  - 🖱️ **Mouse:** Haz clic en los botones de clase para aplicar clases Bootstrap al instante.
  - ⌨️ **Teclado:** Escribe clases en un editor de código con autocompletado en tiempo real, como en VS Code.
- Avanza por niveles, cada uno introduciendo nuevos conceptos y retos de Bootstrap.
- Compite por la mejor puntuación en el leaderboard.

## 🛠️ Tecnologías

- **Frontend:** React + TypeScript + Vite + Bootstrap + Phaser (para el motor de juego)
- **Backend:** Python Flask API
- **Base de datos:** SQLAlchemy (con migraciones Alembic)

## 🚀 Cómo empezar

1. Instala Python 3.10+, Node.js y Pipenv.
2. Instala dependencias del backend:
   ```sh
   pipenv install
   ```
3. Copia `.env.example` a `.env` y configura tu DATABASE_URL.
4. Ejecuta las migraciones:
   ```sh
   pipenv run migrate
   pipenv run upgrade
   ```
5. Inicia el backend:
   ```sh
   pipenv run start
   ```
6. Instala dependencias del frontend:
   ```sh
   npm install
   npm run dev
   ```

## 🧑‍💻 Controles

- **Mouse:** Haz clic en los botones de clase para seleccionar/deseleccionar clases Bootstrap para posicionar torretas.
- **Teclado:** Escribe clases en el editor de código; usa Tab/Enter para aceptar sugerencias.
- **Ambos métodos** actualizan el juego en tiempo real y te ayudan a aprender Bootstrap practicando.

## 📚 Objetivos de aprendizaje

- Domina el grid de 12 columnas y utilidades flexbox de Bootstrap.
- Practica con nombres de clases reales y recibe feedback visual instantáneo.
- Aprende jugando: cada nivel es un reto práctico de Bootstrap.

## 👾 Sobre el proyecto

Creado con fines educativos por 4Geeks Academy. Ideal para estudiantes, docentes y cualquier persona que quiera aprender Bootstrap de forma divertida e interactiva.

### **Nota importante para la base de datos y los datos dentro de ella**

Cada entorno de Github Codespace tendrá **su propia base de datos**, por lo que si estás trabajando con más personas, cada uno tendrá una base de datos diferente y diferentes registros dentro de ella. Estos datos **se perderán**, así que no pases demasiado tiempo creando registros manualmente para pruebas, en su lugar, puedes automatizar la adición de registros a tu base de datos editando el archivo `commands.py` dentro de la carpeta `/src/api`. Edita la línea 32 de la función `insert_test_data` para insertar los datos según tu modelo (usa la función `insert_test_users` anterior como ejemplo). Luego, todo lo que necesitas hacer es ejecutar `pipenv run insert-test-data`.

### Instalación manual del Front-End:

- Asegúrate de estar usando la versión 20 de node y de que ya hayas instalado y ejecutado correctamente el backend.

1. Instala los paquetes: `$ npm install`
2. ¡Empieza a codificar! inicia el servidor de desarrollo de webpack `$ npm run start`

## ¡Publica tu sitio web!

Esta plantilla está 100% lista para desplegarse con Render.com y Heroku en cuestión de minutos. Por favor, lee la [documentación oficial al respecto](https://4geeks.com/docs/start/deploy-to-render-com).

### Contribuyentes

Esta plantilla fue construida como parte del [Coding Bootcamp](https://4geeksacademy.com/us/coding-bootcamp) de 4Geeks Academy por [Alejandro Sanchez](https://twitter.com/alesanchezr) y muchos otros contribuyentes. Descubre más sobre nuestro [Curso de Desarrollador Full Stack](https://4geeksacademy.com/us/coding-bootcamps/part-time-full-stack-developer) y [Bootcamp de Ciencia de Datos](https://4geeksacademy.com/us/coding-bootcamps/datascience-machine-learning).

Puedes encontrar otras plantillas y recursos como este en la [página de github de la escuela](https://github.com/4geeksacademy/).
