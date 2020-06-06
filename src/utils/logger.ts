// create a file to log in json format with class name specified
import * as winston from 'winston'

export function createLogger (loggerName: string) {
    return winston.createLogger({
        level: "INFO",
        defaultMeta: {name: loggerName},
        format: winston.format.json(),
        transports: [
            new winston.transports.Console()
        ]

    })
}
