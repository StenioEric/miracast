# MiraCast

Aplicação web gamificada para o ensino de estereoquímica. A expedição reúne atividades de orientação espacial, quiralidade e atividade óptica.

## Executar

Use Node.js 24. No diretório do projeto:

```sh
npm ci
npm run dev
```

Abra a URL exibida pelo Vite. O fluxo do professor usa o projeto Supabase que possui as tabelas `profiles` e `turmas`.

## Configurar o acesso

1. Copie `.env.example` para `.env.local` e preencha a URL do projeto e a chave `sb_publishable_...`. Reinicie o Vite após alterar essas variáveis.
2. No Supabase, verifique se o cadastro com e-mail e senha está habilitado. Mantenha configurado o envio de e-mails de confirmação e recuperação. Em `.env.local`, use `VITE_PASSWORD_MIN_LENGTH` e `VITE_PASSWORD_REQUIRED_GROUPS` com as mesmas regras do Authentication. O formulário usa oito caracteres como mínimo padrão. O segundo valor aceita uma lista separada por vírgulas com `lower`, `upper`, `digit` e `symbol`, conforme os grupos exigidos.
3. Em **Authentication → URL Configuration**, configure a **Site URL** do MiraCast e permita duas URLs de redirecionamento para cada ambiente. Para o Vite em `http://localhost:5173`, use:
   - `http://localhost:5173/?auth=confirmacao`
   - `http://localhost:5173/?auth=recuperacao`

O projeto fornecido já cria o perfil de professor no cadastro por e-mail. As políticas da tabela `turmas` limitam a leitura, a criação e a edição ao professor proprietário. A aplicação envia apenas o nome ao criar ou renomear uma turma. O banco atribui o proprietário e gera o código.

A [migração de demonstração](supabase/migrations/20261122000000_professor_access.sql) atende ao esquema anterior `miracast_rooms`. Ela serve às bases de teste e de demonstração que usam esse esquema. Para o projeto com `profiles` e `turmas`, use as políticas já aplicadas.

## Testar o fluxo do professor

1. Escolha **Entrar como Professor** e **Criar conta**. Informe seu e-mail e uma senha conforme os requisitos exibidos. Se a confirmação estiver ativa, abra o link no mesmo navegador em que solicitou o cadastro. O link pode abrir em outra aba.
2. Entre, crie uma turma, renomeie-a e recarregue a página. A sessão e a turma devem aparecer novamente.
3. Saia e entre com outra conta de professor. Confira que o painel contém apenas as turmas dessa conta.
4. Em **Esqueci minha senha**, solicite o link e abra-o no mesmo navegador. Salve a nova senha e entre novamente.

## Entrada dos alunos por código

