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
2. Extract the files to the docker folder structure  in which you will start our project. (The project files should be placed into the /app/public directory)
3. Change the filename of ".env.TEMPLATE" into ".env", change the database details to your own settings.

``` .env 
#Specific project name
COMPOSE_PROJECT_NAME="your_project"

# Environment Variables for database.
DB_SERVER="your_database"
DB_ROOT_USER="your_database_user"
DB_ROOT_PASSWORD="your_database_password"

```

4. Move the "docker-compose.yaml.TEMPLATE" file into your docker-container. Change the name into "docker-compose.yaml".
5. Move the ".env" file into your docker-container. It needs to be in the same folder where your "docker-compose.yaml" is.
6. Open your prefered terminal/console in the project folder and execute "docker-compose up" in your console.

``` Powershell
docker-compose up
```
6. Wait a few seconds till the docker-container is running. (First time you docker-compose up your it will take a moment)
7. Open X, enter your database login data you set in step 3. to login.
8. Import the "x.SQL" in X. Check if the database appears on the left side of the screen
9. Go to X  in your favorite browser.
12. Enjoy