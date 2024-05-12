import { useAgora } from "../context/AgoraContext"
import { useSpace } from "../context/SpaceContext"
import { useSpaceShowZoomControls, useSpaceBackgroundGrid, useSpaceBackgroundBlend, useSpaceCanvasBounds, useSpaceBackground, useSpaceBranding } from "../hooks/useLiveMetadata"
import { useYkv } from "../hooks/useYkv"
import { YkvTextInput } from "./YkvUi"
import { canvasBoundsToWidthHeight } from "../util/utils"
import { isCommunityVersion } from "../AgoraApp"

export function SpaceSettings() {
    const agora = useAgora()
    const space = useSpace()
    const { state, ykv } = useYkv(agora.metadata)
    const canvasBounds = useSpaceCanvasBounds()
    const backgroundBlend = useSpaceBackgroundBlend()
    const backgroundGrid = useSpaceBackgroundGrid()
    const showBranding = useSpaceBranding()
    const showZoomControls = useSpaceShowZoomControls()
    const backgroundColor = useSpaceBackground()
    const { width, height } = canvasBoundsToWidthHeight(canvasBounds)

    return <>
        <YkvTextInput label={'space name'} defaultValue={space.name} ykey={`${space.name}-displayName`} state={state} metadataYkv={ykv}/>
        
        <label>background color </label>
        <input type="color" value={backgroundColor} onChange={(e)=>{
            space.metadata.set('background', e.target.value)
        }}/> 
        <br/>
        
        {/*<label>
            background grid
            <input type="checkbox" checked={backgroundGrid} onChange={(e)=>{
                space.metadata.set('backgroundGrid', e.target.checked)
            }}/>
        </label>
        <br/>*/}
        
        <label>
            blend with background
            <input type="checkbox" checked={backgroundBlend} onChange={(e)=>{
                space.metadata.set('backgroundBlend', e.target.checked)
            }}/>
        </label>
        <br/>

        {
        !isCommunityVersion &&
        <>
            <label>
                hide attribution
                <input type="checkbox" checked={!showBranding} onChange={(e)=>{
                    space.metadata.set('showBranding', !e.target.checked)
                }}/>
            </label>
            <br/>
        </>
        }

        <label>
            show zoom buttons
            <input type="checkbox" checked={showZoomControls} onChange={(e)=>{
                space.metadata.set('showZoomControls', e.target.checked)
            }}/>
        </label>
        <br/>
        
        <label>size </label>
        <input name="radius" type="number" min={1500} max={15000} step={150} value={width} onChange={(e)=>{
            const newWidth = e.target.value    
            space.metadata.set('canvasBounds', [[-newWidth/2, canvasBounds[0][1]],[newWidth/2, canvasBounds[1][1]]])
        }} /> x <input name="radius" type="number" min={1500} max={15000} step={510} value={height} onChange={(e)=>{
            const newHeight = e.target.value    
            space.metadata.set('canvasBounds', [[canvasBounds[0][0], -newHeight/2],[canvasBounds[1][0], newHeight/2]])
        }} />   
    </>
}