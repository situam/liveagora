import { Space } from "../agoraHatcher"
import { saveTextFile } from "../util/filesystem"
import { getCurrentTimestamp } from "../util/format"
import { NodesSnapshot } from "./snapshot"

export class SnapshotController {
  static exportSnapshot(space: Space) {
    function _buildFilename() {
      let filename = `${getCurrentTimestamp()}_`
      if (space.agora.name) {
        filename += space.agora.name + '_'
      }
      filename += `${space.agora.metadata.get(`${space.name}-displayName`) || space.name}_snapshot.json`
      return filename
    }

    const snapshotText = JSON.stringify(
      NodesSnapshot.fromSpace(space).toJSON(),
      null,
      2
    )

    saveTextFile(_buildFilename(), snapshotText)
  }
}