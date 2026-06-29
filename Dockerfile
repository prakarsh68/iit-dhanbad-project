# ==========================================
# BUILD STAGE
# ==========================================
FROM node:20.19-alpine AS build

WORKDIR /app

# Copy package management files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source files
COPY . .

# Set up build arguments for Vite environment variables
ARG VITE_API_BASE_URL=https://prakarshawasthi-iit-dhanbad-backend.hf.space
ARG VITE_MOTOR_API_BASE_URL=https://ev-motor-digital-twin-api.onrender.com
ARG VITE_APP_API_KEY
ARG VITE_GEMINI_API_KEY
ARG VITE_HYDRAULIC_API_KEY

# Expose arguments as environment variables for the Vite build compiler
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_MOTOR_API_BASE_URL=$VITE_MOTOR_API_BASE_URL
ENV VITE_APP_API_KEY=$VITE_APP_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_HYDRAULIC_API_KEY=$VITE_HYDRAULIC_API_KEY

# Build the application
RUN npm run build

# ==========================================
# PRODUCTION STAGE
# ==========================================
FROM nginx:1.27-alpine

# Copy built static assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx server configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
