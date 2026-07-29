# 🌐 DeTube

A Decentralized Video Streaming Platform Powered by Blockchain


### 📖 About

DeTube is a decentralized video streaming platform that leverages blockchain technology for secure and transparent content sharing. Built using Next.js and Solana, DeTube allows users to stream, upload, and interact with videos while benefiting from blockchain-based wallet connectivity and token transactions.
### 🛠️ Tech Stack

**Frontend:** Next.js 14, TailwindCSS, DaisyUI

**Backend:** Node.js, Solana Blockchain

**Database:** PostgreSQL

**Authentication:** NextAuth.js (Google, GitHub)

**Storage:** Cloudflare R2

**Blockchain:** Solana RPC for Wallet Integration


### 📦 Installation

Follow these steps to run the project locally:

#### 1️⃣ Clone the Repository

```bash
  git clone https://github.com/yourusername/DeTube.git
  cd DeTube
```

#### 2️⃣ Install Dependencies
Ensure you have Node.js 24 and Corepack installed.
```bash
  corepack enable
  corepack prepare pnpm@10.34.0 --activate
  pnpm install
```

#### 3️⃣ Configure Environment Variables
Create a .env file in the root directory and copy the values from the .env.example file:
```bash
  cp .env.example .env
```
Update the values in the .env file with your credentials.

For media uploads, create an R2 Object Read & Write token scoped to the
configured bucket. Set `R2_PUBLIC_URL` to the bucket's Cloudflare custom domain.
The bucket CORS policy must allow your local origin and deployed application
origin to use `GET`, `HEAD`, and `PUT` with the `Content-Type` header.

For Vercel deployments, add `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_URL` to the Preview and
Production environments.

#### 4️⃣ Run the Development Server
```bash
  pnpm dev
```
Visit the app at http://localhost:3000.

#### 5️⃣ Build and Run for Production
```bash
  pnpm build
  pnpm start
```
## 📧 Contact
For any inquiries, feel free to reach out:

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/kchandresh726)

X : Chandresh_726

Email : kchandresh726@gmail.com
