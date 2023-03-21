import { useState } from 'react'

export const PasswordGate = ({children}) => {
  const [ authed, setAuthed ] = useState(false)
  const [ statePending, setStatePending ] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault() //prevent page refresh

    let password = e.target.password.value;

    if (password)
    {
      setStatePending(true)
      const res = await fetch(`./.netlify/functions/checkPassword?password=${password}`)
      const { authorised } = await res.json()

      if (authorised)
        setAuthed(true)
      else
        alert("Sorry, wrong password!")
      
      setStatePending(false)
    }
  }

  if (authed)
    return children

  return (
    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <form onSubmit={onSubmit}>
        <div className="input-container">
        <label>
          <p style={{marginBottom: '5px'}}>This site is locked. Enter password to continue:</p>
          <input type="password" name="password" autoFocus/>
        </label>
        </div>
        { statePending ? <pre>Checking password...</pre> : <button className="btn-control">ok</button> }
      </form>
    </div>
  )
}