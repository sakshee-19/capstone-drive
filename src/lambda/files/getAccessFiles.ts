import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { getToken } from "../../auth/utils";
import { getAccessableFiles } from "../../businessLogic/files";
import { returnError } from "../../utils/errorResponse";

const logger = createLogger("get All files ")
export const handler:APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    logger.info('processing event ', {event: event})
    try{
        const jwtToken = getToken(event.headers.Authorization)
        if(!jwtToken){
            return returnError(403, "Auth Token Required")
        }
        const userId = event.pathParameters.userId
        const res = await getAccessableFiles(userId, jwtToken)
        return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({item: res})
        }
    } catch (e) {
        logger.info("caught error ", {error: e})
        return returnError (400, e.message)
    }
}