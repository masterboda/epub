"use strict";

let debugMode = true;

function log(...p){
    if(debugMode)
        console.log(...p)
}

window.onerror = function (msg, url, line, column, err) {
    if (msg.indexOf("Permission denied") > -1) return;
    if (msg.indexOf("Object expected") > -1 && url.indexOf("epub") > -1) return;
    if (msg.length < 1 || !err) return;
    document.querySelector(".app .error").classList.remove("hidden");
    document.querySelector(".app .error .error-title").innerHTML = "Error1";
    document.querySelector(".app .error .error-description").innerHTML = "Please try reloading the page or using a different browser (Chrome or Firefox), and if the error still persists, <a href=\"https://github.com/geek1011/ePubViewer/issues\">report an issue</a>.";
    document.querySelector(".app .error .error-info").innerHTML = msg;
    log("msg:", msg, " url:", url, "line: ", line, " column:", column);
    log("err:", err.toString(), " err.stack:", err.stack);
    document.querySelector(".app .error .error-dump").innerHTML = JSON.stringify({
        error: err.toString(),
        stack: err.stack,
        msg: msg,
        url: url,
        line: line,
        column: column,
    });
};


function modal(el, type, callback){
    el.classList[(type == "show") ? "add" : "remove"]("modal-active");
    el.addEventListener("click", e => {
        if(e.target != el && !e.target.classList.contains("close-btn"))
            return;
        else
            el.classList.remove("modal-active");
    });
    if(typeof callback == "function") {
        //el.ontranstionend = () => callback();
        callback();
    }
}

/* Call functions search, settings change, change location, prev & next buttons, open file button
======================================= */

let App = function (el) {
    this.appElm = el;
    this.bookmArr = [];
    this.state = {};
    this.doReset();
    this.mx = 0;
    this.my = 0;

    let ufn = location.search.replace("?", "") || location.hash.replace("#", "");
    this.ufn = ufn.startsWith("!") ? ufn.replace("!", "") : ufn;

    if (this.ufn)
        this.doBook(this.ufn);

    document.body.addEventListener("keyup", this.onKeyUp.bind(this));

    this.qsa(".menu-bar .menu-tool").forEach(el => {
        el.onmouseover = function() {
            let tooltip = this.querySelector(".menu-tooltip");
            if(tooltip) {
                tooltip.classList.add("tooltip-active");
                this.onmouseleave = () => tooltip.classList.remove("tooltip-active");
            }
            return;
        }
    });

    this.qsa(".tab-list .tab-item")
        .forEach(el => el.addEventListener("click", this.onTabClick.bind(this, el.dataset.tab)));
    
    this.qs(".tab[data-tab=search] .search-bar .search-input").addEventListener("keydown", event => {
        if (event.keyCode == 13)
            this.qs(".tab[data-tab=search] .search-bar .do-search").click();
        else if (event.keyCode == 8 || event.keyCode == 46) //on backspace or delete click
            this.qs(".search-results").innerHTML = "";
    });
    
    this.qs(".tab[data-tab=search] .search-bar .do-search").addEventListener("click", this.onSearchClick.bind(this));
    
    // Settings buttons EventListeners
    this.qsa(".settings-row[data-type]").forEach(el => {
        Array.from(el.querySelectorAll(".settings-item[data-value]"))
            .forEach(cel => cel.addEventListener("click", event => {
                this.setChipActive(el.dataset.type, cel.dataset.value);
            }));
    });

    this.qs("button.prev").addEventListener("click", () => this.state.rendition.prev());
    this.qs("button.next").addEventListener("click", () => this.state.rendition.next());

    try {
        this.loadSettingsFromStorage();
    } catch (err) {
        this.fatal("error loading settings", err);
        throw err;
    }
    this.applyTheme();
};

App.prototype.doBook = function (url, opts = null) {
    this.qs(".book").innerHTML = "Loading";

    opts = opts || {
        encoding: "epub"
    };
    log("doBook", url, opts);
    this.doReset();

    try {
        this.state.book = ePub(url, opts);
        this.qs(".book").innerHTML = "";
        let flowState = this.getChipActive("flow");//localStorage.getItem(`ePubViewer:flow`) || "paginated";
        this.state.rendition = this.state.book.renderTo(this.qs(".book"), {flow: flowState}); //flow: "scrolled-doc"
    } catch (err) {
        this.fatal("error loading book", err);
        throw err;
    }

    this.state.book.ready.then(this.onBookReady.bind(this)).catch(this.fatal.bind(this, "error loading book"));
    this.state.book.loaded.navigation.then(this.onNavigationLoaded.bind(this)).catch(this.fatal.bind(this, "error loading toc"));
    this.state.book.loaded.metadata.then(this.onBookMetadataLoaded.bind(this)).catch(this.fatal.bind(this, "error loading metadata"));
    // this.state.book.loaded.cover.then(this.onBookCoverLoaded.bind(this)).catch(this.fatal.bind(this, "error loading cover"));

    this.state.rendition.hooks.content.register(this.applyTheme.bind(this));

    this.state.rendition.on("relocated", this.onRenditionRelocated.bind(this));
    this.state.rendition.on("click", this.onRenditionClick.bind(this));
    this.state.rendition.on("keyup", this.onKeyUp.bind(this));
    this.state.rendition.on("relocated", this.addSwipeListener.bind(this));
    this.state.rendition.on("relocated", this.onRenditionRelocatedUpdateIndicators.bind(this));
    this.state.rendition.on("relocated", this.onRenditionRelocatedSavePos.bind(this));
    this.state.rendition.on("started", this.onRenditionStartedRestorePos.bind(this));
    this.state.rendition.on("started", this.restoreBookm.bind(this));
    this.state.rendition.on("selected", this.doBookmTooltip.bind(this)); //show tooltip when selected text.
    this.state.rendition.on("displayError", this.fatal.bind(this, "error rendering book"));
    this.state.rendition.on("displayed", this.onContentReady.bind(this));

    this.state.rendition.display();

    this.state.rendition.themes.default({
        '::selection': {
            'background': 'rgb(36,38,128, 0.3)'
        },
        '.epubjs-hl': {
            'fill': '#242680',
            'fill-opacity': '0.3',
            'mix-blend-mode': 'multiply'
        }
    });


    // if (this.state.dictInterval)
    //     window.clearInterval(this.state.dictInterval);
    // this.state.dictInterval = window.setInterval(this.checkDictionary.bind(this), 50);
    // this.doDictionary(null);
};

