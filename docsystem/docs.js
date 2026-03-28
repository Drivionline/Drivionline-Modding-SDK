let currentLang = 'TR'; 
let searchData = null; 
let isFetching = false;
let currentHighlights = [];
let currentHighlightIdx = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof checkGlobalSession === 'function') checkGlobalSession();

    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('lang')) {
        currentLang = urlParams.get('lang').toUpperCase();
        localStorage.setItem('drivi_docs_lang', currentLang); 
    } else {
        const savedLang = localStorage.getItem('drivi_docs_lang');
        if (savedLang) {
            currentLang = savedLang;
        }
    }

    const langSelector = document.getElementById('lang-selector');
    if (langSelector) {
        langSelector.value = currentLang;
        langSelector.addEventListener('change', (e) => {
            currentLang = e.target.value;
            localStorage.setItem('drivi_docs_lang', currentLang); 
            window.history.pushState({}, '', `?lang=${currentLang}`);
            loadNavigation(); 
        });
    }

    window.addEventListener('popstate', () => {
        const params = new URLSearchParams(window.location.search);
        currentLang = params.get('lang') || localStorage.getItem('drivi_docs_lang') || 'TR';
        if (langSelector) langSelector.value = currentLang;
        
        const docClass = params.get('class'); // Sınıfı URL'den al
        const doc = params.get('doc');
        const q = params.get('q'); 
        
        if (doc && docClass) {
            loadDoc(docClass, doc, false, q); 
        } else {
            loadNavigation();
        }
    });

    loadNavigation();
});

async function loadNavigation() {
    try {
        const response = await fetch(`/api/docs/list?lang=${currentLang}`);
        const groupedDocs = await response.json();

        const sidebarList = document.querySelector('.sidebar-nav');
        sidebarList.innerHTML = ''; 

        if (groupedDocs.length === 0) {
            sidebarList.innerHTML = '<li style="color:var(--text-muted); padding:10px;">Döküman bulunamadı.</li>';
            document.getElementById('md-content').innerHTML = '';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        let targetDoc = urlParams.get('doc');
        let targetClass = urlParams.get('class');
        let docExists = false;
        let firstDoc = null;

        // API'den gelen verideki İLK dökümanı bul (Varsayılan açılış için)
        if (groupedDocs[0] && groupedDocs[0].docs[0]) {
            firstDoc = groupedDocs[0].docs[0];
        }

        groupedDocs.forEach((group) => {
            // Eğer URL'deki döküman bu kategorideyse, kategori açık başlasın
            const isOpened = (targetClass === group.rawClass) || (!targetClass && firstDoc && firstDoc.class === group.rawClass);
            
            const categoryWrapper = document.createElement('li');
            categoryWrapper.className = 'category-group';
            categoryWrapper.innerHTML = `
                <div class="category-header ${isOpened ? 'active' : ''}" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;">
                    <span>${group.category}</span>
                    <svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="transition: transform 0.3s; transform: ${isOpened ? 'rotate(180deg)' : 'rotate(0deg)'}"><path d="m6 9 6 6 6-6"/></svg>
                </div>
                <ul class="category-content" style="list-style: none; padding: 0; overflow: hidden; max-height: ${isOpened ? '1000px' : '0px'}; transition: max-height 0.3s ease-out;">
                </ul>
            `;

            const contentList = categoryWrapper.querySelector('.category-content');

            group.docs.forEach((doc) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `?lang=${currentLang}&class=${doc.class}&doc=${doc.filename}`;
                a.textContent = doc.title;
                a.dataset.file = doc.filename;
                a.dataset.class = doc.class;
                
                // URL ile eşleşme kontrolü
                if (targetDoc === doc.filename && targetClass === doc.class) {
                    a.classList.add('active');
                    docExists = true;
                }

                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadDoc(doc.class, doc.filename);
                });

                li.appendChild(a);
                contentList.appendChild(li);
            });

            // Başlığa tıklayınca aç/kapat mantığı
            categoryWrapper.querySelector('.category-header').addEventListener('click', function() {
                const chevron = this.querySelector('.chevron');
                const content = this.nextElementSibling;
                this.classList.toggle('active');
                if (content.style.maxHeight === '0px' || !content.style.maxHeight) {
                    content.style.maxHeight = '1000px';
                    chevron.style.transform = 'rotate(180deg)';
                } else {
                    content.style.maxHeight = '0px';
                    chevron.style.transform = 'rotate(0deg)';
                }
            });

            sidebarList.appendChild(categoryWrapper);
        });

        // --- SAYFA YÜKLEME KARAR MEKANİZMASI ---
        const q = urlParams.get('q');
        if (targetDoc && docExists) {
            // 1. URL'de döküman varsa onu aç
            loadDoc(targetClass, targetDoc, false, q); 
        } else if (firstDoc) {
            // 2. URL boşsa en üstteki ilk dökümanı aç
            loadDoc(firstDoc.class, firstDoc.filename, true);
        }
        
    } catch (err) {
        console.error("Navigasyon yüklenemedi:", err);
    }
}

