# VPAA: Seminar Tracking and Attendance Platform

A full-stack web platform built for the **Vice President for Academic Affairs (VPAA)** of **Holy Cross of Davao College**.  
This system streamlines seminar management, QR-based attendance, certificate generation, email notifications, and evaluation analytics.

> **Note:** This project is developed for **academic purposes only**.

---

## 🚀 Live Demo  
Frontend (React + Vite): **https://hcdc-podium.vercel.app/**  
Backend (Django REST API): *(Deployed on Railway)*

---

## 📌 Features

### ✅ **User Roles**
- **Participant** — Attend seminars, view history, download certificates  
- **Admin** — Manage seminars, track attendance, view analytics  
- **Certificate Editor** — Upload templates, adjust text, fonts, and colors

---

## 📋 **Core Functionalities**

### 🎫 **QR Attendance System**
- Auto-generated QR codes for **check-in** and **check-out**
- Instant server-side validation
- Error handling for invalid, expired, or reused QR tokens

---

### 📄 **Certificate Generation**
- Certificates rendered as **PNG files**
- Generated using:
  - **Pillow (PIL)** for text rendering on templates
  - **Cloudinary** for storage  
- Supports customization:
  - Font family  
  - Font size  
  - Font color  
  - Text position  

---

### 📧 **Email System (via Brevo API)**
- Send verification codes for **change email**
- Send **password reset** links with tokens
- Notify participants when a certificate becomes available

---

### 📈 **Seminar Evaluation Analytics**
- Collects participant feedback
- Provides admin dashboards & charts for:
  - Ratings
  - Satisfaction metrics
  - Response summaries

---

### 🧑‍🏫 **Seminar Management**
- Create, edit, and delete seminars
- Upload images (stored in **Cloudinary**)
- View attendance list
- Export analytics and attendance data

---

## 🛠️ Tech Stack

### **Frontend**
- React + Vite  
- Tailwind CSS + shadcn/ui  
- React Router  
- Zustand

### **Backend**
- **Django + Django REST Framework**
- Pillow (image processing)
- Cloudinary SDK
- Brevo API (email delivery)
- Neon (PostgreSQL database hosting)  
- Railway (backend hosting)

---

## 📁 Project Structure

