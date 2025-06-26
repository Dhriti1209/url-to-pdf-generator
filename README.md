# 📄 PDF URL Converter

A full-stack web application that allows users to input a URL and generate a downloadable PDF of that web page. This app uses Puppeteer to convert pages to PDF, stores them in MinIO (S3-compatible object storage), and provides access via signed URLs. It is managed with PM2 for production-level process control.



## 🧰 Tech Stack

| Layer        | Technology                            |
|--------------|----------------------------------------|
| **Frontend** | React + TypeScript + Tailwind CSS     |
| **Backend**  | Node.js + Express + TypeScript + Puppeteer |
| **Storage**  | MinIO (S3-compatible)                 |
| **Process Management** | PM2                         |
| **DevOps Tools** | Docker, Git, GitHub               |

---

## 📁 Project Structure

my-app/  
├── backend/  
│ ├── src/  
│ │ ├── index.ts  
│ │ ├── routes/  
│ │ └── services/  
│ ├── package.json  
│ └── tsconfig.json  
├── frontend/  
│ ├── src/  
│ │ ├── App.tsx  
│ │ └── index.tsx  
│ ├── public/  
│ ├── package.json  
│ └── tsconfig.json  
├── ecosystem.config.js  
├── .gitignore  
├── README.md  
└── package.json  




---

## 🔧 Setup Instructions

### 1. Prerequisites

- **Node.js** v18+
- **Docker**
- **Git**
- **PM2** (Install globally)
  ```bash
  npm install -g pm2
  
**2. Clone the Repository**
git clone https://github.com/Dhriti1209/url-to-pdf-generator.git
cd url_pdf

**3. Install Dependencies**
Backend
cd backend
npm install
Frontend
cd ../frontend
npm install

**4. Environment Variables**
Create a .env file inside the backend/ folder:
PORT=5000
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
BUCKET_NAME=bucket1

**5. Start MinIO with Docker**
```docker run -p 9000:9000 -p 9001:9001 --name minio1 \
-v "C:\minio\data:/data" \
-e "MINIO_ROOT_USER=minioadmin" \
-e "MINIO_ROOT_PASSWORD=minioadmin" \
minio/minio:RELEASE.2024-07-10T18-41-49Z server /data --console-address ":9001"```
Access MinIO Dashboard: http://localhost:9001
Login using:

Username: minioadmin

Password: minioadmin

➡️ Create a bucket named: bucket1

**6. Run the Project using PM2**

```pm2 start ecosystem.config.js
pm2 logs        # View logs
pm2 save        # Save the process list```

🧪 How It Works
User inputs a URL into the frontend.

Frontend sends the URL to the backend via a REST API.

Backend uses Puppeteer to convert the page to PDF.

PDF is uploaded to MinIO and a signed URL is returned.

Frontend shows the link for download.

**🛡️ Security Note**
Avoid hardcoding secret keys in production.

Use .env and secure them with .gitignore.
**
**💡 Future Enhancements****
Add PDF customization (paper size, orientation).

Integrate Celery + Redis for queueing heavy tasks.

Add user authentication.

Deploy to cloud with CI/CD.


