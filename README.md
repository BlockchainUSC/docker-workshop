# Docker Workshop
> NodeJS with PostgreSQL Database

This repository demonstrates how to build and orchestrate a simple Node.js application and a PostgreSQL database using Docker and Docker Compose. The Node.js app provides a web interface to:

- Upload text messages (stored in a "messages" table).
- Upload files (stored in a "files" table) in the database.

## Directory Structure
```
docker-workshop/
├── app/
│   ├── index.js           # Node.js server for routes & uploads
│   ├── package.json       # Node.js project dependencies
│   └── package-lock.json  # Node.js locked dependencies
├── docker/
│   ├── docker-compose.yml # Orchestrates web app + PostgreSQL
│   └── Dockerfile         # Dockerfile for building the web app image
├── Makefile               # Make commands for building and running
├── README.md              # Project documentation
└── .gitignore             # Files/folders ignored by Git

```

## Prerequisites
* Docker installed on your machine (https://docs.docker.com/get-docker/).
* Docker Compose (often included with Docker Desktop).
* (Optional) Make (https://www.gnu.org/software/make/) to use the provided Makefile commands.
* (Optional) DBeaver (https://dbeaver.io/) for database inspection.

## Usage
### (via Makefile)
> The Makefile defines convenient commands for running this project.

Run Locally with Docker DB
```bash
make local
```

Run Entirely in Docker
```bash
make docker
```

View Logs
```bash
make logs
```

Stop Containers
```bash
make down
```

Remove Containers and Volumes
```bash
make clean
```

### (Without Make)
> If you don’t want to use make, you can run Docker Compose commands manually.

Navigate to the "docker/" directory or use the "-f" flag:
```
docker compose -f docker/docker-compose.yml build
docker compose -f docker/docker-compose.yml up
```

Stop containers:
```
docker compose -f docker/docker-compose.yml down
```

Remove containers and volumes:
```
docker compose -f docker/docker-compose.yml down -v
```

## Application Endpoints
Once running, the Node.js app listens on http://localhost:8080.

### Store a text message:
1. Enter a message in the text field and click "Store" to insert it into the "messages" table.

### Upload a file:
1. Go to http://localhost:8080, choose a file, and click "Upload"
2. The file is saved in the "files" table as binary data.

## Inspecting the Database
### DBeaver
> Use DBeaver to connect to the PostgreSQL database.

### Connect to the Database Container
> List all tables with sql queries

1. Connect to the container database
	```bash
	docker compose -f docker/docker-compose.yml exec db psql -U user -d postgres
	```
1. Use the following SQL queries to list all tables and their contents:
	```sql
	SELECT * FROM messages; SELECT * FROM files;
	```

## Troubleshooting
### Port Conflicts:
If 8080 or 5432 is already in use, update them in docker/docker-compose.yml or stop the conflicting service.

### Permission Errors (File Upload):
Check Docker volume permissions and ensure your host OS allows Docker to write to the mounted folder.

### Database Connection Fails:
Double-check environment variables in docker/docker-compose.yml, and confirm they match the settings in app/index.js.