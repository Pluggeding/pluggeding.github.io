## Plugins Concept

### Strategies:

* **offline-first**: excencialmente desenhados pra serem servidos por um ServiceWorker
* **on-demand**: construidos para accessar recursos programaticamente
* **fly-update**: atualizá-vel


### API:

Embora servido sobre o mesmo site, o plugin é tratado como oriundo de uma origem diferente pois é servido em um `<iframe sandbox="allow-scripts">` por esta razão não pode ter acesso a recursos disponiveis somente na origem.

A API expõe uma matriz de recursos explicitamente concedidos pelo usuário em detrimento aqueles previamente requeridos pelo plugin, tais como:

**native** (not so much)

* **IndexedDB**
* **Storage** (local and session)
* **Notification** (fallback to "Bootstraped" fake Notification)
* **WebPush** (in development)
* **Geolocation** (only return lat, lon `{Object}`)
* **Audio** (microphone) (has GetUserMedia API)
* **Video** (camera)     (has GetUserMedia API)

**user info**

* **basic info**
* **user contacts**
* **user galery**
* **user drive**
* **user notes**
* **user dictionary**

Na estrutura do arquivo **package.json** do plugin são definidas as "permissões" requisitadas pelo plugin, exemplo:


**package.json**:

```json
{
    "name": "Plugin Name",
    "description": "Plugin description",
    "permissions": {
        "required": [
            "user-info",
            "user-contacts",
            "indexeddb",
            "storage"
        ],
        "optional": [
            "notification",
            "webpush",
            "geolocation"
        ]
    }
}
```

Assumindo que o usuário tenha concordado com todas as permissões "requeridas" e instalado o plugin, o processo de "build" realizado pelo ServiceWorker
irá adicionar ao contexto de execusão do plugin (javascript) a variável **PluginSetts** `{Object}` contendo as permissões "requeridas" e também as "opcionais" concedidas pelo usuário.


```javascript
const PluginSetts = {
    permissions: [
        'user-info',
        'user-contacts',
        'indexeddb',
        'storage',
        'motification'
    ]
}
// note: user don't allow "webpush" and "geolocation" optional permissions
```

Sob esta premissa o plugin deve ser capaz de tratar suas necessidades no caso de permissões não concedidas e observar os eventos de mudança de estado disparados pelo usuário (permissions change).


### Communication:

