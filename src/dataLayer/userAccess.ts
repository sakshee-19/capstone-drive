import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as AWS  from 'aws-sdk'
import { User } from '../models/user'
import { UserUpdateReq } from "../requests/userUpdateReq";
import { returnError } from "../utils/errorResponse";

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
            console.log("user ", user)
            if( user.auth !== auth) {
                return 
            }
            console.log("data passes to update user ",userData)
            const updatedUser = await this.docClient.update({
                TableName: this.userTable,
                Key: {userId},
                UpdateExpression: "set city=:city, email=:email, mobile=:mobile",
                ExpressionAttributeValues: {
                    ":city": userData.city,
                    ":email": userData.email,
                    ":mobile": userData.mobile
                },
                ReturnValues: 'UPDATED_NEW'
            }).promise()
            console.log("updated user ", updatedUser);
            return updatedUser
        } catch(e) {
            console.log("error in update ",e.message)
            return undefined
        }
    }
    
    async shareFileWithUser(userId: string, fileId: string, shareWith:string,  auth: string) {
        try {
            const userShare = await this.getUser(shareWith)
            const user = await this.getUser(userId)
            console.log("user  ", user)
            if(!user) {
                return returnError(404, "user does not exists")
            }
            if( user.auth !== auth) {
                return returnError(400, "User not authorised to perform this operation")
            }

            const accessList: Array<string> = userShare.access;
            if(accessList.indexOf(fileId)== -1){
                accessList.push(fileId);
            }
            
            console.log("data passes to update fileInfo ", shareWith)
            const updatedFileInfo = await this.docClient.update({
                TableName: this.userTable,
                Key: {userId: shareWith},
                UpdateExpression: "set access=:accessList",
                ExpressionAttributeValues: {
                    ":accessList": accessList
                },
                ReturnValues: 'UPDATED_NEW'
            }).promise()
            console.log("updated fileInfo ", updatedFileInfo);
            return updatedFileInfo
        } catch(e) {
            console.log("error in update ",e.message)
            return returnError(400, e.message)
        }
    }

    async unshareFileWithUser(userId: string, fileId: string, unshareWith:string,  auth: string) {
        try {
            const userShare = await this.getUser(unshareWith)
            const user = await this.getUser(userId)
            console.log("user  ", user)
            if(!user) {
                return returnError(404, "user does not exists")
            }
            if( user.auth !== auth) {
                return returnError(400, "User not authorised to perform this operation")
            }

            const accessList: Array<string> = userShare.access;
            const index = accessList.indexOf(fileId);
            if(index != 1){
                accessList.splice(index, 1);
            }
            console.log("data passes to update fileInfo ", unshareWith)
            const updatedFileInfo = await this.docClient.update({
                TableName: this.userTable,
                Key: {userId: unshareWith},
                UpdateExpression: "set access=:accessList",
                ExpressionAttributeValues: {
                    ":accessList": accessList
                },
                ReturnValues: 'UPDATED_NEW'
            }).promise()
            console.log("updated fileInfo ", updatedFileInfo);
            return updatedFileInfo
        } catch(e) {
            console.log("error in update ",e.message)
            return returnError(400, e.message)
        }
    }
}

function createDynamoDBClient() {
    if(process.env.IS_OFFLINE) {
        console.log("offline ");
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }
    return new AWS.DynamoDB.DocumentClient()
}