import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../utils/logger" 
import { createUser } from "../businessLogic/users"
import { UserRequest } from "../requests/userRequest";

const logger = createLogger('create user lambda ')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    console.log(" event create user ", event);
    logger.info('processing event ', {event: event})
    const newUser: UserRequest = JSON.parse(event.body)
    try {
        const authToken = event.headers.Authorization
        const split = authToken.split(" ")
        const jwt = split[1]

        const item = await createUser(newUser, jwt)

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
        return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify([])
          }
    }
}