import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const CompleteTodoListSchema = z.object({
  todoListId: z.string().min(4, "Todo list id is required!"),
  event: z.string().min(4, "Event is required!"),
  paymentDate: z.string().min(4, "Payment date is required!").optional(),
  purchaseId: z.string().min(4, "Purchase id is required!").optional(),
});

export type CompleteTodoListSchemaSchema = z.infer<
  typeof CompleteTodoListSchema
>;

export const validateCompleteTodoListSchema = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload: Record<string, string> = {
      todoListId: req.body.todoListId,
      event: req.body.event,
    };

    if (req.body.paymentDate) payload.paymentDate = req.body.paymentDate;
    if (req.body.purchaseId) payload.purchaseId = req.body.purchaseId;

    req.body = payload;
    CompleteTodoListSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return ERROR(
        res,
        error.errors.map((err) => ({
          message: err.message,
          path: err.path,
        })),
        "Validation error"
      );
    }
    return ERROR(res, [], "Internal Server Error");
  }
};
