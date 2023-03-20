import { useState, useEffect, useCallback } from "react"
import { useSpace } from "../context/SpaceContext"
import { usePersistedNodeActions } from "../hooks/usePersistedNodeActions"
import { generateRandomColor, roundToGrid } from "../util/utils"

function YkvCheckbox({label, state, metadataYkv, ykey}) {
  if (!ykey)
    return null

  return (
    <label>
      <input type="checkbox" checked={!!state[ykey]?.val} onChange={(e)=>{metadataYkv.set(ykey, e.target.checked)}}/>
      {label || ykey}
    </label>
  )
}

function YkvNumberInput({label, state, metadataYkv, ykey, min, max, step=1}) {
  if (!ykey)
    return null
  
  return (
    <label>
      <input type="number" min={min} max={max} step={step} value={state[ykey]?.val || 0} onChange={(e)=>{metadataYkv.set(ykey, e.target.value)}} />
      {label || ykey}
    </label>
  )
}

function YkvTextInput({label, state, metadataYkv, ykey, min, max, step=1}) {
  if (!ykey)
    return null
  
  return (
    <label>
      {label || ykey}
      <input type="text" value={state[ykey]?.val || ''} onChange={(e)=>{metadataYkv.set(ykey, e.target.value)}} />
      
    </label>
  )
}

function getSubspaceId(x) {
  return 'subspace' + String(x).padStart(2, '0') 
}

function SubspaceMaker() {
  const { addNodes, deleteNode } = usePersistedNodeActions()
  const space = useSpace()
  const [inputValues, setInputValues] = useState({
    numSubspaces: 5,
    radius: 600,
    width: 180,
    height: 120,
  })

  const handleInputChange = (e) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value
    }));
  };

  const makeSubspaceNodes = () => {
    let n = parseInt(inputValues.numSubspaces)
    let w = parseInt(inputValues.width)
    let h = parseInt(inputValues.height)
    let r = parseInt(inputValues.radius)
    let nodes = []
    let i
    for (i=0;i<n;i++) {
      let id = getSubspaceId(i)
      
      nodes.push({
        id,
        type: 'SubspaceNode',
        data: {
          subspace: id,
          label: id,
          frozen: true
        },
        position: {
          x: roundToGrid( Math.cos(2 * Math.PI * i / n) * r - w/2, 15),
          y: roundToGrid( Math.sin(2 * Math.PI * i / n) * r - w/2, 15)
        },
        z: 50,
        width: w,
        height: h,
      })
    }
    //  console.log(nodes)
    addNodes(nodes)
  }

  const clearSubspaces = () => {
    if (!confirm(`are you sure? all subspaces will be removed from ${space?.name}`))
      return 

    for (let i=0;i<25;i++) {
      deleteNode(getSubspaceId(i))
    }
  }

  return (
    <div>
      <h2>Subspace Ring Factory</h2>
      <label>
        <input name="numSubspaces" type="number" min={1} max={25} step={1} value={inputValues.numSubspaces} onChange={handleInputChange} />
        numSubspaces
      </label>
      <label>
        <input name="radius" type="number" min={100} max={1500} step={50} value={inputValues.radius} onChange={handleInputChange} />
        radius
      </label>
      <div>
        subspace dimensions
        <label>
          <input name="width" type="number" min={30} max={300} step={15} value={inputValues.width} onChange={handleInputChange} />
        </label>
        x
        <label>
          <input name="height" type="number" min={30} max={300} step={15} value={inputValues.height} onChange={handleInputChange} />
        </label>
      </div>
      <button onClick={makeSubspaceNodes}>make subspaces</button>
      <button onClick={clearSubspaces}>clear subspaces</button>
    </div>
  )
}


