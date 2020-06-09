import { createLogger } from "../utils/logger"
import { decode } from "jsonwebtoken"
import { JwtPayload } from "./jwtPayload";

const logger = createLogger("auth util");

export function parseUser(jwtToken: string): string {
    logger.info(" userToken ", {jwtToken: jwtToken})
    const jwt = decode(jwtToken) as JwtPayload
    return jwt.sub
}

export function getToken(auth: string) {
    logger.info(" get token ", {auth:auth})
    const split = auth.split(" ")
    return split[1]
}