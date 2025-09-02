import { Response } from "express";

interface TMeta {
  page: number;
  limit: number;
  total: number;
}

interface TResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  message: string;
  meta?: TMeta;
}

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  const { statusCode, success, message, data: dataResponse, meta } = data;
  res.status(statusCode).json({
    statusCode,
    success,
    message,
    data: dataResponse,
    meta,
  });
};
