import { apiClient } from "../admin/api/client";

export async function createVideoUpload(title: string) {
    const res = await apiClient.videoUpload.$post({
        json: {
            title: title,
        }
    })
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
    }
    return res.json()
}