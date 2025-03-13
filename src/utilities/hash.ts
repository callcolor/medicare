import { createHash } from "crypto";

export const md5 = (val: string) => createHash("md5").update(val).digest("hex");
