export const PasswordGate = ({ onPassword, showError = false }) => {
  const onSubmit = (e) => {
    e.preventDefault()
    const password = e.target.password.value
    if (password)
      onPassword(password)
  }

  return (
    <dialog popover="auto" open>
      <form onSubmit={onSubmit}>
        <label htmlFor="password">enter password to view this agora</label>
        <input
          id="password"
          placeholder="password"
          type="password"
          name="password"
          autoFocus
          required
        />
        { showError && <p style={{color: 'red'}}>wrong password</p>}
        <button className="btn-control">ok</button>
      </form>
    </dialog>
  )
}