App.prototype.loadSettingsFromStorage = function () {
    ["theme", "font", "font-size", "flow"].forEach(container => this.restoreChipActive(container));
    // this.changeFS(0, localStorage.getItem(`ePubViewer:font-size`));
};

/* Setting buttons
======================================= */

//*
App.prototype.restoreChipActive = function (container) {
    let v = localStorage.getItem(`ePubViewer:${container}`);
    if (v)
        return this.setChipActive(container, v);
    this.setDefaultChipActive(container);
};

App.prototype.setDefaultChipActive = function (container) {
    let el = this.qs(`.settings-row[data-type='${container}']`).querySelector(".settings-item[data-default]");
    this.setChipActive(container, el.dataset.value);
    return el.dataset.value;
};

// New version 
App.prototype.setChipActive = function (container, value) {
    if (this.getChipActive(container) != value) {
        Array.from(this.qs(`.settings-row[data-type='${container}']`).querySelectorAll(".settings-item[data-value]")).forEach(el => {
            el.classList[el.dataset.value == value ? "add" : "remove"]("active");
        });
        localStorage.setItem(`ePubViewer:${container}`, value);
        this.applyTheme();
        if (container == "flow") {
            this.doBook(this.ufn);
            this.appElm.classList[value == "scrolled-doc" ? "add" : "remove"]("scrolled");
        }

        if (this.state.rendition && this.state.rendition.location)
            this.onRenditionRelocatedUpdateIndicators(this.state.rendition.location);
    }
    return value;
};

App.prototype.getChipActive = function (container) {
    let el = this.qs(`.settings-row[data-type='${container}']`).querySelector(".settings-item.active[data-value]") ||
             this.qs(`.settings-row[data-type='${container}']`).querySelector(".settings-item[data-default]");
    return el.dataset.value;
};

App.prototype.fontSizeUp = function(mode) {
    let fontEl = this.qs("[data-font-size]"),
        sizes = ["04pt","08pt","09pt","10pt","12pt","14pt","16pt","18pt","30pt"],
        btns = this.qsa("[data-font-size] .settings-item"),
        currFZ = sizes[sizes.indexOf(btns[0].dataset.value) + mode];
    if (mode == -1 && currFZ == "04pt") {
        btns[0].classList.add('disabled');
        return;
    }
    else if ( mode == 1 && currFZ == "30pt") {
        btns[1].classList.add('disabled');
        return;
    }
    btns[0].dataset.value = currFZ;
    btns[1].dataset.value = currFZ;

    fontEl.dataset.fontSize = currFZ;
}

App.prototype.changeFS = function(mode, set) {
    let fontEl = this.qs("[data-font-size]"),
        sizes = [4,8,9,10,12,14,16,18,30],
        currFZ = +fontEl.dataset.fontSize,
        btns = this.qsa("[data-font-size] .settings-item");

    btns[0].classList.remove('disabled');
    btns[1].classList.remove('disabled');

    if (mode == -1 && currFZ == 8) {
        btns[0].classList.add('disabled');
        return;
    }
    else if ( mode == 1 && currFZ == 18) {
        btns[1].classList.add('disabled');
        return;
    }
    currFZ = !set ? sizes[sizes.indexOf(currFZ) + mode] : set;
    fontEl.dataset.fontSize = currFZ;
    localStorage.setItem(`ePubViewer:font-size`, currFZ);
    this.applyTheme();
}


App.prototype.onContentReady = function() {
    this.qs("iframe").contentWindow.addEventListener("click", (evt) => {
        // alert(evt.clientX+' '+evt.clientY);
        this.mx = evt.clientX;
        this.my = evt.clientY;
    });
}

//Bookmarks

