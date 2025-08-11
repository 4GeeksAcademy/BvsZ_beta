# Bootstrap vs Zombies 🧟‍♂️

An educational tower defense game where you learn Bootstrap's flexbox and grid system by defending your servers from waves of zombies! Move your turrets using real Bootstrap classes, either by clicking class buttons or typing them with IDE-style autocomplete.

## 🎮 Gameplay

- Place and reposition turrets on a 12-column grid using Bootstrap classes (e.g. `justify-content-center`, `offset-2`).
- Defend your servers from zombie hordes. Turrets fire automatically at zombies in their column.
- Use either:
  - 🖱️ **Mouse:** Click on class buttons to apply Bootstrap classes instantly.
  - ⌨️ **Keyboard:** Type classes in a code editor with real-time autocomplete, just like in VS Code.
- Progress through levels, each introducing new Bootstrap concepts and challenges.
- Compete for high scores on the leaderboard.

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite + Bootstrap + Phaser (for game rendering)
- **Backend:** Python Flask API
- **Database:** SQLAlchemy (with Alembic migrations)

## 🚀 Getting Started

1. Install Python 3.10+, Node.js, and Pipenv.
2. Install backend dependencies:

```sh
pipenv install
```

3. Copy `.env.example` to `.env` and configure your database URL.
4. Run migrations:

```sh
pipenv run migrate
pipenv run upgrade
```

5. Start the backend:

```sh
pipenv run start
```

6. Install frontend dependencies:

```sh
npm install
npm run dev
```

## 🧑‍💻 Controls

- **Mouse:** Click class buttons to select/deselect Bootstrap classes for turret positioning.
- **Keyboard:** Type classes in the code editor; use Tab/Enter to accept suggestions.
- **Both methods** update the game in real time and help you learn Bootstrap by doing.

## 📚 Learning Objectives

- Master Bootstrap's 12-column grid and flexbox utilities.
- Practice with real class names and see instant visual feedback.
- Learn by playing: each level is a practical Bootstrap challenge.

## 👾 About

Created for educational purposes by 4Geeks Academy. Ideal for students, teachers, and anyone who wants to learn Bootstrap in a fun, interactive way.

### **Important note for the database and the data inside it**

Every Github codespace environment will have **its own database**, so if you're working with more people eveyone will have a different database and different records inside it. This data **will be lost**, so don't spend too much time manually creating records for testing, instead, you can automate adding records to your database by editing `commands.py` file inside `/src/api` folder. Edit line 32 function `insert_test_data` to insert the data according to your model (use the function `insert_test_users` above as an example). Then, all you need to do is run `pipenv run insert-test-data`.

### Front-End Manual Installation:

- Make sure you are using node version 20 and that you have already successfully installed and runned the backend.

1. Install the packages: `$ npm install`
2. Start coding! start the webpack dev server `$ npm run start`

## Publish your website!

This boilerplate it's 100% read to deploy with Render.com and Heroku in a matter of minutes. Please read the [official documentation about it](https://4geeks.com/docs/start/deploy-to-render-com).

### Contributors

This template was built as part of the 4Geeks Academy [Coding Bootcamp](https://4geeksacademy.com/us/coding-bootcamp) by [Alejandro Sanchez](https://twitter.com/alesanchezr) and many other contributors. Find out more about our [Full Stack Developer Course](https://4geeksacademy.com/us/coding-bootcamps/part-time-full-stack-developer), and [Data Science Bootcamp](https://4geeksacademy.com/us/coding-bootcamps/datascience-machine-learning).

You can find other templates and resources like this at the [school github page](https://github.com/4geeksacademy/).
