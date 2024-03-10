import { useEffect, useState } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './TabView.css'
import { updateUrlParam } from '../lib/navigate';

export function TabView({titles, bodies, backButtonEnabled, backButtonDestination}) {
  const getInitialTabIndex = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('tab')) {
      const idx = parseInt(urlParams.get('tab'), 10);
      if (!isNaN(idx) && idx >= 0) {
        return idx;
      }
    }
    return backButtonEnabled ? 1 : 0;
  };

  const [tabIndex, setTabIndex] = useState(getInitialTabIndex);

  useEffect(() => {
    console.log("[TabView] tabIndex", tabIndex);
  }, [tabIndex]);

  const onSelect = (index) => {
    if (backButtonEnabled && (index==0))
      window.location = backButtonDestination
    else {
      updateUrlParam('tab', index)
      
      // Change tab
      setTabIndex(index);
    }
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