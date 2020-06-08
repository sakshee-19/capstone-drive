import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as AWS  from 'aws-sdk'
import { FileInfo } from '../models/fileInfo'
import { FileInfoUpdate } from "../models/fileUpdate";
import { UserAccess } from "./userAccess";

export class FileInfoAccess {
    
    constructor (
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly fileInfoTable: string = process.env.FILES_INFO,
        private readonly fileIndex: string = process.env.FILE_INDEX,
        private readonly userAccess: UserAccess = new UserAccess(),
        private readonly s3Bucket: string = "s3"
    ){}

    async createFileInfo(newFileInfo: FileInfo): Promise<FileInfo>{
        console.log("creating fileInfo in access ", newFileInfo)
        newFileInfo.fileUrl = `https://${this.s3Bucket}.s3.amazonaws.com/${newFileInfo.fileId}` 
        await this.docClient.put({
            TableName: this.fileInfoTable,
            Item: newFileInfo
        }).promise()
        
        return newFileInfo;
    }

    async getFileInfo(fileId: string): Promise<FileInfo> {
        const file = await this.docClient.query({
            TableName: this.fileInfoTable,
            IndexName: this.fileIndex,
            KeyConditionExpression: 'fileId = :fileId',
            ExpressionAttributeValues: {
                ':fileId': fileId
            }
        }).promise()
        console.log(" result ", file)
        return file.Items[0] as FileInfo
    }

    async getAllFileInfo(userId: string): Promise<FileInfo[]> {
        const result = await this.docClient.query({
            TableName: this.fileInfoTable,
            KeyConditionExpression: 'userId =: userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        console.log("after query ", result)
        return result.Items as FileInfo[]
    } 


    async updateFileInfo(fileInfoId:string, userId:string, fileInfoData: FileInfoUpdate, auth: string) {
        try {
            const user = await this.userAccess.getUser(userId)
            console.log("user  ", user)
            
            if( user.auth !== auth) {
                return 
            }
            
            console.log("data passes to update fileInfo ",fileInfoData)
            const updatedFileInfo = await this.docClient.update({
                TableName: this.fileInfoTable,
                Key: {fileInfoId, userId},
                ExpressionAttributeNames: {"#N" : "name"},
                UpdateExpression: "set #N=:filename, descripition=:descripition, modifiedAt=:modifiedAt",
                ExpressionAttributeValues: {
                    ":filename": fileInfoData.name,
                    ":descripition": fileInfoData.description,
                    ":modifiedAt": fileInfoData.modifiedAt
                },
                ReturnValues: 'UPDATED_NEW'
            }).promise()
            console.log("updated fileInfo ", updatedFileInfo);
            return updatedFileInfo
        } catch(e) {
            console.log("error in update ",e.message)
            return e.message
        }
    }
    
    async deleteFileInfo(fileId:string, userId:string, auth:string) {
        const user = await this.userAccess.getUser(userId)
        console.log("user  ", user)
        
        if( user.auth !== auth) {
            return 
        }
        const data = await this.docClient.delete ({
            TableName: this.fileInfoTable,
            Key: {userId, fileId}
        }).promise()
        
        return data
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