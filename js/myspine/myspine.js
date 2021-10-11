function MySpine(t) {
    this.config = t,
    this.urlPrefix = t.spineDir + "sd_21miku_" + t.models[Number.parseInt(Math.random()*t.models.length)].name + "_r/",
    this.widget = null,
    this.widgetContainer = document.querySelector(".myspine-spine-widget"),
    this.voiceText = document.createElement("div"),
    this.voicePlayer = new Audio,
    this.triggerEvents = ["mousedown", "touchstart", "scroll"],
    this.animationQueue = new Array,
    this.isPlayingVoice = !1,
    this.lastInteractTime = Date.now(),
    this.localX = 0,
    this.localY = 0,
    this.load()
}
MySpine.downloadBinary = function(t, e, i) {
    var n = new XMLHttpRequest;
    n.open("GET", t, !0),
    n.responseType = "arraybuffer",
    n.onload = function() {
        200 == n.status ? e(new Uint8Array(n.response)) : i(n.status, n.responseText)
    }
    ,
    n.onerror = function() {
        i(n.status, n.responseText)
    }
    ,
    n.send()
}
,
MySpine.prototype = {
    load: function() {
        let i = this.config;
        MySpine.downloadBinary(this.getUrl(i.skeleton), t=>{
            function e(t, e) {
                for (var i in e)
                    t.style.setProperty(i, e[i])
            }
            e(this.widgetContainer, i.styles.widget),
            e(this.voiceText, i.styles.voiceText);
            t = new spine.SkeletonJsonConverter(t,1);
            t.convertToJson(),
            new spine.SpineWidget(this.widgetContainer,{
                animation: this.getAnimationList("start")[0].name,
                skin: i.skin,
                atlas: this.getUrl(i.atlas),
                jsonContent: t.json,
                backgroundColor: "#00000000",
                loop: !1,
                success: this.spineWidgetSuccessCallback.bind(this)
            })
        }
        , function(t, e) {
            console.error(`Couldn't download skeleton ${path}: status ${t}, ${e}.`)
        })
    },
    spineWidgetSuccessCallback: function(t) {
        var e = ()=>{
            this.triggerEvents.forEach(t=>window.removeEventListener(t, e)),
            this.triggerEvents.forEach(t=>window.addEventListener(t, this.changeIdleAnimation.bind(this))),
            this.initVoiceComponents(),
            this.initWidgetActions(),
            this.initDragging(),
            this.widget.play(),
            this.playVoice(this.getVoice("start")),
            this.widgetContainer.style.display = "block"
        }
        ;
        this.widget = t,
        this.widget.pause(),
        this.widgetContainer.style.display = "none",
        this.triggerEvents.forEach(t=>window.addEventListener(t, e))
    },
    initVoiceComponents: function() {
        this.voiceText.setAttribute("class", "myspine-voice-text"),
        this.widgetContainer.appendChild(this.voiceText),
        this.voiceText.style.opacity = 0,
        this.voicePlayer.addEventListener("timeupdate", ()=>{
            this.voiceText.scrollTo({
                left: 0,
                top: this.voiceText.offsetHeight * (this.voicePlayer.currentTime / this.voicePlayer.duration),
                behavior: "smooth"
            })
        }
        ),
        this.voicePlayer.addEventListener("ended", ()=>{
            this.voiceText.style.opacity = 0,
            this.isPlayingVoice = !1
        }
        )
    },
    initWidgetActions: function() {
        this.widget.canvas.onclick = this.interact.bind(this),
        this.widget.state.addListener({
            complete: t=>{
                (this.isPlayingVoice && t.loop) || this.isIdle() ? this.playRandAnimation({
                    name: t.animation.name,
                    loop: !0
                }) : this.playRandAnimation(this.getAnimationList("idle"))
            }
        })
    },
    initDragging: function() {
        function i(t) {
            var e = document.documentElement.scrollLeft
              , i = document.documentElement.scrollTop;
            return t.targetTouches ? (e += t.targetTouches[0].clientX,
            i += t.targetTouches[0].clientY) : t.clientX && t.clientY && (e += t.clientX,
            i += t.clientY),
            {
                x: e,
                y: i
            }
        }
        function e(t) {
            t.cancelable && t.preventDefault()
        }
        var n = (t,e)=>{
            t = Math.max(0, t),
            e = Math.max(0, e),
            t = Math.min(document.body.clientWidth - this.widgetContainer.clientWidth, t),
            e = Math.min(document.body.clientHeight - this.widgetContainer.clientHeight, e),
            this.widgetContainer.style.left = t + "px",
            this.widgetContainer.style.top = e + "px"
        }
          , o = t=>{
            var {x: e, y: t} = i(t);
            this.localX = e - this.widgetContainer.offsetLeft,
            this.localY = t - this.widgetContainer.offsetTop
        }
          , s = t=>{
            var {x: e, y: t} = i(t);
            n(e - this.localX, t - this.localY),
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty()
        }
          , t = {
            passive: !0
        }
          , a = {
            passive: !1
        };
        this.widgetContainer.addEventListener("mousedown", t=>{
            o(t),
            document.addEventListener("mousemove", s)
        }
        ),
        this.widgetContainer.addEventListener("touchstart", t=>{
            o(t),
            document.addEventListener("touchmove", e, a)
        }
        , t),
        this.widgetContainer.addEventListener("touchmove", s, t),
        document.addEventListener("mouseup", ()=>document.removeEventListener("mousemove", s)),
        this.widgetContainer.addEventListener("touchend", ()=>document.removeEventListener("touchmove", e)),
        window.addEventListener("resize", ()=>{
            let t = this.widgetContainer.style;
            var e, i;
            t.left && t.top && (e = Number.parseInt(t.left.substring(0, t.left.length - 2)),
            i = Number.parseInt(t.top.substring(0, t.top.length - 2)),
            n(e, i))
        }
        )
    },
    interact: function() {
        this.isPlayingVoice || 0 < this.animationQueue.length || !this.isIdle() ? console.warn("互动过于频繁！") : (this.lastInteractTime = Date.now(),
        this.playRandAnimation(this.getAnimationList("interact")),
        this.playVoice(this.getVoice("interact")))
    },
    getUrl: function(t) {
        return this.urlPrefix + t
    },
    getAnimationList: function(t) {
        var e = this.config.behaviors[t];
        return "start" == t? [{
            name: e.animation,
            loop: !1
        }] : e.animations.slice()
    },
    getVoice: function(t) {
        var e = this.config.behaviors[t];
        return "start" == t? {
            voice: e.voice,
            text: e.text
        } : e.voices[Math.floor(Math.random() * e.voices.length)]
    },
    playRandAnimation: function(t) {
        if (Array.isArray(t)) {
            e = t[Number.parseInt(Math.random()*t.length)];
            this.widget.state.setAnimation(0, e.name, e.loop);
        } else {
            this.widget.state.setAnimation(0, t.name, t.loop);
        }
    },
    playVoice: function(t) {
        if (this.getUrl(t.voice) == this.urlPrefix) {
            return;
        }
        t && (this.isPlayingVoice = !0,
        this.voicePlayer.src = this.getUrl(t.voice),
        this.voicePlayer.load(),
        this.voicePlayer.play().then(()=>{
            this.voiceText.innerHTML = t.text,
            this.voiceText.scrollTo(0, 0),
            this.voiceText.style.opacity = 1
        }
        , t=>{
            this.isPlayingVoice = !1,
            console.error(`无法播放音频，因为：${t}`)
        }
        ))
    },
    isIdle: function() {
        var e = this.widget.state.tracks[0].animation;
        for (const v of this.getAnimationList("idle")) {
            if (v.name == e.name) {
                return !0;
            }
        }
        return !1;
    },
    isInteract: function() {
        var e = this.widget.state.tracks[0].animation;
        for (const v of this.getAnimationList("interact")) {
            if (v.name == e.name) {
                return !0;
            }
        }
        return !1;
    },
    changeIdleAnimation: function() {
        var t = Date.now()
          , e = t - this.lastInteractTime;
        if ((this.isIdle() && e/1e3/60 >= this.config.behaviors.idle.maxMinutes) || 
            (this.isInteract() && e/1e3 >= this.config.behaviors.interact.maxPlaySec)) {
             this.lastInteractTime = t,
             this.playRandAnimation(this.getAnimationList("idle"))
        }
    }
};