App.prototype.doBookmTooltip = function(cfiRange, contents) {
    if(this.state.rendition.annotations._annotations[encodeURI(cfiRange)] != undefined)
        return;

    let tooltip = document.createElement('span'),
        book = this.qs('.book'),
        img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCzIhnAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAMFBMVEX///9CpfVCpfVCpfVCpfVCpfVCpfVCpfVCpfVCpfVCpfVCpfVCpfVCpfVCpfVCpfXi3q4xAAAAD3RSTlMAECAwQFBggJCgsMDQ4PB4UqzwAAAA+klEQVRYw+3XvQnCUBSG4esfEix0AIuM4ATqCA7gDm7gCOoG2UCsbMXCOSzSiI2CIAbRT5OTv5vmnGvr+bp74eFNl8QYnU6n+3GtNUo7T3hR28Has8eSPirbs2RXJU9ONIFD+TwFxgzx8LIevnbEiiEd3O2LGTYsudkXIwG52hddJUqUKFHyJ6TuO5Plw5V4SF94chIAkRvx4tf3yokEeF8oIyXfSDikjJR8I4MGZYQkjhhDGSGJI8ZQRkYokmZkhCJpRkSyCGVEJItQRkKiPJJkAgFBHkkyEJGwOA5lpIhQhvvqa1uRJMN9W5r5yS8f64ut/m3odLof9wG30l5Rbuc4ggAAAABJRU5ErkJggg==";

    tooltip.innerText = 'Añadir marcador';
    tooltip.addEventListener('click', this.makeBookmark.bind(this, cfiRange, contents));

    Object.assign(tooltip.style, {
        color: "#fff",
        display: "inline-block",
        background: `url(${img}) no-repeat right center #242680`,
        backgroundSize: "37px",
        position: "absolute",
        fontSize: "14px",
        zIndex: 10,
        borderRadius: "15px",
        padding: "10px 35px 10px 10px",
        cursor: "pointer",
        left: this.mx+'px',
        top: this.my+'px'
    });

    console.dir(tooltip);

    contents.window.document.body.appendChild(tooltip);

    setTimeout(() => {
        contents.window.addEventListener("click", () => {tooltip.remove()}, {once: true});
    }, 500);
    
    // document.body.addEventListener("click", () => {
    //     tooltip.remove();
    //     contents.window.getSelection().removeAllRanges();
    // }, {once: true});
}

App.prototype.makeBookmark = function (cfiRange, contents) {
    this.state.book.getRange(cfiRange).then(range => {
        log(`Selected: ${range.toString()}`, cfiRange, contents);
        if(range) {
            let text = range.toString().trim().slice(0, 70);
            this.addBookm({title: text, href: cfiRange});
            contents.window.getSelection().removeAllRanges();
        }
    });
}

App.prototype.addBookm = function (item) {
    log("addBookm", item);
    this.bookmArr.push(item);
    this.updateBookm();
}
App.prototype.rmBookm = function (index) {
    let removed = this.bookmArr.splice(index, 1)[0]; //??
    this.state.rendition.annotations.remove(removed.href);
    this.updateBookm();
}
App.prototype.updateBookm = function () {
    let bookmElm = this.qs(".tab[data-tab=bookmarks] .bookmark-list");
        bookmElm.innerHTML = "";

    let annt = this.state.rendition.annotations;

    this.bookmArr.forEach((item, i) => {
        
        if(annt._annotations[encodeURI(item.href)] == undefined) {
            // log(annt._annotations);
            annt.highlight(item.href, {}, (e) => {
                log("highlight clicked", e.target);
            });
        }

        let bookmark = bookmElm.appendChild(this.el("div", "bookmark")),
            a = bookmark.appendChild(this.el("a", "bookmark-item")),
            btn = bookmark.appendChild(this.el("span", "rm-bookmark"));

        a.href = a.dataset.href = item.href;
        a.innerText = item.title;

        a.addEventListener("click", event => {
            this.state.rendition.display(item.href)
                .catch(err => console.warn("error displaying page", err));

            modal(this.qs(".tabs-modal"), 'hide');
            event.stopPropagation();
            event.preventDefault();
        });

        btn.addEventListener("click", () => {
            this.rmBookm(i);
        });
    });

    this.storeBookm();
}

App.prototype.storeBookm = function () {
    localStorage.setItem(`${this.state.book.key()}:bookm`, JSON.stringify(this.bookmArr));
}

App.prototype.restoreBookm = function () {
    let localBookm = JSON.parse(localStorage.getItem(`${this.state.book.key()}:bookm`));
    if(localBookm) {
        this.bookmArr = localBookm;
        this.updateBookm();
    }
}

// For development purposes
App.prototype.doOpenBook = function () {
    var fi = document.createElement("input");

    fi.setAttribute("accept", "application/epub+zip");
    fi.style.display = "none";
    fi.type = "file";


    fi.onchange = event => {
        var reader = new FileReader();

        reader.addEventListener("load", () => {
            var arr = (new Uint8Array(reader.result)).subarray(0, 2);

            var header = "";
            for (var i = 0; i < arr.length; i++) {
                header += arr[i].toString(16);
            }if (header == "504b") {
                this.doBook(reader.result, {
                    encoding: "binary"
                });
            } else {
                this.fatal("invalid file", "not an epub book");
            }
        }, false);

        
        log(fi.files[0]);

        if (fi.files[0]) {
            reader.readAsArrayBuffer(fi.files[0]);
        }
    };
    document.body.appendChild(fi);
    fi.click();
    // log(fi)
};

App.prototype.fatal = function (msg, err, usersFault) {
    console.error(msg, err);
    document.querySelector(".app .error").classList.remove("hidden");
    document.querySelector(".app .error .error-title").innerHTML = "Error2";
    document.querySelector(".app .error .error-description").innerHTML = usersFault ? "" : "Please try reloading the page or using a different browser, and if the error still persists, <a href=\"https://github.com/geek1011/ePubViewer/issues\">report an issue</a>.";
    document.querySelector(".app .error .error-info").innerHTML = msg + ": " + err.toString();
    document.querySelector(".app .error .error-dump").innerHTML = JSON.stringify({
        error: err.toString(),
        stack: err.stack
    });    
    log("Error line 471");
    log(mgs);
    console.error(err);
    log(usersFault);
    log(err.toString(), err.stack);
};

