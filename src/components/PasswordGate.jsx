export const PasswordGate = ({ onPassword, showError = false }) => {
  const onSubmit = (e) => {
    e.preventDefault()
    const password = e.target.password.value
    if (password)
      onPassword(password)
  }

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={onSubmit}>
        <div className="input-container">
          <label>
            <p style={{ marginBottom: '5px' }}>Enter password to continue:</p>
            <input type="password" name="password" autoFocus />
          </label>
        </div>
        { showError && <p style={{color: 'red', marginBottom: '5px'}}>Sorry, wrong password!</p>}
        <button className="btn-control">ok</button>
      </form>
    </div>
  )
}