function FeedbackGridMaker() {
  const { addNodes, deleteNode } = usePersistedNodeActions()
  const space = useSpace()
  const [inputValues, setInputValues] = useState({
    offsetX: 0,
    offsetY: 0,
    rows: 5,
    columns: 5,
    gridWidth: 2400,
    gridHeight: 1000,
    subspaceWidth: 400,
    subspaceHeight: 120,
    padWidth: 120,
  })

  const handleInputChange = (e) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value
    }));
  };

  const makeSubspaceNodes = () => {
    let oX = parseInt(inputValues.offsetX)
    let oY = parseInt(inputValues.offsetY)
    let rows = parseFloat(inputValues.rows)
    let cols = parseFloat(inputValues.columns)
    let w = parseFloat(inputValues.gridWidth)
    let h = parseFloat(inputValues.gridHeight)
    let sW = parseInt(inputValues.subspaceWidth)
    let sH = parseInt(inputValues.subspaceHeight)
    let pW = parseInt(inputValues.padWidth)

    let nodes = []
    
    for (let i=0; i<cols; i++) {
      for (let j=0; j<rows;j++) {
        let id = getSubspaceId(i*cols+j)

        nodes.push({
          id,
          type: 'SubspaceNode',
          data: {
            subspace: id,
            label: id,
            frozen: true
          },
          position: {
            x: roundToGrid((w/cols)*i+oX, 15),
            y: roundToGrid((h/rows)*j+oY, 15)
          },
          z: 50,
          width: sW,
          height: sH,
        })

        nodes.push({
          id: id+'_pad',
          type: 'PadNode',
          data: {
            layer: 'feedback',
            frozen: true,
            style: {
              background: generateRandomColor()
            }
          },
          position: {
            x: roundToGrid((w/cols)*i+oX+((sW-pW)/2)+30, 15),
            y: roundToGrid((h/rows)*j+oY-30, 15)
          },
          z: 51,
          width: pW,
          height: sH-15,
        })
      }
    }
    console.log(nodes)
    addNodes(nodes)
  }

  const clearFeedback = () => {
    if (!confirm(`are you sure? all feedbacks will be removed from ${space?.name}`))
      return 

    for (let i=0;i<100;i++) {
      deleteNode(getSubspaceId(i))
      deleteNode(getSubspaceId(i)+'_pad')
    }
  }

  return (
    <div>
      <h2>Feedback grid maker</h2>
      <label>
        <input name="rows" type="number" min={1} max={5} step={1} value={inputValues.rows} onChange={handleInputChange} />
        rows
      </label>
      <label>
        <input name="columns" type="number" min={1} max={5} step={1} value={inputValues.columns} onChange={handleInputChange} />
        columns
      </label>
      <div>
        offset
        <label>
          <input name="offsetX" type="number" min={-1200} max={1200} step={15} value={inputValues.offsetX} onChange={handleInputChange} />
        </label>
        x
        <label>
          <input name="offsetY" type="number" min={-1200} max={1200} step={15} value={inputValues.offsetY} onChange={handleInputChange} />
        </label>
      </div>
      <div>
        grid dimensions
        <label>
          <input name="gridWidth" type="number" min={30} max={300} step={15} value={inputValues.gridWidth} onChange={handleInputChange} />
        </label>
        x
        <label>
          <input name="gridHeight" type="number" min={30} max={300} step={15} value={inputValues.gridHeight} onChange={handleInputChange} />
        </label>
      </div>
      <div>
        subspace dimensions
        <label>
          <input name="subspaceWidth" type="number" min={30} max={300} step={15} value={inputValues.subspaceWidth} onChange={handleInputChange} />
        </label>
        x
        <label>
          <input name="subspaceHeight" type="number" min={30} max={300} step={15} value={inputValues.subspaceHeight} onChange={handleInputChange} />
        </label>
      </div>
      <label>
        <input name="padWidth" type="number" min={30} max={300} step={15} value={inputValues.padWidth} onChange={handleInputChange} />
        pad width
      </label>
      <button onClick={makeSubspaceNodes}>make feedback subspaces</button>
      <button onClick={clearFeedback}>clear feedback subspaces</button>
    </div>
  )
}

function EntryPanel() {
  const [inputValues, setInputValues] = useState({
    numSubspaces: 5,
    radius: 600,
    width: 180,
    height: 120,
  })

  const handleInputChange = (e) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value
    }));
  };
  
  return (
    <div>
      <h2>Entry location</h2>
      <p>(random within box)</p>
      <label>
        <input name="x" type="number" min={-1500} max={1500} step={15} value={inputValues.x} onChange={handleInputChange} />
        x
      </label>
      <label>
        <input name="y" type="number" min={-1500} max={1500} step={15} value={inputValues.y} onChange={handleInputChange} />
        y
      </label>
      <div>
        <label>
          <input name="width" type="number" min={100} max={400} step={15} value={inputValues.width} onChange={handleInputChange} />
          width
        </label>
        <label>
          <input name="height" type="number" min={100} max={400} step={15} value={inputValues.height} onChange={handleInputChange} />
          height
        </label>
      </div>
    </div>
  )
}

export function SpaceMetadataPanel() {
  const [visible, setVisible] = useState(false)
  if (!visible)
    return <button onClick={()=>setVisible(true)}>show controls</button>
  
  return <>
    <button onClick={()=>setVisible(false)}>hide controls</button>
    <SpaceMetadataControls/>
  </>
}

