import { initializeDatabase } from "./auth/db.ts"
import { getAgoraPasswordsRow, setAgoraPasswordsRow } from "./repo/agoraPasswords.ts"
import { getSpacePasswordsRow, setSpacePasswordsRow } from "./repo/spacePasswords.ts"
import { env } from "./env.ts"
import { DocumentNames } from "@liveagora/common"

await initializeDatabase(env.pathToDb)

const agoraId = DocumentNames.buildAgoraDoc("my-agora")
const spaceId = DocumentNames.buildSpaceDoc("my-agora", "space00")

await setAgoraPasswordsRow({
  id: agoraId,
  read_password: null,
  edit_password: "agora-edit",
})

await setSpacePasswordsRow({
  id: spaceId,
  edit_password: "space-edit",
})

console.log(await getAgoraPasswordsRow(agoraId))
console.log(await getSpacePasswordsRow(spaceId))
