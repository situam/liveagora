import React from 'react';
import { AgoraProvider } from './context/AgoraContext';
import { SpaceProvider } from './context/SpaceContext';
import { Provider as LiveAVProvider } from './components/LiveAV';
import { NodesSnapshot } from './snapshot/snapshot';
import { SpaceFlow } from './components/LiveFlow';
import { AccessControlProvider, AccessRoles } from './context/AccessControlContext';
import { hatchAgora } from './agoraHatcher';

async function _fetchSnapshotData(url = '/example_snapshot_data.json') {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

/**
 * Loads a space from a snapshot url and initialises a local-only Agora environment
 * 
 * @component
 * @param {String} props.url - url of json snapshot to load
 */
export const AgoraAppLocalSnapshot = ({ url }) => {
    const { baseAgora, spaces } = hatchAgora('', null, ()=>{})
    React.useEffect(()=>{
        async function init() {
            console.log(`[AgoraAppLocalSnapshot] load snapshot from url: ${url}`)
            const json = await _fetchSnapshotData(url)
            NodesSnapshot.fromJSON(json).loadIntoSpace(spaces[0])
        }
        init()
    }, [url])

    return (
        <AccessControlProvider role={AccessRoles.Viewer}>
            <AgoraProvider agora={baseAgora}>
                <LiveAVProvider>
                <SpaceProvider space={spaces[0]}>
                <SpaceFlow editable={true} presence={false}/>
                </SpaceProvider>
                </LiveAVProvider>
            </AgoraProvider>
        </AccessControlProvider>
    )
}