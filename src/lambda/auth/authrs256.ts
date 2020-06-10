import {CustomAuthorizerEvent, CustomAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload';
import { verify } from 'jsonwebtoken';

const cert = `-----BEGIN CERTIFICATE-----
MIIDAzCCAeugAwIBAgIJDzgq8CVl85/DMA0GCSqGSIb3DQEBCwUAMB8xHTAbBgNV
BAMTFHNha3NoZWUtMTkuYXV0aDAuY29tMB4XDTIwMDUyNTA4MDgyN1oXDTM0MDIw
MTA4MDgyN1owHzEdMBsGA1UEAxMUc2Frc2hlZS0xOS5hdXRoMC5jb20wggEiMA0G
CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC0Pe7H73blIaezOqTvozYMLBQ0eT8h
26N06IDzJqlxXPzpC8QLvErlDGEjKBCtCe7nfY1qY0IplpcIFA/KpAjNhDcxiZpP
ktlqztzpUxskVdXRM2byDShRCMlOP0BL1CtXt7f0/4eXGi5R1W4DT2RhjE8UppPm
EEfApk0h7kvfLRNyNgx1wq9oyu2TJ5zoYvoJVpIpEI9S/4Vi1KPKmhCsyf/aqvL1
Zuxp2d7PKE+T/LsjryTOrQe1vfG5Xvsubn9U6sNpfax2XCbH69dr297/vyeHSb3Q
yXtrRM/pd8iEn6lMdVv6PwspNCuzUeHQU9MwV2LeODoQuOI3xtTZFbZ1AgMBAAGj
QjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFFGaqoMQOeNeAlg7EXJlC+WH
SpxDMA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAW8UKUlBoB+y3
s5HOyFHQGw1RZIVoDtHlJC4wq/84jihUNO9mBLCVoh2y9RU7+kPUfwoMTMIsOMY1
7eOoGaWnd07NlqW+O7YC2Uz89UrTFLWf8mvhozJrdO35s2Ir8R3DyAbQ0Ulbe3W3
n1bLFIKj/OOGcQYFhZ+V2Xqo6w1DB5lZdufGkosnyjLOG/IfG/DA+07EHbLqq0vo
Ji//n/f36PNmaY1/r98QEeYYLnL083XWfYT00+mTTLBhUnF3tYHJRRdI8K8y/v3N
M3xot4ozbLtKFlk8tm9jiqfeqypGjO5ur9/NIRghnIj018mo9OphBMdBk3g4+yYt
5777hjGhzQ==
-----END CERTIFICATE-----`

const logger = createLogger("RSA256");

export const handler = async(event: CustomAuthorizerEvent) :Promise<CustomAuthorizerResult> => {
    logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}