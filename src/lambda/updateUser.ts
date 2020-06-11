import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { modifyUser }  from "../businessLogic/users"
import { createLogger } from "../utils/logger";
import { UserUpdateReq } from "../requests/userUpdateReq";
import { returnError } from "../utils/errorResponse";
import { getToken } from "../auth/utils";

const logger = createLogger("update User")
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ): Promise<APIGatewayProxyResult> => {
    logger.info("processing event ", {event: event})
    try {
        const userUpdate: UserUpdateReq = JSON.parse(event.body)
        const jwtToken = getToken(event.headers.Authorization)
        if(!jwtToken)
          return returnError(403, "Auth Token Required")

        const userId = event.pathParameters.userId
        const item = await modifyUser(userUpdate, userId, jwtToken)
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
        return returnError(e.statusCode, e.body)
    }
}
