# PaperFlow Makefile
.PHONY: help install clean start stop backend frontend test docker-up docker-down

# Default target
help:
	@echo "🚀 PaperFlow - Available Commands:"
	@echo "=================================="
	@echo "make install     - Install all dependencies"
	@echo "make start       - Start both frontend and backend"
	@echo "make backend     - Start only backend"
	@echo "make frontend    - Start only frontend"
	@echo "make test        - Run integration tests"
	@echo "make clean       - Clean up processes and cache"
	@echo "make docker-up   - Start with Docker Compose"
	@echo "make docker-down - Stop Docker containers"
	@echo "make stop        - Stop all processes"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@cd backend_python && pip install -r requirements.txt
	@npm install
	@echo "✅ Dependencies installed!"

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	@-pkill -f "uvicorn" 2>/dev/null || true
	@-pkill -f "vite" 2>/dev/null || true
	@-lsof -ti:8000 | xargs kill -9 2>/dev/null || true
	@-lsof -ti:5173 | xargs kill -9 2>/dev/null || true
	@npm cache clean --force 2>/dev/null || true
	@echo "✅ Cleanup completed!"

# Start backend only
backend: clean
	@echo "🐍 Starting Python backend..."
	@cd backend_python && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
	@sleep 3
	@echo "✅ Backend started on http://localhost:8000"

# Start frontend only
frontend:
	@echo "⚛️ Starting React frontend..."
	@npm run dev &
	@sleep 3
	@echo "✅ Frontend started on http://localhost:5173"

# Start both services
start: clean install
	@echo "🚀 Starting PaperFlow..."
	@make backend
	@make frontend
	@echo "🎉 PaperFlow is running!"
	@echo "🌐 Frontend: http://localhost:5173"
	@echo "🔧 Backend: http://localhost:8000"
	@echo "📚 API Docs: http://localhost:8000/docs"

# Stop all processes
stop:
	@echo "🛑 Stopping all processes..."
	@make clean
	@echo "✅ All processes stopped!"

# Run tests
test:
	@echo "🧪 Running integration tests..."
	@python test_integration.py

# Docker commands
docker-up:
	@echo "🐳 Starting with Docker Compose..."
	@docker-compose up --build -d
	@echo "✅ Docker containers started!"
	@echo "🌐 Frontend: http://localhost:5173"
	@echo "🔧 Backend: http://localhost:8000"

docker-down:
	@echo "🐳 Stopping Docker containers..."
	@docker-compose down
	@echo "✅ Docker containers stopped!"

# Development mode with auto-restart
dev: clean
	@echo "🔄 Starting in development mode..."
	@make backend
	@make frontend
	@echo "🎯 Development mode active - files will auto-reload"