# Mocks da API

Os mocks são ativados somente no servidor de desenvolvimento do Vite. Copie `.env.example` para `.env.local`, defina `VITE_API_MOCKS=true` e reinicie `npm run dev`.

Com a opção ligada, o frontend usa o mock quando a conexão falha ou quando a API responde `404` ou `501`. Outros erros HTTP, como `401` e `500`, continuam sendo mostrados como erros reais da API. Para voltar ao backend, defina `VITE_API_MOCKS=false`.

No estado inicial do mock, entre com `demo@taskcat.local` e `taskcat123`. O cadastro também cria usuários em memória; os dados de teste são reiniciados ao recarregar a página.

Os mocks implementam os caminhos já consumidos pelos serviços de usuário e projetos. Eles não substituem nem alteram a implementação dessas funcionalidades no frontend.
