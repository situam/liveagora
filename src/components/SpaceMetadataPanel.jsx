import { useState, useEffect, useCallback } from "react"
import { useSpace } from "../context/SpaceContext"
import { useAgora } from "../context/AgoraContext"
import { usePersistedNodeActions } from "../hooks/usePersistedNodeActions"
import { generateRandomLightColor, roundToGrid } from "../util/utils"
import { useStoreApi } from 'reactflow'

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

function YkvTextInput({label, state, metadataYkv, ykey}) {
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
        selectable: false,
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
        let id = getSubspaceId(j*cols+i)

        nodes.push({
          id,
          type: 'SubspaceNode',
          data: {
            layer: 'feedback',
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
          id: id+'_feedbackpad0',
          type: 'PadNode',
          data: {
            layer: 'feedback',
            frozen: true,
            style: {
              background: generateRandomLightColor(),
              fontSize: '0.5em',
              lineHeight: '1em'
            }
          },
          position: {
            x: roundToGrid((w/cols)*i+oX+15, 15),
            y: roundToGrid((h/rows)*j+oY+90, 15)
          },
          z: 51,
          width: pW,
          height: sH-15,
        })
        nodes.push({
          id: id+'_feedbackpad1',
          type: 'PadNode',
          data: {
            layer: 'feedback',
            frozen: true,
            style: {
              background: generateRandomLightColor(),
              fontSize: '0.5em',
              lineHeight: '1em'
            }
          },
          position: {
            x: roundToGrid((w/cols)*i+oX+15+pW, 15),
            y: roundToGrid((h/rows)*j+oY+90, 15)
          },
          z: 51,
          width: pW,
          height: sH-15,
        })
        nodes.push({
          id: id+'_feedbackpad2',
          type: 'PadNode',
          data: {
            layer: 'feedback',
            frozen: true,
            style: {
              background: generateRandomLightColor(),
              fontSize: '0.5em',
              lineHeight: '1em'
            }
          },
          position: {
            x: roundToGrid((w/cols)*i+oX+15+pW+pW, 15),
            y: roundToGrid((h/rows)*j+oY+90, 15)
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
      deleteNode(getSubspaceId(i)+'_feedbackpad0')
      deleteNode(getSubspaceId(i)+'_feedbackpad1')
      deleteNode(getSubspaceId(i)+'_feedbackpad2')
    }
  }

  return (
    <div>
      <h2>Feedback grid maker</h2>
      <label>
        <input name="rows" type="number" min={1} max={8} step={1} value={inputValues.rows} onChange={handleInputChange} />
        rows
      </label>
      <label>
        <input name="columns" type="number" min={1} max={8} step={1} value={inputValues.columns} onChange={handleInputChange} />
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

function useNodeControls() {
  const { updateNodes, deleteAllNodes } = usePersistedNodeActions()
  const rfStore = useStoreApi()
  const { ykv } = useSpace()

  const getSelectedNodes = () => Array.from(rfStore.getState().nodeInternals.values()).filter(n=>n.selected)

  const setZIndex = useCallback(()=>{
    const nodes = getSelectedNodes()
    if (nodes.length < 1)
      return alert('select the node/s first')

    let z = prompt('enter z', nodes[0].z || 1)
    let updates = nodes.map(n=>({
      id: n.id,
      update: { z }
    }))
    updateNodes(updates)
  },
  [])
  const setLayer = useCallback(()=>{
    const nodes = getSelectedNodes()
    if (nodes.length < 1)
      return alert('select the node/s first')

    let layer = prompt('set layer', nodes[0].layer || '')
    if (!layer)
      return
      
    let updates = nodes.map(n=>({
      id: n.id,
      update: { data: {...n.data, layer} }
    }))
    updateNodes(updates)
  },[])

  const setLayerHidden = useCallback(()=>{
    let layer = prompt('which layer?')
    if (!layer)
      return

    let hidden = confirm('OK=Hide, Cancel=Show')

    let updates = Array.from(rfStore.getState().nodeInternals.values()).filter(n=>n.data?.layer==layer).map(n=>({
      id: n.id,
      update: { hidden }
    }))

    updateNodes(updates)
  },[])

  const setLayerSelectable = useCallback(()=>{
    let layer = prompt('which layer?')
    if (!layer)
      return

    let selectable = confirm('make selectable? (OK=Selectable, Cancel=Not Selectable)')

    let updates = Array.from(rfStore.getState().nodeInternals.values()).filter(n=>n.data?.layer==layer).map(n=>({
      id: n.id,
      update: { selectable }
    }))

    updateNodes(updates)
  },[])

  const soloLayerVisibility = useCallback(()=>{
    let layer = prompt('which layer?')
    if (!layer)
      return

    let updates = Array.from(ykv.map.values()).filter(n=>n.val.type!='StageNode'&&n.val.data?.layer!='special').map(n=>({
      id: n.val.id,
      update: {
        hidden: n.val.data?.layer==layer ? false : true
      }
    }))
    
    updateNodes(updates)
  },[])

  const revealAllNodes = useCallback(()=>{
    if (!confirm('are you sure?'))
      return

    let updates = Array.from(ykv.map.values()).map(n=>({
      id: n.val.id,
      update: {
        hidden: false
      }
    }))

    updateNodes(updates)
  },[])
 
  return {setZIndex, setLayer, setLayerHidden, setLayerSelectable, soloLayerVisibility, revealAllNodes}
}

function NodeControlUI() {
  const nodeControls = useNodeControls()

  return (<>
  <h2>node controls</h2>
    <button onClick={nodeControls.setZIndex}>set node z</button>
    <button onClick={nodeControls.setLayer}>set node layer</button>
    <button onClick={nodeControls.setLayerHidden}>hide/show layer</button>
    <button onClick={nodeControls.soloLayerVisibility}>solo layer</button>
    <button onClick={nodeControls.setLayerSelectable}>set layer selectable</button>
    <button onClick={nodeControls.revealAllNodes}>reveal all nodes</button>
  </>)
}


export function useYkv(ykv) {
  const [state, setState] = useState({})

  useEffect(()=>{
    const syncState = () => setState(Object.fromEntries(ykv.map.entries()))

    syncState()
    ykv.on('change', syncState)
    return () => ykv.off('change', syncState)
  }, [ykv])

  return { state, ykv }
}

export function AgoraMetadataPanel() {
  const agora = useAgora()
  const { state, ykv } = useYkv(agora.metadata)

  return (
    <>
      <h2>spaces</h2>
      <YkvCheckbox ykey={`infopage-enabled`} state={state} metadataYkv={ykv}/><br/>
          {
            state[`infopage-enabled`]?.val && <>
              <YkvTextInput label={'displayName'} ykey={`infopage-displayName`} state={state} metadataYkv={ykv}/>
              
            </> 
          }
      {
      ['space00', 'space01', 'space02', 'space03', 'space04', 'space05'].map((s,i) =>
        <>
          <YkvCheckbox label={s} ykey={`${s}-enabled`} state={state} metadataYkv={ykv} key={i}/>
          <br/>
          {
            state[`${s}-enabled`]?.val && <>
              <YkvTextInput label={'displayName'} ykey={`${s}-displayName`} state={state} metadataYkv={ykv} key={i}/>
              
            </>
          }
        </>
      )
      }
      <hr/>
      <h2>liveAV</h2>
      <YkvTextInput ykey={'liveAV/roomID'} state={state} metadataYkv={ykv}/>
    </>
  )
}

export function SpaceMetadataControls() {
  const space = useSpace()
  const metadata = space.metadata
  const [ state, setState ] = useState({})

  const { addNode, deleteAllNodes } = usePersistedNodeActions()
  
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

  const onUpdateSpaceBackground = useCallback((e)=>{
    metadata.set('background', e.target.value)
  },
  [])

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

    //stop observing
    return ()=>metadata.off('change', syncState)
  }, [metadata])
  
  return (
    <>
    <div className="form">
      <AgoraMetadataPanel/>
      <hr/>
      <h2>space</h2>
      {/* <YkvTextInput ykey={'spaceDisplayName'} state={state} metadataYkv={metadata}/> */}
      <label>
        <input type="color" value={state?.background?.val} onChange={onUpdateSpaceBackground}/>
        background
      </label>
      
      <button onClick={()=>{metadata.delete('background')}}>unset background</button>
      <button className="btn-alert" onClick={resetMetadata}>reset metadata</button>
      <hr/>
      <h2>entry</h2>
      <YkvCheckbox ykey={'onEntryJoinLiveAV'} state={state} metadataYkv={metadata}/>
      <hr/>
      <NodeControlUI/>
      <hr/>
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
      <button className="btn-alert" onClick={
        ()=>{
          if (confirm('are you sure? this cannot be undone'))
            deleteAllNodes()
        }}>
        delete all nodes
      </button>
    </div>
    
    </>
  )

}