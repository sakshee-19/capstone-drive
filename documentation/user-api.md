# USER APIS

## Headers
```
Content-Type : application/json
Authorization: Bearer {{authToken}}
```
## CRUD 

* create-user
    * endpoint - users
    * method - POST
    * body - ```{
	"name": "name",
	"email": "xyz@gmail.com",
	"mobile": "10 digit required",
	"city": "city"
}```. 

* get-user
    * endpoint - users
    * method- GET
* update user
    * endpoint - users/{userId}
    * method - PATCH
    * body - ```{ "name": "name", "email": "xyz@gmail.com", "mobile": "10 digit required", "city": "city" }```
* delete user
    * endpoint - users/{userId}
    * method: DELETE
  
