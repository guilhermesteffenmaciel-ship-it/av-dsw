// Erro "conhecido" da aplicação: carrega o código HTTP e a mensagem
// que serão devolvidos ao cliente pelo middleware de erros.
export class AppError extends Error {
  constructor(mensagem, statusCode = 400, detalhes = undefined) {
    super(mensagem);
    this.statusCode = statusCode;
    this.detalhes = detalhes;
  }
}
