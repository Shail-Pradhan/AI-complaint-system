#!/bin/bash

# Create a temporary directory
temp_dir="complaint-system-package"
mkdir -p $temp_dir

# Copy necessary files
cp -r \
    src/ \
    backend/ \
    public/ \
    package.json \
    package-lock.json \
    tsconfig.json \
    next.config.js \
    .env \
    backend/.env \
    Dockerfile \
    docker-compose.yml \
    docker-compose.dev.yml \
    README.md \
    $temp_dir/

# Create zip file
zip -r complaint-system.zip $temp_dir

# Clean up
rm -rf $temp_dir

echo "Project has been packaged into complaint-system.zip"
echo "Remember to include the following environment variables in .env files:"
echo "- CLOUDINARY_CLOUD_NAME"
echo "- CLOUDINARY_API_KEY"
echo "- CLOUDINARY_API_SECRET"
echo "- GROQ_API_KEY"
echo "- JWT_SECRET_KEY" 