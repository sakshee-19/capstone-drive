import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../utils/logger" 
import { createUser } from "../businessLogic/users"
import { UserRequest } from "../requests/userRequest";
import { returnError } from "../utils/errorResponse";
import { getToken } from "../auth/utils";

const logger = createLogger('create user lambda ')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    console.log(" event create user ", event);
    logger.info('processing event ', {event: event})
    
    try {
        const newUser: UserRequest = JSON.parse(event.body)
        const authToken = event.headers.Authorization
        const jwtToken = getToken(authToken)
        if(!jwtToken)
          return returnError(403, "Auth Token Required")

        const item = await createUser(newUser, jwtToken)
        if(item == undefined) {
          return returnError(400, "Could not create the user")
        }

        return {
            statusCode: 201,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
              item
            })
          }

    } catch (e) {
        console.log("error ",e.message)
        logger.info("could not process request ", {error: e})
        return returnError(400, e.message)
    }
}