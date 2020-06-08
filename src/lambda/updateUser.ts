import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { modifyUser }  from "../businessLogic/users"
import { createLogger } from "../utils/logger";
import { UserUpdateReq } from "../requests/userUpdateReq";

const logger = createLogger("update User")
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ): Promise<APIGatewayProxyResult> => {
    logger.info("processing event ", {event: event})
    try {
        const userUpdate: UserUpdateReq = JSON.parse(event.body)
        const jwtToken = getToken(event.headers.Authorization)
        const userId = event.pathParameters.userId
        const item = await modifyUser(userUpdate, userId, jwtToken)
        if(item == undefined) {
            return {
                statusCode: 400,
                headers: {
                  'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify("user does not exist")
              }    
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
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({})
        }
    }
}

function getToken(auth: string) {
    return auth.split(" ")[1]
}
