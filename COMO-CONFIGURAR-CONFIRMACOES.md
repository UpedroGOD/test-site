# Como receber as confirmacoes

Seu site agora ja esta pronto para enviar os nomes para um Google Form.

## O jeito mais simples

1. Crie um Google Form com uma pergunta curta:
   `Nome`

2. No Google Form, abra a aba de respostas e conecte a um Google Sheets.
   Essa planilha sera a sua lista de nomes confirmados.

3. Descubra a URL de envio do formulario:
   - abra o formulario
   - a URL geralmente termina com `/viewform`
   - troque `/viewform` por `/formResponse`

   Exemplo:
   `https://docs.google.com/forms/d/e/SEU_ID/viewform`

   vira:
   `https://docs.google.com/forms/d/e/SEU_ID/formResponse`

4. Descubra o campo do nome:
   - no Google Form, clique em `Mais` e depois em `Receber link pre-preenchido`
   - digite um nome de teste e gere o link
   - nesse link vai aparecer algo como:
     `entry.123456789=Pedro`
   - copie so a parte:
     `entry.123456789`

5. Abra o arquivo [config.js](C:/Users/Pedro/OneDrive/Documentos/cha%20de%20bebe/config.js) e preencha:

```js
window.INVITE_CONFIG = {
  confirmationFormAction: "COLE_AQUI_A_URL_formResponse",
  confirmationNameField: "entry.123456789",
  confirmationSuccessMessage:
    "Sua presenca foi enviada com sucesso. Obrigado por confirmar."
};
```

## Onde voce vai ver os nomes

Voce vai ver tudo no Google Sheets conectado ao formulario.

Cada vez que alguem confirmar:
- o nome vai para a planilha
- o Google tambem registra a data e a hora

## Enquanto nao configurar

Se o `config.js` ficar vazio, o site ainda salva a confirmacao so no navegador local.
Mas isso nao junta os nomes de todo mundo.
