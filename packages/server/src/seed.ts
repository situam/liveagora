import { initializeDatabase } from "./auth/db.ts"
import { getAgoraPasswordsRow, setAgoraPasswordsRow } from "./repo/agoraPasswords.ts"
import { getSpacePasswordsRow, setSpacePasswordsRow } from "./repo/spacePasswords.ts"

await initializeDatabase()

await setAgoraPasswordsRow({
    id: "agora/my-agora",
    read_password: null,
    edit_password: "agora-edit",
})

await setSpacePasswordsRow({
    id: "space/my-agora/space00",
    edit_password: "space-edit",
})

console.log(await getAgoraPasswordsRow("agora/my-agora"))
console.log(await getSpacePasswordsRow("space/my-agora/space00"))
