<div align="center">
  <div style="background-color: #2563eb; width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
  </div>
  
  <h1>PocketFlow</h1>
  
  <p>
    <b>A minimalist, premium personal finance and expense tracker.</b><br>
    Track incomes, manage expenses, set budgets, and achieve financial goals with a beautiful glassmorphic UI.
  </p>
</div>

---

### 🌟 Features

- **Transactions**: Add incomes and expenses with categories, notes, and tags.
- **Analytics**: Beautiful Recharts-based pie charts to visualize your spending.
- **Goals & Wishlist**: Track progress towards financial targets with visual progress bars.
- **Security**: Built-in PIN lock system using Firebase cloud synchronization.
- **Global Search**: Instantly find any transaction or note with the Cmd+K quick search.
- **Fully Responsive**: Perfect mobile-first experience using TailwindCSS.
- **Dark & Light Mode**: Gorgeous customized themes.

### 🛠️ Tech Stack
- React (Vite)
- TailwindCSS
- Firebase Firestore (Real-time Cloud Database)
- Lucide React Icons
- Recharts

### 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/MightyFardin/PocketFlow.git
```
2. Install dependencies
```bash
npm install
```
3. Run the development server
```bash
npm run dev
```

### 🔒 Database Architecture
PocketFlow operates as a personal, local-first application but leverages Firebase Firestore to ensure your data is perfectly synced across all your devices in real-time, without requiring a traditional login system.
