## Learning Guide – VPAA: Seminar Tracking and Attendance Platform

This document explains **what you can learn** from this project and **how each major part works**.  

---

## 🎯 Project Purpose

This system was developed for the **Office of the Vice President for Academic Affairs (VPAA)** of  
**Holy Cross of Davao College**.

It solves real academic workflow problems such as:

- Seminar attendance tracking via QR codes
- Automated certificate generation and delivery
- Seminar evaluation and analytics
- Secure authentication and account recovery
- Role-based access for administrators and participants

This project is intended **for academic and learning purposes**.

---

## 🧠 What You Can Learn From This Project

### 1️⃣ Full-Stack Architecture (React + Django)

You will learn how to:

- Separate concerns between frontend and backend
- Build a REST API using **Django Rest Framework**
- Consume APIs from a **React (Vite) frontend**
- Manage authentication tokens across requests

---

### 2️⃣ Authentication & Security Patterns

This project demonstrates:

- Token-based authentication (DRF Token Auth)
- Secure login with email and password
- Email verification workflow for changing email addresses
- Password reset using **email + token-based reset link**
- Protected routes and role-based access control

---

### 3️⃣ QR Code–Based Attendance System

Key learning points:

- Generating QR codes per seminar session
- Encoding secure tokens in QR links
- Redirect logic when:
  - User is authenticated
  - User scans a QR code while unauthenticated
- Preventing invalid or reused attendance tokens

---

### 4️⃣ Certificate Generation with Image Processing

This project uses **PNG-based certificates**, not PDFs.

You will learn:

- Uploading certificate templates
- Editing certificate layouts (text position, font, size, color)
- Using **Pillow (PIL)** to dynamically draw text on images
- Generating certificates per participant
- Emailing certificates automatically after seminar completion

---

### 5️⃣ File & Media Management with Cloudinary

You will learn how to:

- Store uploaded images securely using **Cloudinary**
- Handle public vs protected media
- Reference stored assets in certificates and frontend UI

---

### 6️⃣ Email Automation with Brevo API

This system sends transactional emails for:

- Certificate delivery
- Email verification codes
- Password reset links

Learning outcomes:

- Integrating a third-party email API
- Building reliable email workflows
- Handling failures and retries gracefully

---

### 7️⃣ Seminar Evaluation & Analytics

The project includes an evaluation module that demonstrates:

- Collecting structured feedback from participants
- Storing evaluation responses
- Aggregating results per seminar
- Displaying analytics for administrators

---

### 8️⃣ Database Design & Hosting (Neon)

You can study:

- Relational data modeling for seminars, users, attendance, certificates
- Using **Neon (PostgreSQL)** as a hosted database
- Environment-based database configuration using `.env`

---

## 🧩 Roles & Permissions

The system supports **three functional roles**:

- **Participant**
  - Attend seminars
  - Submit evaluations
  - Receive certificates
- **Admin**
  - Manage seminars
  - View attendance and evaluation analytics
  - Generate QR codes
  - Upload templates
  - Adjust text position, font, size, and color


---

## 🗂 Project Structure Overview

```text
frontend/                # React (Vite) application
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── utils/
└── ...

backend/
├── api/                 # API routing
├── attendance/          # QR & attendance logic
├── certificates/        # Certificate generation & emailing
├── evaluation/          # Seminar evaluation & analytics
├── users/               # Authentication & user management
├── .env                 # Provide your own environment variables for your APIs
├── requirements.txt
└── manage.py
