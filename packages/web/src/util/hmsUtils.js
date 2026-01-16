import { Env } from "../config/env";

/**
 * Helper function to build HmsRole name from space and subspace
 * @param {string} space 
 * @param {string} subspace 
 */
export function buildHmsRoleName(space, subspace) {
  let role = space
  if (subspace)
    role += '-' + subspace
  return role
}

export async function getHmsToken(
  room_id,
  clientID,
  role,
  endpoint=`${Env.serverUrl}${Env.apiBase}/getHmsRoomToken`
){
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        room_id,
        user_id: `awarenesspeer.${clientID}`,
        role: role,
      }),
    });

    if (!response.ok) {
      let error = new Error("could not connect to api server");
      error.response = response;
      throw error;
    }

    const data = await response.json();
    
    const { token } = data;
    if (token === null) {
      throw Error(data.msg);
    }
    return token;
  } catch (err) {
    console.error(err);
    throw err;
  }
}