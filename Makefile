DOCKER_COMPOSE := docker compose -f docker/docker-compose.yml

#
# Local commands
#
local: app
	$(DOCKER_COMPOSE) up db -d --build
	node app/index.js

#
# Docker commands
#
docker: docker/
	$(DOCKER_COMPOSE) up -d --build

logs:
	$(DOCKER_COMPOSE) logs -f

down:
	$(DOCKER_COMPOSE) down

clean:
	$(DOCKER_COMPOSE) down -v

.PHONY: local docker docker-stop