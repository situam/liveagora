const MAIN_PASSWORD = 'huckleberry'

const checkPassword = (password) => ({ authorised: MAIN_PASSWORD===password})

exports.handler = async function (event, context) {
  try {
    const password = event.queryStringParameters.password
    
    const res = checkPassword(password)

    return {
      statusCode: 200,
      body: JSON.stringify(res),
      headers: {
        "access-control-allow-origin": "*",
      },
    } 
  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify(e),
      headers: {
        "access-control-allow-origin": "*",
      },
    } 
  }
}
