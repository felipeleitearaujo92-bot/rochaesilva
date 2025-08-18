# Confeitaria — v4 (Sobre + Depoimentos + rodapé)

## Onde editar
- Contatos/WhatsApp/horário: `assets/site-config.json`
- Preços/itens: `assets/pricing.json`
- Depoimentos: `assets/testimonials.json`
- Textos e imagem do Sobre: `empresa.html` e `assets/imagens/sobre.jpg`
- Fotos dos kits: troque os JPG em `assets/imagens/` (mantenha o nome dos arquivos).

## Publicar no Netlify (recomendado)
### Jeito rápido (Netlify Drop)
1) Acesse `app.netlify.com/drop`
2) Arraste a **pasta** `confeitaria-v4/` para a página
3) Pronto! Ele te dá uma URL.
> Para atualizar, arraste a pasta novamente.

### Jeito via GitHub (atualizações automáticas)
1) Crie um repositório e suba os arquivos da pasta `confeitaria-v4/`.
2) No Netlify: **Add new site → Import from Git**.
3) **Build command:** (vazio). **Publish directory:** `/` (raiz).
4) Deploy.
> Depois é só dar *commit/push* a cada mudança.

## Publicar no Vercel
1) Importe o repositório.
2) **Framework preset:** Other
3) **Build command:** (vazio) — **Output directory:** `/`
4) Deploy.

## Testar localmente
Abra `index.html` no navegador. O carrinho utiliza `localStorage` (funciona offline).
