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
4. À medida que o aluno avança, o professor vê as etapas, as respostas e os itens com mais erros em **Alunos e progresso**. Em **Encerrar expedição**, o código da turma fica fechado para novos ingressos e envios. Os resultados ficam em **Expedições anteriores**.
5. Para repetir a atividade, use **Criar nova turma** e compartilhe o novo código.
6. Em **Expedições anteriores**, selecione uma expedição e use **Excluir expedição**. Após confirmar, a expedição, as participações e as respostas dela são excluídas do banco. A turma permanece encerrada com seu código desativado.

O código de dez caracteres permite entrar na expedição. O aluno recebe só sua participação, o estado da turma e a contagem de inscritos. Ao recarregar a mesma aba, a sessão e o rascunho continuam disponíveis. O acesso do professor aos resultados segue a propriedade da turma no banco. O modo de expedição que salvava salas e progresso apenas no navegador foi descontinuado. A associação de dados históricos a turmas exige uma correspondência confirmada entre os registros.

## Organização

- `src/pages/` contém as telas. Cada página tem uma pasta com os arquivos TSX e CSS de mesmo nome. Os frames `2003:865` e `2003:1089` aparecem como estados internos da montagem e da sobreposição.
- `src/navigation/ActivityRoutes.tsx` associa os IDs das 18 atividades às páginas. `src/domain/expedition.ts` define a ordem de avanço e o cálculo da pontuação.
- `src/components/` contém os layouts compartilhados, campos de resposta e modelos moleculares. As respostas abertas podem ser lidas pelo professor e ficam fora da pontuação automática.
- `src/services/teacherAuth.ts` integra o cadastro, a sessão e a recuperação de senha. `src/services/teacherClasses.ts` consulta e atualiza `turmas`.
- `src/services/expeditionAccess.ts` integra o ingresso e o avanço dos alunos ao Supabase.

## Visualização molecular 3D

- Em **Tente sobrepor**, selecione uma alternativa e clique em **Abrir visualização molecular 3D**. Arraste a molécula, ajuste o zoom e use **Comparar enantiômeros**. Em **Tentar sobrepor**, os carbonos centrais ficam alinhados e a imagem espelhada aparece translúcida. **Separar moléculas** retorna à comparação lado a lado. Feche com **Voltar à atividade**, Esc ou o botão Voltar do navegador e confirme que a alternativa continua selecionada antes de verificar a resposta.
- Na atividade **Compare as duas formas do cristal** (frame `2003:264`), selecione uma alternativa e clique em **Explorar o cristal em 3D** abaixo do modelo esquemático. Compare as estruturas lado a lado, volte ao modelo individual e use **Restaurar posição** para recuperar o ângulo e o zoom iniciais. Ao voltar à atividade, confira a alternativa selecionada e o ajuste do modelo esquemático.
- Arraste com o mouse ou um dedo para girar. Pelo teclado, coloque o modelo em foco e use as setas. Ajuste o zoom com a roda do mouse, o gesto de pinça ou o controle deslizante. A comparação usa a mesma escala nos dois lados e mantém a imagem espelhada fixa. O enunciado de **Tente sobrepor** descreve o giro do espelho. Girar o original produz a rotação relativa equivalente para testar a sobreposição.

### Modelo e manutenção

O modelo representa uma molécula de bromoclorofluorometano (CHClBrF), a mesma usada nas duas atividades. O carbono está ligado a H, Cl, Br e F. Os dados locais usam a geometria tetraédrica didática do modelo esquemático do MiraCast, com ângulos ideais de aproximadamente 109,47°, comprimentos normalizados e raios gráficos para facilitar a leitura. A legenda e os símbolos das esferas usam a paleta do material existente. [PubChem, CID 79058](https://pubchem.ncbi.nlm.nih.gov/compound/79058)

`src/utils/moleculeGeometry.ts` reúne os átomos, as ligações e o centro de referência. A imagem espelhada reflete as coordenadas em relação ao plano perpendicular a X que passa pelo centro. A reflexão mantém a conectividade e as distâncias e inverte a configuração espacial. Para adicionar um modelo, informe nome, fórmula, centro, elementos, coordenadas e pares de índices das ligações. Indique a quiralidade com base na estrutura para que o botão use o termo adequado. O modo de sobreposição usa o centro fornecido pelo modelo.

`MoleculeViewerButton` abre um diálogo em tela cheia e carrega `MoleculeViewer` sob demanda. O diálogo mantém a atividade montada. Uma entrada no histórico da aba permite usar Voltar dentro do mesmo endereço. Abrir ou fechar o diálogo preserva a seleção, o feedback e o progresso da expedição.

`moleculeScene.ts` usa Three.js diretamente para desenhar esferas, cilindros e símbolos com câmera ortográfica. O componente aplica rotações por quaternions ao grupo inteiro. A cena atualiza em resposta a interações e redimensionamentos e libera o contexto gráfico e os demais recursos ao fechar. A renderização e os controles são executados no navegador com os dados incluídos no projeto. [Documentação do WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer)

A renderização requer WebGL 2. Em caso de indisponibilidade, o botão de retorno permanece acessível. A validação em Chromium e WebKit no Linux inclui larguras de 320, 393, 768 e 1280 px. O teste de navegador abaixo percorre as duas atividades, simula o gesto de pinça no Chromium e verifica o retorno com WebGL 2 indisponível.

## Verificar

```sh
npm run lint
npm run build
node --test --test-isolation=none tests/*.test.mjs
```

O build inclui a checagem de tipos. Os testes automatizados cobrem a sequência de atividades, o cálculo da pontuação, o feedback das alternativas, os estados iniciais dos botões e a estrutura dos componentes compartilhados.

Para executar a jornada do professor e do aluno no navegador, instale o Chromium uma vez com `npx playwright-core install chromium` e rode `npm run test:browser`. Também é possível definir `MIRACAST_CHROMIUM` com o caminho de um Chrome já instalado. O teste simula o Supabase, incluindo falhas de leitura e envio, e roda com dados fictícios.

O [teste de histórico](supabase/tests/expedition_history.sql) verifica o encerramento, a exclusão dos resultados e o isolamento entre professores. O [teste da expedição por turma](supabase/tests/class_expeditions.sql) verifica a entrada por código, o bloqueio antes do início, o avanço e o isolamento entre turmas em uma base de teste. Para o esquema anterior, o [teste de isolamento](supabase/tests/professor_access.sql) executa as políticas para duas contas de professor, dois alunos e uma conta sem autorização. Execute o SQL em uma base de teste com as migrações aplicadas. Os registros criados pelo teste são revertidos ao final.

## Pendências

- **Figma.** Os IDs foram preservados no código. A comparação visual precisa da URL do arquivo Figma Design, além dos IDs. A versão funcional da entrada parte do frame `7:101` e inclui código e nome. A comparação com o frame `15:33` e a confirmação dos enunciados originais continuam pendentes.
- **Resultados acadêmicos.** Relatórios de pesquisa e diploma requerem definição do conteúdo e dos critérios de emissão.

Os conceitos usados nas verificações se baseiam no IUPAC Gold Book. [Quiralidade](https://goldbook.iupac.org/terms/view/C01058) · [Centro de quiralidade](https://goldbook.iupac.org/terms/view/C01060) · [Enantiômero](https://goldbook.iupac.org/terms/view/E02069) · [Atividade óptica](https://goldbook.iupac.org/terms/view/O04303)
