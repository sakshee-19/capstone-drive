import { createLogger } from "../utils/logger"
import { decode } from "jsonwebtoken"
import { JwtPayload } from "./jwtPayload";

const logger = createLogger("auth util");

export function parseUser(jwtToken: string): string {
    logger.log(" userToken: ", jwtToken)
    const jwt = decode(jwtToken) as JwtPayload
    return jwt.sub
}