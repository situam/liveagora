import { SidebarSide, useSidebar } from "./Sidebar";
import { useSpace } from "../context/SpaceContext";
import { useSpaceAccessControl } from "../context/AccessControlContext";
import { Pad } from "./Pad";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";
import { useSpaceShowInfo } from "../hooks/useLiveMetadata";

function SpaceInfoSidebarContent() {
  const space = useSpace()
  if (!space) return null

  const { currentRole } = useSpaceAccessControl()

  return <Pad
    ydoc={space.ydoc}
    id={`pad.space-sidebar.${space.name}`}
    outsideFlow={true}
    editable={currentRole.canEdit}
    extensions={[
      Image.configure({
        HTMLAttributes: {
          class: 'sidebar-image',
        },
      }),
    ]}
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