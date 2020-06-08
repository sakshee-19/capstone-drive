import { createLogger } from "../utils/logger"
import { decode } from "jsonwebtoken"
import { JwtPayload } from "./jwtPayload";

const logger = createLogger("auth util");

export function parseUser(jwtToken: string): string {
    console.log(" print utils parseUSer")
    logger.info(" userToken ", {jwtToken: jwtToken})
    const jwt = decode(jwtToken) as JwtPayload
    return jwt.sub
}