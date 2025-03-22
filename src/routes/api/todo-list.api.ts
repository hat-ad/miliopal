import express from "express";

import TodoListController from "@/controller/todo-list.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import { validateCompleteTodoListSchema } from "../validators/todolist/todo-list";
import { validateUpdateTodoListSettings } from "../validators/todolist/todo-list-settings.validator";

const router = express.Router();

router.get(
  "/list-todo-lists",
  isAuthenticated,
  TodoListController.getInstance().listTodoLists
);

router.get(
  "/get-todo-list-settings",
  isAuthenticated,
  TodoListController.getInstance().getTodoListSettings
);

router.put(
  "/update-todo-list-settings",
  isAuthenticated,
  validateUpdateTodoListSettings,
  TodoListController.getInstance().updateTodoListSettings
);

router.post(
  "/complete-todo-list-tasks",
  isAuthenticated,
  validateCompleteTodoListSchema,
  TodoListController.getInstance().completeTodoListEvent
);
export default router;