App.prototype.doReset = function () {
    // if (this.state.dictInterval) window.clearInterval(this.state.dictInterval);
    if (this.state.rendition) this.state.rendition.destroy();
    if (this.state.book) this.state.book.destroy();
    this.state = {
        book: null,
        rendition: null
    };
    this.qs(".menu-bar .book-title").innerHTML = "";
    this.qs(".menu-bar .book-author").innerHTML = "";
    this.qs(".tab[data-tab=bookmarks] .bookmark-list").innerHTML = "";
    this.qs(".bar .loc").innerHTML = "";
    this.qs(".search-results").innerHTML = "";
    this.qs(".search-input").value = "";
    this.qs(".chapter-list").innerHTML = "";
    this.qs(".book").innerHTML = '<div class="empty-wrapper"><div class="empty"><div class="app-name">ePubViewer</div><div class="message"><a href="javascript:ePubViewer.doOpenBook();" class="big-button">Open a Book</a></div></div></div>';
    this.qs("button.prev").classList.add("hidden");
    this.qs("button.next").classList.add("hidden");
    // this.doDictionary(null);
};

App.prototype.createElement = function (name, props, innerContent) {
    const elm = document.createElement(name);

    for (let prop in props) {
        if (typeof props[prop] === 'object')
            Object.assign(elm[prop], props[prop]);
        else
            elm[prop] = props[prop];
    }

    if (innerContent) {

        if(!(innerContent instanceof Array))
            innerContent = [innerContent];

        for (let item of innerContent) {
            let append = item instanceof Node ? item : document.createTextNode(item);
            elm.appendChild(append)
        }

    }

    return elm;
}

App.prototype.qs = function (q) {
    return this.appElm.querySelector(q);
};

App.prototype.qsa = function (q) {
    return Array.from(this.appElm.querySelectorAll(q));
};

App.prototype.el = function (t, c) {
    let e = document.createElement(t);
    if (c) e.classList.add(c);
    return e;
};

App.prototype.createAudio = function (src, opts) {
    opts = opts || {
        autoplay: false,
        loop: false,
        minimized: false,
        draggable: false
    };


    function formatTime(sec) {
        let h = Math.floor(sec / 3600),
            m = Math.floor(sec / 60) % 60,
            s = Math.floor(sec % 60);
        return [h, m, s]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
    }

    function setProgress(evt) {
        let box = this.getBoundingClientRect(),
            left = box.left + pageXOffset;

        audioObj.currentTime = (evt.clientX - left) / this.clientWidth * audioObj.duration;
    }

    function onPlayPause(evt) {
        playBtn.classList[evt.type == 'play' ? 'add' : 'remove']('played');
    }

    function onVolumeChange(evt) {
        muteBtn.classList[this.muted ? 'add' : 'remove']('muted');
    }

    function onTimeUpdate(evt) {
        timeBlock.innerText = formatTime(this.currentTime);
        bar.children[0].style.width = `${this.currentTime / this.duration * 100}%`;
    }

    function onPlayClick(evt) {
        audioObj[audioObj.paused ? 'play' : 'pause']()
    }

    const audioObj = this.createElement(
        'audio', {
            src: src,
            loop: opts.loop,
            autoplay: opts.autoplay,
            hidden: true,
            onplay: onPlayPause,
            onpause: onPlayPause,
            onvolumechange: onVolumeChange,
            ontimeupdate: onTimeUpdate
        }
    );

    const playBtn = this.createElement('span', {
        className: 'audio-playpause',
        onclick: onPlayClick
    });
    
    const minimizeBtn = this.createElement('span', {
        className: 'audio-minimize',
        onclick: function (evt) {
            audioPlayer.classList.add('minimized');
        }
    });

    const maximizeBtn = this.createElement('span', {
        className: 'audio-maximize',
        onclick: function (evt) {
            audioPlayer.classList.remove('minimized');
        }
    });

    const muteBtn = this.createElement('span', {
        className: 'audio-mute',
        onclick: function (evt) {
            audioObj.muted = !audioObj.muted;
        }
    });

    const closeBtn = this.createElement('span', {
        className: 'audio-close',
        onclick: function (evt) {
            this.parentElement.parentElement.remove();
        }
    });

    const bar = this.createElement('div', {
        className: 'audio-bar',
        innerHTML: '<span></span>',
        onclick: setProgress
    });

    const timeBlock = this.createElement('span', {
        className: 'audio-duration',
        innerText: '00:00'
    });

    const audioPlayer = this.createElement(
        'div', {
            className: `audio-player ${(opts.minimized ? 'minimized' : '')}`
        }, [
            audioObj,
            this.createElement(
                'div', {
                    className: 'audio-progress'
                }, [
                    timeBlock,
                    bar
                ]
            ),
            this.createElement(
                'div', {
                    className: 'audio-controls'
                }, [
                    playBtn,
                    muteBtn,
                    minimizeBtn,
                    closeBtn
                ]
            ),
            maximizeBtn
        ]
    );

    return audioPlayer;
}

App.prototype.addAudioClick = function () {
    let bookiFrame = this.qs("iframe").contentWindow.document,
        audioBtns = Array.from(bookiFrame.querySelectorAll('.audio-btn'));

    audioBtns.forEach(btn => {
        let audioSrc = btn.dataset.source;

        if (audioSrc) {
            let app = this;

            btn.onclick = function (e) {
                // if (this.dataset.active == "false") {
                    let audio = app.qs('.audio-player audio');

                    if (!audio) {

                        let audioPlayer = app.createAudio(audioSrc, { autoplay: true });
                        audioPlayer.style.position = "absolute";
                        audioPlayer.style.right = "10px";
                        audioPlayer.style.bottom = "40px";

                        app.qs('.viewer').appendChild(audioPlayer);

                    } else {
                        audio.src = audioSrc;
                    }
                // } else {
                //     //In future some logic to handle with
                //     return;
                // }
            }
        }
    });
}

