# 🍱 Fooie – Smart Food Donation Platform

Fooie is a full-stack web application designed to reduce food waste by connecting restaurants and food providers with NGOs and charitable organizations. The platform enables seamless food donation management, ensuring surplus food reaches those in need efficiently and securely.

---

## 🚀 Features

### 🍽️ For Food Providers

* Secure registration and login.
* Create and manage food donation listings.
* Track donation history.
* Manage profile and availability.

### 🤝 For NGOs

* Secure authentication.
* Browse available food donations.
* Accept and manage donations.
* Track received contributions.

### 🔒 Authentication & Security

* JWT-based authentication.
* Password hashing with bcryptjs.
* Role-based user access.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* React Router
* Modern CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JSON Web Token (JWT)
* bcryptjs

---

## 📂 Project Structure

```
Fooie/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/fooie.git
cd fooie
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## 🎯 Mission

Every day, large quantities of edible food go to waste while many people struggle to access nutritious meals. Fooie bridges this gap by creating a digital ecosystem where surplus food can be donated quickly and efficiently to organizations that distribute it to those in need.

---

## 🌟 Future Enhancements

* Real-time donation status updates.
* Interactive maps for nearby donations.
* Push and email notifications.
* Admin dashboard.
* Analytics and reporting.
* Mobile application support.

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository, create a feature branch, and submit a pull request.

---

## 📜 License

This project is developed for educational and social impact purposes.

---

### Made with ❤️ to reduce food waste and support communities.
