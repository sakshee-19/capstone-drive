# FILE APIS

## Headers
```
Content-Type : application/json
Authorization: Bearer {{authToken}}
```

## CRUD 

* Create FileInfo
    * Endpoint - users/{userId}/files
    * Method - POST
    * Body - ```{ "name": "name","description": " "}```
    * ResponseBody - 
    ```
    {
      "item": {
          "userId": "userId",
          "fileId": "uuid",
          "name": "name",
          "description": " ",
          "createdAt": "2020-06-11T09:05:39.603Z",
          "modifiedAt": "2020-06-11T09:05:39.603Z",
          "fileUrl": "https://abc.amazonaws.com/xyz",
          "uploadUrl": "https://xyz.amazonaws.com/pqwe"
      }
    }
    ```



* Get FileInfo
    * Endpoint - users/{userId}/files/{fileId}
    * Method - GET
    * ResponseBody - 
    ```
    {
      "item": {
          "modifiedAt": "2020-06-11T09:05:39.603Z",
          "fileId": "{fileId}",
          "userId": "{userId}",
          "fileUrl": "https://abc.s3.amazonaws.com/xyz",
          "createdAt": "2020-06-11T09:05:39.603Z",
          "description": " ",
          "name": "name"
      }
    }
    ```
    
* Update file info
    * Endpoint - users/{userId}/files/{fileId}
    * Method - PATCH
    * Body - ```{ "name": "name","description": " "}```
    * ResponseBody -
    ```
    {
      "item": {
          "description": " ",
          "name": "name",
          "modifiedAt": "2020-06-11T14:06:38.108Z"
      }
    }
    ```


* Delete file info
    * Endpoint - users/{userId}/files/{fileId}
    * Method: DELETE
    

* Share file with other user 
    * Endpoint - share/users/{userId}/files/{fileId}
    * Method - PATCH
    * Body - ```{ userId: {userId2} }```. userId2 the user we want to share the file with
    * ResponseBody - 
    ```
      {
      "items": {
          "access": [
              "{fileId}"
          ]
         }
      }
    ```
 
* Unshare file with user
    * Endpoint - unshare/users/{userId}/files/{fileId}
    * Method - PATCH
    * Body - ```{ userId: {userId2} }```. userId2 the user we want to share the file with
    * ResponseBody - 
    ```
      {
      "items": {
          "access": [
              "{fileId}"
          ]
         }
      }
    ``` 
     * will contain file which are still shared with user
 
* Accessable file for a user
    * Endpoint - share/users/{userId}/files/{fileId}
    * Method - GET
    * ResponseBody - 
    ```
     {
      "item": [
          {
              "modifiedAt": "2020-06-11T09:05:39.603Z",
              "fileId": "{fileId}",
              "userId": "{userId-creator}",
              "fileUrl": "https://abc.s3.amazonaws.com/xyz",
              "createdAt": "2020-06-11T09:05:39.603Z",
              "description": " ",
              "name": "name"
          }
      ]
    }
    ```
  
