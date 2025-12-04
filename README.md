# Year 2 period 2 

## Project StreamFlix Data Processing 

### Group members:
* Beyza Ölmez Email: beyza.olmez@student.nhlstenden.com
* Sara Kiani Nejad Email: sara.kiani.nejad@student.nhlstenden.com
* Stefan Bryda Email: stefan.bryda@student.nhlstenden.com
* Miriam Cerulíková Email: miriam.cerulikova@student.nhlstenden.com

## Getting started
These instrutions will aid you in setting up the environment for our web application.

## Local on your own machine
This section is for the people that want to run our web-application in a docker-container
### Prerequisites

#### Windows

- [Docker desktop](https://docs.docker.com/desktop/windows/install/)

#### Mac

- [Docker Desktop for Mac](https://docs.docker.com/desktop/mac/install/)
  - Note: Do check the architecture of your Mac! (x64/arm64)

#### Linux and friends

- [Docker engine](https://docs.docker.com/engine/install/#server)
  - Select your distribution from the table and follow the provided instructions.

### Running

1. Download the archive containing the necessary files.
2. Create an empty folder called "mysqldata"
3. Change the filename of "docker-compose.yamlTEMPLATE" into "docker-compose.yaml".
4. Change the filename of ".env.TEMPLATE" into ".env", change the database details to your own settings.

``` .env 
#Specific project name
COMPOSE_PROJECT_NAME="your_project"

# Environment Variables for database.
DB_SERVER="your_database"
DB_ROOT_USER="your_database_user"
DB_ROOT_PASSWORD="your_database_password"

```
5. Open your prefered terminal/console in the project folder and execute "docker compose up --build" in your console.

``` Powershell
docker compose up --build
```
6. Wait a few seconds till the docker-container is running. (First time you docker compose up --build it will take a moment.)
7. Open ???, enter your database login data you set in step 4 to login.
9. Go to ??? in your favorite browser.
12. Enjoy!