
## Running the app

```bash
# development
 before running you should set up correct env configuration file in node-school-test/src/shared/database/database.module "envFilePath: '.development.env'"

$ docker-compose up --build

after app build you should execute in docker "app" container command "yarn migration:run"

## Test
before running you should set up correct env configuration file in node-school-test/src/shared/database/database.module "envFilePath: '.test.env'" and run application locally
(you can also use existing .test.env, but don't forget to start the database in docker)
as a result of tests, pictures will be created in the project directory "storage" and "test/test-files/response-files"
yarn test
```