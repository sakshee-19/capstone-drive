import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as AWS  from 'aws-sdk'
import { User } from '../models/user'
import { UserUpdateReq } from "../requests/userUpdateReq";

export class UserAccess {
    
    constructor (
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly userTable: string = process.env.USERS
    ){}

    async createUser(newUser: User): Promise<User>{
        console.log("createing user in user access ", newUser)
        await this.docClient.put({
            TableName: this.userTable,
            Item: newUser
        }).promise()
        
        return newUser;
    }

    async getAllUser(): Promise<User[]> {
        const result = await this.docClient.scan({
            TableName: this.userTable
        }).promise()
        return result.Items as User[]
    }

    async getUser(userId: string): Promise<User> {
        const result = await this.docClient.get({
            TableName: this.userTable,
            Key: {userId}
        }).promise()
        console.log(result)
        return result.Item as User
    } 


    async updateUser(userId:string, userData: UserUpdateReq, auth: string) {
        try {

            const user = await this.getUser(userId)
            if( user.auth !== auth) {
                return 
            }

            const updatedUser = await this.docClient.update({
                TableName: this.userTable,
                Key: {userId},
                UpdateExpression: "set city=:city, email=:email, mobile=:mobile",
                ExpressionAttributeValues: {
                    ":city": userData.city,
                    ":email": userData.email,
                    ":mobile": userData.mobile
                },
                ReturnValues: "UPDATED_NEW"
            }).promise()
            console.log("updated user ", updatedUser);
            return updatedUser
        } catch(e) {
            console.log("error in update ",e.message)
            return 
        }
    }   
}

function createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient()
}