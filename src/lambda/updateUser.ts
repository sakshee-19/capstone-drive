import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { modifyUser }  from "../businessLogic/users"
import { createLogger } from "../utils/logger";
import { UserUpdateReq } from "../requests/userUpdateReq";

const logger = createLogger("update User")
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ): Promise<APIGatewayProxyResult> => {
    logger.info("processing event ", {event: event})

    const userUpdate: UserUpdateReq = JSON.parse(event.body)

    const jwtToken = getToken(event.headers.Authorization)

    const item = await modifyUser(userUpdate, jwtToken)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(item)
    }
}

function getToken(auth: string) {
    return auth.split(" ")[1]
}