Plugins se comunicam com o script principal excencialmente através de `.postMessage()` más não podem acessar esta propriedade diretamente (ver seção limits) para isto, utilizam o gerenciador de eventos [Mitt](https://github.com/developit/mitt):

Podem escutar mensagens observando o evento **"onmessage"** assim como podem disparar mensagens usando **"postMessage"** dentro deste gerenciador:

```javascript
// pub/sub
const Emitter = Mitt()
// listener messages
Emitter.on('onmessage', function(data) {
    // do stuff...
})
// send messages
Emitter.emit('postMessage', 'your-data')
```

Sob esta cracteristica todas as chamadas a API devem prover um identificador para poder "identificar" a mensagem de resposta uma vez que não são vinculantes e podem chamar recursos ou funções que podem ter uma natureza "assincrona".

Uma observação importante deve ser dita:

O plugin só poderá efetivamente utilizar "postMessage" após receber do script principal a primeira mensagem. O script principal abre o canal de comunicação `700ms` após acomodar o `<iframe>` do plugin ao documento principal.


### Limits:

**Sandboxed**:

Plugins rodam em um `<iframe sandbox="allow-scripts">` e herdam regras de um **Content Security Policy** (CSP) cabeçalho `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; object-src 'none'; script-src 'self';">`

Por sua natureza não podem acessar a origem do documento pai (`.parent`) não podem executar scripts e estilos `inline` assim como não podem adicionar recursos de origens externas ou mesmo redirecionar para origens externas.

**Caped scope**:

Alguns recursos deste `sandbox` são desabilitados por padrão e outros impostos para garantir o comportamento esperado. O contexto de execusão utiliza "use-strict" em um aspecto global.

Em regras gerais o script do plugin é adicionado em um bloco `try/catch` precedido das seguintes regras e componentes:


```javascript
"use-strict"
const global = this

const PluginId = 'plugin-id' // immutable writed from ServiceWorker build

const PluginSetts = {}       // writed from ServiceWorker

/**
 * Mitt - Tiny 200b functional event emitter/pubsub.
 * @url - https://github.com/developit/mitt
 * @licence - MIT (c) Jason Miller <https://jasonformat.com/>
 */
const Mitt = (a, e) => {
    function n(n) {
        return n = n || Object.create(null), {
            on(e, t) {
                (n[e] || (n[e] = [])).push(t)
            },
            off(e, t) {
                n[e] && n[e].splice(n[e].indexOf(t) >>> 0, 1)
            },
            emit(e, t) {
                (n[e] || []).slice().map(n => {
                    n(t)
                }), (n["*"] || []).slice().map(n => {
                    n(e, t)
                })
            }
        }
    }
    return n(a)
}

//
const Emitter = Mitt()

/**
 * Change `console` to auto-replace "mode" and plugin identification - facilitates filtering on console
 */
const ImprovedLog = (context, method, message) => {
    return function() {
       method.apply(context, [message].concat(Array.prototype.slice.apply(arguments)))
    }
}
// something close to the original (other options are not available)
let Log = function() {}
Log       = ImprovedLog(console, console.log,   '[LOG][${PluginSetts.name}   - ${PluginId}]:')
Log.info  = ImprovedLog(console, console.info,  '[INFO][${PluginSetts.name}  - ${PluginId}]:')
Log.warn  = ImprovedLog(console, console.warn,  '[WARN][${PluginSetts.name}  - ${PluginId}]:')
Log.error = ImprovedLog(console, console.error, '[ERROR][${PluginSetts.name} - ${PluginId}]:')
Log.debug = ImprovedLog(console, console.debug, '[DEBUG][${PluginSetts.name} - ${PluginId}]:')

/**
 * Receive `source` from first communication
 */
const PostMessageListener = source => {
    Emitter.on('postMessage', function(message) {
        // overwrite message to {Object} add plugin id - because this, "pluginId" is reserved key
        if ( typeof message === 'object' ) {
            message.pluginId = PluginId
        } else if ( typeof message === 'string' ) {
            message = {
                pluginId: PluginId,
                message: message
            }
        } else {
            message = {
                pluginId: PluginId,
                message: undefined
            }
        }
        source.postMessage(message, '*')
    })
}

//
const AppMessageHandler = event => {
    if ( event.origin !== "https://allowed-origin" ) {
        return
    }
    // check credentials ... more Informations soon
    PostMessageListener(event.source)      // enable communication
    Emitter.emit('onmessage', event.data)
}

// listener
window.addEventListener('message', AppMessageHandler, false)

// prevent access (or modification)
;[
    'self',
    'global',
    'eval',
    'onmessage',
    'postMessage',
    'Mitt',
    'Emitter',
    'addEventListener',
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'RTCPeerConnection',
    'parent',
    'console'
].forEach(prop => {
    Object.defineProperty( global, prop, {
        get : function() {
            throw "Security Exception: cannot access " + prop;
            return 1;
        },
        set : function() {
            throw "Security Exception: cannot set " + prop;
            return 1;
        },
        configurable : false
    })
})

try {

     // plugin code added here

} catch(ex) {
    Emitter.emit('postMessage', {
        CodeException: ex
    })
}
```

**Inheritance by imposition**: (visual Plugins)

Plugins herdam por padrão em sua seção `<head>` folhas de estilo de **Bootstrap-4**, **Font-Awesome** (4.7.0) e um conjunto de "utilidades" assim como herdam em sua `<body>` **jQuery** e **Bootstrap** scripts.

A tag `<body>` recebe um identificador padrão de **id** (id="body") assim como uma classe para redimensionar seu corpo (body width and height) através de seu **view port**: `<body id="body" class="vwh-100">` definidas pela folha de utilidades (utils.css).

Também herdam dentro de sua `body` uma `<div id="plugin-loader-icon">` especialmente disposta para indicar ao usuário que o plugin está sendo carregado. Deve ser removida manualmente pelo plugin.

```html
<div id="plugin-loader-icon" class="d-flex h-100">
    <div class="col-sm-12 my-auto text-center">
        <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
    </div>
</div>
```


-------------

## [to be continued]
