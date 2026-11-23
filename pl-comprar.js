/* Provou Levou — "Comprar" do resultado do provador = botão de comprar da página (23/11/2026, pedido do Lucas).
   Ao clicar em #q-btn-buy-now: registra o clique, fecha o provador e clica no botão nativo de comprar
   da loja, então a cliente vê exatamente o que veria clicando em comprar na página (sacola lateral,
   carrinho, escolha de tamanho/lente…). Se não achar o botão da página, não faz nada e o widget segue como antes.
   Desligar numa loja: window.PL_COMPRAR_NATIVO = false (antes do widget). */
(function () {
    if (window.__plComprarNativo) return; window.__plComprarNativo = 1;
    var SEL = [
        '.product-purchase__submit',                                                   // Mozaik (tema novo)
        '#product_form .js-addtocart', '.js-addtocart',                                // Nuvemshop
        'form[action*="/cart/add"] button[type=submit]', 'form[action*="/cart/add"] [name=add]', 'button[name=add]', 'product-form button[type=submit]', 'button[data-lz-atc]', // Shopify
        '#bt_comprar', '#button-buy', '.botao-comprar', '#bt-comprar', '.btn-comprar', // Tray / Bagy / Loja Integrada
        'button.single_add_to_cart_button',                                            // WooCommerce
        '.vtex-add-to-cart-button-0-x-buttonText', '.buy-button', '.buy-in-page-button', // VTEX
        '#form-add-cart .product-action-buy', '#product-buy', '.area-compra-btn button', '.quick-buy-action', // Dooca (Óculos em Foco, Lebloss) / Fbits / Magazord
        '#app-lentes-open', '#product_form .nube-button', '#product_form button.buy-lente', '.mw-trigger-button', '.q-btn-lentes-produto', // apps de lentes que viram o "Comprar" da página
        '[data-action="add-to-cart"]', '.btn-add-to-cart', '.add-to-cart', '#btn-comprar',
        '[class*="btnComprar"]', '[class*="add-cart"]', '[class*="addToCart"]', '[id*="addToCart"]'
    ];
    // Áreas que não são o produto principal (só olha os ANTEPASSADOS do botão, sem body/html:
    // temas Shopify põem "card-hover-effect-*" no <body>).
    var FORA = '#q-modal-ia,[class*="card"],[class*="related"],[class*="carousel"],[class*="swiper-container-relac"],[class*="slick"],[class*="shelf"],[class*="vitrine"],header,footer,[class*="quick-buy-bar"],[class*="sticky-buy"],[class*="mini-cart"],[class*="minicart"],[class*="drawer"]';
    function foraDoProduto(e) {
        for (var p = e.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
            if (p.matches && p.matches(FORA)) return true;
        }
        return false;
    }
    function botaoDaPagina() {
        if (window.PL_COMPRAR_SELETOR) { var x = document.querySelector(window.PL_COMPRAR_SELETOR); if (x) return x; }
        for (var i = 0; i < SEL.length; i++) {
            var els = document.querySelectorAll(SEL[i]);
            for (var j = 0; j < els.length; j++) {
                var e = els[j].closest('button,a,input');          // só botão/link/input (nunca a DIV em volta)
                if (!e || e.closest('#q-modal-ia') || e.id === 'q-btn-buy-now' || e.disabled) continue;
                if (foraDoProduto(e)) continue;
                if (e.offsetParent === null && getComputedStyle(e).position !== 'fixed') continue;
                return e;
            }
        }
        return null;
    }
    function fone() { var i = document.querySelector('#q-phone, #q-modal-ia input[type=tel]'); return (i && i.value) || ''; }
    function produto() { var h = document.querySelector('h1'); return ((h && h.innerText) || document.title || '').trim(); }
    document.addEventListener('click', function (ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest('#q-btn-buy-now') : null;
        if (!t || window.PL_COMPRAR_NATIVO === false) return;
        var nb = botaoDaPagina();
        if (!nb) return;                       // sem botão na página: o widget faz o que já fazia
        ev.preventDefault(); ev.stopImmediatePropagation();
        try {
            fetch('https://n8n.segredosdodrop.com/webhook/pl-provador-buy-click', { method: 'POST', keepalive: true,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: fone(), origin: location.origin, produto: produto() }) }).catch(function () {});
        } catch (e) {}
        var fechar = document.querySelector('#q-close-btn, #q-modal-ia .q-close-ia, #q-modal-ia .q-close');
        if (fechar) { try { fechar.click(); } catch (e) {} }
        var m = document.getElementById('q-modal-ia');
        if (m && getComputedStyle(m).display !== 'none') m.style.display = 'none';
        try { nb.scrollIntoView({ block: 'center' }); } catch (e) {}
        setTimeout(function () { try { nb.click(); } catch (e) {} }, 200);
    }, true);
})();
