/* Provou Levou — slider "antes e depois" na tela de resultado do provador.
   Arrasta a linha: esquerda = com o produto (resultado), direita = foto original do cliente.
   Funciona em qualquer widget que tenha #q-result-img-col > #q-final-view-img
   e envie a foto do cliente como 'person_image' no FormData. */
// Interruptor de manutenção (27/10/2026): com true, esconde o botão do provador em todas as lojas
// que carregam este script — usado quando o servidor de automação (n8n) sai do ar para manutenção.
(function () {
    var PL_MANUTENCAO = false;
    if (!PL_MANUTENCAO || window.__plManutencao) return;
    window.__plManutencao = true;
    var sel = '#q-open-ia,.q-btn-trigger-ia,.q-btn-inline-provador,#q-modal-ia';
    try { var st = document.createElement('style'); st.id = 'pl-manutencao-hide'; st.textContent = sel + '{display:none !important}'; (document.head || document.documentElement).appendChild(st); } catch (_) {}
})();
(function () {
    if (window.__plAntesDepois) return;
    window.__plAntesDepois = true;

    // guarda a foto que o cliente mandou (o widget a envia como 'person_image')
    var fotoUrl = null;
    var _append = FormData.prototype.append;
    FormData.prototype.append = function (k, v) {
        try {
            if (k === 'person_image' && v instanceof Blob) {
                if (fotoUrl) URL.revokeObjectURL(fotoUrl);
                fotoUrl = URL.createObjectURL(v);
            }
        } catch (e) {}
        return _append.apply(this, arguments);
    };
    window.plAntesDepoisFoto = function (url) { fotoUrl = url; };  // usado na prévia

    var css =
        '#q-result-img-col.pl-ad-on{position:relative;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:ew-resize}' +
        '#q-result-img-col.pl-ad-on img{-webkit-user-drag:none;user-drag:none;pointer-events:none}' +
        '#q-result-img-col .pl-ad-orig{position:absolute;left:var(--pl-ad-x,0);top:var(--pl-ad-y,0);width:var(--pl-ad-w,100%);height:var(--pl-ad-h,100%);margin:0;max-width:none;max-height:none;' +
            'clip-path:inset(0 0 0 var(--pl-ad,50%));-webkit-clip-path:inset(0 0 0 var(--pl-ad,50%));pointer-events:none;display:block}' +
        '#q-result-img-col .pl-ad-linha{position:absolute;top:var(--pl-ad-y,0);height:var(--pl-ad-h,100%);left:calc(var(--pl-ad-x,0px) + var(--pl-ad-w,100%) * var(--pl-ad-f,.5));width:2px;margin-left:-1px;background:#fff;' +
            'box-shadow:0 0 6px rgba(0,0,0,.35);pointer-events:none}' +
        '#q-result-img-col .pl-ad-bola{position:absolute;top:calc(var(--pl-ad-vy,0px) + var(--pl-ad-vh,100%) / 2);left:calc(var(--pl-ad-x,0px) + var(--pl-ad-w,100%) * var(--pl-ad-f,.5));width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;' +
            'background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;pointer-events:none}' +
        '#q-result-img-col .pl-ad-bola svg{width:20px;height:20px;stroke:#111;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}' +
        '#q-result-img-col .pl-ad-tag{position:absolute;top:calc(var(--pl-ad-vy,0px) + var(--pl-ad-vh,100%) - 34px);padding:4px 10px;border-radius:999px;font:600 11px/1.4 "DM Sans",sans-serif;' +
            'letter-spacing:.3px;pointer-events:none;transition:opacity .2s}' +
        '#q-result-img-col .pl-ad-com{left:calc(var(--pl-ad-x,0px) + 10px);background:var(--pl-ad-cor,#111);color:#fff}' +
        '#q-result-img-col .pl-ad-sem{right:calc(100% - var(--pl-ad-x,0px) - var(--pl-ad-w,100%) + 10px);background:rgba(0,0,0,.55);color:#fff}' +
        '#q-result-img-col.pl-ad-anim{transition:none}' +
        '#q-result-img-col.pl-ad-anim .pl-ad-orig,#q-result-img-col.pl-ad-anim .pl-ad-linha,#q-result-img-col.pl-ad-anim .pl-ad-bola{transition:all .6s ease-in-out}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    function montar(col, img) {
        if (!fotoUrl) return;
        desmontar(col);
        col.classList.add('pl-ad-on');
        var orig = document.createElement('img'); orig.className = 'pl-ad-orig'; orig.alt = 'Sua foto'; orig.src = fotoUrl;
        var linha = document.createElement('div'); linha.className = 'pl-ad-linha';
        var bola = document.createElement('div'); bola.className = 'pl-ad-bola';
        bola.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg>';
        var com = document.createElement('span'); com.className = 'pl-ad-tag pl-ad-com'; com.textContent = 'Com o produto';
        var sem = document.createElement('span'); sem.className = 'pl-ad-tag pl-ad-sem'; sem.textContent = 'Sua foto';
        [orig, linha, bola, com, sem].forEach(function (e) { e.setAttribute('data-pl-ad', '1'); col.appendChild(e); });

        function pos(p) {
            p = Math.max(0, Math.min(100, p));
            col.style.setProperty('--pl-ad', p + '%');
            col.style.setProperty('--pl-ad-f', p / 100);
            com.style.opacity = p < 18 ? 0 : 1;
            sem.style.opacity = p > 82 ? 0 : 1;
        }
        function medir() {
            var cs = getComputedStyle(img);
            orig.style.objectFit = cs.objectFit; orig.style.objectPosition = cs.objectPosition;
            orig.style.background = cs.backgroundColor;
            if (getComputedStyle(col).position === 'static') col.style.position = 'relative';
            col.style.setProperty('--pl-ad-x', img.offsetLeft + 'px'); col.style.setProperty('--pl-ad-y', img.offsetTop + 'px');
            col.style.setProperty('--pl-ad-w', img.offsetWidth + 'px'); col.style.setProperty('--pl-ad-h', img.offsetHeight + 'px');
            // parte visível da foto (a coluna pode cortar): é onde ficam a bola e os selos
            var vy = Math.max(0, img.offsetTop), vb = Math.min(col.clientHeight || 1e5, img.offsetTop + img.offsetHeight);
            col.style.setProperty('--pl-ad-vy', vy + 'px'); col.style.setProperty('--pl-ad-vh', Math.max(60, vb - vy) + 'px');
        }
        medir(); col.__plAdMedir = medir; setTimeout(medir, 400);
        col.__plAdPos = pos;
        img.draggable = false; orig.draggable = false;
        if (!col.__plAdLigado) {   // listeners uma vez só (o cliente pode provar várias fotos)
            col.__plAdLigado = true;
            var arrastando = false;
            var porEvento = function (ev) {
                var r = (col.querySelector('#q-final-view-img') || col).getBoundingClientRect();
                col.__plAdPos((ev.clientX - r.left) / r.width * 100);
            };
            window.addEventListener('resize', function () { if (col.classList.contains('pl-ad-on') && col.__plAdMedir) col.__plAdMedir(); });
            col.addEventListener('dragstart', function (ev) { if (col.classList.contains('pl-ad-on')) ev.preventDefault(); });
            col.addEventListener('pointerdown', function (ev) {
                if (!col.classList.contains('pl-ad-on')) return;
                if (ev.pointerType === 'mouse') ev.preventDefault();  // senão o navegador começa a arrastar a foto
                arrastando = true; col.classList.remove('pl-ad-anim');
                try { col.setPointerCapture(ev.pointerId); } catch (e) {}
                porEvento(ev);
            });
            col.addEventListener('pointermove', function (ev) { if (arrastando) porEvento(ev); });
            ['pointerup', 'pointercancel'].forEach(function (t) { col.addEventListener(t, function () { arrastando = false; }); });
        }

        // começa mostrando o resultado inteiro e "abre" a linha até o meio, para o cliente notar que dá para arrastar
        pos(100);
        setTimeout(function () {
            col.classList.add('pl-ad-anim'); pos(50);
            setTimeout(function () { col.classList.remove('pl-ad-anim'); }, 650);
        }, 500);
    }
    function desmontar(col) {
        col.classList.remove('pl-ad-on', 'pl-ad-anim');
        col.querySelectorAll('[data-pl-ad]').forEach(function (e) { e.remove(); });
    }

    function ligar() {
        var img = document.getElementById('q-final-view-img');
        var col = document.getElementById('q-result-img-col');
        if (!img || !col) return false;
        var cor = getComputedStyle(document.documentElement).getPropertyValue('--c-ink');
        if (cor && cor.trim()) col.style.setProperty('--pl-ad-cor', cor.trim());
        new MutationObserver(function () {
            if (img.getAttribute('src')) {
                if (img.complete) montar(col, img); else img.addEventListener('load', function () { montar(col, img); }, { once: true });
            } else desmontar(col);
        }).observe(img, { attributes: true, attributeFilter: ['src'] });
        return true;
    }
    if (!ligar()) {
        var obs = new MutationObserver(function () { if (ligar()) obs.disconnect(); });
        obs.observe(document.documentElement, { childList: true, subtree: true });
    }
})();
