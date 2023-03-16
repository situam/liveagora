export function generateRandomColor() {
  return '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)
}

export function roundToGrid(x, grid) {
  return Math.round(x/grid)*grid
}

// used by reactflow for the z parameter
export const internalsSymbol = Symbol.for('internals');