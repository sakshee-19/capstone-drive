import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { getToken } from "../../auth/utils";
import { createFileInfo } from "../../businessLogic/files";
import { FileInfoReq } from "../../requests/fileInfoReq";
import { returnError } from "../../utils/errorResponse";

const logger = createLogger("create file ")
export const handler:APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    logger.info('processing event ', {event: event})
    try{
        const jwtToken = getToken(event.headers.Authorization)
        if(!jwtToken){
            return returnError(403, "Auth Token Required")
        }
        const fileInfoReq : FileInfoReq= JSON.parse(event.body)
        const userId = event.pathParameters.userId
        const result = await createFileInfo(fileInfoReq, userId, jwtToken)

        if(!result){
            return returnError(400, "Bad request")     
        }

        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({item: result})
        }

    } catch (e) {
        logger.info("caught error ", {error: e})
        return returnError(e.statusCode, e.body)
    }
}

