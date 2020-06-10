import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as AWS  from 'aws-sdk'
import { User } from '../models/user'
import { returnError } from "../utils/errorResponse";
import { createLogger } from "../utils/logger";
import { UserUpdate } from "../models/userUpdate";

export class UserAccess {
    
    constructor (
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly userTable: string = process.env.USERS,
        private readonly logger = createLogger("user access")
    ){}

    async createUser(newUser: User): Promise<User>{
        this.logger.info("creating user in user access ", newUser)
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
        this.logger.info({result: result})
        return result.Item as User
    } 


    async updateUser(userId:string, userData: UserUpdate, auth: string) {
        try {
            const user = await this.getUser(userId)
            console.log("user ", user)
            if( user.auth !== auth) {
                return returnError(400, "auth not matched") 
            }
            this.logger.info("data passes to update user ",{userData: userData, userId: userId})
            const updatedUser = await this.docClient.update({
                TableName: this.userTable,
                Key: {userId},
                UpdateExpression: "set city=:city, email=:email, mobile=:mobile, modifiedAt=:modifiedAt",
                ExpressionAttributeValues: {
                    ":city": userData.city,
                    ":email": userData.email,
                    ":mobile": userData.mobile,
                    ":modifiedAt": userData.modifiedAt
                },
                ReturnValues: 'UPDATED_NEW'
            }).promise()
            this.logger.info("updated user ", {update: updatedUser});
            return updatedUser
        } catch(e) {
            this.logger.info("error in update ",{error: e})
            return returnError(400, e.message)
        }
    }
    
    async shareFileWithUser(userId: string, fileId: string, shareWith:string,  auth: string) {
        try {
            const userShare = await this.getUser(shareWith)
            const user = await this.getUser(userId)
            this.logger.info("user  ", {user:userShare, userCurr: user})
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
            
            this.logger.info(" updated list ", {accessList: accessList})
            const updatedFileInfo = await this.docClient.update({
                TableName: this.userTable,
                Key: {userId: shareWith},
                UpdateExpression: "set access=:accessList",
                ExpressionAttributeValues: {
                    ":accessList": accessList
                },
                ReturnValues: 'UPDATED_NEW'
            }).promise()
            this.logger.info("updated fileInfo ", {updatedValue: updatedFileInfo});
            return updatedFileInfo
        } catch(e) {
            this.logger.info("error in update ",{error: e})
            return returnError(400, e.message)
        }
    }

    async unshareFileWithUser(userId: string, fileId: string, unshareWith:string,  auth: string) {
        try {
            const userShare = await this.getUser(unshareWith)
            const user = await this.getUser(userId)
            this.logger.info("user  ", {user:user})
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

            this.logger.info(" data before update ", {unshareWith: unshareWith, accessList: accessList, fileId: fileId})
            const updatedFileInfo = await this.docClient.update({
                TableName: this.userTable,
                Key: {userId: unshareWith},
                UpdateExpression: "set access=:accessList",
                ExpressionAttributeValues: {
                    ":accessList": accessList
                },
                ReturnValues: 'UPDATED_NEW'
            }).promise()
            this.logger.info("updated fileInfo ", {updatedValue: updatedFileInfo});
            return updatedFileInfo
        } catch(e) {
            this.logger.info("error in update ",{error: e})
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