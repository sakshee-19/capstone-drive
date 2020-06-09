import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {  shareFile }  from "../businessLogic/users"
import { createLogger } from "../utils/logger";
import { returnError } from "../utils/errorResponse";
import { getToken } from "../auth/utils";

const logger = createLogger("update User")
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ): Promise<APIGatewayProxyResult> => {
    logger.info("processing event ", {event: event})
    try {
        // const user = JSON.parse(event.body)
        const jwtToken = getToken(event.headers.Authorization)
        if(!jwtToken)
          return returnError(403, "Auth Token Required")

          const fileId = event.pathParameters.fileId
          const userId = event.pathParameters.userId
          const shareWithUserId = JSON.parse(event.body)

        const item = await shareFile(fileId, userId, shareWithUserId.userId,  jwtToken)
        if(item == undefined) {
            return returnError(400, "user does not exist")
        }
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(item)
        }

    } catch (e) {
        logger.info("caught error ", {error: e})
        return returnError(400, e.message)
    }
}
