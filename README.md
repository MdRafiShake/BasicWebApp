# MySQL + Node.js Setup Guide

## Step 1: Download MySQL

1. Go to: [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)
2. Choose your Operating System: **Windows**
3. Select version: **Windows (x86, 32-bit), MSI Installer**  
   → *Choose the **first one** listed*

---

## Step 2: Install MySQL Server

1. Run the downloaded `.msi` file.
2. Click **Next**
3. Choose setup type: **Custom**
4. Expand:
   - **MySQL Servers** → Select the **latest version** of MySQL Server
   - **Applications > MySQL Workbench** → Select the **latest version**
   - **Applications > MySQL Shell** → Select the **latest version**
5. Click **Next** → then **Execute** to install everything
6. During configuration:
   - Set your **root password** (remember it — you’ll need it for CLI and database access)

---

## Step 3: Create Database and Tables (Using MySQL CLI)

1. Open the **MySQL Command Line Client (CLI)**
2. Run these commands:

    ```sql
    mysql -u root -p
    ```

    → Enter the root password you created earlier

    ```sql
    CREATE DATABASE basicWebApp;
    USE basicWebApp;
    SELECT DATABASE();

    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content TEXT NOT NULL
    );

    ALTER TABLE posts ADD COLUMN user_id INT;
    ALTER TABLE posts ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);
    ```

---

## Step 4: Set Up Project Environment in VS Code

1. Open your project folder in **VS Code**
2. Open terminal in the directory:  
   `basicWebApp/server`
3. Run the following commands:

    ```bash
    npm init -y
    npm i express
    npm i mysql2
    npm i express-session
    ```

---

## Step 5: Create `db.js` File

Inside the `server` folder, create a file named `db.js` with the following content:

```js
import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
  host: '127.0.0.1',
  user: '<yourDatabaseUserName>',
  password: '<yourDatabasePassword>',
  database: 'basicWebApp'
});

export default db;
```

---


## Step 6: Run the Program

From the terminal inside `basicWebApp/server`, run:

```bash
node server.js