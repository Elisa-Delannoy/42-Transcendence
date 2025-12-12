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
	@echo "$(GREEN)\n 🤖  Build up successfully ✴️  $(NAME) ✴️$(RESET)"

down:
	@$(COMPOSE) down
	@echo "$(RED)\n 🚽  Tear down successfully ❄️  $(NAME) ❄️$(RESET)"

# Clean
clean:
	@$(COMPOSE) down --volumes
	@echo "$(RED)\n 🗑️  Clean up successfully containers and volumes 🗑️ $(RESET)"

fclean:
	@$(COMPOSE) down --volumes --rmi all
	@echo "$(RED)\n 🗑️🗑️  Deep clean successfully containers, volumes, images and data 🗑️🗑️ $(RESET)"

re: fclean all

.PHONY: all clean fclean up down re
