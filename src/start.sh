#!/bin/bash

# Interface RAG Full-Stack Application Starter Script

echo "🚀 Starting Interface RAG Full-Stack Application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No .env file found. Creating from example..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env with your actual configuration values:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_KEY"
    echo "   - OLLAMA_HOST (if different from default)"
    echo ""
    read -p "Press Enter to continue after updating .env file..."
fi

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Application started successfully!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "🛑 To stop the application, run: docker-compose down"