App.prototype.addImgClick = function () {    
    // let bookiFrame = this.state.rendition.getContents().document;
    let bookiFrame = this.qs("iframe").contentWindow.document;
    let imgDivArr = Array.from(bookiFrame.querySelectorAll(".circle-div"));
    
    imgDivArr.forEach(cDiv => {
        cDiv.parentNode.style.height = "200px";
        cDiv.style.cursor = "zoom-in";

        let app = this,
            imgSrc = cDiv.querySelector("img").src;

        cDiv.onclick = function (e) {
            log(imgSrc);

            let modalContainer = app.createElement(
                'div', {
                    className: 'imgFullscreen fadeIn animated',
                    style: {animationDuration: '0.5s'},
                    onclick: function() {
                        this.className = "imgFullscreen fadeOut animated";
                        this.addEventListener('animationend', function() {
                            this.remove();
                        });
                    }
                },
                [
                    app.createElement('img', {src: imgSrc}),
                    app.createElement('span', {className: 'close-btn'})
                ]
            );

            app.qs('.viewer').appendChild(modalContainer);
            e.stopPropagation();
        }
    });
}

// bCoverInit serve for only one time show
var bCoverInit = false;
App.prototype.addCover = function () {
    if (bCoverInit) return;
    //let imgCover = bookiFrame.querySelector("._idGenObjectAttribute-1");
    let imgCover = this.state.book.cover;
    if (!imgCover) {
        bCoverInit = true;
        return;
    }

    fetch(imgCover)
        .then((resp) => {
            if (resp.status == 200) {
                showCover(imgCover, this);
            } else {
                if (imgCover.substr(0, 6) == "/OEBPS") {
                    imgCover = imgCover.replace("/OEBPS/image", "/images");
                    fetch(imgCover).then((resp1) => {
                        if (resp1.status == 200) {
                            showCover(imgCover, this);
                        }
                    });
                }
                bCoverInit = true;
                return;
            }
        })
        .catch(err => {
            log("error loading cover", err);
            bCoverInit = true;
            return;
        });
    
    bCoverInit = true;
}

App.prototype.onBookReady = function (event) {
    this.qs("button.prev").classList.remove("hidden");
    this.qs("button.next").classList.remove("hidden");

    log("bookKey", this.state.book.key());

    let chars = 1650;
    let key = `${this.state.book.key()}:locations-${chars}`;
    let stored = localStorage.getItem(key);
    log("storedLocations", typeof stored == "string" ? stored.substr(0, 40) + "..." : stored);

    if (stored) return this.state.book.locations.load(stored);
    log("generating locations");
    return (this.state.book.locations.generate(chars)
        .then(() => {
            localStorage.setItem(key, this.state.book.locations.save());
            log("locations generated", this.state.book.locations);
        })
        .catch(err => console.error("error generating locations", err))
    );
};


/* Markers & chapters click function
======================================= */

App.prototype.onTocItemClick = function (href, event) {
    log("tocClick", href);

    this.state.rendition.display(href)
        .catch(err => console.warn("error displaying page", err));

    modal(this.qs(".tabs-modal"), 'hide');
    event.stopPropagation();
    event.preventDefault();
};

App.prototype.getNavItem = function(loc, ignoreHash) {
    return (function flatten(arr) {
        return [].concat(...arr.map(v => [v, ...flatten(v.subitems)]));
    })(this.state.book.navigation.toc).filter(
        item => ignoreHash ?
            this.state.book.canonical(item.href).split("#")[0] == this.state.book.canonical(loc.start.href).split("#")[0] :
            this.state.book.canonical(item.href) == this.state.book.canonical(loc.start.href)
    )[0] || null;
};

App.prototype.onNavigationLoaded = function (nav) {
    // log("navigation", nav);
    let toc = this.qs(".chapter-list");
    toc.innerHTML = "";

    let handleItems = (items, indent) => {
        items.forEach(item => {
            let a = toc.appendChild(this.el("a", "chapter-item"));
            a.href = a.dataset.href = item.href;
            a.innerHTML = item.label.trim();

            if(indent > 0 && item.subitems.length < 1)
                a.classList.add("level-3");
            else if (indent == 0)
                a.classList.add("level-1");
            else
                a.classList.add("level-2");

            a.addEventListener("click", this.onTocItemClick.bind(this, item.href));
            handleItems(item.subitems, indent + 1);
        });
    };
    handleItems(nav.toc, 0);
};

App.prototype.onRenditionRelocated = function (event) {
    // try {this.doDictionary(null);} catch (err) {}
    try {
        let navItem = this.getNavItem(event, false) || this.getNavItem(event, true);
        this.qsa(".chapter-list .chapter-item")
            .forEach(el => el.classList[(navItem && el.dataset.href == navItem.href) ? "add" : "remove"]("active"));
        //Add this directly to hooks
        //this.addCover();
        this.addImgClick();
        this.addAudioClick();
    } catch (err) {
        this.fatal("error updating toc", err);
    }
};

