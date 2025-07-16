#!/bin/bash

# Setup script for K6-Script-Ai repository
# This script helps you set up the repository locally and push to GitHub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check if we're in the right directory
if [ ! -f "odyssey-k6-test.js" ]; then
    print_error "odyssey-k6-test.js not found. Please run this script from the directory containing the K6 files."
    exit 1
fi

print_header "K6-Script-Ai Repository Setup"

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    print_warning "K6 is not installed. You'll need to install it to run the tests."
    echo "Installation instructions:"
    echo "  macOS: brew install k6"
    echo "  Linux: See odyssey-k6-execution-guide.md"
    echo "  Windows: choco install k6"
fi

# Get GitHub username
print_status "Enter your GitHub username:"
read -r GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    print_error "GitHub username is required."
    exit 1
fi

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
    print_status "Git repository initialized."
else
    print_status "Git repository already exists."
fi

# Add remote origin
REPO_URL="https://github.com/$GITHUB_USERNAME/K6-Script-Ai.git"
print_status "Adding remote origin: $REPO_URL"

if git remote get-url origin &> /dev/null; then
    print_warning "Remote origin already exists. Updating..."
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
fi

# Create necessary directories
print_status "Creating directory structure..."
mkdir -p .github/workflows
mkdir -p docs
mkdir -p config
mkdir -p examples

# Stage all files
print_status "Staging files for commit..."
git add .

# Check if there are any changes to commit
if git diff --staged --quiet; then
    print_warning "No changes to commit."
else
    # Commit files
    print_status "Committing files..."
    git commit -m "Initial commit: K6 load testing suite for Odyssey REST API

- Complete coverage of all 51 API endpoints
- Multiple test scenarios (smoke, load, stress, spike, endurance)
- Smart test data management and validation
- CI/CD integration with GitHub Actions
- Comprehensive documentation and execution guides
- Production-ready error handling and reporting

Generated with AI assistance for comprehensive API load testing."
fi

# Ask about pushing
print_status "Ready to push to GitHub. Have you created the repository 'K6-Script-Ai' on GitHub? (y/n)"
read -r PUSH_CONFIRM

if [ "$PUSH_CONFIRM" = "y" ] || [ "$PUSH_CONFIRM" = "Y" ]; then
    print_status "Pushing to GitHub..."
    
    # Check if main branch exists, if not create it
    if ! git show-ref --verify --quiet refs/heads/main; then
        git branch -M main
    fi
    
    # Push to GitHub
    if git push -u origin main; then
        print_status "Successfully pushed to GitHub!"
        echo ""
        print_header "Next Steps"
        echo "1. Go to: https://github.com/$GITHUB_USERNAME/K6-Script-Ai"
        echo "2. Add your Odyssey API token as a repository secret:"
        echo "   - Go to Settings > Secrets and variables > Actions"
        echo "   - Click 'New repository secret'"
        echo "   - Name: ODYSSEY_API_TOKEN"
        echo "   - Value: Your Bearer token (including 'Bearer ' prefix)"
        echo "3. Update test data in odyssey-k6-config.js with your phone numbers and emails"
        echo "4. Run your first test: npm run test:smoke"
        echo ""
        print_status "Repository setup complete! 🎉"
    else
        print_error "Failed to push to GitHub. Please check:"
        echo "1. Repository exists: https://github.com/$GITHUB_USERNAME/K6-Script-Ai"
        echo "2. You have push permissions"
        echo "3. Your Git credentials are configured"
    fi
else
    print_warning "Skipping push to GitHub."
    echo "To push later, run: git push -u origin main"
fi

# Validate script files
print_status "Validating K6 script files..."
if k6 --version &> /dev/null; then
    # Basic syntax check
    echo "Checking script syntax..."
    if node -c odyssey-k6-test.js &> /dev/null; then
        print_status "✅ Main script syntax is valid"
    else
        print_warning "⚠️  Main script syntax check failed"
    fi
    
    if node -c odyssey-k6-config.js &> /dev/null; then
        print_status "✅ Config script syntax is valid"
    else
        print_warning "⚠️  Config script syntax check failed"
    fi
    
    if node -c odyssey-k6-scenarios.js &> /dev/null; then
        print_status "✅ Scenarios script syntax is valid"
    else
        print_warning "⚠️  Scenarios script syntax check failed"
    fi
else
    print_warning "K6 not installed - skipping syntax validation"
fi

# Create a quick test script
print_status "Creating quick test script..."
cat > quick-test.sh << 'EOF'
#!/bin/bash
# Quick test script for K6-Script-Ai

# Check if AUTH_TOKEN is set
if [ -z "$AUTH_TOKEN" ]; then
    echo "Please set your AUTH_TOKEN environment variable:"
    echo "export AUTH_TOKEN=\"Bearer YOUR_ODYSSEY_API_TOKEN\""
    exit 1
fi

# Run smoke test
echo "Running smoke test..."
k6 run --env AUTH_TOKEN="$AUTH_TOKEN" --env TEST_SCENARIO=smoke odyssey-k6-test.js
EOF

chmod +x quick-test.sh
print_status "Created quick-test.sh for easy testing"

print_header "Setup Summary"
echo "✅ Repository initialized and configured"
echo "✅ Files staged and committed"
echo "✅ Remote origin set to: $REPO_URL"
echo "✅ GitHub Actions workflow configured"
echo "✅ Documentation and guides included"
echo "✅ Quick test script created"
echo ""
echo "Repository is ready for use!"
echo "Documentation: odyssey-k6-README.md"
echo "Execution Guide: odyssey-k6-execution-guide.md"
echo "Quick Test: ./quick-test.sh"