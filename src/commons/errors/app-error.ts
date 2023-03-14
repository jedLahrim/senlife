import { Matches, ValidationOptions } from 'class-validator';

export class AppError {
  code: string;
  message?: string;

  constructor(code: string, message?: string) {
    this.code = code;
    this.message = message;
  }
}
