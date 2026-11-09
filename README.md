# AI Lab

### An Experimental AI-Assisted Software Development Environment

**AI Lab** is an open-source project exploring a more integrated relationship between artificial intelligence and software development.

The vision is to create an environment where an AI model can understand a project's codebase, examine its structure, propose code modifications, validate those modifications, and iteratively repair errors — all while keeping the human developer in control.

Rather than functioning solely as a chatbot, AI Lab aims to become an intelligent development environment capable of participating directly in its own software development process.

---

## Project Vision

What if an AI model could do more than generate code snippets?

What if it could understand the entire project it operates within, identify problems, implement improvements, test its changes, and learn from validation failures?

AI Lab is an experiment towards making that vision practical.

The central principle is **AI-assisted development with human supervision**. The AI proposes changes, validation mechanisms examine them, and the developer retains final approval.

## Core Capabilities

The project is being developed around the following capabilities:

- **AI Chat Interface:** An integrated graphical interface for interacting with an AI model.
- **Project File Access:** A file-access architecture designed to let the AI inspect the project codebase using a dynamically generated file structure.
- **AI-Assisted Code Editing:** A system for generating and proposing modifications to existing project files.
- **Code Validation:** Docker-based isolated environments for testing proposed changes.
- **Automated Repair Pipeline:** An iterative mechanism intended to capture validation failures and allow the AI to attempt corrections.
- **Human Approval:** A review and approval workflow that keeps the developer in control of changes before they are applied.

*Note: AI Lab is under active development. Some capabilities remain experimental and are still being integrated and tested.*

## Technology Stack

| Technology | Purpose |
|---|---|
| Electron | Desktop application framework |
| JavaScript | Application logic and interface |
| Python | Supporting utilities and validation |
| SQLite | Local event logging |
| Docker | Isolated code validation |

## Getting Started

### Requirements

- Node.js and npm
- Python
- Docker Desktop
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/BraindeadLoser/AI_LAB.git
```

Navigate into the project:

```bash
cd AI_LAB
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

Additional configuration may be required for the AI provider and Docker-based validation environment.

## Development Roadmap

AI Lab is an evolving project. Its longer-term objectives include:

- Reliable project-wide AI code accessibility.
- Improved code understanding and retrieval.
- More robust automated validation and repair.
- Safer experimentation and rollback of AI-generated modifications.
- Expanded language support.
- A progressively more capable self-improving development environment.

## Contributing

AI Lab is an independent open-source experiment, and contributions, suggestions, bug reports and constructive criticism are welcome.

Developers interested in AI-assisted software engineering, autonomous development systems and human-supervised automation are encouraged to explore the project.

## Support AI Lab

Building and maintaining an experimental development environment requires time, resources and continuous experimentation.

If you find the project interesting or believe in its vision, consider supporting its development.

**Your sponsorship helps make continued development possible.**

- [Become a GitHub Sponsor](https://github.com/sponsors/BraindeadLoser)
- [Explore the AI Lab Repository](https://github.com/BraindeadLoser/AI_LAB)

Every contribution, regardless of size, is appreciated.

---

*AI Lab — Exploring the future of AI-assisted software development.*