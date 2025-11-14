import { env } from "../../env.ts"
import jwt from "jsonwebtoken"
import { v4 as uuid4 } from "uuid"

export function generateHmsUserToken(room_id: String, user_id: String, role: String) {
  var payload = {
    access_key: env.hmsAppAccessKey,
    room_id: room_id,
    user_id: user_id,
    role: role,
    type: "app",
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
  };

  // console.log('generating user token for ', payload)

  return jwt.sign(payload, env.hmsAppSecret, {
    algorithm: "HS256",
    expiresIn: "24h",
    jwtid: uuid4(),
  });
}