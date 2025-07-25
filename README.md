# 🎓 Student-Teacher Appointment System

<p align="center">
  <b>A modern, full-featured platform for seamless student-teacher interaction, appointment management, and real-time notifications.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-FFB300?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Nodemailer-009688?style=for-the-badge&logo=gmail&logoColor=white"/>
  <img src="https://img.shields.io/badge/Bcrypt-004488?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
</p>

---

## ✨ Features

<p align="center">
  <img src="https://img.shields.io/badge/Admin%20Panel-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Teacher%20Portal-green?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Student%20Portal-yellow?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Email%20Alerts-red?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Modern%20UI%2FUX-0f172a?style=for-the-badge&logo=css3&logoColor=white"/>
</p>

- **Admin Panel:** Add, update, and remove teachers; approve or reject student registrations; view all users.
- **Teacher Portal:** Manage slots, approve/reject appointments, receive email alerts, and view messages.
- **Student Portal:** Register, book appointments, send messages, and receive email notifications.
- **Automated Email Alerts:** Real-time notifications for appointment requests, approvals, and rejections.
- **Role-Based Access:** Secure, JWT-authenticated access for all roles.
- **Modern UI/UX:** Clean, responsive dashboards for every user.

---

## 📦 System Modules

| Admin  | Teacher | Student |
|--------|---------|---------|
| Add, update, and delete teacher profiles | Secure login | Register and log in |
| Approve or reject student registrations | Schedule available appointment slots | Book appointments with teachers |
| View all registered teachers and students | Approve or reject student appointment requests | Send messages and appointment requests |
|        | Receive email notifications for new bookings | Receive email notifications on appointment status |
|        | View/respond to student messages |         |
|        | See all upcoming and past appointments |     |

---

## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express.js%20%7C%20MongoDB%20%7C%20JWT%20%7C%20Nodemailer%20%7C%20Bcrypt-0f172a?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JavaScript-0f172a?style=for-the-badge&logo=html5&logoColor=white"/>
</p>

---

## 🚀 Installation

<details>
<summary><b>Click to expand installation steps</b></summary>

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   ```

2. **Install eduConnect dependencies:**
   ```bash
   cd eduConnect
   npm install
   ```

3. **Set up eduConnect environment variables:**
   ```
   DB_URL=your_mongodb_connection_string
   JWT_KEY=your_jwt_secret
   PORT=5000

   # Email integration
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password_or_app_password
   ```

4. **Run the eduConnect server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   - Visit `http://localhost:5000` in your browser.

</details>

---

## 💡 Usage

| Admin | Teacher | Student |
|-------|---------|---------|
| Log in to the admin dashboard | Log in to the teacher portal | Register and log in |
| Add, update, or delete teachers | Schedule, approve, or reject appointments | Book appointments with teachers |
| Approve or reject student registrations | Receive/respond to student messages | Send messages and appointment requests |
|       | Get email alerts for new bookings | Receive email notifications on appointment status |

---

## 🖼️ Screenshots

### Welcome Page
![Welcome Page](screenshots/welcome-page.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

### Teacher Dashboard
![Teacher Dashboard](screenshots/teacher-dashboard.png)

### Student Dashboard
![Student Dashboard](screenshots/student-dashboard.png)

---

## 🔑 Login Access

- **Admin:** Use the credentials set in your `.env` file.
- **Teachers/Students:** Register via the respective portals or have the admin create teacher accounts.

---

## 🤝 Contributing

<p align="center">
  <img src="https://img.shields.io/badge/Contributions-Welcome-brightgreen?style=for-the-badge"/>
</p>

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---

<p align="center" style="font-size:1.2em; color:#10b981;">
  <b>Enjoy a seamless, modern, and efficient student-teacher appointment experience!</b>
</p>
