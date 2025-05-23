# ThinkMLApp

A full-stack web application featuring an AI assistant chat interface with user authentication.

## Features

- Interactive AI chat interface (ThinkBot)
- User authentication (registration and login)
- Real-time message display
- Responsive design
- Secure backend API

## Tech Stack

### Frontend
- React 18.2.0
- React Router DOM 7.6.0
- Styled Components 6.1.18
- Axios

### Backend
- Flask
- SQLite3
- Python

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8 or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ThinkMLApp.git
cd ThinkMLApp
```

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server
```bash
cd backend
python app.py
```

2. Start the frontend development server
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
ThinkMLApp/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   └── engine/           # Chat engine logic
├── backend/              # Flask server
│   ├── app.py           # Main server file
│   └── requirements.txt  # Python dependencies
├── public/              # Static assets
└── package.json        # Frontend dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 