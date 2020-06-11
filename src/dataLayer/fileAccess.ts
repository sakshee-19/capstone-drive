import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk';
import { FileInfo } from '../models/fileInfo'
import { FileInfoUpdate } from "../models/fileUpdate";
import { UserAccess } from "./userAccess";
import { returnError } from "../utils/errorResponse";
import { createLogger } from "../utils/logger";

const XAWS = AWSXRay.captureAWS(AWS)
export class FileInfoAccess {
    
    constructor (
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly fileInfoTable: string = process.env.FILES_INFO,
        private readonly fileIndex: string = process.env.FILE_INDEX,
        private readonly userAccess: UserAccess = new UserAccess(),
        private readonly s3Bucket: string = process.env.S3_BUCKET,
        private readonly logger = createLogger(" file access"),
        private readonly  s3 = createS3()
    ){}

    async createFileInfo(newFileInfo: FileInfo): Promise<FileInfo>{
        this.logger.info("creating fileInfo in access ", {newFile: newFileInfo})
        newFileInfo.fileUrl = `https://${this.s3Bucket}.s3.amazonaws.com/${newFileInfo.fileId}` 
        await this.docClient.put({
            TableName: this.fileInfoTable,
            Item: newFileInfo
        }).promise()
        
        return newFileInfo;
    }

    async getFileInfo(fileId: string): Promise<FileInfo> {
        this.logger.info("file id ", {fileId: fileId})
        const file = await this.docClient.query({
            TableName: this.fileInfoTable,
            IndexName: this.fileIndex,
            KeyConditionExpression: 'fileId = :fileId',
            ExpressionAttributeValues: {
                ':fileId': fileId
            }
        }).promise()
        // console.log(" result ", file)
        return file.Items[0] as FileInfo
    }

    async getAllFileInfo(userId: string, auth:string): Promise<FileInfo[]> {
        await this.validateUserWithAuthToken(userId, auth);
        const result = await this.docClient.query({
            TableName: this.fileInfoTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        return result.Items as FileInfo[]
    } 


    async updateFileInfo(fileId:string, userId:string, fileInfoData: FileInfoUpdate, auth: string) {
        await this.validateUserWithAuthToken(userId, auth);
        try {
            this.logger.info("data passes to update fileInfo ",{fileinfo: fileInfoData})
            const updatedFileInfo = await this.docClient.update({
                TableName: this.fileInfoTable,
                Key: {fileId, userId},
                ExpressionAttributeNames: {"#N" : "name"},
                UpdateExpression: "set #N=:filename, description=:descripition, modifiedAt=:modifiedAt",
                ExpressionAttributeValues: {
                    ":filename": fileInfoData.name,
                    ":description": fileInfoData.description,
                    ":modifiedAt": fileInfoData.modifiedAt
                },
                ReturnValues: 'UPDATED_NEW'
            }).promise()
            this.logger.info("updated fileInfo ", {update: updatedFileInfo});
            return updatedFileInfo
        } catch(e) {
            this.logger.info("error in update ",{error: e})
            throw returnError(400, e.message)
        }
    }
    
    async deleteFileInfo(fileId:string, userId:string, auth:string) {
        await this.validateUserWithAuthToken(userId, auth);
        // const user = await this.userAccess.getUser(userId)
        // console.log("user  ", user)
        // if(!user) {
        //     return returnObject(404, "user does not exists")
        // }
        // if( user.auth !== auth) {
        //     return returnObject(400,"user not authorised")
        // }
        try {
            const data = await this.docClient.delete ({
                TableName: this.fileInfoTable,
                Key: {userId, fileId}
            }).promise()
            
            const Item = {
                ...data,
                error: null,
                code: 200
            }
            return Item
        } catch (e) {
            throw returnError(400, e.message)
        }
    }

    generateSignedUrl(fileId: string) {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.s3Bucket,
            Key: fileId,
            Expires: 300
        })
    }

    async validateUserWithAuthToken(userId: string, auth: string) {
        const user = await this.userAccess.getUser(userId)
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
   
    async getAccessableFileDetails(userId: string, auth:string) {
        const user = await this.validateUserWithAuthToken(userId, auth);
        try {
            // const user = await this.userAccess.getUser(userId)
            // console.log("user  ", user)
            // if(!user) {
            //     return returnError(404, "user does not exists")
            // }
            const fileList = user.access;
            console.log(fileList)
            const detList = new Array();
            for( const fileIds of fileList)    {
                const data =  await this.getFileInfo(fileIds)
                if(data)
                    detList.push(data)
            }
            // const data = await this.docClient.query({
            //     TableName: this.fileInfoTable,
            //     FilterExpression: "fileId IN :fileList",
            //     ExpressionAttributeValues: {
            //         ":fileList": fileList
            //     }
            // }).promise()

            return detList
        } catch (e) {
            console.log("error in update ",e.message)
            throw returnError(400, e.message)    
        }

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

function  createS3() {
    return new XAWS.S3({
        signatureVersion: 'v4'
    })
}
