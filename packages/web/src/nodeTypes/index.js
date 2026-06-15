import { AgoraNode, ImageNode, VideoNode, SoundNode, PadNode, DemoNode, NodeHatcher, SubspaceNode, StageNode, ScreenShareNode, BoundaryNode } from './nodeTypes';
import ImagesNode from './ImagesNode';
import {
  LocalPeer,
  RemotePeer,
  LocalPeerScreenshare,
  RemotePeerScreenshare
} from './PeerNode';

export const nodeTypes = {
  image: ImageNode,
  images: ImagesNode,
  video: VideoNode,
  sound: SoundNode,
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
