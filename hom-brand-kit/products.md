# Catálogo de Produtos — The House of Mouth

> **Fonte primária:** https://thehouseofmouth.com.au  
> **Atualizar este arquivo** sempre que um produto novo entrar no site ou uma
> promoção relevante for lançada. O workflow 02 carrega este arquivo a cada
> geração — mudou aqui, mudou no conteúdo.

---

## Sobre a marca

**The House of Mouth** é uma loja online especializada em saúde bucal para o
mercado australiano. Posicionamento: "Australia's #1 Oral Care Superstore".

- **Frete grátis** em pedidos acima de AUD $99
- **Entrega** para todo o território australiano
- **Público-alvo:** adultos 25–45 anos preocupados com estética e saúde bucal
- **Diferencial:** seleção curada de produtos de qualidade profissional
  acessíveis para uso doméstico

---

## Categorias principais

### 1. Clareamento Dental (Teeth Whitening)
URL: https://thehouseofmouth.com.au/collections/teeth-whitening

Produtos de clareamento para uso doméstico — kits, tiras, géis e pós.
Principal categoria da loja em termos de volume de buscas e engajamento.

**Ângulos de conteúdo:**
- Resultados visíveis sem visita ao dentista
- Segurança para uso diário
- Comparação custo/benefício vs clínica
- "Before & after" com clientes reais (respeitar guardrails — sem promessa)

---

### 2. Boca Seca (Dry Mouth)
URL: https://thehouseofmouth.com.au/collections/dry-mouth

Géis, sprays, pastilhas e enxaguantes para xerostomia. Nicho de alta
intenção de compra, pouco explorado nos concorrentes.

**Ângulos de conteúdo:**
- "Você acorda com a boca seca?" (hook de identificação)
- Causas comuns (medicamentos, respiração pela boca, sono)
- Alívio imediato vs solução de longo prazo
- Educação: seca não é só desconforto, afeta a saúde dos dentes

---

### 3. Mau Hálito (Bad Breath / Halitosis)
URL: https://thehouseofmouth.com.au/collections/bad-breath

Sprays, raspadores de língua, enxaguantes enzimáticos.

**Ângulos de conteúdo:**
- Abordagem sem julgamento: "todo mundo já teve"
- Causa real (bactérias na língua, não a comida)
- Diferença entre mascarar e tratar
- Produto como parte da rotina de higiene, não emergência

---

### 4. Higiene Oral Geral (Oral Hygiene)
URL: https://thehouseofmouth.com.au/collections/oral-hygiene

Escovas elétricas, fios, escovas interdentais, pastas especializadas.

**Ângulos de conteúdo:**
- Rotina completa de higiene (não só escovar)
- Técnica correta de escovação
- Produtos que dentistas recomendam

---

## Produtos destaque / high-ticket

> Atualizar com produtos específicos quando o acesso ao site for liberado.
> Por enquanto, usar as categorias como referência.

| Produto | Categoria | Preço estimado | CTA sugerido |
|---|---|---|---|
| Kit clareamento | Teeth Whitening | AUD $50–150 | "Ver kit completo" |
| Gel boca seca | Dry Mouth | AUD $20–40 | "Experimentar" |
| Raspador de língua | Bad Breath | AUD $15–30 | "Adicionar à rotina" |

---

## Links rastreáveis padrão

Os slugs abaixo são usados nos CTAs dos posts. O n8n compõe o link
`https://hom.link/<slug>` automaticamente a partir do campo `cta_link_slug`
no calendário editorial.

| Slug | Destino |
|---|---|
| `clareamento` | Coleção Teeth Whitening |
| `boca-seca` | Coleção Dry Mouth |
| `mal-halito` | Coleção Bad Breath |
| `higiene` | Coleção Oral Hygiene |
| `frete-gratis` | Página de promoção frete |
| `novidade` | Novidades do mês |

---

## Como o n8n usa este arquivo

O workflow 02 carrega este markdown e injeta como `{{products_md}}` no
system prompt do Gemini, junto com voice.md e audience.md. Isso permite que
o Gemini conheça os produtos reais antes de criar o copy.

**Importante:** não inclua preços exatos ou promoções com data sem atualizar
este arquivo antes. Copy desatualizado sobre preços cria frustração no cliente.