App.prototype.onBookMetadataLoaded = function (metadata) {
    log("metadata", metadata);
    this.qs(".menu-bar .book-title").innerText = this.qs(".tabs-wrapper .book-name").innerText = metadata.title.trim();
    this.qs(".menu-bar .book-author").innerText = metadata.creator.trim();
    // this.qs(".info .title").innerText = metadata.title.trim();
    // this.qs(".info .author").innerText = metadata.creator.trim();
    // if (!metadata.series || metadata.series.trim() == "") this.qs(".info .series-info").classList.add("hidden");
    // this.qs(".info .series-name").innerText = metadata.series.trim();
    // this.qs(".info .series-index").innerText = metadata.seriesIndex.trim();
    // this.qs(".info .description").innerText = metadata.description;
    // if (sanitizeHtml) this.qs(".info .description").innerHTML = sanitizeHtml(metadata.description);
};

App.prototype.onBookCoverLoaded = function (url) {
    if (!url)
        return;
    if (!this.state.book.archived) {
        this.qs(".cover").src = url;
        return;
    }
    this.state.book.archive.createUrl(url).then(url => {
        this.qs(".cover").src = url;
    }).catch(this.fatal.bind(this, "error loading cover"));
};


/* Prev && Next by arrows
======================================= */

App.prototype.onKeyUp = function (event) {
    let kc = event.keyCode || event.which;
    let b = null;
    if (kc == 37) {
        this.state.rendition.prev();
        b = this.qs(".app .bar button.prev");
    } else if (kc == 39) {
        this.state.rendition.next();
        b = this.qs(".app .bar button.next");
    }
    if (b) {
        b.style.transform = "scale(1.15)";
        window.setTimeout(() => b.style.transform = "", 150);
    }
};

// ?? To remove
App.prototype.onRenditionClick = function (event) {
    // log("You clicked on book");
    try {
        if(true) return;
        if (event.target.tagName.toLowerCase() == "a" && event.target.href) return;
        if (event.target.parentNode.tagName.toLowerCase() == "a" && event.target.parentNode.href) return;
        if (window.getSelection().toString().length !== 0) return;
        if (this.state.rendition.manager.getContents()[0].window.getSelection().toString().length !== 0) return;
    } catch (err) {}

    let wrapper = this.state.rendition.manager.container;
    let third = wrapper.clientWidth / 3;
    let x = event.pageX - wrapper.scrollLeft;
    let b = null;
    /*if (x > wrapper.clientWidth - 20) {
        event.preventDefault();
        // this.doSidebar();
    } else*/ if (x < third) {
        event.preventDefault();
        this.state.rendition.prev();
        b = this.qs(".bar button.prev");
    } else if (x > (third * 2)) {
        event.preventDefault();
        this.state.rendition.next();
        b = this.qs(".bar button.next");
    }
    if (b) {
        b.style.transform = "scale(1.15)";
        window.setTimeout(() => b.style.transform = "", 150);
    }
};

App.prototype.addSwipeListener = function () {
    
    let el = this.qs("iframe").contentWindow.document;

    // log('Call \'addSwipeListener\'', el);

    var yDown = null, xDown = null;

    function getTouches(evt) {
        return evt.touches ||             // browser API
                evt.originalEvent.touches; // jQuery
    }                                                     

    el.ontouchstart = (evt) => {
        const firstTouch = getTouches(evt)[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    };  

    el.ontouchend = (evt) => {
        if ( ! xDown || ! yDown ) return;

        let xUp = evt.changedTouches[0].clientX,
            yUp = evt.changedTouches[0].clientY;

        let xDiff = xDown - xUp,
            yDiff = yDown - yUp;

        if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
            if ( xDiff > 0.25 ) {
                log('left swipe');
                return this.state.rendition.next();
            } else if (xDiff < -0.25) {
                log('right swipe');
                return this.state.rendition.prev();
            }
        } else {
            if ( yDiff > 0.25 ) {
                log('up swipe');
            } else if (yDiff < -0.25) {
                log('down swipe');
            }
        };

        /* reset values */
        xDown = null;
        yDown = null;
    };
}


/* Change Themes
======================================= */

App.prototype.applyTheme = function () {
    let viewerElm = this.qs(".app .viewer .book");

    let theme = {
        linkColor: "#1e83d2",
        textAlign: "justify",
        fontFamily: this.getChipActive("font"),
        // fontSize: this.qs("[data-font-size]").dataset.fontSize + 'pt',
        fontSize: this.getChipActive("font-size")
        // lineHeight: 1
    };

    [theme.bodyBg, theme.viewerBg, theme.viewerShadowColor, theme.fontColor] = this.getChipActive("theme").split(";");

    let rules = {
        "body": {
            "background": theme.viewerBg,
            "color": theme.fontColor != "" ? `${theme.fontColor} !important` : "!invalid-hack",
            "font-family": theme.fontFamily != "" ? `${theme.fontFamily} !important` : "!invalid-hack",
            "font-size": theme.fontSize != "" ? `${theme.fontSize} !important` : "!invalid-hack",
            "line-height": `${theme.lineHeight} !important`,
            "text-align": `${theme.textAlign} !important`,
            "padding": `${theme.margin} 0`,
        },
        "p": {
            "font-family": theme.fontFamily != "" ? `${theme.fontFamily} !important` : "!invalid-hack",
            "font-size": theme.fontSize != "" ? `${theme.fontSize} !important` : "!invalid-hack",
            "color": theme.fontColor != "" ? `${theme.fontColor} !important` : "!invalid-hack",
        },
        "a": {
            "color": "inherit !important",
            "text-decoration": "none !important",
            "-webkit-text-fill-color": "inherit !important"
        },
        "a:link": {
            "color": `${theme.linkColor} !important`,
            "text-decoration": "none !important",
            "-webkit-text-fill-color": `${theme.linkColor} !important`
        },
        "a:link:hover": {
            "background": "rgba(0, 0, 0, 0.1) !important"
        },
        "img": {
            "max-width": "100% !important"
        },
    };

    try {
        this.appElm.style.background = theme.bodyBg;
        viewerElm.style.background = theme.viewerBg;
        viewerElm.style.boxShadow = `0 0 10px ${theme.viewerShadowColor}`;
        // this.appElm.style.fontFamily = theme.fontFamily;
        // this.appElm.style.color = theme.fontColor;
        if(this.state.rendition) this.state.rendition.getContents().forEach(c => c.addStylesheetRules(rules));
    } catch (err) {
        console.error("error applying theme", err);
    }
};

