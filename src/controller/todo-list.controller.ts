import { ServiceFactory } from "@/factory/service.factory";
import { bindMethods } from "@/functions/function";
import { ERROR, OK } from "@/utils/response-helper";
import { Request, Response } from "express";

export default class TodoListController {
  private static instance: TodoListController;
  private serviceFactory: ServiceFactory;

  private constructor(factory?: ServiceFactory) {
    this.serviceFactory = factory ?? new ServiceFactory();
    bindMethods(this);
  }

  static getInstance(factory?: ServiceFactory): TodoListController {
    if (!TodoListController.instance) {
      TodoListController.instance = new TodoListController(factory);
    }
    return TodoListController.instance;
  }
  async listTodoLists(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId;

      if (!organizationId) return ERROR(res, false, "Organization not found");

      let todoList = await this.serviceFactory
        .getTodoListService()
        .getTodoList(organizationId);

      if (!todoList) return ERROR(res, false, "User not found");

      return OK(res, todoList, "Todo list retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async updateTodoListSettings(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId;
      if (!organizationId) return ERROR(res, false, "Organization not found");
      const todoList = await this.serviceFactory
        .getTodoListService()
        .updateTodoListSettings(organizationId, req.body);
      return OK(res, todoList, "Todo list settings updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async getTodoListSettings(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId;

      if (!organizationId) return ERROR(res, false, "Organization not found");
      const todoList = await this.serviceFactory
        .getTodoListService()
        .getTodoListSettings(organizationId);
      return OK(res, todoList, "Todo list settings retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async completeTodoListEvent(req: Request, res: Response): Promise<void> {
    try {
      const { todoListId, event } = req.body;
      if (!todoListId) return ERROR(res, false, "Todo list not found");
      const todoList = await this.serviceFactory
        .getTodoListService()
        .completeTodoListTask(todoListId, event, { ...req.body });
      return OK(res, todoList, "Todo list event completed successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
