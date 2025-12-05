# Spendr 💸

**Spendr** is a modern, personal finance tracker designed to help you manage your money smarter. Track expenses, monitor income, and understand your spending patterns with beautiful, interactive charts.

![Spendr Dashboard](/public/og-image.png)

## ✨ Features

- **📊 Visual Analytics**: Interactive charts and graphs to visualize your spending habits (Income vs. Expenses, Category Breakdown).
- **💰 Transaction Management**: Easily add, edit, and delete income and expense transactions.
- **🏷️ Smart Categorization**: Organize transactions with built-in categories (Food, Transport, Shopping, etc.).
- **🎯 Budget Tracking**: Set monthly budgets and track your progress with visual indicators.
- **📱 Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices.
- **🔐 Secure Authentication**: Sign in with Google or Email/Password (powered by Supabase).
- **📤 Data Export**: Export your entire transaction history to CSV for external analysis.
- **🌑 Dark Mode Support**: Sleek UI that adapts to your system preferences.

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Backend / Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these steps to run the project locally:

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/spendr.git
    cd spendr
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open in browser:**
    Navigate to `http://localhost:8080` (or the port shown in your terminal).

## 🔮 Roadmap

- [ ] **SMS Integration**: Companion Android app to auto-sync bank SMS transactions (Coming Soon).
- [ ] **Recurring Transactions**: Set up automatic recurring income/expenses.
- [ ] **Custom Categories**: Allow users to create their own categories.
- [ ] **Multi-currency Support**: Track finances in different currencies.

## 📄 License

This project is licensed under the MIT License.