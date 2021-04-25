
# FullStack app with React, GraphQL, PostgresQL and TypeScript

## MikroORM migrations
Setting up migrations allows us to modify the postgres tables to add or remove the colums we have defined on the entities file. If we delete the property "surname" on our user entity file and then run the migration, the user postgres table will be modified with the same changes as in the entity

## Pasword hashed with argon2
It's supposed to be better than bcrypt so let's try it

## Stored sessions on Redis
We choose Redis to store the user session because it's faster than Postgresql
```
req.session.userId = user.id;

{ userId: 1} -> send that to redis

//key               value
sess:qwertuiop -> {userId: 1}

express-sesion will set a cookie on my browser 2dafsadfasd87fadgg89adg (signed version of key)

when user makes a request:
2dafsadfasd87fadgg89adg -> sent to the server

Server decrypt the cookie
2dafsadfasd87fadgg89adg -> sess:qwertuiop

make a request to redis
sess:qwertuiop -> {userId: 1}

```
