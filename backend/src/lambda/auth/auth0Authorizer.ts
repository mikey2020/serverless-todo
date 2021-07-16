import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://dev-9nmjn1ij.us.auth0.com/.well-known/jwks.json'
const cert = `
-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJISsCgLcQ7dooMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi05bm1qbjFpai51cy5hdXRoMC5jb20wHhcNMjEwNzA3MTMwNDMzWhcN
MzUwMzE2MTMwNDMzWjAkMSIwIAYDVQQDExlkZXYtOW5tam4xaWoudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyT/HhZwQ4AwVhWxT
LGuF2zLX1VArmOrvKe4iI1fVPhSUOaANZQmLU7EbivuNPo2/CwWmaK2dhqfLKA+J
cHa4dU5/nHJBdT/jKIg7+lkJEr/mfj4YnzkSS3uM7o9pWwW7cGpiUbBEdBIqE8NB
XbNem9XQrgXg0ky8rpjna3h9FPh3MC4Lz74D9OEsk9tPQ6zcYDI5IG/rBrOWhKGk
EoUZkjys/BVIGm6YrfNnHoNWiFokRmMc8wnPXrC6InucAigJt4dhjy8jb3Pe4vTW
7ZRStrhFY0DLK0G6s0Cu7SKe6Uo1eE2XghOK/eQQrPbWgH/IjCXdG3cFLuyDreh7
V/GkVQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSq/gvjTrlU
Pf8V6mU36CuM72cp0zAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AGl6bcR61ty1MioNLuPPE5aI8Jh8++FUSJF+hm5Or0W/vEY9eoxSEzBpeSe1kYPs
l1BDiUbKrgqIrIl42R9QQHZKssYzjpz/EAHr8juY5SNziOeEsHCFLsplPOydbvlF
MKdCe49mJd7Y07eMRxZrMVii4/hyujGlDIrVSBHHgkHn0nMBeWN9qt1xcFaa3y7+
fiqKl+m4W2rA1bivLeWlhAI07YLcxtaolK2nQdGm+Sr2p3/fUJFmZiFtDJmjUBBf
Gm40GHrTQaH19aEvHNYN40FSNUfbK+CdsLZQ0bmZcwWMcoNtkiI1pbfDvr6JBY/l
hSu/1KqBmODZXK/2OOIzed4=
-----END CERTIFICATE-----
`;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
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
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
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
