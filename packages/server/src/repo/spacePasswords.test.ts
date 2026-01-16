import { describe, it, expect, beforeAll, afterAll } from "vitest"
import fs from "fs"
import path from "path"
import { initializeDatabase } from "../auth/db.ts"
import { getSpacePasswordRowsByAgora, setSpacePasswordsRow } from "../repo/spacePasswords.ts"
import { DocumentNames } from "@liveagora/common"

const DB_PATH = path.join(process.cwd(), ".test-space-passwords.sqlite")

describe("getSpacePasswordRowsByAgora", () => {
  const agoraId = "my-agora"

  beforeAll(async () => {
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH)
    await initializeDatabase(DB_PATH)

    await setSpacePasswordsRow({
      id: DocumentNames.buildSpaceDoc(agoraId, "space00"),
      edit_password: "a",
    })

    await setSpacePasswordsRow({
      id: DocumentNames.buildSpaceDoc(agoraId, "space01"),
      edit_password: "b",
    })

    await setSpacePasswordsRow({
      id: DocumentNames.buildSpaceDoc("another-agora-id", "space00"),
      edit_password: "c",
    })
  })

  afterAll(() => {
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
  })

  it("returns only spaces belonging to the given agora", async () => {
    const rows = await getSpacePasswordRowsByAgora(agoraId)
    expect(rows).toHaveLength(2)
  })
})
