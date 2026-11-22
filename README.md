# MiraCast

Aplicação web gamificada para o ensino de estereoquímica. A expedição reúne atividades de orientação espacial, quiralidade e atividade óptica.

## Executar

Use Node.js 24. No diretório do projeto:

```sh
npm ci
npm run dev
```

Abra a URL exibida pelo Vite. Configure o Supabase para criar salas e participar de novas expedições.

## Configurar o acesso

1. Copie `.env.example` para `.env.local` e preencha a URL e a chave publicável do projeto Supabase. Reinicie o Vite após alterar essas variáveis.
2. Aplique [a migração de acesso](supabase/migrations/20261122000000_professor_access.sql) pelo SQL Editor ou pelo fluxo de migrações do Supabase.
3. Em Authentication, habilite os provedores de e-mail e de [sessão anônima](https://supabase.com/docs/guides/auth/auth-anonymous). A sessão anônima permite aos alunos entrar com código e nome.
4. Crie a conta do professor em Authentication e libere seu acesso no SQL Editor usando o e-mail cadastrado:

   ```sql
   insert into public.miracast_teachers (id)
   select id from auth.users where email = 'professor@escola.edu.br'
   on conflict do nothing;
   ```

Cada sala gerada recebe a conta do professor como proprietária. As permissões do banco restringem consultas e atualizações às salas dessa conta e aos alunos vinculados a elas. Os alunos recebem apenas sua própria participação, os dados da sala e a contagem de inscritos.

## Demonstrar os fluxos

1. Na primeira aba, entre como professor, crie uma sala e anote o código. Abra o detalhe da sala.
2. Em outra aba ou dispositivo, entre como aluno, informe o código e use um nome de teste. O nome deve aparecer no detalhe da sala.
3. Na aba do professor, inicie a expedição. Na aba do aluno, a sala de espera dá lugar à motivação.
4. Siga pelo protocolo, classificação e pelas atividades até **Mestre do Quiral**. Recarregue a aba após avançar uma etapa para conferir a retomada. No painel, abra **Respostas registradas** para acompanhar o progresso.

Salas, participantes e respostas de novas expedições ficam no Supabase. A sessão fica na aba e é retomada ao recarregar. As salas da demonstração antiga permanecem no navegador, onde sessões de alunos já abertas ainda podem ser retomadas. Como essas salas foram criadas sem proprietário, a criação de turmas no Supabase começa com as novas contas.

## Organização

- `src/pages/` contém as telas. Cada página tem uma pasta com os arquivos TSX e CSS de mesmo nome. Os frames `2003:865` e `2003:1089` aparecem como estados internos da montagem e da sobreposição.
- `src/navigation/ActivityRoutes.tsx` associa os IDs das 18 atividades às páginas. `src/domain/expedition.ts` define a ordem de avanço e o cálculo da pontuação.
- `src/components/` contém os layouts compartilhados, campos de resposta e modelos moleculares. As respostas abertas podem ser lidas pelo professor e ficam fora da pontuação automática.
- `src/services/expeditionAccess.ts` integra o login e as novas expedições ao Supabase. `src/services/rooms.ts` preserva a leitura e o avanço das sessões locais existentes.

## Verificar

```sh
npm run lint
npm run build
node --test --test-isolation=none tests/*.test.mjs
```

O build inclui a checagem de tipos. Os testes cobrem a sequência de frames, validação de sala, participantes homônimos, bloqueio antes do início, retomada dos registros, rejeição de avanços fora de ordem e cálculo da pontuação. Eles também verificam o feedback de cada alternativa, os estados iniciais dos botões e a estrutura dos componentes compartilhados.

O [teste de isolamento](supabase/tests/professor_access.sql) executa as políticas para duas contas de professor, dois alunos e uma conta sem autorização. Execute o SQL em uma base de teste com a migração aplicada. Os registros criados pelo teste são revertidos ao final.

## Pendências

- **Figma.** Os IDs foram preservados no código. A comparação visual precisa da URL do arquivo Figma Design, além dos IDs. A versão funcional da entrada parte do frame `7:101` e inclui código e nome. A comparação com o frame `15:33` e a confirmação dos enunciados originais continuam pendentes.
- **Realidade aumentada.** Na Tela 19 (frame `2003:264`), o botão de RA está desabilitado e a questão sobre a sobreposição dos enantiômeros está disponível. A experiência em RA ou 3D será aberta em uma nova aba quando estiver implementada.
- **Resultados acadêmicos.** Relatórios de pesquisa e diploma requerem definição do conteúdo e dos critérios de emissão.

Os conceitos usados nas verificações se baseiam no IUPAC Gold Book. [Quiralidade](https://goldbook.iupac.org/terms/view/C01058) · [Centro de quiralidade](https://goldbook.iupac.org/terms/view/C01060) · [Enantiômero](https://goldbook.iupac.org/terms/view/E02069) · [Atividade óptica](https://goldbook.iupac.org/terms/view/O04303)
