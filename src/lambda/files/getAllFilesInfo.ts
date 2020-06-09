import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { getToken } from "../../auth/utils";
import { getAllFileInfo } from "../../businessLogic/files";

const logger = createLogger("get All files ")
export const handler:APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    logger.info('processing event ', {event: event})
    try{
        const jwtToken = getToken(event.headers.Authorization)
        if(!jwtToken){
            return returnError("Auth Token Required")
        }
        const userId = event.pathParameters.userId
        const res = await getAllFileInfo(userId)
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
        return returnError (e.message)
    }
}

function returnError(message:string) {
    return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(message)
    }
}