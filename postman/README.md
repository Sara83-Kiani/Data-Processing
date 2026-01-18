# Postman Tests (StreamFlix)

## Import

1. Open Postman
2. Import the collection:
   - `postman/StreamFlix.postman_collection.json`
3. Import the environment:
   - `postman/StreamFlix.postman_environment.json`
4. Select the environment **"StreamFlix - Local"**

## Run order

Run requests in order `01` -> `37`.

- The first block (`01` -> `15`) covers the “happy path” (successful requests).
- The second block (`16` -> `37`) covers common negative outcomes (400/401/403/404).

## Notes

- The protected requests require a valid JWT. The collection stores it automatically after `08 - Login` into the environment variable `accessToken`.
- Default login credentials in the environment are:
  - `john.doe@streamflix.com`
  - `Test123456`

- The forbidden tests use `otherProfileId=3` by default, which assumes seeded data where profile 3 is owned by another account.

If login fails, update `loginEmail` / `loginPassword` in the Postman environment to match a valid activated user in your database.
