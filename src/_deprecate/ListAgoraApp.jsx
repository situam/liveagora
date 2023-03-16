import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './Tabs.css'

import { GatedSharedFlow } from './components/GatedSharedFlow.jsx'

function ClassicTabbedSpaces({room, spaces}) {
  if (!spaces)
    return null

  return (
    <Tabs>
      <TabList>
        {spaces.map((space,i)=>
          <Tab key={i}>
            {space}
          </Tab>
        )}
      </TabList>
      {spaces.map((space,i)=>
        <TabPanel key={i}>
          <GatedSharedFlow docname={`${room}.${space}`}/>
        </TabPanel>
      )}
    </Tabs>
  )
}

export default function ListAgoraApp() {
  const validSpaces = ['sandbox', 'space01', 'space02', 'space03', 'space04', 'space05']
  const urlParams = new URLSearchParams(window.location.search);
  
  let spaces = validSpaces.filter(space=>urlParams.has(space))

  if (!spaces.length)
    return (<p>Invalid url. Should take shape as /?tree=mitbestimmung&sandbox&space01</p>)
  
  if (spaces.length == 1)
    return <GatedSharedFlow docname={`${urlParams.get('tree')}.${spaces[0]}`}/>

  return <ClassicTabbedSpaces room={urlParams.get('tree')} spaces={spaces}/>
}