A [migração de expedições por turma](supabase/migrations/20261123025101_vincula_alunos_as_turmas.sql) acrescenta o estado de início e o registro de participações e respostas vinculados a `turmas.id`. Em seguida, aplique a [migração de histórico](supabase/migrations/20261125232124_expedition_history.sql) e a [migração de encerramento e exclusão](supabase/migrations/20261125232148_fecha_e_exclui_expedicoes.sql) no projeto que atende à aplicação web. O projeto deve permitir **Anonymous Users** em **Authentication → Sign In / Providers**. Assim o Supabase cria uma sessão para o aluno, que informa apenas nome e código. [Sessões anônimas do Supabase](https://supabase.com/docs/guides/auth/auth-anonymous)

1. O professor abre uma turma e compartilha o código de dez caracteres ou o link de convite, que preenche o código para o aluno.
2. Cada aluno informa o nome e o código e aguarda na sala de espera.
3. O professor seleciona **Iniciar expedição**. A sala de espera e a lista de alunos são atualizadas automaticamente.
4. À medida que o aluno avança, o professor vê as etapas, as respostas e os itens com mais erros em **Alunos e progresso**. Em **Encerrar expedição**, grave os resultados no histórico. A turma volta à sala de espera para uma nova aplicação.

O código permite entrar na expedição. O aluno recebe só sua participação, o estado da turma e a contagem de inscritos. Ao recarregar a mesma aba, a sessão e o rascunho continuam disponíveis. O acesso do professor aos resultados segue a propriedade da turma no banco. Os códigos de seis caracteres e as participações do esquema anterior continuam funcionando onde o serviço antigo está instalado. A associação de dados históricos a turmas exige uma correspondência confirmada entre os registros.

## Organização

- `src/pages/` contém as telas. Cada página tem uma pasta com os arquivos TSX e CSS de mesmo nome. Os frames `2003:865` e `2003:1089` aparecem como estados internos da montagem e da sobreposição.
- `src/navigation/ActivityRoutes.tsx` associa os IDs das 18 atividades às páginas. `src/domain/expedition.ts` define a ordem de avanço e o cálculo da pontuação.
- `src/components/` contém os layouts compartilhados, campos de resposta e modelos moleculares. As respostas abertas podem ser lidas pelo professor e ficam fora da pontuação automática.
- `src/services/teacherAuth.ts` integra o cadastro, a sessão e a recuperação de senha. `src/services/teacherClasses.ts` consulta e atualiza `turmas`.
- `src/services/expeditionAccess.ts` integra o ingresso e o avanço dos alunos ao Supabase. `src/services/rooms.ts` preserva as sessões locais existentes.

## Verificar

```sh
npm run lint
npm run build
node --test --test-isolation=none tests/*.test.mjs
```

O build inclui a checagem de tipos. Os testes cobrem a sequência de frames, validação de sala, participantes homônimos, bloqueio antes do início, retomada dos registros, rejeição de avanços fora de ordem e cálculo da pontuação. Eles também verificam o feedback de cada alternativa, os estados iniciais dos botões e a estrutura dos componentes compartilhados.

Para executar a jornada do professor e do aluno no navegador, instale o Chromium uma vez com `npx playwright-core install chromium` e rode `npm run test:browser`. Também é possível definir `MIRACAST_CHROMIUM` com o caminho de um Chrome já instalado. O teste simula o Supabase, incluindo falhas de leitura e envio, e roda com dados fictícios.

O [teste de histórico](supabase/tests/expedition_history.sql) verifica o encerramento das expedições e o isolamento dos resultados entre professores. O [teste da expedição por turma](supabase/tests/class_expeditions.sql) verifica a entrada por código, o bloqueio antes do início, o avanço e o isolamento entre turmas em uma base de teste. Para o esquema anterior, o [teste de isolamento](supabase/tests/professor_access.sql) executa as políticas para duas contas de professor, dois alunos e uma conta sem autorização. Execute o SQL em uma base de teste com a migração aplicada. Os registros criados pelo teste são revertidos ao final.

## Pendências

- **Figma.** Os IDs foram preservados no código. A comparação visual precisa da URL do arquivo Figma Design, além dos IDs. A versão funcional da entrada parte do frame `7:101` e inclui código e nome. A comparação com o frame `15:33` e a confirmação dos enunciados originais continuam pendentes.
- **Realidade aumentada.** Na Tela 19 (frame `2003:264`), o aluno pode girar um modelo interativo no navegador e comparar os enantiômeros. A experiência com a câmera ainda está pendente.
- **Resultados acadêmicos.** Relatórios de pesquisa e diploma requerem definição do conteúdo e dos critérios de emissão.

Os conceitos usados nas verificações se baseiam no IUPAC Gold Book. [Quiralidade](https://goldbook.iupac.org/terms/view/C01058) · [Centro de quiralidade](https://goldbook.iupac.org/terms/view/C01060) · [Enantiômero](https://goldbook.iupac.org/terms/view/E02069) · [Atividade óptica](https://goldbook.iupac.org/terms/view/O04303)
