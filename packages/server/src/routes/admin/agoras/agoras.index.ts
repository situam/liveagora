import { createRouter } from "../../../lib/createRouter.ts";
import * as handlers from "./agoras.handlers.ts"
import * as routes from "./agoras.routes.ts"

const router = createRouter()
  .openapi(routes.list, handlers.list)
  //.openapi(routes.create, handlers.create)
  //.openapi(routes.getOne, handlers.getOne)
  .openapi(routes.put, handlers.put)
  .openapi(routes.remove, handlers.remove)

export default router;