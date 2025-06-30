import { SidebarContent } from "./Sidebar";
import { useSpace } from "../context/SpaceContext";
import { useAccessControl } from "../context/AccessControlContext";
import { TagNavigator } from "./SpaceNavigator";
import { Pad } from "./Pad";
import Image from "@tiptap/extension-image";
import { TagPosts } from "./Posts";

export function SpaceSidebar() {
  const space = useSpace()
  if (!space) return null

  const { currentRole } = useAccessControl()

  return <SidebarContent showCloseButton={true}>
    {/* <Pad
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
    <TagPosts/> */}
  </SidebarContent>
}