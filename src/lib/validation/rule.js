import {z} from 'zod'
export const RuleSchema = z.object({
    name:z.string().min(3, "Name must be at least 3 characters long"),
    description:z.string().min(3, "Description must be at least 3 characters long")

})