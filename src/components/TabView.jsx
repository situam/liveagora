import { useEffect, useState } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './TabView.css'

export function TabView({titles, bodies, backButtonEnabled, backButtonDestination}) {
  // console.log(titles, bodies)
  // if (titles.length != bodies.length)
  //   return null
  const [tabIndex, setTabIndex] = useState(backButtonEnabled ? 1 : 0)

  const onSelect = (index) => {
    if (backButtonEnabled && (index==0))
      window.location = backButtonDestination
    else
      setTabIndex(index)
  }

  return (
    <Tabs selectedIndex={tabIndex} onSelect={onSelect}>
      <TabList>
        {titles.map((title,i)=>
          <Tab key={i}>
            {title}
          </Tab>
        )}
      </TabList>
      <main className="main-content">
      {bodies.map((body,i)=>
        <TabPanel key={i}>
          {body}
        </TabPanel>
      )}
      </main>
    </Tabs>
  )
}