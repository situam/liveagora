import ImagesNode from './ImagesNode';
import { AgoraNode, ImageNode, VideoNode, SoundNode, PadNode, DemoNode, /*PdfNode, TextNode,*/ NodeHatcher, SubspaceNode, StageNode, ScreenShareNode, BoundaryNode } from './nodeTypes';
import { LocalPeer, RemotePeer } from './PeerNode';

export const nodeTypes = {
  image: ImageNode,
  images: ImagesNode,
  video: VideoNode,
  sound: SoundNode,
  PadNode,
  DemoNode,
  //PdfNode,
  //TextNode,
  NodeHatcher,
  SubspaceNode,
  AgoraNode,
  StageNode,
  LocalPeer,
  RemotePeer,
  ScreenShareNode,
  BoundaryNode
};
