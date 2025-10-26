# BILLING APP

This is a full-stack billing and invoice management application. It's a modern React and Node.js application designed for creating detailed, itemized invoices, managing pricing data, and viewing historical invoice records.

## Features

* **Invoice Management:** Create, save, update, and delete customer invoices.
* **Live Bill Building:** Dynamically add items to a bill, with automatic calculation of dimensions, quantity, tax, and totals.
* **Print Friendly:** A dedicated, clean view for printing any invoice.
* **Dynamic Data Management:**
    * Manage **Items** (e.g., 'Wall Panel', 'Door').
    * Manage **Materials** (e.g., 'Veneer', 'Glass').
    * Manage **Rates** by linking items, materials, and units of measure (sqcm, sqft, nos) to a specific price.
* **Invoice History:** View, search, edit, or delete all previously saved invoices.

## Tech Stack

This project is a "monorepo" containing two separate projects: a frontend and a backend.

### Frontend (`/frontend`)

* **Framework:** React 18
* **Build Tool:** Vite
* **Routing:** React Router v6
* **Styling:** Plain CSS

### Backend (`/backend`)

* **Runtime:** Node.js
* **Framework:** Express
* **Database:** MySQL
* **API:** REST
* **Security:** `dotenv` for environment variable management
* **Middleware:** `cors` for handling cross-origin requests

## Project Structure

```
my-billing-app/
├── backend/
│   ├── node_modules/
│   ├── .env            # (Local secrets, must be created)
│   ├── .gitignore
│   ├── package.json
│   └── server.js       # (The Express API)
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.js
├── database_setup.sql  # (SQL script to set up the database)
└── README.md
```

## Setup & Installation

You will need **Node.js** and a **MySQL server** (like MySQL Workbench) installed on your machine.

### 1. Backend Setup (`/backend`)

First, let's get the server and database running.

1.  Navigate to the backend folder:
    ```bash
    cd my-billing-app/backend
    ```
2.  Install the necessary packages:
    ```bash
    npm install express mysql2 cors dotenv
    ```
3.  **Database Setup:**
    * Make sure your MySQL server is running.
    * You need to run the `database_setup.sql` file (located in the root `my-billing-app/` folder) to create the `interior_design_db` and all its tables.

    **Option A: Using a GUI (like MySQL Workbench)**
    * Open MySQL Workbench and connect to your database server.
    * Go to `File` > `Open SQL Script...`.
    * Navigate to the `my-billing-app/` folder and select `database_setup.sql`.
    * Click the "lightning bolt" (⚡) icon to execute the script.

    **Option B: Using the Command Line**
    * Open your terminal.
    * Navigate to the root `my-billing-app/` folder (the one containing the `.sql` file).
    * Run the following command, replacing `your_username` with your MySQL username:
        ```bash
        mysql -u your_username -p < database_setup.sql
        ```
    * It will prompt you to enter your MySQL password.

4.  **Create Environment File:**
    * Create a new file named `.env` in the `/backend` folder.
    * Add your MySQL credentials to this file. It must include:
    ```ini
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=interior_design_db
    ```
5.  **Start the Backend Server:**
    ```bash
    node server.js
    ```
    Your backend is now running at `http://localhost:3000`.

### 2. Frontend Setup (`/frontend`)

Now, let's start the React application in a separate terminal.

1.  Open a **new terminal window**.
2.  Navigate to the frontend folder:
    ```bash
    cd my-billing-app/frontend
    ```
3.  Install the necessary packages:
    ```bash
    npm install
    ```
4.  Install React Router:
    ```bash
    npm install react-router-dom
    ```
5.  **Start the Frontend App:**
    ```bash
    npm run dev
    ```
    Your React app is now running at `http://localhost:5173` (or the port shown in your terminal).

## Usage

Once both the backend and frontend are running, open **`http://localhost:5173`** in your browser.

The React application is configured to proxy all API requests (anything starting with `/api`) to your backend server at `http://localhost:3000`, so you won't encounter any CORS errors.