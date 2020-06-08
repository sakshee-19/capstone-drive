import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { getToken } from "../../auth/utils";
import { deleteFileInfo } from "../../businessLogic/files";

const logger = createLogger("delete a file ")
export const handler:APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    logger.info('processing event ', {event: event})
    try{
        const jwtToken = getToken(event.headers.Authorization)
        if(!jwtToken){
            return returnError("Auth Token Required")
        }
        const fileId = event.pathParameters.fileId
        const userId = event.pathParameters.userId
        const res = await deleteFileInfo(fileId, userId, jwtToken)
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
        return returnError (e.message)
    }
}

function returnError(message:string) {
    return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(message)
    }
}