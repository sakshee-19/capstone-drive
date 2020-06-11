import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk';
import { User } from '../models/user'
import { returnError } from "../utils/errorResponse";
import { createLogger } from "../utils/logger";
import { UserUpdate } from "../models/userUpdate";

const XAWS = AWSXRay.captureAWS(AWS)
export class UserAccess {
    
    constructor (
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly userTable: string = process.env.USERS,
        private readonly logger = createLogger("user access"),
        
    ){}

    async createUser(newUser: User): Promise<User>{
        this.logger.info("creating user in user access ", newUser)
        await this.docClient.put({
            TableName: this.userTable,
            Item: newUser
        }).promise()
        
        return newUser;
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
        const user = await this.validateUserWithAuthToken(userId, auth);
        try {
            this.logger.info("data passes to update user ",{userData: userData, userId: user})
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
            throw returnError(400, e.message)
        }
    }

    async deleteUser(userId:string, auth: string) {
        const user = await this.validateUserWithAuthToken(userId, auth);
        try {
            this.logger.info("data passes to update user ",{ userId: user})
            const deletedUser = await this.docClient.delete({
                TableName: this.userTable,
                Key: {userId}
            }).promise()
            this.logger.info("deletedUser user ", {deletedUser: deletedUser});
            return deletedUser
        } catch(e) {
            this.logger.info("error in delete ",{error: e})
            throw returnError(400, e.message)
        }
    }
    
    async shareFileWithUser(userId: string, fileId: string, shareWith:string,  auth: string) {
        const user = await this.validateUserWithAuthToken(userId, auth);
        try {
            const userShare = await this.getUser(shareWith)
            this.logger.info("user  ", {user:userShare, userCurr: user})
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
            throw returnError(400, e.message)
        }
    }

    async unshareFileWithUser(userId: string, fileId: string, unshareWith:string,  auth: string) {
        const user = await this.validateUserWithAuthToken(userId, auth);
        try {
            const userShare = await this.getUser(unshareWith)
            this.logger.info("user  ", {user:user, userShare: userShare})
            const accessList: Array<string> = userShare.access;
            const index = accessList.indexOf(fileId);
            if(index !== -1){
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
            throw returnError(400, e.message)
        }
    }
    async validateUserWithAuthToken(userId: string, auth: string) {
        const user = await this.getUser(userId)
            this.logger.info("user  ", user)
            if(!user) {
                this.logger.info("user does not exists ", {userId: userId})
                throw returnError(404, "user does not exists")
            }
            if( user.auth !== auth) {
                this.logger.info("user and access token auth deos not match")
                throw returnError(400, "User not authorised to perform this operation")
            }
        return user;
    }
}

function createDynamoDBClient() {
    if(process.env.IS_OFFLINE) {
        console.log("offline ");
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }
    return new XAWS.DynamoDB.DocumentClient()
}