/* Progress bar
======================================= */
App.prototype.updateRangeBar = function (r) {
    let x = r.value / r.max;
    r.style.backgroundImage = [
        '-webkit-gradient(',
            'linear, ',
            'left top, ',
            'right top, ',
            'color-stop(' + x + ', #3d66ef), ',
            'color-stop(' + x + ', #e6e6e6)',
        ')' 
    ].join('');
}

App.prototype.onRenditionRelocatedUpdateIndicators = function (event) {
    try {
        //progress update
        let range = this.qs('.bar .rangebar');
        range.classList.remove('hidden');
        range.min = 0;
        range.max = this.state.book.locations.length() - 1 ;
        range.value = event.start.location;
        this.updateRangeBar(range);
        range.oninput = () => {
            this.updateRangeBar(range);
            this.state.rendition.display(this.state.book.locations.cfiFromLocation(range.value));
        }

        //book percent indicator update
        this.qs('.bar .loc').innerText = `${Math.round(this.state.rendition.location.start.percentage * 100)}%`;
        
    } catch (err) {
        console.error("error updating indicators: " + err);
    }
};

App.prototype.onRenditionRelocatedSavePos = function (event) {
    localStorage.setItem(`${this.state.book.key()}:pos`, event.start.cfi);
};

/* Local storage position
======================================= */

App.prototype.onRenditionStartedRestorePos = function (event) {
    try {
        let stored = localStorage.getItem(`${this.state.book.key()}:pos`);
        log("storedPos", stored);
        if (stored) this.state.rendition.display(stored);
    } catch (err) {
        this.fatal("error restoring position", err);
    }
};

{
// App.prototype.checkDictionary = function () {
//     try {
//         let selection = (this.state.rendition.manager && this.state.rendition.manager.getContents().length > 0) ? this.state.rendition.manager.getContents()[0].window.getSelection().toString().trim() : "";
//         if (selection.length < 2 || selection.indexOf(" ") > -1) {
//             if (this.state.showDictTimeout) window.clearTimeout(this.state.showDictTimeout);
//             this.doDictionary(null);
//             return;
//         }
//         this.state.showDictTimeout = window.setTimeout(() => {
//             try {
//                 let newSelection = this.state.rendition.manager.getContents()[0].window.getSelection().toString().trim();
//                 if (newSelection == selection) this.doDictionary(newSelection);
//             } catch (err) {console.error(`showDictTimeout: ${err.toString()}`)}
//         }, 300);
//     } catch (err) {console.error(`checkDictionary: ${err.toString()}`)}
// };

// App.prototype.doDictionary = function (word) {
//     if (this.state.lastWord) if (this.state.lastWord == word) return;
//     this.state.lastWord = word;

//     if (!this.qs(".dictionary-wrapper").classList.contains("hidden")) log("hide dictionary");
//     this.qs(".dictionary-wrapper").classList.add("hidden");
//     this.qs(".dictionary").innerHTML = "";
//     if (!word) return;

//     log(`define ${word}`);
//     this.qs(".dictionary-wrapper").classList.remove("hidden");
//     this.qs(".dictionary").innerHTML = "";

//     let definitionEl = this.qs(".dictionary").appendChild(document.createElement("div"));
//     definitionEl.classList.add("definition");

//     let wordEl = definitionEl.appendChild(document.createElement("div"));
//     wordEl.classList.add("word");
//     wordEl.innerText = word;

//     let meaningsEl = definitionEl.appendChild(document.createElement("div"));
//     meaningsEl.classList.add("meanings");
//     meaningsEl.innerHTML = "Loading";

//     fetch(`https://dict.geek1011.net/word/${encodeURIComponent(word)}`).then(resp => {
//         if (resp.status >= 500) throw new Error(`Dictionary not available`);
//         return resp.json();
//     }).then(obj => {
//         if (obj.status == "error") throw new Error(`ApiError: ${obj.result}`);
//         return obj.result;
//     }).then(word => {
//         log("dictLookup", word);
//         meaningsEl.innerHTML = "";
//         wordEl.innerText = [word.word].concat(word.alternates || []).join(", ").toLowerCase();
        
//         if (word.info && word.info.trim() != "") {
//             let infoEl = meaningsEl.appendChild(document.createElement("div"));
//             infoEl.classList.add("info");
//             infoEl.innerText = word.info;
//         }
        
//         (word.meanings || []).map((meaning, i) => {
//             let meaningEl = meaningsEl.appendChild(document.createElement("div"));
//             meaningEl.classList.add("meaning");

//             let meaningTextEl = meaningEl.appendChild(document.createElement("div"));
//             meaningTextEl.classList.add("text");
//             meaningTextEl.innerText = `${i + 1}. ${meaning.text}`;

//             if (meaning.example && meaning.example.trim() != "") {
//                 let meaningExampleEl = meaningEl.appendChild(document.createElement("div"));
//                 meaningExampleEl.classList.add("example");
//                 meaningExampleEl.innerText = meaning.example;
//             }
//         });
        
//         if (word.credit && word.credit.trim() != "") {
//             let creditEl = meaningsEl.appendChild(document.createElement("div"));
//             creditEl.classList.add("credit");
//             creditEl.innerText = word.credit;
//         }
//     }).catch(err => {
//         try {
//             console.error("dictLookup", err);
//             if (err.toString().toLowerCase().indexOf("not in dictionary") > -1) {
//                 meaningsEl.innerHTML = "Word not in dictionary.";
//                 return;
//             }
//             if (err.toString().toLowerCase().indexOf("not available") > -1 || err.toString().indexOf("networkerror") > -1 || err.toString().indexOf("failed to fetch") > -1) {
//                 meaningsEl.innerHTML = "Dictionary not available.";
//                 return;
//             }
//             meaningsEl.innerHTML = `Dictionary not available: ${err.toString()}`;
//         } catch (err) {}
//     });
// };
}