function loadDoc(className, filename, pushToHistory = true, searchQuery = null) {
    const contentDiv = document.getElementById('md-content');
    contentDiv.innerHTML = '<p style="color: var(--text-muted);">Yükleniyor...</p>';

    if (pushToHistory) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('lang', currentLang);
        newUrl.searchParams.set('class', className); 
        newUrl.searchParams.set('doc', filename);
        if (searchQuery) newUrl.searchParams.set('q', searchQuery);
        else newUrl.searchParams.delete('q');
        window.history.pushState({}, '', newUrl.href);
    }

    //  /docs/SınıfAdı/Dil/Dosya.md
    fetch(`/docs/${className}/${currentLang}/${filename}`)
        .then(response => {
            if (!response.ok) throw new Error('Döküman bulunamadı veya henüz çevrilmedi.');
            return response.text();
        })
        .then(markdown => {
            contentDiv.innerHTML = marked.parse(markdown);
            
            document.querySelectorAll('#md-content a').forEach(link => {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer'); 
            });

            document.querySelectorAll('#md-content h1, #md-content h2, #md-content h3').forEach(heading => {
                const rawText = heading.textContent;
                const id = rawText.toLowerCase()
                    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
                    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                    .replace(/[^a-z0-9]+/g, '-') 
                    .replace(/(^-|-$)+/g, '');
                
                heading.id = id;
                heading.classList.add('anchor-heading');
                heading.style.cursor = 'pointer';
                heading.title = "Direkt Linki Kopyala";
                
                heading.addEventListener('click', () => {
                    const copyUrl = new URL(window.location);
                    copyUrl.hash = heading.id; 
                    
                    navigator.clipboard.writeText(copyUrl.href);
                    
                    const originalText = heading.innerText;
                    heading.innerText = originalText + " (Kopyalandı!)";
                    heading.style.color = "#4ade80"; 
                    setTimeout(() => {
                        heading.innerText = originalText;
                        heading.style.color = ""; 
                    }, 1000);
                });
            });

            document.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
            
            document.querySelectorAll('#md-content pre').forEach((preBlock) => {
                preBlock.style.position = 'relative';
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.title = "Kodu Kopyala";
                const copyIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
                const checkIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

                copyBtn.innerHTML = copyIcon;
                copyBtn.addEventListener('click', () => {
                    const codeText = preBlock.querySelector('code').innerText;
                    navigator.clipboard.writeText(codeText).then(() => {
                        copyBtn.innerHTML = checkIcon;
                        copyBtn.style.borderColor = "#4ade80";
                        setTimeout(() => {
                            copyBtn.innerHTML = copyIcon;
                            copyBtn.style.borderColor = "rgba(255, 255, 255, 0.2)";
                        }, 2000);
                    });
                });
                preBlock.appendChild(copyBtn);
            });

            document.querySelectorAll('.sidebar-nav a').forEach(link => {
                if (link.dataset.file === filename && link.dataset.class === className) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            if (searchQuery) {
                highlightAndScroll(contentDiv, searchQuery);
            } else if (window.location.hash) {
                const targetId = window.location.hash.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    setTimeout(() => targetElement.scrollIntoView({ behavior: 'smooth' }), 100);
                }
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        })
        .catch(error => {
            contentDiv.innerHTML = `<h2 style="color:#ef4444">Hata!</h2><p>${error.message}</p>`;
        });
}

document.getElementById('doc-search')?.addEventListener('focus', async (e) => {
    if (searchData || isFetching) return;
    
    isFetching = true;
    const originalPlaceholder = e.target.placeholder;
    e.target.placeholder = "Dökümanlar yükleniyor..."; 
    
    try {
        const response = await fetch(`/api/docs/search-index?lang=${currentLang}`);
        searchData = await response.json();
        e.target.placeholder = originalPlaceholder;
    } catch (err) {
        console.error("Arama verisi yüklenemedi:", err);
        e.target.placeholder = "Bağlantı hatası!";
    }
    isFetching = false;
});

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

// --- ESNEK VE KAPSAMLI ARAMA MOTORU ---
document.getElementById('doc-search')?.addEventListener('input', (e) => {
    if (!searchData) return; 
    
    const rawQuery = e.target.value.trim();
    if (rawQuery.length < 2) { 
        document.getElementById('search-results').style.display = 'none';
        return;
    }

    const queryWords = rawQuery.toLocaleLowerCase('tr-TR').split(/\s+/).filter(w => w.length > 0);
    const noSpaceQuery = rawQuery.replace(/\s+/g, '').toLocaleLowerCase('tr-TR'); 

    const filteredDocs = searchData.filter(doc => {
        const docTitle = doc.t.toLocaleLowerCase('tr-TR');
        const docContent = doc.c; // Backend'den zaten küçük harf geliyor
        
        // 1. Durum: Boşluksuz haline bak (Örn: "set car state" yazarsa "setcarstate" bulur)
        const noSpaceTitle = docTitle.replace(/\s+/g, '');
        const noSpaceContent = docContent.replace(/\s+/g, '');
        if (noSpaceTitle.includes(noSpaceQuery) || noSpaceContent.includes(noSpaceQuery)) return true;

        // 2. Durum: Her kelimeyi bağımsız ara (Örn: "oyuncu canı" yazarsa ikisinin de geçtiği sayfayı bulur)
        return queryWords.every(word => docTitle.includes(word) || docContent.includes(word));
    });

    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    if (filteredDocs.length === 0) {
        resultsContainer.innerHTML = '<li style="color: #a1a1aa; padding: 5px; font-size: 13px;">Sonuç bulunamadı. Biraz farklı yazmayı dene.</li>';
    } else {
        filteredDocs.forEach(doc => {
            // Snippet için eşleşen ilk kelimeyi bul
            let snippet = doc.c.substring(0, 60) + "...";
            for (const word of queryWords) {
                const matchIndex = doc.c.indexOf(word);
                if (matchIndex !== -1) {
                    const start = Math.max(0, matchIndex - 30);
                    const end = Math.min(doc.c.length, matchIndex + word.length + 40);
                    let rawSnippet = doc.c.substring(start, end);
                    
                    const safeQuery = escapeRegExp(word);
                    const regex = new RegExp(`(${safeQuery})`, 'gi');
                    snippet = rawSnippet.replace(regex, '<span style="color: #fbbf24; font-weight: bold;">$1</span>');
                    snippet = (start > 0 ? "..." : "") + snippet + (end < doc.c.length ? "..." : "");
                    break; 
                }
            }

            const li = document.createElement('li');
            li.style.marginBottom = '5px';
            
            const a = document.createElement('a');
            a.href = `?lang=${currentLang}&doc=${doc.f}&q=${encodeURIComponent(rawQuery)}`;
            
            a.innerHTML = `
                <div style="font-size: 14px; color: var(--accent); margin-bottom: 3px; font-weight: 500;">${doc.t}</div>
                <div style="font-size: 12px; color: #a1a1aa; line-height: 1.4; word-break: break-all;">${snippet}</div>
            `;
            
            a.style.display = 'block';
            a.style.padding = '8px';
            a.style.borderRadius = '6px';
            a.style.textDecoration = 'none';
            a.onmouseover = () => a.style.background = 'rgba(255,255,255,0.05)';
            a.onmouseout = () => a.style.background = 'transparent';

            a.addEventListener('click', (event) => {
                event.preventDefault();
                // Tıklandığında doc.cls (Sınıf adını) loadDoc'a gönderiyoruz
                loadDoc(doc.cls, doc.f, true, rawQuery); 
                resultsContainer.style.display = 'none';
                document.getElementById('doc-search').value = rawQuery; 
            });

            li.appendChild(a);
            resultsContainer.appendChild(li);
        });
    }
    
    resultsContainer.style.display = 'block';
});

document.addEventListener('click', (e) => {
    const searchBox = document.querySelector('.search-container');
    const resultsContainer = document.getElementById('search-results');
    if (searchBox && !searchBox.contains(e.target) && resultsContainer) {
        resultsContainer.style.display = 'none';
    }
});


// --- ÇOKLU KELİME BOYAMA MOTORU ---
function highlightAndScroll(container, keyword) {
    currentHighlights = [];
    currentHighlightIdx = 0;
    
    const navTools = document.getElementById('search-nav-tools');

    if (!keyword) {
        if(navTools) navTools.style.display = 'none';
        return;
    }
    
    // Aramayı kelimelere böl (Örn: "set car state" -> ["set", "car", "state"])
    const wordsToHighlight = keyword.toLocaleLowerCase('tr-TR').split(/\s+/).filter(w => w.length > 0);
    if (wordsToHighlight.length === 0) return;

    // Her kelimeyi metin içinde ayrı ayrı bulup sarıya boyar
    wordsToHighlight.forEach(word => {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
        const nodesToProcess = [];
        let node;
        
        while ((node = walker.nextNode())) {
            if (node.nodeValue.toLocaleLowerCase('tr-TR').includes(word)) {
                if (node.parentNode.nodeName !== 'SCRIPT' && node.parentNode.nodeName !== 'STYLE' && node.parentNode.className !== 'drivi-highlight') {
                    nodesToProcess.push(node);
                }
            }
        }
        
        nodesToProcess.forEach(n => {
            let text = n.nodeValue;
            let lowerText = text.toLocaleLowerCase('tr-TR');
            let matchIdx = lowerText.indexOf(word);
            
            if (matchIdx !== -1) {
                const fragment = document.createDocumentFragment();
                
                while (matchIdx !== -1) {
                    fragment.appendChild(document.createTextNode(text.substring(0, matchIdx)));
                    
                    const mark = document.createElement('mark');
                    mark.className = 'drivi-highlight';
                    mark.style.cssText = 'background: rgba(251, 191, 36, 0.2); color: #fbbf24; border-bottom: 2px solid #fbbf24; padding: 0 2px; border-radius: 2px; transition: all 0.3s ease;';
                    mark.textContent = text.substring(matchIdx, matchIdx + word.length);
                    fragment.appendChild(mark);
                    
                    text = text.substring(matchIdx + word.length);
                    lowerText = lowerText.substring(matchIdx + word.length);
                    matchIdx = lowerText.indexOf(word);
                }
                
                if (text.length > 0) fragment.appendChild(document.createTextNode(text));
                n.parentNode.replaceChild(fragment, n);
            }
        });
    });

    currentHighlights = Array.from(container.querySelectorAll('.drivi-highlight'));

    if (currentHighlights.length > 0) {
        if(navTools) navTools.style.display = 'flex';
        focusHighlight(); 
    } else {
        if(navTools) navTools.style.display = 'none';
    }
}

function focusHighlight() {
    if (currentHighlights.length === 0) return;

    currentHighlights.forEach(el => {
        el.style.background = 'rgba(251, 191, 36, 0.2)';
        el.style.boxShadow = 'none';
        el.style.color = '#fbbf24';
    });

    const target = currentHighlights[currentHighlightIdx];
    target.style.background = 'rgba(251, 191, 36, 0.8)'; 
    target.style.color = '#000'; 
    target.style.boxShadow = '0 0 10px rgba(251, 191, 36, 0.8)'; 

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const matchCountEl = document.getElementById('match-count');
    if(matchCountEl) matchCountEl.innerText = `${currentHighlightIdx + 1} / ${currentHighlights.length}`;
}

document.getElementById('search-up')?.addEventListener('click', () => {
    if (currentHighlights.length === 0) return;
    currentHighlightIdx = (currentHighlightIdx - 1 + currentHighlights.length) % currentHighlights.length;
    focusHighlight();
});

document.getElementById('search-down')?.addEventListener('click', () => {
    if (currentHighlights.length === 0) return;
    currentHighlightIdx = (currentHighlightIdx + 1) % currentHighlights.length;
    focusHighlight();
});

document.querySelectorAll('#search-up, #search-down').forEach(btn => {
    btn.addEventListener('mouseover', () => btn.style.color = '#fff');
    btn.addEventListener('mouseout', () => btn.style.color = '#a1a1aa');
});