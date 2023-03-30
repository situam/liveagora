export async function getHmsToken(room_id, clientID, role, endpoint='./.netlify/functions/getHmsRoomToken') {
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