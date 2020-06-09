import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { getToken } from "../../auth/utils";
import { deleteFileInfo } from "../../businessLogic/files";
import { returnError } from "../../utils/errorResponse";

const logger = createLogger("delete a file ")
export const handler:APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    logger.info('processing event ', {event: event})
    try{
        const jwtToken = getToken(event.headers.Authorization)
        if(!jwtToken){
            return returnError(403, "Auth Token Required")
        }
        const fileId = event.pathParameters.fileId
        const userId = event.pathParameters.userId
        const res = await deleteFileInfo(fileId, userId, jwtToken)
        if(res.error) {
            return returnError(res.code, res.error)
        }
        return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({item: res.Attributes})
        }

    } catch (e) {
        logger.info("caught error ", {error: e})
        return returnError (400, e.message)
    }
}
