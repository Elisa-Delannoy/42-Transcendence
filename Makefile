# ***** Color Definition ***** #

RED = \033[91m
YELLOW = \033[33m
GREEN = \033[92m
RESET = \033[0m

# **************************** #

NAME 		= ft_transcendence

# Compose
COMPOSE     = docker compose -f docker-compose.yml

# Targets
all:	up

up:		$(NAME)

$(NAME):
	@$(COMPOSE) up -d --build
	@echo "$(GREEN)\n 🤖  Build up successfully ✴️  $(NAME) ✴️$(RESET)\n"
	@echo "$(GREEN)\n You can connect to https://localhost:3000\n You can test with pseudo: 42, password:42 or create an account\n $(RESET)"

down:
	@$(COMPOSE) down
	@echo "$(RED)\n 🚽  Tear down successfully ❄️  $(NAME) ❄️$(RESET)
	You can connect to https://localhost:3000\n
	You can test with pseudo: 42, password:42 or create an account\n"

# Clean
clean:
	@$(COMPOSE) down --volumes
	@echo "$(RED)\n 🗑️  Clean up successfully containers and volumes 🗑️ $(RESET)\n"

fclean:
	@$(COMPOSE) down --volumes --rmi all
	@echo "$(RED)\n 🗑️🗑️  Deep clean successfully containers, volumes, images and data 🗑️🗑️ $(RESET)\n"

re: fclean all

help:
	@echo "\n\tℹ️  $(GREEN) COMMANDS $(RESET) ℹ️\n"
	@echo "- $(YELLOW)make$(RESET) / $(YELLOW)make all$(RESET) / $(YELLOW)make up$(RESET): build the program with Docker"
	@echo "- $(YELLOW)make down$(RESET): tear down the program"
	@echo "- $(YELLOW)make clean$(RESET): clean up containers and volumes"
	@echo "- $(YELLOW)make fclean$(RESET): deep clean all containers, volumes, images, data"
	@echo "- $(YELLOW)make re$(RESET): clean all and rebuild program"
	@echo "- $(YELLOW)make help$(RESET): helps with all commands\n"

.PHONY: all clean fclean up down re help
