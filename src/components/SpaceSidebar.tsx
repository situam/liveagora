import { SidebarSide, useSidebar } from "./Sidebar";
import { useSpace } from "../context/SpaceContext";
import { useSpaceAccessControl } from "../context/AccessControlContext";
import { SIDEBAR_EXTENSIONS, Pad } from "./Pad";
import { useEffect } from "react";
import { useSpaceShowInfo } from "../hooks/useLiveMetadata";

function SpaceInfoSidebarContent() {
  const space = useSpace()
  if (!space) return null

  const { currentRole } = useSpaceAccessControl()

  return <Pad
    ydoc={space.ydoc}
    id={`pad.space-sidebar`}
    outsideFlow={true}
    editable={currentRole.canEdit}
    extensions={SIDEBAR_EXTENSIONS}
  />
}

export function SpaceInfoSidebarLoader() {
  const space = useSpace()
  if (!space) return null

  const showInfoSidebar = useSpaceShowInfo();
  const { openSidebar, closeSidebar } = useSidebar();

  useEffect(() => {
    if (showInfoSidebar) {
      openSidebar({
        children: <SpaceInfoSidebarContent/>,
        side: SidebarSide.left,
        showCloseButton: true,
      })
    } else {
      closeSidebar()
    }
  }, [space, showInfoSidebar]);

  return null;
}