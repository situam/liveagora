export function YkvCheckbox({label, state, metadataYkv, ykey}) {
  if (!ykey)
    return null

  return (
    <label>
      <input type="checkbox" checked={!!state[ykey]?.val} onChange={(e)=>{metadataYkv.set(ykey, e.target.checked)}}/>
      {label || ykey}
    </label>
  )
}

export function YkvNumberInput({label, state, metadataYkv, ykey, min, max, step=1}) {
  if (!ykey)
    return null
  
  return (
    <label>
      <input type="number" min={min} max={max} step={step} value={state[ykey]?.val || 0} onChange={(e)=>{metadataYkv.set(ykey, e.target.value)}} />
      {label || ykey}
    </label>
  )
}

export function YkvTextInput({label, state, metadataYkv, ykey}) {
  if (!ykey)
    return null
  
  return (
    <label>
      {label || ykey}
      <input type="text" value={state[ykey]?.val || ''} onChange={(e)=>{metadataYkv.set(ykey, e.target.value)}} />
    </label>
  )
}