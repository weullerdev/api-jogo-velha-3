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
  code: string
}

const app = express()

const server = http.createServer(app)

const generateCode = () => {

}

const createGame = () => {
  return [...Array(9)].map(i => ({ value: null }))
}

let game = {} as Game

let code: string = ''

const io = new Server(server, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  socket.on('createGame', (element: 'x' | 'o') => {

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789'
    const charLength = chars.length
    
    for ( let i = 0; i < 6; i++ ) {
      game.code += chars.charAt(Math.floor(Math.random() * charLength));
    }

    game.value = createGame()
    game.turn = 'x'
    game.playerOne = {
      element,
      id: socket.id
    }
    
    socket.join(game.code)
    
    socket.to(game.code).emit('updateGame', game)
    socket.emit('getCode', game.code)
  })


  socket.on('joinGame', (joinCode) => {
    if(game.code === joinCode){
      game.playerTwo = {
        element: game.playerOne?.element === 'x' ? 'o' : 'x',
        id: socket.id,
      }
      socket.emit('joinedGame', game.playerTwo.element)
      socket.join(game.code)
      socket.to(game.code).emit('updateGame', game)
    } else {
      socket.emit('errorCode')
    }
  })

  socket.on('round', (currentGame, turn: 'x' | 'o') => {
    game.value = currentGame
    game.turn = turn === 'x' ? 'o' : 'x'
    socket.to(game.code).emit('updateGame', game)
  })

  // socket.on('endGame', (element: 'x' | 'o') => {
  //   socket.to(code).emit('winner', element)
  // })

  socket.on('reset', () => {
    game.value = createGame()
    socket.to(game.code).emit('updateGame', game)
  })
})

server.listen(3333, () => console.log('foi'))