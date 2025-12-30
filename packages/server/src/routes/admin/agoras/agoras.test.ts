import { describe, it, expect } from "vitest"
import { app } from "../../../app.ts"
import { env } from "../../../env.ts"

// import { testClient } from "hono/testing"
// todo: reference https://github.com/w3cj/hono-open-api-starter/blob/main/src/routes/tasks/tasks.test.ts
// import router from "./agoras.index.ts"
// const client = testClient(router)

describe("GET /agoras", () => {
  const endpoint = `${env.routePrefix}/admin/agoras`

  it("returns 401 without auth", async () => {
    const res = await app.request(endpoint)
    expect(res.status).toBe(401)
  })

  it("returns 401 with wrong token", async () => {
    const res = await app.request(endpoint, {
      headers: {
        Authorization: `Bearer (wrongtoken)`,
      },
    })
    expect(res.status).toBe(401)
  })

  it("returns rows with valid token", async () => {
    const res = await app.request(endpoint, {
      headers: {
        Authorization: `Bearer ${env.adminToken}`,
      },
    })

    expect(res.status).toBe(200)
    await res.json()
  })
})
