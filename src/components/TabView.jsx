import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './TabView.css'

export function TabView({titles, bodies}) {
  // console.log(titles, bodies)
  // if (titles.length != bodies.length)
  //   return null

  return (
    <Tabs>
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