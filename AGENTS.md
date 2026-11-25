# AGENTS.md — MiraCast

## 1. Contexto do projeto

O MiraCast é uma aplicação web gamificada com Realidade Aumentada para o ensino de Estereoquímica, desenvolvida como Trabalho de Conclusão de Curso de Sistemas de Informação.

O projeto deve priorizar simplicidade, qualidade de código, organização, manutenibilidade, usabilidade e consistência visual.

## 2. Organização e arquitetura

- Respeite a arquitetura existente do projeto.
- Mantenha a organização das telas na pasta `pages`, com uma pasta individual para cada tela, contendo seu arquivo TSX e CSS.
- Utilize componentes reutilizáveis para elementos compartilhados.
- Evite duplicação de código.
- Utilize nomes claros e descritivos para funções, variáveis, componentes, arquivos e classes CSS.
- Evite complexidade desnecessária.
- Não adicione dependências sem necessidade.
- Não altere a arquitetura do projeto sem autorização.
- Priorize soluções simples, legíveis e de fácil manutenção.

## 3. Padronização visual

Todas as telas devem compartilhar a mesma identidade visual.

Padronize:

- Fontes e tamanhos de texto.
- Cores.
- Espaçamentos e margens.
- Cabeçalhos e rodapés.
- Botões.
- Cards.
- Indicadores de progresso.
- Campos de formulário.
- Mensagens de erro e sucesso.
- Responsividade.
- Componentes de navegação.

Sempre que possível, utilize componentes compartilhados e estilos centralizados, evitando implementações diferentes para elementos visualmente equivalentes.

## 4. Fidelidade aos protótipos

- Utilize os protótipos do Figma como referência visual e funcional.
- Preserve os textos, perguntas, alternativas e imagens fornecidos.
- Não invente ou modifique conteúdos pedagógicos sem autorização.
- Adapte as telas para diferentes resoluções.
- Garanta o funcionamento correto da rolagem.
- Preserve a sequência dos fluxos educacionais.
- Garanta que respostas incorretas apresentem feedback explicativo, indicando o conceito correto.
- Não modifique a lógica pedagógica sem autorização.

## 5. Qualidade do código

- Priorize código limpo, simples e legível.
- Elimine duplicações desnecessárias.
- Evite arquivos, funções e componentes excessivamente grandes.
- Remova imports e variáveis não utilizados.
- Utilize tipagem adequada no TypeScript.
- Evite o uso desnecessário de `any`.
- Preserve funcionalidades existentes.
- Não realize refatorações fora do escopo da tarefa sem autorização.
- Adicione comentários apenas quando forem realmente úteis.

## 6. Versionamento e organização dos commits

Sempre que realizar commits, siga obrigatoriamente as boas práticas de Git e Conventional Commits.

### Regras obrigatórias

- Utilize commits atômicos.
- Nunca agrupe alterações sem relação direta em um único commit.
- Distribua as alterações de acordo com suas responsabilidades.
- Analise `git status`, `git diff` e o conteúdo da área de staging antes dos commits.
- Selecione individualmente os arquivos ou trechos relacionados a cada commit.
- Evite utilizar `git add .` indiscriminadamente.
- Respeite a ordem lógica e as dependências entre as alterações.
- Mantenha, sempre que possível, o projeto funcional em cada commit.
- Não crie commits artificiais apenas para aumentar a quantidade de registros.
- Não inclua arquivos temporários, credenciais ou informações sensíveis.

### Padrão das mensagens

Utilize a estrutura:

`tipo(escopo opcional): descrição objetiva em português`

Tipos permitidos:

- `feat`: nova funcionalidade.
- `fix`: correção de comportamento ou bug.
- `refactor`: reorganização ou melhoria estrutural do código.
- `style`: alterações de formatação que não modificam o comportamento.
- `docs`: alterações na documentação.
- `test`: criação ou alteração de testes.
- `chore`: tarefas de manutenção e configuração.
- `perf`: melhorias de desempenho.
- `build`: alterações relacionadas ao processo de compilação.
- `ci`: alterações relacionadas à integração contínua.

### Exemplos

- `feat(auth): implementa autenticação de professores`
- `feat(turmas): adiciona criação de turmas`
- `feat(estudante): implementa feedback das respostas`
- `fix(navegacao): corrige sequência das telas`
- `fix(interface): corrige responsividade mobile`
- `refactor(componentes): reutiliza cabeçalhos e rodapés`
- `refactor(estilos): centraliza tipografia e espaçamentos`
- `chore(deps): atualiza dependências do projeto`
- `docs: atualiza instruções de execução`

Não utilize mensagens genéricas como "Atualizações", "Correções gerais", "Update" ou "Melhorias".

## 7. Segurança e GitHub

- Verifique a branch atual antes de iniciar alterações.
- Preserve alterações locais realizadas pelo usuário.
- Não descarte alterações sem autorização.
- Não execute `git reset --hard`.
- Não execute `git push --force`.
- Não reescreva o histórico de commits existentes.
- Não realize merge entre branches sem autorização.
- Não altere a branch de trabalho sem autorização.
- Não versione arquivos `.env`, tokens, senhas ou credenciais.
- Realize commits e push quando solicitado ou expressamente autorizado.
- Envie as alterações somente para a branch autorizada.

É permitido realizar um único push contendo vários commits devidamente organizados.

## 8. Validação das alterações

Antes de considerar uma implementação concluída, execute as verificações disponíveis e pertinentes ao escopo da tarefa:

- Build.
- Lint.
- Verificação de TypeScript.
- Testes automatizados.
- Revisão das alterações realizadas.
- Verificação de possíveis regressões.

Corrija os problemas causados pela implementação. Informe separadamente os problemas preexistentes encontrados.

Não ignore erros nem desative validações apenas para conseguir finalizar uma tarefa.

## 9. Relatório de conclusão

Ao finalizar uma tarefa, informe:

- Alterações realizadas.
- Arquivos criados, modificados ou removidos.
- Componentes reutilizados ou criados.
- Validações executadas e respectivos resultados.
- Branch utilizada.
- Commits realizados, quando autorizados.
- Status do envio ao GitHub, quando autorizado.
- Pendências e possíveis problemas identificados.

## 10. Princípios gerais

Priorize sempre:

- Simplicidade.
- Organização.
- Padronização.
- Reutilização.
- Segurança.
- Manutenibilidade.
- Fidelidade aos protótipos.
- Qualidade do código.
- Preservação das funcionalidades existentes.

O objetivo não é apenas entregar um sistema funcional, mas manter uma aplicação organizada, profissional e compreensível para futuras manutenções.