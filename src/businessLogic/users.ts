import { UserRequest } from "../requests/userRequest"
import { parseUser } from "../auth/utils"
import { User } from "../models/user";
import { UserUpdate } from "../models/userUpdate";
import { UserAccess } from "../dataLayer/userAccess"
import { createLogger } from "../utils/logger";
import { UserUpdateReq } from "../requests/userUpdateReq";
import * as uuid from "uuid"

const userAccess = new UserAccess();

const logger = createLogger("users bl")

export async  function createUser(userReq: UserRequest, jwtToken:string):Promise<User> {
    const userAuthId = parseUser(jwtToken);
    console.log("user id ", userAuthId)
    logger.info(" proccessing request ", {userReq: userReq})
    const user: User = {
        userId: uuid.v4(),
        ...userReq,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        auth: userAuthId
    }
    return await userAccess.createUser(user)
}

export async  function get(userId: string):Promise<User> {
    logger.info(" proccessing request ", {userId: userId})
    return await userAccess.getUser(userId)
}

export async  function getAll():Promise<User[]> {
    logger.info(" proccessing request ",)
    return await userAccess.getAllUser()
}

export async  function modifyUser(userUpdateReq: UserUpdateReq, userId: string, jwtToken:string) {
    const auth = parseUser(jwtToken)
    logger.info(" proccessing request ", {userUpdateReq: userUpdateReq, userId: userId})
    const user: UserUpdate = {
        ...userUpdateReq,
        modifiedAt: new Date().toISOString(),
    }
    return await userAccess.updateUser(userId, user, auth)
}