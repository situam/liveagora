import React from 'react';
import { AgoraProvider } from './context/AgoraContext';
import { SpaceProvider } from './context/SpaceContext';
import { Provider as LiveAVProvider } from './components/LiveAV';
import { NodesSnapshot } from './snapshot/snapshot';
import { SpaceFlow } from './components/LiveFlow';
import { AgoraAccessControlProvider, AccessRoles, SpaceAccessControlProvider } from './context/AccessControlContext';
import { hatchAgora } from './agoraHatcher';
import { SidebarProvider } from './components/Sidebar';

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
        <AgoraAccessControlProvider
            initialRole={AccessRoles.Viewer}
            initialAuthScope={AccessRoles.Editor}
        >
            <AgoraProvider agora={baseAgora}>
                <LiveAVProvider>
                    <SpaceAccessControlProvider
                        initialRole={AccessRoles.Viewer}
                        initialAuthScope={AccessRoles.Editor}
                    >
                        <SidebarProvider>
                            <SpaceProvider space={spaces[0]}>
                                <SpaceFlow presence={false}/>
                            </SpaceProvider>
                        </SidebarProvider>
                    </SpaceAccessControlProvider>
                </LiveAVProvider>
            </AgoraProvider>
        </AgoraAccessControlProvider>
    )
}