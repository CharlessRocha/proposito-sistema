# Sistema Comercial — Colégio Propósito

## Arquivos

| Arquivo | Módulo | Senha padrão |
|---|---|---|
| index.html | Menu de acesso | — |
| gerente.html | Painel do Gerente | gerente2027 |
| cdr.html | CDR / Inside Sales | cdr2027 |
| closer.html | Closer | closer2027 |
| entrevistas.html | Gestão de Entrevistas | entre2027 |
| playbook.html | Playbook do Seletivo | play2027 |
| matriculador.html | Guia do Matriculador | matric2027 |

## Como hospedar no GitHub Pages

1. Acesse github.com e crie uma conta (ou faça login)
2. Clique em "New repository"
3. Nome: `proposito-sistema`
4. Marque como **Private** (privado)
5. Clique em "Create repository"
6. Arraste TODOS os arquivos desta pasta para a tela do GitHub
7. Clique em "Commit changes"
8. Vá em Settings → Pages → Source: "Deploy from branch" → Branch: main
9. Aguarde 2 minutos — o site estará no ar em:
   `https://SEU-USUARIO.github.io/proposito-sistema/`

## Como atualizar um módulo

1. Receba o arquivo atualizado do Claude
2. Acesse github.com/SEU-USUARIO/proposito-sistema
3. Clique no arquivo que deseja atualizar
4. Clique no ícone de lápis (Edit)
5. Cole o novo conteúdo
6. Clique em "Commit changes"
7. Pronto — o sistema atualiza em menos de 1 minuto

## Como trocar as senhas

Abra o arquivo `index.html` no GitHub, localize o trecho:

```js
const SENHAS = {
  gerente:      'gerente2027',
  cdr:          'cdr2027',
  ...
};
```

Altere os valores e salve. Todos os módulos usam essas senhas.

## Segurança

- Repositório privado: só você vê os arquivos
- Acesso por senha por módulo: cada equipe vê só o seu
- Dados sensíveis ficam no navegador local de cada usuário
- Nenhum dado trafega para servidores externos
