# EIP.directory

[![Website](https://img.shields.io/website?url=https%3A%2F%2Feip.directory)](https://eip.directory)
[![Twitter Follow](https://img.shields.io/twitter/follow/velvet_shark?style=social)](https://twitter.com/velvet_shark)

> **All your EIPs, ERCs, CAIPs, and RIPs in one place.**

EIP.directory is an open-source web application that aggregates and presents Ethereum-related improvement proposals in a clean, searchable interface. Visit at [eip.directory](https://eip.directory).

## 🚀 Features

- **Comprehensive Coverage**: Browse all major Ethereum proposal types:

  - **EIPs** - Ethereum Improvement Proposals
  - **ERCs** - Ethereum Requests for Comments
  - **CAIPs** - Chain Agnostic Improvement Proposals
  - **RIPs** - Rollup Improvement Proposals

- **Enhanced Content**: Important proposals include a "Why is it important?" section explaining their significance in simple terms

- **Modern Interface**: Clean, responsive design with dark/light mode support

- **Smart Search**: Fast, intuitive search across all proposals

- **Real-time Updates**: Automated synchronization with upstream repositories

## 🛠 Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **Zustand** - State management
- **React Markdown** - Markdown rendering with syntax highlighting

### Backend

- **Python** - Proposal fetching and processing
- **Supabase** - Database and authentication
- **GitHub API** - Source of truth for proposals

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Supabase account (for database)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/velvet-shark/eips-with-style.git
   cd eips-with-style
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Set up Python environment**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Configure environment variables**

   ```bash
   # Frontend (.env.local)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Backend (.env)
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

### Updating Proposals

To fetch and update proposals from GitHub:

```bash
cd backend
source venv/bin/activate
python proposal_updater.py
```

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── [proposalType]/     # Dynamic routes for proposal types
│   ├── api/                # API routes
│   └── auth/               # Authentication pages
├── backend/                # Python proposal updater
│   ├── proposal_updater.py # Main update script
│   └── downloaded_proposals/ # Cached proposal files
├── components/             # React components
├── config/                 # Configuration files
├── contexts/              # React contexts
├── database/              # Database schema
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── public/                # Static assets
└── utils/                 # Helper functions
```

## 🤝 Contributing

Contributions are very welcome! Here's how you can help:

### Ways to Contribute

1. **Report bugs** - Found something broken? Open an issue
2. **Suggest features** - Have ideas for improvements? We'd love to hear them
3. **Improve content** - Help write "Why is it important?" sections for proposals
4. **Fix issues** - Browse open issues and submit pull requests
5. **Improve documentation** - Help make our docs clearer

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure code quality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- We use TypeScript for type safety
- Follow existing code patterns and conventions
- Use Prettier for code formatting
- Write meaningful commit messages

## 📞 Support

- **Website**: [eip.directory](https://eip.directory)
- **GitHub Issues**: [Report bugs or request features](https://github.com/velvet-shark/eips-with-style/issues)
- **Twitter**: [@velvet_shark](https://twitter.com/velvet_shark)

---

<div align="center">
  <p>Built with ❤️ for the Ethereum community</p>
  <p><a href="https://eip.directory">EIP.directory</a></p>
</div>
