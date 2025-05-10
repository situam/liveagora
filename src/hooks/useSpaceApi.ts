import { useStoreApi } from "reactflow"

function useSpaceApi() {
    const rfStore = useStoreApi()
    const getSelectedNodes = () => {
        let nodes = Array.from(rfStore.getState().nodeInternals.values()).filter(n=>n.selected)
        return nodes
    }

    return {
        getSelectedNodes
    }
}

export {
    useSpaceApi
}