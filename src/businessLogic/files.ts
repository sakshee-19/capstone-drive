import { parseUser } from "../auth/utils"
import { FileInfoAccess } from "../dataLayer/fileAccess"
import { createLogger } from "../utils/logger";
import * as uuid from "uuid"
import { FileInfoReq } from "../requests/fileInfoReq";
import { FileInfo } from "../models/fileInfo";
import { FileInfoUpdateReq } from "../requests/fileInfoUpdateReq";
import { FileInfoUpdate } from "../models/fileUpdate";

const fileAccess = new FileInfoAccess();

const logger = createLogger("files business logic")

export async  function createFileInfo(fileInfoReq: FileInfoReq, userId:string,  jwtToken:string):Promise<FileInfo> {
    logger.info(" proccessing request ", {fileInfoReq: fileInfoReq, userId: userId, jwtToken: jwtToken})
    const fileInfo: FileInfo = {
        userId: userId,
        fileId: uuid.v4(),
        ...fileInfoReq,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        fileUrl: ""
    }
    return await fileAccess.createFileInfo(fileInfo)
}

export async  function getFileInfo(fileId: string):Promise<FileInfo> {
    logger.info(" proccessing request ", {fileId: fileId})
    return await fileAccess.getFileInfo(fileId)
}

export async  function getAllFileInfo(userId: string):Promise<FileInfo[]> {
    logger.info(" proccessing request ",{userId: userId})
    return await fileAccess.getAllFileInfo(userId)
}

export async  function deleteFileInfo(fileId:string,userId: string, jwtToken: string) {
    logger.info(" proccessing request ",{userId: userId})
    const auth = parseUser(jwtToken)
    return await fileAccess.deleteFileInfo(fileId, userId, auth)
}


export async function modifyFileInfo(fileInfoUpdateReq: FileInfoUpdateReq, userId: string, fileId: string,  jwtToken:string) {
    try{
        const auth = parseUser(jwtToken)
        logger.info(" proccessing request ", {fileInfoUpdateReq: fileInfoUpdateReq, userId: userId, fileId:fileId})
        const fileInfo: FileInfoUpdate = {
            ...fileInfoUpdateReq,
            modifiedAt: new Date().toISOString(),
        }
        return await fileAccess.updateFileInfo(fileId, userId, fileInfo, auth)
    } catch(e) {
        logger.info("caught error", {error: e})
        return e.message
    }
}