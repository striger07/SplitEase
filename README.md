# 💰 SplitEase (Expense Tracker & Group Settlement Web App)

This project is a full-stack application designed to help users track their expenses, manage group finances, and simplify the process of settling debts within groups. It provides a backend API built with Node.js, Express, and MongoDB, along with a frontend interface (not detailed in these summaries) for users to interact with. The core functionality revolves around creating groups, adding members, recording expenses, and automatically calculating the optimal way to settle debts using a max-flow algorithm.

## 🚀 Key Features

- **User Authentication:** Secure user registration and login using JWTs and bcrypt for password hashing. 🔐
- **Group Management:** Create, manage, and add members to groups for shared expense tracking. 👥
- **Expense Tracking:** Record individual expenses with details like amount, category, and description. 🧾
- **Transaction Management:** Record transactions between users within a group. 💸
- **Automated Settlement:** Calculates the optimal payment plan to settle debts within a group using a max-flow algorithm, minimizing the number of transactions. 🧮
- **Username Availability Check:** Checks if a username already exists during registration. ✅

## 🛠️ Tech Stack

- **Backend:**
    - Node.js
    - Express
- **Database:**
    - MongoDB
    - Mongoose
- **Authentication:**
    - JSON Web Tokens (JWT)
    - bcrypt
- **Middleware:**
    - cors
    - express.json
- **Algorithms:**
    - Ford-Fulkerson (Edmonds-Karp) for Max Flow
    - Breadth-First Search (BFS)
- **Utilities:**
    - dotenv

## 📦 Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- MongoDB installed and running, or access to a MongoDB Atlas cluster.

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  Install backend dependencies:

    ```bash
    cd backend
    npm install
    ```

3.  Create a `.env` file in the `backend` directory and configure the following environment variables:

    ```
    PORT=3000
    MONGODB_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    SALT_ROUNDS=10
    ```

    **Important Security Note:** Replace `<your_jwt_secret>` with a strong, randomly generated secret key.  The `JWT_SECRET` is critical for the security of your application.  Also, ensure your email credentials (`EMAIL_USER` and `EMAIL_PASS`) are properly secured.

### Running Locally

1.  Start the backend server:

    ```bash
    cd backend
    npm start
    ```

    This will start the server on the port specified in your `.env` file (or port 3000 if not specified).

## 📂 Project Structure

```
├── backend/
│   ├── app.js                # Main entry point for the backend application
│   ├── middleware/
│   │   └── authMiddleware.js   # Authentication middleware
│   ├── controllers/
│   │   ├── authControllers.js    # Authentication controllers (register, login)
│   │   ├── expenseControllers.js # Expense controllers (create, get)
│   │   ├── groupControllers.js   # Group controllers (create, get, add member)
│   │   ├── userControllers.js    # User controllers (check if user exists)
│   │   ├── transactionControllers.js # Transaction controllers (create, get, delete)
│   │   ├── resultsController.js # Results controller (calculate settlement)
│   │   └── inviteControllers.js # Invite controllers (send invite emails)
│   ├── helpers/
│   │   ├── bfs.js              # Breadth-First Search algorithm
│   │   ├── calculateNetBalances.js # Calculate net balances for users
│   │   ├── createFlowGraphMatrix.js # Create flow graph matrix for max flow algorithm
│   │   └── maxFlowAlgo.js      # Max flow algorithm implementation
│   ├── models/
│   │   ├── expenseModel.js     # Expense model
│   │   ├── groupModel.js       # Group model
│   │   ├── transactionModel.js # Transaction model
│   │   └── userModel.js        # User model
│   ├── routes/
│   │   ├── authRoutes.js       # Authentication routes
│   │   ├── expenseRoutes.js      # Expense routes
│   │   ├── groupRoutes.js        # Group routes
│   │   ├── userRoutes.js         # User routes
│   │   ├── transactionRoutes.js  # Transaction routes
│   │   ├── resultsRoutes.js      # Results routes
│   │   └── inviteRoutes.js      # Invite routes
│   ├── utils/
│   │   └── mailer.js           # Utility for sending emails
│   ├── .env                  # Environment variables (API keys, database URI, etc.)
│   └── package.json            # Backend dependencies and scripts
├── frontend/                # (Assumed frontend directory - details not provided)
│   └── ...
├── README.md               # This file
└── ...
```


