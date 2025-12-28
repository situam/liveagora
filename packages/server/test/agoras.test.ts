import { describe, it, expect } from "vitest"
import { app } from "../src/app.ts"
import { env } from "../src/env.ts"

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
    const json = await res.json()
    expect(Array.isArray(json)).toBe(true)
    // TODO: validate content
  })
})
