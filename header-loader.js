/**
 * 糊塗咖啡 HUTU CAFE — 共用頁首載入器
 * =====================================================
 * 使用方式（每個頁面的 <head> 加入以下兩行即可）：
 *   <link rel="stylesheet" href="header.css">
 *   <script src="header-loader.js"></script>
 *
 * 新增 / 修改導覽項目：只需修改此檔案的 NAV_ITEMS 陣列，
 * 所有頁面立即同步，完全不需要動各頁面的 HTML。
 * =====================================================
 */

(function () {

    // ── 導覽列設定：在此新增或調整頁籤 ──────────────────────────
    // href       : 連結目標檔名（用來比對目前頁面，決定 active）
    // label      : 顯示文字
    // activeAlso : 額外也視為「此頁 active」的檔名（選填）
    const NAV_ITEMS = [
        { href: 'index.html',      label: '訂購頁' },
        { href: 'abouthutu.html',  label: '關於糊塗' },
        { href: 'contactus.html',  label: '聯絡我們' },
        { href: 'faq.html',        label: '常見問題' },
        { href: 'more.html',       label: '更多...' },
    ];
    // ────────────────────────────────────────────────────────────

    /** 取得目前頁面的檔名（不含路徑），找不到時視為 index.html */
    function currentPage() {
        const path = window.location.pathname;
        const file = path.split('/').pop();
        return file || 'index.html';
    }

    /** 把 header.html 注入到頁面最前面，並標記 active 頁籤 */
    async function injectHeader() {
        try {
            const res  = await fetch('header.html');
            const html = await res.text();

            // 建立暫存容器，解析 HTML 字串
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            const headerEl = tmp.querySelector('header');
            if (!headerEl) return;

            // 將 header 插到 <body> 最前面
            document.body.insertBefore(headerEl, document.body.firstChild);

            // 填入導覽列項目
            const navEl  = document.getElementById('main-nav');
            const page   = currentPage();

            NAV_ITEMS.forEach(function (item) {
                const isActive = (item.href === page) ||
                                 (item.activeAlso && item.activeAlso === page);

                const a = document.createElement('a');
                a.href      = isActive ? '#' : item.href; // active 頁面連結設為 #，搭配 CSS pointer-events:none
                a.className = 'nav-item' + (isActive ? ' active' : '');
                a.textContent = item.label;

                // active 頁面額外加 aria-current 以利無障礙輔助
                if (isActive) a.setAttribute('aria-current', 'page');

                navEl.appendChild(a);
            });

        } catch (err) {
            // fetch 失敗時（例如本地直接開啟 file://）fallback 為靜態 HTML
            console.warn('[header-loader] 無法載入 header.html，改用 fallback。', err);
            injectFallbackHeader();
        }
    }

    /** fetch 失敗時的靜態備援（確保頁面功能正常） */
    function injectFallbackHeader() {
        const page = currentPage();

        const navHtml = NAV_ITEMS.map(function (item) {
            const isActive = item.href === page;
            const href     = isActive ? '#' : item.href;
            const cls      = 'nav-item' + (isActive ? ' active' : '');
            const aria     = isActive ? ' aria-current="page"' : '';
            return `<a href="${href}" class="${cls}"${aria}>${item.label}</a>`;
        }).join('\n                ');

        const fallback = `
    <header>
        <div class="header-inner">
            <h1>糊塗咖啡 HUTU CAFE</h1>
            <p>職人嚴選 ‧ 極致烘焙 ‧
                <a href="https://lin.ee/6oPqPhD" target="_blank" class="line-link">
                    <img src="line_logo.svg" alt="LINE" class="line-img-icon">
                    @hutucafe
                </a>
            </p>
            <nav class="main-nav" id="main-nav">
                ${navHtml}
            </nav>
        </div>
    </header>`;

        const tmp = document.createElement('div');
        tmp.innerHTML = fallback;
        document.body.insertBefore(tmp.firstElementChild, document.body.firstChild);
    }

    // <script defer> 保證 DOM 已解析完成後才執行，可以直接呼叫 injectHeader。
    // 同時監聽 DOMContentLoaded 作為保險（兩者都相容，不會重複執行）。
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectHeader);
    } else {
        // defer 腳本執行時 DOM 已就緒，直接注入
        injectHeader();
    }

})();
