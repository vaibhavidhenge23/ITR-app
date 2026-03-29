📊 ITR App
Streamlined Income Tax Return Planning & Calculation Dashboard

📖 Overview
The ITR App solves the complexity of manual income tax calculation for Indian taxpayers and freelancers. Tracking scattered income sources, allowable expenses, Section 80 investments, and deducted TDS manually often leads to errors and missed refund opportunities.

This platform provides a unified dashboard to record all financial data throughout the year, utilizing a custom tax engine to compute final tax liabilities, highlight potential savings, and generate a comprehensive summary report ready for official ITR filing.

✨ Features
🔐 Secure Authentication: User registration and login system for private tax profiles.

💰 Income & Expense Tracking: Log various income sources (salary, business, capital gains) and allowable deductions.

📈 Investment Declarations: Dedicated modules to record tax-saving investments (Section 80C, 80D, etc.).

✂️ TDS Management: Track Tax Deducted at Source to accurately calculate final refunds or dues.

🧮 Real-Time Tax Computation: Custom tax engine evaluating total taxable income against current tax slabs.

📑 Summary Reports: Generate clean, structured tax computation reports for easy ITR filing.

🛠 Tech Stack
Component	Technology	Description
Frontend	Next.js (App Router)	React framework for UI and routing.
Styling	Tailwind CSS	Utility-first CSS framework for responsive design.
Backend	Next.js API Routes	Serverless API endpoints for data operations.
Business Logic	Custom JavaScript	Isolated tax computation engine (lib/taxEngine.js).
ORM	Prisma	Type-safe database client.
Database	Relational Database	Configurable via Prisma (SQLite/PostgreSQL/MySQL).
🏗 Architecture
The application follows a modern Next.js full-stack architecture, utilizing Serverless API routes that interface with a database via Prisma, while business logic is decoupled into a dedicated computation engine.

Code snippet
flowchart TD
    Client[Next.js Client Components] -->|HTTP Fetch| API[Next.js API Routes]
    
    subgraph Backend
        API -->|CRUD Operations| Prisma[Prisma ORM]
        API -->|Calculation Requests| Engine[Tax Engine lib/taxEngine.js]
    end
    
    Prisma -->|Read/Write| DB[(Database)]
    Engine -->|Computed Tax Data| API
📁 Project Structure
Plaintext
├── app/
│   ├── api/             # Backend API Route Handlers
│   │   ├── auth/        # Login and registration routes
│   │   ├── compute/     # Trigger for the tax computation engine
│   │   ├── expenses/    # Expense CRUD
│   │   ├── income/      # Income CRUD
│   │   ├── investments/ # Investment CRUD
│   │   └── tds/         # TDS CRUD
│   ├── components/      # Shared React components (e.g., Header)
│   ├── calculator/      # Interactive tax calculator UI
│   ├── dashboard/       # Main user dashboard UI
│   ├── report/          # Final ITR report generation UI
│   └── (modules)/       # Dedicated pages for income, expenses, TDS, etc.
├── lib/
│   ├── prisma.js        # Prisma client singleton instance
│   ├── taxEngine.js     # Core logic for tax slab calculations and deductions
│   └── useUser.js       # Client-side user session management
├── prisma/
│   ├── schema.prisma    # Database schema definitions
│   └── migrations/      # Database migration history
├── .env.example         # Environment variables template
└── package.json         # Project metadata and dependencies
🚀 Installation
1. Clone the repository

Bash
git clone https://github.com/vaibhavidhenge23/itr-app.git
cd itr-app
2. Install dependencies

Bash
npm install
3. Configure Environment Variables

Bash
cp .env.example .env
Edit .env to include your specific database connection string.

4. Setup the Database
Generate the Prisma client and apply migrations.

Bash
npx prisma generate
npx prisma migrate dev
5. Start the Development Server

Bash
npm run dev
Visit http://localhost:3000 in your browser.

💻 Usage
Register/Login: Create an account to secure your financial data.

Log Financials: Navigate through the Income, Expenses, Investments, and TDS tabs to input your yearly financial data.

Calculate: Use the Calculator module to see a real-time breakdown of your tax liability based on the active tax slabs.

Generate Report: Navigate to the Report section to review a compiled summary of your total taxable income, total deductions, and final tax payable or refundable.

⚙️ Configuration
The application requires the following environment variables (refer to .env.example):

Code snippet
# Database connection string (e.g., PostgreSQL, MySQL, or SQLite)
DATABASE_URL="postgresql://user:password@localhost:5432/itr_db"

# Authentication secret (if utilizing JWT or NextAuth)
JWT_SECRET="your_secure_random_string"
🔌 API Modules
POST /api/auth/register & POST /api/auth/login: User authentication.

GET/POST /api/income: Manage income records.

GET/POST /api/expenses: Manage allowable expense records.

GET/POST /api/investments: Manage Section 80 declarations.

GET/POST /api/tds: Manage Tax Deducted at Source records.

GET /api/compute: Aggregates user data, passes it through taxEngine.js, and returns the final computation breakdown.

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

🗺 Roadmap
[ ] Implement PDF export functionality for the final ITR report.

[ ] Add Old vs. New Tax Regime comparison feature.

[ ] Support multiple assessment years for historical tracking.

[ ] Integrate OCR to auto-read Form 16 / Form 26AS PDFs.

📄 License
Distributed under the MIT License. See LICENSE for more information.
