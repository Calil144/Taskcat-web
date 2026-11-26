# Roteiro de testes de integração

Este roteiro valida as fronteiras entre páginas, serviços HTTP e backend. Os serviços ficam em `src/services`; as páginas exibem o sucesso ou a mensagem padronizada lançada pelo cliente de API.

## Backend disponível

1. Inicie o backend em `http://localhost:8080` e o frontend com `npm run dev`.
2. Deixe `VITE_API_MOCKS=false` (ou remova a variável) e reinicie o Vite.
3. Cadastre um usuário de teste e confira no banco/API se o registro foi criado.
4. Entre com esse usuário. Confira se a sessão recebida permite abrir as páginas protegidas e se a listagem do dashboard carrega.
5. Faça uma chamada autenticada de leitura de projetos e confira o resultado em `/api/v1/projects?page=0&size=100`.
6. Encerre ou desconecte o backend e repita uma chamada. O frontend deve exibir a mensagem de conexão, sem apresentar dados simulados.

## Mock de desenvolvimento

1. Copie `.env.example` para `.env.local`, use `VITE_API_MOCKS=true` e reinicie o Vite.
2. Com o backend parado, entre com `demo@taskcat.local` / `taskcat123`.
3. Confirme que o dashboard mostra o projeto `Projeto de demonstração`.
4. Teste credenciais incorretas. O mock deve responder como erro `401`, sem iniciar uma sessão.
5. Confirme que o cadastro, a listagem, os detalhes e os membros usam os mesmos serviços do modo real.
6. Defina `VITE_API_MOCKS=false` depois do teste para voltar a usar apenas o backend.

## Diagnóstico

`ApiError.code` diferencia `NETWORK_ERROR`, `HTTP_ERROR` e `INVALID_RESPONSE`; erros HTTP também carregam `status`. Ao investigar uma falha, confira no painel Network do navegador se o pedido chegou ao proxy `/api` e, em seguida, ao backend. A opção de mock só substitui falhas de conexão e respostas `404` ou `501` em desenvolvimento.
