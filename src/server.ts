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
  turn?: 'x' | 'o'
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
    game.turn = 'x'
    game.playerOne = {
      element,
      id: socket.id
    }
    
    socket.join(code)
    
    socket.to(code).emit('updateGame', game)
  })

  socket.on('joinGame', (joinCode) => {
    if(code === joinCode){
      game.playerTwo = {
        element: game.playerOne?.element === 'x' ? 'o' : 'x',
        id: socket.id,
      }
      socket.emit('joinedGame', game.playerTwo.element)
      socket.join(code)
      socket.to(code).emit('updateGame', game)
    } else {
      socket.emit('errorCode')
    }
  })

  socket.on('round', (currentGame, turn: 'x' | 'o') => {
    game.value = currentGame
    game.turn = turn === 'x' ? 'o' : 'x'
    socket.to(code).emit('updateGame', game)
  })

  // socket.on('endGame', (element: 'x' | 'o') => {
  //   socket.to(code).emit('winner', element)
  // })

  socket.on('reset', () => {
    game.value = createGame()
    socket.to(code).emit('updateGame', game)
  })
})

server.listen(3333, () => console.log('foi'))