export function SpaceMetadataControls() {
  const space = useSpace()
  const metadata = space.metadata
  const [ state, setState ] = useState({})

  const { addNode } = usePersistedNodeActions()
  
  const makeStage = useCallback(()=>{
    addNode({
      id: 'stage',
      type: 'StageNode',
      data: {
        subspace: 'stage',
        label: 'stage',
        frozen: true
      },
      position: {
        x: -150,
        y: -150
      },
      z: 1,
      width: 300,
      height: 300,
    })

    addNode({
      id: 'stage-innercircle',
      type: 'StageNode',
      data: {
        subspace: 'stage-innercircle',
        frozen: true
      },
      position: {
        x: -75,
        y: -75
      },
      z: 2,
      width: 150,
      height: 150,
    })
  }, [addNode])

  const resetMetadata = useCallback(()=>{
    if (!confirm("are you sure?"))
      return 

    metadata.map.forEach(({key, _})=>{
      metadata.delete(key)
    })
  }, [])

  useEffect(()=>{
    const syncState = () => {
      setState(Object.fromEntries(metadata.map.entries()))
    }

    //init
    syncState()
    
    //start observing
    metadata.on('change', syncState)

    //stop obsering
    return ()=>metadata.off('change', syncState)
  }, [metadata])
  
  return (
    <>
    <div className="form">
      <YkvTextInput ykey={'spaceDisplayName'} state={state} metadataYkv={metadata}/>
    
      <h2>Stage</h2>
      <div>
        <YkvCheckbox ykey={'onEnterInnerCircleChangeVideo'} state={state} metadataYkv={metadata}/>
        {
          state['onEnterInnerCircleChangeVideo']?.val && <YkvCheckbox ykey={'enterInnerCircleVideo'} state={state} metadataYkv={metadata}/>
        }
        <br/>
        <YkvCheckbox ykey={'onEnterInnerCircleChangeAudio'} state={state} metadataYkv={metadata}/>
        {
          state['onEnterInnerCircleChangeAudio']?.val && <YkvCheckbox ykey={'enterInnerCircleAudio'} state={state} metadataYkv={metadata}/>
        }
      </div>
      <div>
        <YkvCheckbox ykey={'onEnterStageChangeVideo'} state={state} metadataYkv={metadata}/>
        {
          state['onEnterStageChangeVideo']?.val && <YkvCheckbox ykey={'enterStageVideo'} state={state} metadataYkv={metadata}/>
        }
        <br/>
        <YkvCheckbox ykey={'onEnterStageChangeAudio'} state={state} metadataYkv={metadata}/>
        {
          state['onEnterStageChangeAudio']?.val && <YkvCheckbox ykey={'enterStageAudio'} state={state} metadataYkv={metadata}/>
        }
        {/* <br/>
        <YkvCheckbox ykey={'onEnterStageChangeSize'} state={state} metadataYkv={metadata}/>
        {
          state['onEnterStageChangeSize']?.val && <YkvNumberInput label={'size change'} ykey={'enterStageSizeChange'} step={15} state={state} metadataYkv={metadata}/>
        } */}
      </div>
      <div>
        <YkvCheckbox ykey={'onLeaveStageChangeVideo'} state={state} metadataYkv={metadata}/>
        {
          state['onLeaveStageChangeVideo']?.val && <YkvCheckbox ykey={'leaveStageVideo'} state={state} metadataYkv={metadata}/>
        }
        <br/>
        <YkvCheckbox ykey={'onLeaveStageChangeAudio'} state={state} metadataYkv={metadata}/>
        {
          state['onLeaveStageChangeAudio']?.val && <YkvCheckbox ykey={'leaveStageAudio'} state={state} metadataYkv={metadata}/>
        }
        {/* <br/>
        <YkvCheckbox ykey={'onLeaveStageChangeSize'} state={state} metadataYkv={metadata}/>
        {
          state['onLeaveStageChangeSize']?.val && <YkvNumberInput label={'size change'} ykey={'leaveStageSizeChange'} step={15} state={state} metadataYkv={metadata}/>
        } */}
      </div>
      <button onClick={makeStage}>make stage</button>
    <hr/>
      <SubspaceMaker/>
    <hr/>   
      <FeedbackGridMaker/>
    <hr/>
      <button onClick={resetMetadata}>reset metadata</button>
    </div>
    
    </>
  )

}