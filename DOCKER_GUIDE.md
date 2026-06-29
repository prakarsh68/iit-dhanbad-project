# AEGIS: Docker Deployment & Access Guide

This guide provides step-by-step instructions on how to containerize, run, and access **AEGIS: An Intelligent Digital Twin Framework for Vehicle Health Monitoring and Predictive Maintenance** using Docker and Docker Compose.

---

## 📋 Prerequisites

Before running the project, make sure you have the following installed on your system:
1. **Docker Desktop** (version 20.10+): [Download Docker](https://www.docker.com/products/docker-desktop/)
2. **Docker Compose** (usually bundled with Docker Desktop): [Compose Documentation](https://docs.docker.com/compose/)

Ensure the Docker daemon is running on your system before proceeding.

---

## 🚀 Quick Start (Running Both Services Together)

To spin up the entire application (both the React frontend and FastAPI backend) automatically:

1. **Open a terminal/shell** in this repository folder (`IIT_DigitalTwin`).
2. Run the following command:
   ```bash
   docker compose up --build
   ```
3. Docker will automatically download the necessary base images, build the React frontend production assets, configure Nginx, and start both containers.
4. **Keep this terminal window open** to view real-time log outputs.

---

## 🌐 Accessing the Application

Once the containers are successfully launched, you can access the application interfaces in your browser:

| Component | Host URL | Description |
| :--- | :--- | :--- |
| **AEGIS Web Console** | [http://localhost:3000](http://localhost:3000) | The main React digital twin dashboard interface (Tyre AI & EV Motor Twin). |
| **Backend API Root** | [http://localhost:7860](http://localhost:7860) | FastAPI root confirming backend status (`{"status":"running"}`). |
| **API Docs (Swagger)** | [http://localhost:7860/docs](http://localhost:7860/docs) | Interactive Swagger UI to inspect, test, and document all backend API routes. |

---

## 🛠️ Configuration & Customization

### Changing Build-time API Endpoints

The React frontend embeds environment variables during compilation. By default, the `docker-compose.yml` configures the frontend to talk to the local backend running inside Docker at `http://localhost:7860`.

If you wish to change these endpoints, edit the `args` section in `docker-compose.yml` before running the build command:

```yaml
frontend:
  build:
    context: .
    dockerfile: Dockerfile
    args:
      - VITE_API_BASE_URL=http://localhost:7860  # Point to local or remote Tyre API
      - VITE_MOTOR_API_BASE_URL=https://ev-motor-digital-twin-api.onrender.com
      - VITE_APP_API_KEY=your_key_here
```

### Data Persistence

The backend container maps the sibling host directory `../IIT_Project/data` to `/app/data` inside the container. This ensures that any processed inspection logs, uploaded assets, or generated PDF reports persist on your physical machine even if you stop or rebuild the Docker container.

---

## 🛑 Stopping the Application

To shut down the running containers:

1. Press `Ctrl + C` in the terminal where Docker Compose is running.
2. Alternatively, open a new terminal in this directory and run:
   ```bash
   docker compose down
   ```

---

## 🔍 Troubleshooting

### Port 3000 or 7860 is Already in Use
If you receive an error like `bind: address already in use`, it means another process is occupying that port.
- Open `docker-compose.yml` and modify the host-side port mappings.
- For example, change `"3000:80"` to `"8080:80"` to access the web app at `http://localhost:8080`.

### Rebuilding After Code Changes
If you modify source code in either the frontend or backend, rebuild the Docker images to apply your modifications:
```bash
docker compose build --no-cache
docker compose up
```
