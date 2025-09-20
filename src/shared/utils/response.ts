import { Context } from "hono";

export const ResponseResult = <T>(
  c: Context,
  result: T,
  message: string,
) => {
  return c.json({
    message,
    result,
  });
};
