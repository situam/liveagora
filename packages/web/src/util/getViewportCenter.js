export function getViewportCenter(rfState = { width: 1280, height: 720, transform: [0,0,1] }, grid=[1,1]) {
  const { width, height, transform } = rfState
    
  let x = transform[0]*-1 + (width/2)
  let y = transform[1]*-1 + (height/2)

  if (grid) {
    x = Math.round(x/grid[0])*grid[0]
    y = Math.round(y/grid[1])*grid[1]
  }

  return { x, y }
}