import { z } from "zod";

export const prSubmitSchema = z.object({
  targetType: z.enum(["machine", "lift"]),
  machineId: z.string().optional(),
  liftId: z.string().optional(),
  value: z.coerce.number().positive(),
  bodyweight: z.coerce.number().optional(),
  genderDivision: z.enum(["open", "male", "female", "non_binary"]),
  notes: z.string().optional(),
});
