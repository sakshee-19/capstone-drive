import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { getToken } from "../../auth/utils";
import { modifyFileInfo } from "../../businessLogic/files";
import { FileInfoUpdateReq } from "../../requests/fileInfoUpdateReq";
import { returnError } from "../../utils/errorResponse";

const logger = createLogger("update a file ")
export const handler:APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    logger.info('processing event ', {event: event})
    try{
        const jwtToken = getToken(event.headers.Authorization)
        if(!jwtToken){
            return returnError(403, "Auth Token Required")
        }
        const userId = event.pathParameters.userId
        const fileId = event.pathParameters.fileId
        const fileBody: FileInfoUpdateReq = JSON.parse(event.body)
        const res = await modifyFileInfo(fileBody, userId, fileId, jwtToken)
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