App.prototype.doFullscreen = () => {
    document.fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.documentElement.webkitRequestFullScreen;

    let requestFullscreen = element => {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    };

    if (document.fullscreenEnabled) {
        requestFullscreen(document.documentElement);
    }
};

/* Search
======================================= */

App.prototype.doSearch = function (q) {
    return Promise.all(this.state.book.spine.spineItems.map(item => {
        return item.load(this.state.book.load.bind(this.state.book)).then(doc => {
            let results = item.find(q);
            item.unload();
            return Promise.resolve(results);
        });
    })).then(results => Promise.resolve([].concat.apply([], results)));
};

App.prototype.onResultClick = function (href, event) {
    log("tocClick", href);
    this.state.rendition.display(href);
    modal(this.qs(".tabs-modal"), 'hide');
    event.stopPropagation();
    event.preventDefault();
};

App.prototype.doTab = function (tab) {
    try {
        let controls = this.qsa(".tab-list .tab-item"),
            tabs = this.qsa(".tab-container .tab");

        controls.forEach(el => el.classList[(el.dataset.tab == tab) ? "add" : "remove"]("active"));

        tabs.forEach(el => {
            let tabInp = el.querySelector('input');
            el.classList[(el.dataset.tab != tab) ? "remove" : "add"]("tab-active");
            if(tabInp)
                tabInp.focus();
        });

        try {
            this.qs(".tab-wrapper").scrollTop = 0;
        } catch (err) {}
    } catch (err) {
        this.fatal("error showing tab", err);
    }
};

App.prototype.onTabClick = function (tab, event) {
    log("tabClick", tab);
    this.doTab(tab);
    event.stopPropagation();
    event.preventDefault();
};

App.prototype.onSearchClick = function (event) {
    let q = this.qs(".search-bar .search-input").value.trim();
    if(q == "") return;

    this.doSearch(q).then(results => {
        
        let resultContainer = this.qs(".tab[data-tab=search] .search-results"),
            resultsEl = document.createDocumentFragment();

        resultContainer.innerHTML = "";

        if(results.length > 0) {
            results.slice(0, 200).forEach(result => {
                let resultEl = resultsEl.appendChild(this.el("a", "search-item"));
                resultEl.href = result.cfi;
                resultEl.addEventListener("click", this.onResultClick.bind(this, result.cfi));
    
                let textEl = resultEl.appendChild(this.el("span", "text"));
                textEl.innerText = result.excerpt.trim();
    
                resultEl.appendChild(this.el("span", "pbar")).style.width = (this.state.book.locations.percentageFromCfi(result.cfi)*100).toFixed(3) + "%";
            });
    
            resultContainer.appendChild(resultsEl);
        } else {
            resultContainer.innerHTML = "<center>Matches not found</center>";
        }

    }).catch(err => this.fatal("error searching book", err));
};


let ePubViewer = null;

try {
    ePubViewer = new App(document.querySelector(".app"));
} catch (err) {
    document.querySelector(".app .error").classList.remove("hidden");
    document.querySelector(".app .error .error-title").innerHTML = "Error3";
    document.querySelector(".app .error .error-description").innerHTML = "Please try reloading the page or using a different browser (Chrome or Firefox), and if the error still persists, <a href=\"https://github.com/geek1011/ePubViewer/issues\">report an issue</a>.";
    document.querySelector(".app .error .error-dump").innerHTML = JSON.stringify({
        error: err.toString(),
        stack: err.stack
    });
    log("Error line 1385");
    console.error(err);
    log(err.toString(), err.stack);
}

function showCover(imgCover, _this) {
    let bookiFrame = _this.qs("iframe").contentWindow.document;
    let parent = document.querySelector(".app .viewer"), modalContainer = parent.appendChild(document.createElement("div")), modalImg = modalContainer.appendChild(document.createElement("img")), closeBtn = modalContainer.appendChild(document.createElement("span"));
    modalContainer.className = "imgFullscreen fadeIn animated";
    modalImg.src = imgCover; //.coverPath; //imgCover.src
    closeBtn.className = "close-btn";
    modalContainer.onclick = function () {
        this.className = "imgFullscreen fadeOut animated";
        this.style.animationDuration = "0.5s";
        this.addEventListener('animationend', function () {
            this.remove();
        });
    };
}
