# MiraCast

Aplicação web gamificada para o ensino de estereoquímica. A expedição reúne atividades de orientação espacial, quiralidade e atividade óptica. A versão atual permite demonstrar os fluxos de aluno e professor em abas do mesmo navegador.

## Executar

Use Node.js 24. No diretório do projeto:

```sh
npm ci
npm run dev
```

Abra a URL exibida pelo Vite.

## Demonstrar os fluxos

1. Na primeira aba, entre como professor, crie uma sala e anote o código. Abra o detalhe da sala.
2. Em outra aba do mesmo perfil do navegador, entre como aluno, informe o código e use um nome de teste. O nome deve aparecer no detalhe da sala.
3. Na aba do professor, inicie a expedição. Na aba do aluno, a sala de espera dá lugar à motivação.
4. Siga pelo protocolo, classificação e pelas atividades até **Mestre do Quiral**. Recarregue a aba após avançar uma etapa para conferir a retomada. No painel, abra **Respostas registradas** para acompanhar o progresso.

O código identifica uma sala armazenada na origem da aplicação. Salas, participantes e respostas confirmadas ao avançar ficam no `localStorage`. A identidade da sessão do aluno fica no `sessionStorage` da sua aba. A área do professor é de demonstração local, sem autenticação. Use nomes de teste em navegadores compartilhados.

## Organização

- `src/pages/` contém as telas. Cada página tem uma pasta com os arquivos TSX e CSS de mesmo nome. Os frames `2003:865` e `2003:1089` aparecem como estados internos da montagem e da sobreposição.
- `src/navigation/ActivityRoutes.tsx` associa os IDs das 18 atividades às páginas. `src/domain/expedition.ts` define a ordem de avanço e o cálculo da pontuação.
- `src/components/` contém os layouts compartilhados, campos de resposta e modelos moleculares. As respostas abertas podem ser lidas pelo professor e ficam fora da pontuação automática.
- `src/services/rooms.ts` reúne as operações de sala, registro de participantes, avanço e persistência. A interface usa essas operações para gravar os registros.

## Verificar

```sh
npm run lint
npm run build
node --test --test-isolation=none tests/*.test.mjs
```

O build inclui a checagem de tipos. Os testes cobrem a sequência de frames, validação de sala, participantes homônimos, bloqueio antes do início, retomada dos registros, rejeição de avanços fora de ordem e cálculo da pontuação.

## Pendências

- **Figma.** Os IDs foram preservados no código. A comparação visual precisa da URL do arquivo Figma Design, além dos IDs. A versão funcional da entrada parte do frame `7:101` e inclui código e nome. A comparação com o frame `15:33` e a confirmação dos enunciados originais continuam pendentes.
- **Realidade aumentada.** O frame `2003:264` oferece uma alternativa rotacionável na tela e identifica a indisponibilidade da câmera. A versão com RA precisa do modelo do cristal, da definição de como ele será posicionado no ambiente e de validação em dispositivos compatíveis.
- **Supabase.** Para compartilhar salas entre dispositivos, será necessário um projeto configurado, autenticação do professor, identidade de aluno, tabelas de salas, participantes e respostas, e políticas que limitem a leitura e escrita à sala e ao perfil corretos. O ingresso por código e a gravação do avanço devem ser validados no servidor. O início pode então ser propagado aos alunos pela atualização da sala. O frontend deve usar apenas as credenciais publicáveis do projeto.
- **Resultados acadêmicos.** Relatórios de pesquisa e diploma requerem definição do conteúdo e dos critérios de emissão.

Os conceitos usados nas verificações se baseiam no IUPAC Gold Book. [Quiralidade](https://goldbook.iupac.org/terms/view/C01058) · [Centro de quiralidade](https://goldbook.iupac.org/terms/view/C01060) · [Enantiômero](https://goldbook.iupac.org/terms/view/E02069) · [Atividade óptica](https://goldbook.iupac.org/terms/view/O04303)
