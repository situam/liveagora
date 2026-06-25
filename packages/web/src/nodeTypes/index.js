import { AgoraNode, ImageNode, VideoNode, SoundNode, PadNode, DemoNode, NodeHatcher, SubspaceNode, StageNode, BoundaryNode } from './nodeTypes';
import ImagesNode from './ImagesNode';
import {
  LocalPeer,
  RemotePeer,
  LocalPeerScreenshare,
  RemotePeerScreenshare
} from './PeerNode';
import { LinkNode } from './LinkNode';

export const nodeTypes = {
  image: ImageNode,
  images: ImagesNode,
  video: VideoNode,
  sound: SoundNode,
  link: LinkNode,
  PadNode,
  DemoNode,
  NodeHatcher,
  SubspaceNode,
  AgoraNode,
  StageNode,
  LocalPeer,
  LocalPeerScreenshare,
  RemotePeer,
  RemotePeerScreenshare,
  BoundaryNode
};
