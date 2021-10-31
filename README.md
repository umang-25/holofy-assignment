## API Doc
### Books

    API access points that interacts with the books collections

    POST /books -> requires uuid, header : x-access-token, optional: name,releaseDate, author
    PATCH /books/:bookUuid -> requires book's uuid as param, header : x-access-token, optional: name,releaseDate, author 
    GET /books?page=<page> -> requires a page number as query, header : x-access-token, returns: <page limit> number of books for the page
    GET /books/:bookUuid -> requires book's uuid as param, header : x-access-token, returns: book if it exists in the database
    DELETE /books/:bookUuid -> requires book's uuid, header : x-access-token
    DELETE /books -> requires header : x-access-token

### User

    API access points that register users, update token for a user and get token for a registered user

    POST /user -> requires phone, isAdmin, returns: user object {phone, isAdmin, token}
    GET /token -> requires phone, returns: token
    PUT /token/:phone -> requires phone as query, returns: token

### USE
    1. run node index.js
    2. create a user using POST /user with a phone number, if the user will be an admin, send isAdmin:1 in the body
    3. Once a user is created their admin status cannot be changed, thus create admin while registering
    4. use the token to access books api
    5. If a token is expired(in 2 hours) update the token for a user using PUT /token/:phone