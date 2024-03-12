import { useEffect, useState } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './TabView.css'
import { updateUrlParam, UrlParam } from '../lib/navigate';
import { compareStringsNormalized } from '../util/utils';

/**
 * 
 * @param {string[]} titles - list of titles
 * @returns {int?} index of matching title, or zero 
 */
function getTabIndexFromUrlParam(titles) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(UrlParam.Tab)) {
    for (let idx=0;idx<titles.length;idx++) {
      if (compareStringsNormalized(urlParams.get(UrlParam.Tab), titles[idx])) {
        return idx;
      }
    }
  }
  return null;
}

export function TabView({titles, bodies, backButtonEnabled, backButtonDestination}) {
  const getInitialTabIndex = () => {
    return getTabIndexFromUrlParam(titles) ?? backButtonEnabled ? 1 : 0;
  };

  const [tabIndex, setTabIndex] = useState(getInitialTabIndex);

  // If number of tabs change, change to tab based on title
  useEffect(()=>{
    const updateTabIndex = getTabIndexFromUrlParam(titles)
    if (updateTabIndex != null) {
      setTabIndex(updateTabIndex)
    }
  }, [titles])

  const onSelect = (index) => {
    if (backButtonEnabled && (index==0))
      window.location = backButtonDestination
    else {
      updateUrlParam(UrlParam.Tab, titles[index])
      
      // Change tab
      setTabIndex(index);
    }
  }

  // If only one tab, don't show tab chrome, just show content
  if (titles.length==1&&bodies.length==1) {
    return <main className="main-content" style={{marginTop:0}}>
      {bodies[0]}
    </main>
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