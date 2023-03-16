import React, { createContext, useContext } from 'react';

const AgoraContext = createContext(undefined);

const AgoraProvider = ({ agora, ...props }) => {
  console.log('[AgoraProvider] agora:', agora)

  return <AgoraContext.Provider value={agora}>
    {props.children}
  </AgoraContext.Provider>
};

const useAgora = () => useContext(AgoraContext)

export { AgoraProvider, useAgora }