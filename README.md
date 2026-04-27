# 🧠 Project Title

# EduNest
A role-based school management portal for administrators, teachers, students, and parents, built with Next.js and MongoDB.

---

# 📌 Overview

EduNest is a full-stack academic operations platform that centralizes school workflows in one system.

It solves the common problem of fragmented school data and manual reporting by offering:
- Secure role-based access for 4 user types
- Structured academic records (attendance, marks, homework, remarks)
- Automated progress reports in PDF and attendance exports in Excel
- AI-assisted teacher remark generation

It is designed for:
- School administrators managing user onboarding and analytics
- Teachers handling class-level academic operations
- Students tracking progress and downloading reports
- Parents monitoring their child’s attendance, marks, and remarks

---

# 🚀 Features

- Role-based authentication and route protection for Admin, Teacher, Student, Parent
- Admin-led onboarding with auto-generated credentials for teacher/student/parent accounts
- Teacher assignment model (class + section + subject) used as authorization guard across APIs
- Attendance workflow with duplicate-day prevention and class validation
- Marks workflow with upsert-based bulk write for exam entries
- Homework assignment and soft delete lifecycle
- Multi-entry remarks with AI-generated suggestion support via Gemini
- Student and parent dashboards with aggregated academic insights
- Date-range based report generation APIs
- PDF progress reports (single-student and all-students)
- Attendance Excel export with styled register and attendance percentages
- Profile setup flow with avatar selection and session update

---

# 🛠 Tech Stack

- Language: JavaScript
- Framework: Next.js 16 (App Router)
- UI: React 19, Tailwind CSS 4, shadcn/ui, Lucide icons, Sonner toasts
- Auth: NextAuth (Credentials Provider, JWT sessions)
- Database: MongoDB with Mongoose
- Charts: Recharts
- Reports:
	- PDF: @react-pdf/renderer
	- Excel: ExcelJS
- AI: @google/generative-ai (Gemini 2.5 Flash)
- Utilities: clsx, class-variance-authority, tailwind-merge
- Tooling: ESLint, PostCSS

---

# 📂 Project Structure

```text
src/
	app/
		api/
			admin/          # Admin CRUD + stats + onboarding endpoints
			teacher/        # Attendance, marks, homework, remarks, reports, excel
			student/        # Student dashboard + report-facing APIs
			parent/         # Parent dashboard + child report-facing APIs
			auth/           # NextAuth route
			user/           # Profile setup (avatar + completion)
		dashboard/        # Role-specific pages and UI composition
		login/            # Credentials login page
		setup-profile/    # First-login avatar/profile completion flow
	components/
		admin/            # Admin forms, tables, drawers
		layout/           # Sidebar, topbar, dashboard shell
		shared/           # Charts, stat cards, PDF docs, report download buttons
		ui/               # shadcn/ui primitives
	lib/
		mongodb.js        # Cached MongoDB connection
		api.js            # Frontend API helper wrapper
		generateCredentials.js
		logoBase64.js     # Embedded logo for PDF rendering
	models/
		User.js
		Student.js
		Teacher.js
		Attendance.js
		Marks.js
		Homework.js
		Remark.js
		Subject.js
	middleware.js       # Route-level auth + role guard
```

---

# ⚙️ Installation & Setup

## Prerequisites
- Node.js 18+ (recommended for modern Next.js workflow)
- npm
- MongoDB database (local or Atlas)

## Steps

1. Clone the repository
```bash
git clone <your-repo-url>
cd edunest
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
Create a file named **.env.local** in the project root.

4. Add required environment variables
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_random_long_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
```

5. Run development server
```bash
npm run dev
```

6. Open the app
```text
http://localhost:3000
```

## Build for production
```bash
npm run build
npm run start
```

---

# 💡 Usage

- Login with a valid account.
- On first login, complete profile setup by selecting an avatar.
- Access dashboard based on your role:
	- Admin: manage users, view school statistics
	- Teacher: mark attendance, enter marks, assign homework, create/generate remarks, export reports
	- Student: track attendance, marks, homework, download report
	- Parent: monitor child metrics and download child report
- Use date range filters to generate PDF reports and Excel attendance sheets.

Assumption:
- Initial admin account seeding is handled externally (not found as explicit seed script in current codebase).

---

# 🧩 Key Implementation Insights

## 1. Centralized role enforcement at middleware + API layer

Middleware protects dashboard/setup paths before rendering. APIs also re-check role server-side for defense in depth.

```js
// middleware.js (concept)
if (!token) redirect("/login")

if (pathname.startsWith("/dashboard/admin") && token.role !== "admin") {
	redirect("/unauthorized")
}
```

Why it matters:
- Prevents unauthorized page access and API misuse even if frontend checks are bypassed.

---

## 2. Transactional student-parent onboarding with deterministic credential generation

Admin student creation uses a MongoDB session transaction to create linked parent + student records atomically.

```js
// add-student route (concept)
const dbSession = await mongoose.startSession()
dbSession.startTransaction()

// find next unique student/parent credentials
// hash passwords
// create parent user
// create student user
// create student profile linked to parent

await dbSession.commitTransaction()
```

Why it matters:
- Avoids partial writes (for example, parent created but student missing).
- Produces predictable school-scoped credentials based on shortform + sequence.

---

## 3. Teacher authorization model tied to assignments

Teacher operations validate class-section-subject ownership before allowing data writes.

```js
const isAssigned = teacher.assignments.some(
	a => a.class === cls && a.section === section && a.subjectName === subjectName
)
if (!isAssigned) return unauthorized()
```

Why it matters:
- Implements real-world teaching boundaries and prevents cross-class data manipulation.

---

## 4. Report pipeline: API aggregation + multi-format output

The reporting flow composes attendance, marks, subject percentages, and remarks, then renders:
- PDF progress reports via React PDF
- Excel attendance registers via ExcelJS

```js
// marks upsert workflow (teacher)
await Marks.bulkWrite(operations)

// excel export workflow
const wb = new ExcelJS.Workbook()
const ws = wb.addWorksheet(`Class ${cls}${section}`)
```

Why it matters:
- Converts raw academic data into institution-ready outputs for meetings, archives, and parent communication.


# 📜 License

MIT License

Copyright (c) 2026 EduNest Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the Software), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED AS IS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
