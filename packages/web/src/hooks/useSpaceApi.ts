import { useStoreApi } from "reactflow"

function useSpaceApi() {
    const rfStore = useStoreApi()
    const getNodes = () => {
        return Array.from(rfStore.getState().nodeInternals.values())
    }
    const getSelectedNodes = () => {
        return getNodes().filter(n => n.selected)
    }
    const getStageNodes = () => {
        return getNodes().filter(n => n.type === 'StageNode')
    }

    return {
        getNodes,
        getSelectedNodes,
        getStageNodes,
    }
}

export {
    useSpaceApi
}