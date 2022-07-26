const express = require('express')

const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')

const contenedorMsg = require('./src/controllers/contenedorMensajes.js')
const contenedorProd = require('./src/controllers/contedorProductos.js')

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

const { response } = require('express')
const session = require('express-session')

const connectMongo = require('connect-mongo')
const cookieParser = require('cookie-parser')
const advancedOptions = {useNewUrlParser: true, useUnifiedTopology: true }

const MongoStore = connectMongo.create({
    mongoUrl: 'mongodb+srv://ValentinVicente:kpoctmaster470@cluster0.4hxnz.mongodb.net/Cluster0?retryWrites=true&w=majority',
    mongoOptions: advancedOptions,
    ttl: 600
})

app.use(express.static('./src/public'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: false}))
app.use(cookieParser())

app.use(session({
    store: MongoStore,
    secret: 'MySecretValue',
    resave: false,
    saveUninitialized: false,
}));

app.get('/data', async (req, res) => {

    if(req.session.username){
        const datos = req.session.username
        res.render('index.ejs', { datos })
    }
    else{
        res.redirect('/')
    }
})

app.get('/', (req, res) => {
    res.render('login')
});



app.post('/login-post', async (req, res) => {
    try {
        const username = req.body.name;
        req.session.username = username;
        res.redirect('/data');
    }
    catch (err) {
        console.log(err);
        res.send({ error: err });
    }
})

app.get('/olvidar/:name', (req,res) => {
    const name = req.params.name
    req.session.destroy( err => {
        if (err) {
            res.json({error: 'olvidar', descripcion: err})
        } else {
            res.render('bye', { name })
        }
    })

})


io.on('connection', async (sockets) => {
    console.log('Un cliente se ha conectado!: ' + sockets.id)

    sockets.emit('productos', await contenedorProd.listarProductos())
    sockets.emit('messages', await contenedorMsg.getMSGS())
    

    sockets.on('new-producto', async data => {
        await contenedorProd.insertarProductos(data)
        console.log(data)

        io.sockets.emit('productos', await contenedorProd.listarProductos())
    })

    sockets.on('new-message', async dato => {
        console.log(dato)
        const author = dato.author
        const messageText = dato.text
        const fecha = dato.fecha
        const hora = dato.hora
        await contenedorMsg.saveMSG(author, messageText, fecha, hora)

        io.sockets.emit('messages', await contenedorMsg.getMSGS())
    })
})

const PORT = 8080
httpServer.listen(PORT, () => console.log('Iniciando en el puerto: ' + PORT))
