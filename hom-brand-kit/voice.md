# Brand Voice — The House of Mouth

> Este arquivo é a fonte da verdade do tom da marca. Os workflows do n8n
> carregam ele a cada execução via `BRAND_KIT_RAW_BASE/voice.md`. Mudou aqui
> (via PR), mudou na esteira de conteúdo no próximo post.

## Posicionamento em uma frase

A House of Mouth é a clínica que trata o sorriso como parte da saúde e da
autoestima — sem julgar, sem prometer milagre, sem clínica fria.

## Pilares de tom

1. **Acolhedor sem ser bobo.** Conversa de gente que sabe do que fala, mas
   não usa jargão para impor distância.
2. **Técnico quando precisa, leigo no resto do tempo.** Se o termo é clínico,
   a próxima frase explica.
3. **Anti-vendedor agressivo.** Sem urgência fabricada, sem "últimas vagas",
   sem comparação com concorrente.
4. **Específico, não genérico.** "Avaliação de 30 minutos com a Dra. X" vence
   "agende sua consulta" toda vez.

## Vocabulário

**Usar:**
sorriso, autoestima, cuidado, avaliação, conversa, plano, acompanhamento,
no seu tempo, sem pressão, transparência, tira-dúvidas.

**Evitar:**
"transformação completa", "novo você", "antes e depois" (proibido por CFO),
"resultado garantido", "milagre", "incrível", "imperdível", "última chance",
"top de linha", "melhor do mercado", emoji em excesso, CAPSLOCK gritado.

## Estrutura padrão de legenda (Feed)

```
[Hook: 1ª linha curta, gera curiosidade ou identifica a dor]

[Desenvolvimento: 2-4 linhas explicando ou contando uma micro-história]

[Ponte para o serviço: 1-2 linhas conectando ao que a clínica faz]

[CTA suave: convite para conversar pelo WhatsApp + link]

[Linha em branco]

[Hashtags em bloco único no final]
```

## Estrutura padrão de roteiro (Reels/TikTok)

```
0-2s   HOOK visual + texto na tela. Sem logo no começo.
2-8s   Promessa do conteúdo ("nos próximos 20 segundos você vai entender...")
8-25s  Conteúdo de fato — preferir 1 ideia bem feita a 3 ideias mal feitas.
25-30s CTA: "Salva esse vídeo" ou "Agende uma conversa, link na bio."
```

## Exemplos de bom e ruim

**Ruim ❌**
> "🚨🚨 PROMOÇÃO IMPERDÍVEL DE CLAREAMENTO! 50% OFF SÓ HOJE! Corre lá! 🦷✨"

Por quê: urgência fabricada, claim regulado por CFO, emoji em excesso,
caps gritado, vendedor de ofertão.

**Bom ✅**
> Tem gente que evita sorrir em foto há tanto tempo que esqueceu o motivo.
>
> Geralmente é o tom dos dentes — e quase sempre é mais simples de resolver
> do que parece. Nas conversas iniciais aqui na clínica, a gente avalia se
> faz sentido pra você antes de falar de procedimento.
>
> Se quiser tirar dúvida, é só chamar no WhatsApp 👉 hom.link/conversa-clareamento

Por quê: hook empático, foco na pessoa antes do serviço, CTA suave, link
rastreável, sem promessa, sem regulado.

## Como o n8n usa este arquivo

O workflow 02 (Gerar Conteúdo) carrega este markdown inteiro e injeta dentro
do system prompt do Gemini, antes de pedir a copy. Por isso:

- Mantenha o arquivo conciso (não mais que ~6 KB).
- Atualize quando descobrir um padrão que funciona ou um que falha.
- Versione tudo via PR — a esteira segue o que está em `main`.
