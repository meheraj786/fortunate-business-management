# Project Overview

This is a comprehensive business management software built with the MERN stack (MongoDB, Express, React, Node.js) and Vite. It provides a wide range of features to manage sales, customers, inventory, and finances. The front end is built with React and utilizes Tailwind CSS for styling, while the back end is powered by Node.js and Express, with MongoDB as the database.

## Key Technologies

*   **Front-End:**
    *   React
    *   Vite
    *   React Router
    *   TanStack React Query
    *   Tailwind CSS
    *   Axios
    *   Chart.js
    *   React Hook Form
    *   jsPDF
*   **Back-End:**
    *   Node.js
    *   Express
    *   MongoDB
    *   Mongoose
    *   JWT for authentication

## Features

*   **Sales Management:** Track sales, manage invoices, and view sales dashboards.
*   **Customer Management:** Maintain a database of customers and their details.
*   **LC Management:** Manage Letters of Credit.
*   **Stock Management:** Track inventory, manage warehouses, and view product details.
*   **Team Management:** Manage team members and their permissions.
*   **Financials:** Track daily cash flow and manage accounts.
*   **Settings:** Customize application settings, such as categories and units.
*   **Trash:** A trash bin to recover all the deleted data.

# Building and Running

## Prerequisites

*   Node.js (LTS version)
*   npm
*   MongoDB

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables by creating a `.env` file in the root of the project. You can use `sample.env` as a template.

## Running the Application

*   To start the development server, run:
    ```bash
    npm run dev
    ```
*   To create a production build, run:
    ```bash
    npm run build
    ```
*   To preview the production build, run:
    ```bash
    npm run preview
    ```

## Linting

To lint the code, run:

```bash
npm run lint
```

# Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. Please adhere to the existing styling conventions.
*   **State Management:** TanStack React Query is used for data fetching and caching. For client-side state, use React's built-in hooks (`useState`, `useReducer`, `useContext`).
*   **Component Structure:** Components are organized by feature in the `src/features` directory. Reusable UI components are located in `src/components/ui`.
*   **API Calls:** API calls are made using Axios and are organized in the `src/api` directory. Custom hooks are used to interact with the API services.
*   **Routing:** Routing is handled by React Router. All routes are defined in `src/App.jsx`.
*   **Authentication:** Authentication is handled using JSON Web Tokens (JWT). The `AuthContext` provides authentication state and methods to the rest of the application.
