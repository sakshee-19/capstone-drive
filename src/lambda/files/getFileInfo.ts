import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { getToken } from "../../auth/utils";
import { getFileInfo } from "../../businessLogic/files";
import { returnError } from "../../utils/errorResponse";

const logger = createLogger("get a file ")
export const handler:APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    logger.info('processing event ', {event: event})
    try{
        const jwtToken = getToken(event.headers.Authorization)
        if(!jwtToken){
            return returnError(403, "Auth Token Required")
        }
        const fileId = event.pathParameters.fileId
        const res = await getFileInfo(fileId)
        if(!res){
            return returnError(404, "file does  not exist")
        }
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
        return returnError(e.statusCode, e.body)
    }
}
