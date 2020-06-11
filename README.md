# capstone-drive

A WebApp which mimics feature of google drive with limited features.

## features
* **USER Related**
    * Create a User
    * Update a User
    * Delete a User
    * Retrive single User
* **FILE Related**
    * Create a FileInfo
    * Modify a FileInfo
    * Upload a File using signed API
    * Delete a FileInfo
    * Share created File with other User (owner of a file can share it with other user)
    * Unshare a file with other User
    * Get all Files Accessable to User (all the files which are shared with curr user by other users)
    * Get All files create by the User

## Tools
* serverless framework

### concept/plugins
* RSA256 authenticated
* AWS CloudFormation
* API Gateway
* Lambda Function
* serverless-webpack
* serverless-iam-roles-per-function
* serverless-dynamodb-local
* serverless-offline
* serverless-aws-documentation
* serverless-reqvalidator-plugin etc


**Documentation API Exposed**

* [User APIs](https://github.com/sakshee-19/capstone-drive/blob/master/documentation/file-api.md)
* [File APIs](https://github.com/sakshee-19/capstone-drive/blob/master/documentation/user-api.md)
* [POSTMAN Collection](https://www.postman.com/collections/58e7dcd2379cd993fb5c)
