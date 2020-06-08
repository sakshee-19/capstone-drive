import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { get }  from "../businessLogic/users"
import { createLogger } from "../utils/logger";

const logger = createLogger("get User")
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ): Promise<APIGatewayProxyResult> => {
    logger.info("processing event ", {event: event})

    const userId = event.pathParameters.userId;

    const item = await get(userId)
    console.log(item)
    if(item == undefined) {
        return {
            statusCode: 404,
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
}
