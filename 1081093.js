/* Cacife — troca provisória do telefone de contato no site (30/09/2026).
   O número antigo (11) 91539-0708 saiu do ar; o novo é (11) 91518-5328.
   Remover este script quando o telefone for trocado no painel da Nuvemshop
   (Configurações → Informações de contato). */
(function () {
    var OLD_DIG = '11915390708', NEW_DIG = '11915185328';
    var NEW_TXT = '(11) 91518-5328';
    // (11) 91539-0708 · 11 91539-0708 · 11915390708 · +55 11 91539-0708 ...
    var reTxt = /(\+?55\s*)?\(?\s*11\s*\)?\s*9?\s*1539[\s.-]*0708/g;

    function trocaHref(a) {
        var h = a.getAttribute('href') || '';
        if (h.replace(/\D/g, '').indexOf(OLD_DIG) === -1) return;
        if (/^tel:/i.test(h)) { a.setAttribute('href', 'tel:+55' + NEW_DIG); return; }
        a.setAttribute('href', h.replace(/(\d[\d\s().+-]*)/g, function (m) {
            var d = m.replace(/\D/g, '');
            if (d.indexOf(OLD_DIG) === -1) return m;
            return d.replace(OLD_DIG, NEW_DIG);
        }));
    }
    function trocaTexto(root) {
        var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, lista = [];
        while ((n = w.nextNode())) if (reTxt.test(n.nodeValue)) lista.push(n);
        lista.forEach(function (t) { reTxt.lastIndex = 0; t.nodeValue = t.nodeValue.replace(reTxt, NEW_TXT); });
        reTxt.lastIndex = 0;
    }
    function roda(root) {
        try {
            (root.querySelectorAll ? root : document).querySelectorAll('a[href]').forEach(trocaHref);
            trocaTexto(root.nodeType === 1 || root.nodeType === 9 ? root : document.body);
        } catch (e) {}
    }
    function inicia() {
        roda(document.body);
        new MutationObserver(function (ms) {
            ms.forEach(function (m) { m.addedNodes.forEach(function (x) { if (x.nodeType === 1) roda(x); }); });
        }).observe(document.body, { childList: true, subtree: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();
