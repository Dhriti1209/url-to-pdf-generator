# 📄 PDF URL Converter

This is a full-stack application that allows users to input a URL and generate a downloadable PDF of that web page. The project uses **React (frontend)** and **Express with Puppeteer (backend)**, and stores files using **MinIO** (S3-compatible object storage). The app runs concurrently using **PM2** for process management.

---

## 🧰 Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Puppeteer
- **Infrastructure**: Docker + MinIO + PM2
- **Tools**: Celery (if extended), Git, GitHub

---

## 📁 Project Structure

my-app/
├── backend/
│ ├── src/
│ │ ├── index.ts # Express entry point
│ │ ├── routes/ # API routes
│ │ └── services/ # Business logic (PDF generation, etc.)
│ ├── package.json
│ └── tsconfig.json
├── frontend/
│ ├── src/
│ │ ├── App.tsx # Main React component
│ │ └── index.tsx # App entry point
│ ├── public/
│ ├── package.json
│ └── tsconfig.json
├── ecosystem.config.js # PM2 process configuration
├── .gitignore
├── README.md
├── package.json # Root-level (optional)


---

## 🔧 Setup Instructions

### 1. Prerequisites

- Node.js v18+
- Docker
- Git
- PM2 (`npm install -g pm2`)

---

### 2. Clone the Repository


git 
cd 


3. Install Dependencies
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

->Setup Environment Variables
Create a .env file inside the backend/ folder:


PORT=5000
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
BUCKET_NAME=pdf-storage

->Start MinIO with Docker
docker run -p 9000:9000 -p 9001:9001   --name minio1
-v "C:\minio\data:/data"   -e "minioadmin"
-e "MINIO_ROOT_PASSWORD=minioadmin" `
minio/minio:RELEASE.2024-07-10T18-41-49Z server /data --console-address ":9001"

Access MinIO dashboard at: http://localhost:9001
Login with:

Username: minioadmin

Password: minioadmin

Create a bucket named: bucket1

 Run Project with PM2

pm2 start ecosystem.config.js
pm2 logs        # View logs
pm2 save        # Save the process list
