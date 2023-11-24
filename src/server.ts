import express from "express"
import http from "http"
import socket, { Server } from "socket.io"

interface SquareGame {
  value: 'x' | 'o' | null
  date?: Date;
}

interface Player {
  element: 'x'| 'o'
  id: string
}

interface Game {
  value: SquareGame[]
  playerOne?: Player
  playerTwo?: Player
}

const app = express()

const server = http.createServer(app)

const createGame = () => {
  return [...Array(9)].map(i => ({ value: null }))
}

let game = {} as Game

const code: string = 'asDSSQ' 

const io = new Server(server, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  socket.on('createGame', (element: 'x' | 'o') => {
    game.value = createGame()
    game.playerOne = {
      element,
      id: socket.id
    }

    socket.join(code)

    socket.to(code).emit('updateGame', game)
  })

  socket.on('round', (currentGame) => {
    game.value = currentGame
    socket.to(code).emit('updateGame', game)
  })

  socket.on('endGame', (element: 'x' | 'o') => {
    socket.to(code).emit('winner', element)
  })

  socket.on('reset', () => {
    game.value = createGame()
    socket.to(code).emit('updateGame', game)
  })
})

server.listen(3333, () => console.log('foi'))