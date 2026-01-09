import { createRouter } from "../../lib/createRouter.ts";
import * as handlers from "./app.handlers.ts"
import * as routes from "./app.routes.ts"

const router = createRouter()
  .openapi(routes.createVideoUpload, handlers.createVideoUpload)

export default router;