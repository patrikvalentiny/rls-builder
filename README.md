# PostgreSQL Row Level Security (RLS) Builder & Auditor

A comprehensive toolkit for designing, validating, and managing PostgreSQL Row-Level Security (RLS) policies. This tool helps developers ensure their database authorization logic is secure, performant, and error-free.

## 🚀 Overview

Row-Level Security (RLS) is powerful but can be complex to manage and prone to "footguns" like infinite recursion or blind writes. This project provides a UI to:

* **Build**: Visually design policies without memorizing complex SQL syntax.
* **Lint**: Analyze policies for security vulnerabilities (e.g., `USING (true)` on updates) and performance issues.
* **Manage**: Organize policies into collections and generate audit reports (PDF).

## ✨ Features

* **Visual Policy Builder**: Form-based interface to generate valid `CREATE POLICY` SQL.
* **Static Analysis / Linter**: Detects security risks, logic errors, and performance bottlenecks in your SQL.
* **Policy Management**: Group policies by collection (e.g., per tenant, per feature).
* **Offline & Secure**: Runs entirely client-side. No database credentials leave your browser.
* **Audit Reports**: Export policy documentation to PDF.

## 🛠️ Getting Started

### Prerequisites

* Node.js (v18+ recommended)
* npm, yarn, or pnpm

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/patrikvalentiny/rls-builder.git
    cd rls-builder
    ```

2. Install dependencies:

    ```bash
    npm install
    # or
    pnpm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    # or
    pnpm dev
    ```

4. Open your browser at `http://localhost:5173` (or the port shown in the terminal).

## 💡 Usage & Examples

### Testing with Example Data

The repository includes an `examples/` directory with sample policy configurations to help you get started.

* **`examples/policies.json`**: A collection of common RLS patterns.
* **`examples/example.json`**: A sample project configuration.

You can refer to these JSON files to understand how policy collections are structured or use them as a reference when creating your own policies in the builder.

### Core Modules

1. **Builder**: Navigate to the Builder tab to create a new policy from scratch.
2. **Parser**: Paste existing SQL `CREATE POLICY` statements to analyze them for issues.
3. **Overview**: View and manage your saved policy collections.

## 🏗️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite
* **UI**: Tailwind CSS, DaisyUI
* **Routing**: wouter
* **Storage**: localforage (IndexedDB)
* **PDF Generation**: @react-pdf/renderer

## 📄 License

```markdown
Copyright (c) the respective contributors, as shown by the AUTHORS file.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```