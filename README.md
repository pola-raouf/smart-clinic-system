# 🏥 Smart Clinic Management System

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-4.0.5-brightgreen?style=for-the-badge&logo=springboot" />
  <img src="https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk" />
  <img src="https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql" />
  <img src="https://img.shields.io/badge/JWT-Secured-red?style=for-the-badge&logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

A full-stack **Smart Clinic Management System** built with Spring Boot and Vanilla JavaScript. The system provides role-based portals for **Owners (Admins)**, **Doctors**, **Secretaries**, and **Patients**, offering a complete suite of tools to manage appointments, medical records, prescriptions, notifications, and analytics — all secured with JWT-based authentication.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features by Role](#-features-by-role)
- [System Architecture](#-system-architecture)
- [Technologies Used](#-technologies-used)
- [Database Schema](#-database-schema)
- [Setup Instructions](#-setup-instructions)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Team Members](#-team-members)

---

## 🔍 Project Overview

The **Smart Clinic Management System** is a web-based application designed to streamline clinic operations. It replaces manual paper-based workflows with a centralized digital platform that supports the full patient journey — from registration and appointment booking to medical consultation, prescription generation, and report export.

The system is built around four distinct user roles, each with a dedicated portal and tailored feature set, all governed by a robust security layer using **Spring Security** and **JWT tokens**.

---

## 🎯 Features by Role

### 👑 Owner (Admin)
- Full system dashboard with real-time KPIs and trend charts
- User management — create, update, and deactivate Doctors, Secretaries, and Patients
- Clinic-wide analytics and report generation (PDF export)
- System activity log with filterable audit trail
- Notification center

### 👨‍⚕️ Doctor
- Personal dashboard with today's appointments and patient statistics
- Manage schedule (available time slots per day)
- View full patient profiles and medical history
- Start consultations and write medical records
- Manage prescriptions per consultation
- Appointment tracking (Pending → Confirmed → Completed)
- Notifications for upcoming appointments

### 📋 Secretary
- Dashboard overview of daily appointment load
- Book, confirm, and cancel patient appointments
- Manage doctor availability schedules
- View and update patient information
- Notifications for schedule changes

### 🧑‍💼 Patient
- Self-service dashboard with upcoming appointments
- Book appointments with available doctors
- View personal medical records and history
- Download/view medical reports
- Manage personal profile
- Real-time notifications for appointment status updates

---

## 🏛️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Frontend (SPA)                          │
│   Vanilla JS · HTML5 · CSS3 · Role-based page routing        │
└─────────────────────────┬────────────────────────────────────┘
                          │ REST API (JSON / JWT)
┌─────────────────────────▼────────────────────────────────────┐
│                  Spring Boot Backend                          │
│  Controllers → Services → Repositories → JPA Entities        │
│  Spring Security · JWT Filter · Event System · Scheduler      │
└─────────────────────────┬────────────────────────────────────┘
                          │ JPA / Hibernate
┌─────────────────────────▼────────────────────────────────────┐
│                     MySQL Database                            │
│          clinicdb · Auto-DDL · Relational Schema             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technologies Used

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Java** | 17 | Core language |
| **Spring Boot** | 4.0.5 | Application framework |
| **Spring Security** | (via Boot) | Authentication & authorization |
| **Spring Data JPA** | (via Boot) | ORM & database access |
| **Hibernate** | (via JPA) | ORM implementation |
| **JJWT (jjwt-api)** | 0.11.5 | JWT token generation & validation |
| **OpenPDF** | 1.3.39 | PDF report generation |
| **Lombok** | (via Boot) | Boilerplate reduction |
| **Spring Boot DevTools** | (via Boot) | Hot reload during development |
| **Bean Validation** | (via Boot) | Request DTO validation |

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5** | Page structure & semantics |
| **CSS3** | Styling, animations, glassmorphism effects |
| **Vanilla JavaScript (ES6+)** | Dynamic SPA logic, API calls, component rendering |
| **Fetch API** | REST communication with backend |

### Database & Infrastructure
| Technology | Version | Purpose |
|---|---|---|
| **MySQL** | 8.0+ | Relational database |
| **MySQL Connector/J** | (via Boot) | JDBC driver |
| **Maven** | 3.x | Build & dependency management |

---

## 🗄️ Database Schema

The database (`clinicdb`) consists of the following core entities:

| Entity | Description |
|---|---|
| `User` | Base user account (username, password, role) |
| `Doctor` | Doctor profile linked to a User |
| `Secretary` | Secretary profile linked to a User |
| `Patient` | Patient profile with demographics |
| `Owner` | Admin/Clinic owner profile |
| `Appointment` | Links a Patient to a Doctor with status tracking |
| `DoctorSchedule` | Available time slots per Doctor per day |
| `MedicalRecord` | Consultation notes written by a Doctor |
| `Prescription` | Medications prescribed within a MedicalRecord |
| `Notification` | System notifications targeted at specific users |

**Roles:** `OWNER`, `DOCTOR`, `SECRETARY`, `PATIENT`

**Appointment Statuses:** `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`

---

## ⚙️ Setup Instructions

### Prerequisites

Ensure you have the following installed:
- ☕ **Java 17** (JDK)
- 📦 **Apache Maven 3.x**
- 🐬 **MySQL 8.0+**
- 🌐 Any modern browser (Chrome, Firefox, Edge)

---

### 1. Clone the Repository

```bash
git clone https://github.com/pola-raouf/smart-clinic-management-system.git
cd smart-clinic-management-system
```

---

### 2. Configure the Database

Log into MySQL and create the database:

```sql
CREATE DATABASE clinicdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 3. Configure Application Properties

Open `src/main/resources/application.properties` and update the credentials:

```properties
spring.application.name=clinic

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/clinicdb
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# File Uploads
app.upload.dir=uploads
app.clinic.name=Smart Clinic
spring.servlet.multipart.max-file-size=3MB
spring.servlet.multipart.max-request-size=3MB
```

> **Note:** `ddl-auto=update` will automatically create and update tables on first run. No SQL scripts needed.

---

### 4. Build and Run

Using Maven Wrapper (no Maven installation required):

```bash
# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

Or build a JAR and run it:

```bash
mvnw.cmd clean package
java -jar target/clinic-0.0.1-SNAPSHOT.jar
```

---

### 5. Access the Application

Once started, open your browser and navigate to:

```
http://localhost:8080
```

The landing page will be served automatically. Use the **Login** page to authenticate with your credentials based on your assigned role.

| Role | Default Access Path |
|---|---|
| Owner / Admin | `/pages/owner/dashboard.html` |
| Doctor | `/pages/doctor/dashboard.html` |
| Secretary | `/pages/secretary/dashboard.html` |
| Patient | `/pages/patient/dashboard.html` |

---

## 🔌 API Endpoints

All API routes are prefixed with `/api`. Authentication is required via a `Bearer` JWT token in the `Authorization` header (except `/api/auth/**`).

| Module | Base Path | Key Operations |
|---|---|---|
| **Auth** | `/api/auth` | Login, Register |
| **Appointments** | `/api/appointments` | Book, Confirm, Cancel, Complete |
| **Doctor** | `/api/doctor` | Profile, Patients, Medical Records |
| **Doctor Schedule** | `/api/schedule` | View & manage availability |
| **Patient** | `/api/patient` | Profile, History |
| **Secretary** | `/api/secretary` | Manage patients & appointments |
| **Owner / Users** | `/api/owner` | CRUD for all user accounts |
| **Notifications** | `/api/notifications` | Fetch & mark as read |
| **Dashboard** | `/api/dashboard` | Stats & activity feed |
| **Reports** | `/api/reports` | Analytics, PDF export |
| **System Logs** | `/api/logs` | Audit trail (Owner only) |
| **Public** | `/api/public` | Doctors listing, Services info |

---

## 📁 Project Structure

```
clinic34/
├── src/
│   ├── main/
│   │   ├── java/org/smartclinic/clinic/
│   │   │   ├── ClinicApplication.java       # Entry point
│   │   │   ├── config/                      # Security & MVC config
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── JwtAuthFilter.java
│   │   │   │   └── WebMvcConfig.java
│   │   │   ├── controller/                  # REST Controllers (16)
│   │   │   ├── service/                     # Business logic (17)
│   │   │   ├── Entity/                      # JPA Entities (13)
│   │   │   ├── Dto/                         # Request/Response DTOs (41)
│   │   │   ├── Repository/                  # Spring Data JPA repos
│   │   │   ├── Mapper/                      # Entity ↔ DTO mappers
│   │   │   ├── event/                       # Application events
│   │   │   ├── exception/                   # Custom exceptions
│   │   │   └── util/                        # Utility classes (ClinicLogger)
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │           ├── index.html               # Landing page
│   │           ├── css/                     # Global stylesheets
│   │           ├── js/
│   │           │   ├── core/                # Auth, API base, routing
│   │           │   ├── components/          # Shared UI (navbar, etc.)
│   │           │   ├── pages/
│   │           │   │   ├── owner/           # Admin portal JS
│   │           │   │   ├── doctor/          # Doctor portal JS
│   │           │   │   ├── secretary/       # Secretary portal JS
│   │           │   │   ├── patient/         # Patient portal JS
│   │           │   │   └── shared/          # Shared page logic
│   │           │   └── appointmentService.js
│   │           ├── pages/
│   │           │   ├── owner/               # Admin HTML pages (7)
│   │           │   ├── doctor/              # Doctor HTML pages (11)
│   │           │   ├── secretary/           # Secretary HTML pages (7)
│   │           │   └── patient/             # Patient HTML pages (7)
│   │           └── assets/                  # Images & static assets
├── uploads/                                 # Uploaded files storage
├── pom.xml
├── mvnw / mvnw.cmd
└── README.md
```

---

## 👥 Team Members

| Name | ID | Role |
|---|---|---|
| **Eyad Ashraf Mohamed Ahmed Sadek** | 2023/06444 | 👑 Team Leader |
| **Pola Raouf Malak Wassef** | 2023/02440 | Developer |
| **Sherif Wafaei Mohamed Efat Ahmed Ibrahim** | 2023/00591 | Developer |
| **Peter Emad Ernest Sadek** | 2022/01274 | Developer |
| **Radwa Khalid Mahmoud Shoukry** | 2023/03904 | Developer |

---

## 📄 License

This project is developed as an academic project. All rights reserved by the team.

---

<p align="center">
  Made with ❤️ by the Smart Clinic Team — 2026
</p>
